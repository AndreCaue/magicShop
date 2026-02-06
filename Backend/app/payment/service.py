from .client import EfiClient
from .schemas import PixRequest, CardOneStepRequest, InstallmentsRequest


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

    def create_card_one_step(self, data: CardOneStepRequest) -> dict:

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

        items_list = [
            {
                "name": item.name,
                "amount": item.quantity,
                "value": item.unit_price
            }
            for item in data.items
        ]

        # birth_date = getattr(data.customer, 'birth', None) or "1990-01-01"
        # Monta o body esperado pela Efí (baseado na doc oficial)
        body = {
            "items": items_list,
            # "items": [
            #     {
            #         "name": item.name,
            #         "amount": item.quantity,
            #         "value": item.unit_price
            #     }
            #     for item in data.items
            # ],
            "payment": {
                "credit_card": {
                    "payment_token": data.payment_token,
                    "installments": data.installments,
                    # A Efí exige customer DENTRO de credit_card
                    "customer": {
                        "name": customer_name,
                        "email": data.customer.email,
                        "cpf": data.customer.cpf,
                        "phone_number": phone_number,
                        # "birth": birth_date,
                        # Alguns casos exigem billing_address aqui também
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

            # Adiciona payeeCode se fornecido (para split de pagamento)
            if data.shipping.payee_code:
                shipping_item["payeeCode"] = data.shipping.payee_code

            body["shippings"] = [shipping_item]

        # Chamada ao SDK
        result = self.client.create_one_step_charge(body=body)

        if not isinstance(result, dict) or result.get("code") != 200:
            error_msg = result.get("error_description",
                                   "Erro desconhecido na Efí")
            raise ValueError(
                f"Falha ao criar cobrança com cartão: {error_msg}")

        charge_data = result.get("data", {})

        return {
            "charge_id": charge_data.get("charge_id"),
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
