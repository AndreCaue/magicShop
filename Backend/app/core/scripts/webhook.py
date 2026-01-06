from payment.service import EfiService
import os

service = EfiService(sandbox=True)
chave = "af2f21a9-5d40-43b9-9692-9d7aa544a85f"
webhook_url = "https://sua-url-publica.ngrok.io/payment/webhook/pix"

response = service.configure_webhook(chave_pix=chave, webhook_url=webhook_url)