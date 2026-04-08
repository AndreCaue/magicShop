from sqlalchemy.orm import Session
from .client import EfiClient
from .schemas import CardOneStepRequest, InstallmentsRequest, PixRequest
from .models import PixCharge
from app.store.orders.models import Order, OrderItem
from app.store.models import Product
from datetime import datetime, timezone
from app.core.config import settings
from pycpfcnpj import cpfcnpj
from uuid import UUID
from ..store.orders.enums import OrderStatus, PaymentStatus
from ..payment.refund.enums import PaymentMethod
from app.melhorenvio.service import registrar_envio_cart, gerar_etiqueta_melhor_envio

SANDBOX = settings.EFI_SANDBOX

if SANDBOX:
    WEBHOOK_URL = settings.NGROK_URL
else:
    WEBHOOK_URL = settings.WEBHOOK_URL

PIX_KEY = settings.PIX_KEY
STORE_NAME = settings.STORE_NAME


class EfiService:
    def __init__(self, sandbox: bool = True):
        self.sandbox = sandbox
        self.client = EfiClient(sandbox=sandbox).efi

    def release_stock(self, order, db):
        try:
            for item in order.items:
                product = db.query(Product).filter(
                    Product.id == item.product_id).first()

                if product is None:
                    continue

                reserved = product.reserved_stock or 0
                quantity = item.quantity or 0
                product.reserved_stock = max(0, reserved - quantity)
                product.updated_at = datetime.now(timezone.utc)
                db.add(product)

            order.stock_reserved = False
            order.updated_at = datetime.now(timezone.utc)
            db.add(order)

        except Exception as e:
            db.rollback()
            raise

    def reserve_stock(self, order, db):

        try:
            for item in order.items:
                product = db.query(Product).filter(
                    Product.id == item.product_id
                ).first()

                if product is None:
                    continue

                if product.reserved_stock is None:
                    product.reserved_stock = 0

                estoque_disponivel = product.stock - product.reserved_stock
                if estoque_disponivel < item.quantity:
                    raise ValueError(
                        f"Estoque insuficiente para '{product.name}' "
                        f"(disponível: {estoque_disponivel}, solicitado: {item.quantity})"
                    )

                product.reserved_stock += item.quantity
                product.updated_at = datetime.now(timezone.utc)
                db.add(product)

            order.stock_reserved = True
            order.updated_at = datetime.now(timezone.utc)
            db.add(order)

        except Exception as e:
            db.rollback()
            raise

    def get_pix_charge_details(self, txid: str) -> dict:
        """
        Consulta os detalhes atuais da cobrança PIX na Efí pelo txid.
        Levanta exceção em caso de erro.
        """
        try:
            response = self.client.pix_detail_charge(params={"txid": txid})
            if not isinstance(response, dict) or "status" not in response:
                raise ValueError("Resposta inválida ao consultar cobrança PIX")
            return response
        except Exception as e:
            raise ValueError(
                f"Erro ao consultar cobrança PIX (txid={txid}): {str(e)}")

    def create_pix_charge(self, db: Session, order, valor_original: str, expiracao: int) -> dict:
        """
        Create pix charge and save db
        """
        existing = db.query(PixCharge).filter(
            PixCharge.order_id == order.id,
            PixCharge.status == "ATIVA"
        ).first()

        if existing:
            try:
                details = self.get_pix_charge_details(existing.txid)
                current_status = details.get("status")

                if current_status == "ATIVA":

                    return {
                        "txid": existing.txid,
                        "location": existing.location,
                        "pix_copia_e_cola": existing.pix_copia_e_cola,
                        "imagem_qrcode": existing.imagem_qrcode,
                        "charge_id": existing.id
                    }

                existing.status = current_status
                existing.updated_at = datetime.now(timezone.utc)

                if current_status in ("CONCLUIDA", "PAGA"):
                    existing.paid_at = datetime.now(timezone.utc)
                    order.payment.status = "pago"
                    order.status = "confirmed"
                elif current_status == 'EXPIRADA':
                    if order:
                        order.payment_status = PaymentStatus.EXPIRED

                elif current_status == "REMOVIDA_PELO_USUARIO_RECEBEDOR":
                    if (order):
                        order.payment_status = PaymentStatus.CANCELED
                        order.status = OrderStatus.CANCELED

                db.commit()
                db.refresh(existing)

                return {
                    "txid": existing.txid,
                    "location": existing.location,
                    "pix_copia_e_cola": existing.pix_copia_e_cola,
                    "imagem_qrcode": existing.imagem_qrcode,
                    "charge_id": existing.id,
                    "message": f"Cobrança já existia, status atual: {current_status}"
                }

            except ValueError as ve:
                return {
                    "txid": existing.txid,
                    "location": existing.location,
                    "pix_copia_e_cola": existing.pix_copia_e_cola,
                    "imagem_qrcode": existing.imagem_qrcode,
                    "charge_id": existing.id,
                    "warning": f"Não foi possível consultar status atual: {str(ve)}"
                }

        solicitacao = f"{settings.STORE_NAME} - Pedido #{order.uuid}"

        body = {
            "calendario": {"expiracao": expiracao},
            "valor": {"original": valor_original},
            "chave": PIX_KEY,
            "solicitacaoPagador": solicitacao,
            "devedor": {
                "cpf": order.shipping.recipient_document,
                "nome": order.shipping.recipient_name,
            }

        }

        if self.sandbox:
            devedor = {
                "cpf": order.shipping.recipient_document or "12345678909",
                "nome": order.shipping.recipient_name or "Teste Homologacao"
            }
        else:
            if not order.shipping.recipient_document or not order.shipping.recipient_name:
                raise ValueError("CPF e Nome são obrigatórios em produção")

            if not cpfcnpj.validate(order.shipping.recipient_document):
                raise ValueError("CPF inválido")

            devedor = {
                "cpf": order.shipping.recipient_document,
                "nome": order.shipping.recipient_name
            }

        body["devedor"] = devedor

        try:
            result = self.client.pix_create_immediate_charge(body=body)

            location = result.get("loc", {}).get("location")

            pix_charge = PixCharge(
                txid=result["txid"],
                location=location,
                pix_copia_e_cola=result.get("pixCopiaECola"),
                imagem_qrcode=result.get("imagemQrcode"),
                devedor_cpf=devedor.get("cpf"),
                devedor_nome=devedor.get("nome"),
                valor_original=valor_original,
                status="ATIVA",
                order_id=order.id
            )

            db.add(pix_charge)
            db.commit()
            db.refresh(pix_charge)

            return {
                "txid": result["txid"],
                "location": result["loc"]["location"],
                "pix_copia_e_cola": result.get("pixCopiaECola"),
                "imagem_qrcode": result.get("imagemQrcode"),
                "charge_id": pix_charge.id
            }

        except Exception as e:
            db.rollback()
            raise ValueError(f"Erro ao criar cobrança Pix: {str(e)}")

    def process_pix_webhook(self, webhook_data: dict, db: Session) -> dict:
        """process web hook pix"""

        pix_events = webhook_data.get("pix", [])
        if not pix_events:
            return {"processed": 0}

        processed_count = 0

        for event in pix_events:
            txid = event.get("txid")
            if not txid:
                continue

            pix_charge = db.query(PixCharge).filter(
                PixCharge.txid == txid
            ).first()

            if not pix_charge:
                continue

            if pix_charge.status == "CONCLUIDA":
                continue

            charges_details = self.client.pix_detail_charge(
                params={"txid": txid})

            status = charges_details.get("status")
            pix_list = charges_details.get("pix", [])

            pix_charge.status = status
            pix_charge.updated_at = datetime.now(timezone.utc)

            order = pix_charge.order

            if status == "CONCLUIDA" and pix_list:
                pix_charge.paid_at = datetime.now(timezone.utc)
                pix_charge.end_to_end_id = pix_list[0].get("endToEndId")

                if order:
                    pix_charge.order.payment_status = PaymentStatus.PAID
                    pix_charge.order.status = OrderStatus.CONFIRMED
                    pix_charge.order.updated_at = datetime.now(timezone.utc)
                    pix_charge.order.payment_method = PaymentMethod.PIX
                    order.paid_at = datetime.now(timezone.utc)
                    self.reserve_stock(order, db)

            elif status == "EXPIRADA":
                if order:
                    order.payment_status = PaymentStatus.EXPIRED
                    order.status = OrderStatus.CANCELED
                    order.updated_at = datetime.now(timezone.utc)

                    self.release_stock(order, db)

            elif status == "REMOVIDA_PELO_USUARIO_RECEBEDOR":
                if order:
                    order.payment_status = PaymentStatus.CANCELED
                    order.status = OrderStatus.CANCELED
                    order.updated_at = datetime.now(timezone.utc)

                    self.release_stock(order, db)
            db.commit()
            processed_count += 1

        return {"processed": processed_count}

    def configure_webhook(self, chave_pix: str, webhook_url: str) -> dict:
        body = {"webhookUrl": webhook_url}
        params = {"chave": chave_pix}

        headers = {}
        if self.sandbox:
            headers["x-skip-mtls-checking"] = "true"
        return self.client.pix_config_webhook(params=params, body=body, headers=headers)
