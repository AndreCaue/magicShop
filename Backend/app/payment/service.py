from sqlalchemy.orm import Session
from .client import EfiClient
from .schemas import PixRequest, CardOneStepRequest, InstallmentsRequest
from app.store.orders.models import Order, OrderItem
from app.store.models import Product
from datetime import datetime, timezone
from app.core.config import settings

SANDBOX = settings.EFI_SANDBOX

if SANDBOX:
    WEBHOOK_URL = settings.NGROK_URL
else:
    WEBHOOK_URL = settings.WEBHOOK_URL


class EfiService:
    def __init__(self, sandbox: bool = True):
        self.sandbox = sandbox
        self.client = EfiClient(sandbox=sandbox).efi

    def create_pix_charge(self, data: PixRequest) -> dict:
        valor_formatado = data.valor_original

        body = {
            "calendario": {"expiracao": data.expiracao},
            "valor": {"original": valor_formatado},
            "chave": data.chave,
        }

        if data.solicitacao_pagador:
            body["solicitacaoPagador"] = data.solicitacao_pagador

        devedor = {}
        if data.devedor_cpf:
            devedor["cpf"] = data.devedor_cpf
        if data.devedor_nome:
            devedor["nome"] = data.devedor_nome

        if not devedor.get("cpf") or not devedor.get("nome"):
            devedor = {"cpf": "12345678909",
                       "nome": "Teste Homologacao"}  # precisa mudar

        body["devedor"] = devedor

        return self.client.pix_create_immediate_charge(body=body)

    def create_card_one_step(self, data: CardOneStepRequest, db: Session, user_id: int) -> dict:

        customer_name = data.customer.name.strip()

        if len(customer_name.split()) < 2:
            raise ValueError("O nome do cliente deve conter nome e sobrenome")

        customer_name = ' '.join(customer_name.split())

        phone_number = ""
        if data.customer.phone_number:
            phone_number = ''.join(
                filter(str.isdigit, data.customer.phone_number))

            if len(phone_number) not in [10, 11]:
                raise ValueError(
                    "Telefone deve conter 10 ou 11 dígitos (com DDD)")

        order = Order(
            user_id=user_id,
            total=0,
            status="pending",
            payment_status="aguardando_pagamento",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.add(order)
        db.flush()

        items_list = []
        items_total_cents = 0

        for item in data.items:
            product = db.query(Product).filter(
                Product.id == item.product_id).first()

            if not product:
                raise ValueError(f"Produto {item.product_id} não encontrado")

            unit_price_cents = int(product.price * 100)
            total_price_cents = unit_price_cents * item.quantity

            items_total_cents += total_price_cents

            items_list.append({
                "name": product.name,
                "amount": item.quantity,
                "value": unit_price_cents,
            })

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
                total_price=product.price * item.quantity
            )
            db.add(order_item)

        shipping_total_cents = data.shipping.value if data.shipping else 0

        order_total_cents = items_total_cents + shipping_total_cents  # verificar
        order.total = order_total_cents / 100

        body = {
            "items": items_list,
            "metadata": {
                # dev , ajustar para uma variavel para mudar entre prod e dev
                "notification_url": f"{WEBHOOK_URL}/webhook/efipay",
                "custom_id": f"order_{order.id}",
            },
            "payment": {
                "credit_card": {
                    "payment_token": data.payment_token,
                    "installments": data.installments,
                    "customer": {
                        "name": customer_name,
                        "email": data.customer.email,
                        "cpf": data.customer.cpf,
                        "phone_number": phone_number,
                    },
                    "billing_address": {
                        "street": data.billing_address.street,
                        "number": data.billing_address.number,
                        "neighborhood": data.billing_address.neighborhood,
                        "zipcode": data.billing_address.zipcode.replace("-", "").replace(".", ""),
                        "city": data.billing_address.city,
                        "state": data.billing_address.state
                    }
                }
            }
        }

        if data.shipping and data.shipping.value > 0:
            shipping_item = {
                "name": data.shipping.name,
                "value": data.shipping.value
            }

            if data.shipping.payee_code:
                shipping_item["payeeCode"] = data.shipping.payee_code

            body["shippings"] = [shipping_item]

        # Chamada ao SDK
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

        order.efipay_charge_id = str(charge_id)
        order.updated_at = datetime.now(timezone.utc)

        db.commit()

        return {
            "order_id": order.id,
            "charge_id": charge_id,
            "status": charge_data.get("status"),
            "installments": charge_data.get("installments"),
            "total": charge_data.get("total"),
            "payment": charge_data.get("payment"),
        }

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
        return self.client.pix_config_webhook(chave=chave_pix, body=body)
