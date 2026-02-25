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
                    order.payment_status = "expirado"

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

            if status == "EXPIRADA" and pix_charge.order:
                pix_charge.order.payment_status = "expirado"

            if status == "CONCLUIDA" and pix_list:
                pix_charge.paid_at = datetime.now(timezone.utc)
                pix_charge.end_to_end_id = pix_list[0].get("endToEndId")

                if pix_charge.order:
                    pix_charge.order.payment_status = "pago"
                    pix_charge.order.status = "confirmed"
                    pix_charge.order.updated_at = datetime.now(timezone.utc)

            elif status == "EXPIRADA":
                if pix_charge:
                    pix_charge.order.payment_status = "expirado"
                    pix_charge.order.updated_at = datetime.now(timezone.utc)

            elif status == "REMOVIDA_PELO_USUARIO_RECEBEDOR":
                if pix_charge.order:
                    pix_charge.order.payment_status = "cancelado"
                    pix_charge.order.updated_at = datetime.now(timezone.utc)

            db.commit()
            processed_count += 1

        return {"processed": processed_count}

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

        if order.payment_status in ("pago", "approved", "capturado", "autorizado", "paid"):
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
                "notification_url": f"{WEBHOOK_URL}/webhook/efipay",
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
                # "payeeCode": "..." se necessário
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

            if not charge_id:
                order.payment_status = "erro_gateway"
                order.updated_at = datetime.now(timezone.utc)
                db.commit()
                raise ValueError("Efí não retornou charge_id")

            order.efipay_charge_card_id = str(charge_id)
            order.updated_at = datetime.now(timezone.utc)

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

    def configure_webhook(self, chave_pix: str, webhook_url: str) -> dict:
        body = {"webhookUrl": webhook_url}
        params = {"chave": chave_pix}

        print(f"self {self.sandbox}")

        headers = {}
        if self.sandbox:
            headers["x-skip-mtls-checking"] = "true"
        return self.client.pix_config_webhook(params=params, body=body, headers=headers)