# Cartão

    def create_card_one_step(self, order_uuid: UUID, payment_token: str, installments: int, db: Session, user_id: int, name_on_card: str) -> dict:
        order = db.query(Order).filter(Order.uuid == str(order_uuid)).first()

        if not order:
            raise ValueError("Pedido não encontrado")

        if order.user_id != user_id:
            raise ValueError("Você não tem permissão para este pedido")

        if order.efipay_charge_card_id:
            raise ValueError(
                "Este pedido já possui uma cobrança de cartão associada")

        if order.paid_at:
            raise ValueError(
                "Esse pedido está em processo de pagamento, seja por via cartão ou pix. Em caso de dúvida entre em contato com o suporte."
            )

        if order.payment_status in (PaymentStatus.PAID):
            raise ValueError(
                f"Pedido já processado com sucesso (status: {order.payment_status})"
            )

        shipping = order.shipping
        if not shipping:
            raise ValueError("Dados de entrega não encontrados no pedido")

        customer_name = shipping.recipient_name.strip()
        if len(customer_name.split()) < 2:
            raise ValueError("O nome do cliente deve conter nome e sobrenome")

        cpf = shipping.recipient_document
        if not cpf or not cpfcnpj.validate(cpf):
            raise ValueError("CPF/CNPJ inválido ou ausente.")

        phone = shipping.recipient_phone
        phone_digits = ''.join(filter(str.isdigit, phone)) if phone else ""
        if len(phone_digits) not in [10, 11]:
            raise ValueError("Telefone inválido no pedido")

        order_items = db.query(OrderItem).filter(
            OrderItem.order_id == order.id).all()
        if not order_items:
            raise ValueError("Pedido sem itens")

        items_list = []
        for oi in order_items:
            product = db.query(Product).filter(
                Product.id == oi.product_id).first()

            if not product:
                raise ValueError(f"Produto {oi.product_id} não encontrado")

            items_list.append({
                "name": product.name,
                "amount": oi.quantity,
                "value": int(oi.unit_price * 100),
            })

        body = {
            "items": items_list,
            "metadata": {
                "notification_url": f"{WEBHOOK_URL}/efipay",
                "custom_id": f"order_{order.uuid}",
            },
            "payment": {
                "credit_card": {
                    "payment_token": payment_token,
                    "installments": installments,
                    "customer": {
                        "name": name_on_card or customer_name,
                        "email": shipping.recipient_email,
                        "cpf": cpf,
                        "phone_number": phone_digits,
                    },
                    "billing_address": {
                        "street": shipping.street,
                        "number": shipping.number,
                        "neighborhood": shipping.neighborhood,
                        "zipcode": shipping.postal_code,
                        "city": shipping.city,
                        "state": shipping.state
                    }
                }
            }
        }

        if order.shipping_cost > 0:
            body["shippings"] = [{
                "name": f"Frete - {order.shipping_carrier} {order.shipping_method}",
                "value": int(order.shipping_cost * 100)
            }]

        # Chamada ao SDK
        try:
            result = self.client.create_one_step_charge(body=body)

            if not isinstance(result, dict) or result.get("code") != 200:
                order.payment_status = "erro_gateway"
                order.updated_at = datetime.now(timezone.utc)
                db.commit()
                raise ValueError(result.get("error_description",
                                            "Erro desconhecido na Efí"))

            charge_data = result.get("data", {})
            charge_id = charge_data.get("charge_id")
            charge_status = charge_data.get("status")

            if not charge_id:
                order.payment_status = "erro_gateway"
                order.updated_at = datetime.now(timezone.utc)
                db.commit()
                raise ValueError("Efí não retornou charge_id")

            order.efipay_charge_card_id = str(charge_id)
            order.updated_at = datetime.now(timezone.utc)

            if charge_status in ("approved", "paid"):
                if order.payment_status != PaymentStatus.PAID:
                    self.reserve_stock(order, db)
                    order.payment_status = PaymentStatus.PAID
                    order.payment_method = PaymentMethod.CREDIT_CARD
                    order.status = OrderStatus.CONFIRMED
                    order.paid_at = datetime.now(timezone.utc)
                    order.updated_at = datetime.now(timezone.utc)

            elif charge_status in ("failed", "error"):
                order.payment_status = PaymentStatus.FAILED
                order.status = OrderStatus.CANCELED

            db.commit()

            return {
                "order_uuid": order.uuid,
                "charge_id": charge_id,
                "status": charge_data.get("status"),
                "installments": charge_data.get("installments"),
                "total": charge_data.get("total"),
                "payment": charge_data.get("payment"),
            }

        except Exception as e:
            db.rollback()
            if isinstance(e, ValueError):
                raise
            raise ValueError(
                f"Erro interno no processamento do cartão: {str(e)}")

    def process_card_webhook(self, notification_token: str, db: Session) -> dict:
        """
        Processa notificação de cartão da Efí.
        Fluxo:
          1. Consulta o token via get_notification para obter charge_id e status atual.
          2. Localiza o Order pelo efipay_charge_card_id.
          3. Atualiza status do pedido conforme o status retornado.
        """
        try:
            notification_data = self.client.get_notification(
                params={"token": notification_token}
            )
        except Exception as e:
            print(f"Erro ao consultar notificação Efí: {str(e)}")
            return {"processed": 0}

        events = notification_data.get("data", [])
        if not events:
            return {"processed": 0}

        last_event = events[-1]
        identifiers = last_event.get("identifiers", {})
        charge_id = str(identifiers.get("charge_id", ""))
        status = last_event.get("status", {}).get("current", "").lower()

        if not charge_id or not status:
      
            return {"processed": 0}

        order = db.query(Order).filter(
            Order.efipay_charge_card_id == charge_id
        ).first()

        if not order:
        
            return {"processed": 0}

    # Evita reprocessar pedidos já finalizados
        if order.payment_status == PaymentStatus.PAID:
            return {"processed": 0}



        now = datetime.now(timezone.utc) 


        if status in ("paid", "approved"):
            if order.payment_status != PaymentStatus.PAID:
                order.payment_status = PaymentStatus.PAID
                order.status = OrderStatus.CONFIRMED
                order.payment_method = PaymentMethod.CREDIT_CARD
                order.paid_at = now
                order.reservation_expires_at = now
                order.updated_at = now

                self.reserve_stock(order, db)

        elif status in ("refused", "failed"):
            order.payment_status = PaymentStatus.FAILED
            order.status = OrderStatus.CANCELED
            order.updated_at = datetime.now(timezone.utc)

            self.release_stock(order, db)

        elif status == "refunded":
            order.payment_status = PaymentStatus.REFUNDED
            order.status = OrderStatus.CANCELED
            order.reservation_expires_at = None
            order.updated_at = datetime.now(timezone.utc)

            self.release_stock(order, db)


        elif status in ("canceled", "cancelled"):
            order.payment_status = PaymentStatus.CANCELED
            order.status = OrderStatus.CANCELED
            order.updated_at = datetime.now(timezone.utc)
            order.reservation_expires_at = None

            self.release_stock(order, db)

        elif status in ("unpaid", "waiting"):
            print(
                f"Pedido {order.uuid} ainda aguardando confirmação ({status})")
            return {"processed": 0}

        else:
            print(
                f"Status Efipay não tratado: {status} (order {order.uuid})")
            return {"processed": 0}

        db.commit()
        db.refresh(order)

        return {"processed": 1}

    def get_card_installments(self, data: InstallmentsRequest) -> list[dict]:
        valor_centavos = int(data.total_value * 100)
        brand = data.brand.lower().strip()

        valid_brands = ["visa", "mastercard", "elo", "amex", "hipercard"]
        if brand not in valid_brands:
            raise ValueError(
                f"Bandeira '{data.brand}' inválida. "
                f"Use: {', '.join(valid_brands)}"
            )

        try:
            params = {
                "total": valor_centavos,
                "brand": brand
            }

            result = self.client.get_installments(params=params)

            if not isinstance(result, dict):
                raise ValueError("Resposta inválida da Efí")

            if result.get("error"):
                raise ValueError(result.get(
                    "error_description", "Erro na Efí"))

            data_response = result.get("data", {})
            installments_data = data_response.get("installments", [])

            formatted = []
            for opt in installments_data:
                formatted.append({
                    "installment": opt["installment"],
                    "installment_value": opt["value"] / 100,
                    "total_value": (opt["installment"] * opt["value"]) / 100,
                    "interest_percentage": opt.get("interest_percentage", 0),
                    "has_interest": opt["has_interest"]
                })

            return formatted

        except Exception as e:
            raise ValueError(f"Erro ao buscar parcelas: {str(e)}")

    def get_card_charge_details(self, charge_id: str | int) -> dict:
        """Consulta detalhes da cobrança de cartão pela Efí."""
        try:
            response = self.client.detail_charge(params={"id": int(charge_id)})
            if not isinstance(response, dict) or "data" not in response:
                raise ValueError(
                    "Resposta inválida ao consultar cobrança cartão")
            return response.get("data", {})
        except Exception as e:
            raise ValueError(
                f"Erro ao consultar cobrança cartão (id={charge_id}): {str(e)}")

    def refund_card_charge(self, charge_id: str | int, amount: int | None = None) -> dict:
        """Solicita estorno (total ou parcial) de cobrança de cartão."""
        body = {}
        if amount is not None:
            if amount <= 0:
                raise ValueError("Amount deve ser positivo em centavos")
            body["amount"] = amount

        try:

            result = self.client.request(
                method="POST",
                endpoint=f"/v1/charge/card/{charge_id}/refund",
                body=body or None
            )

            if not isinstance(result, dict) or result.get("code") not in (200, 201):
                error_msg = result.get("error_description") or result.get(
                    "mensagem") or "Erro desconhecido"
                raise ValueError(
                    f"Falha no estorno: {error_msg} (code: {result.get('code')})")

            return {
                "status": "success",
                "message": result.get("message", "Estorno solicitado com sucesso"),
                "response": result
            }

        except AttributeError as e:
            raise AttributeError(
                f"SDK não tem o método esperado (_make_request / post / call). "
                f"Erro: {e}. Veja dir(self.client) ou código-fonte do EfiClient."
            )

        except Exception as e:
            raise ValueError(
                f"Erro ao solicitar estorno cartão (id={charge_id}): {str(e)}")
