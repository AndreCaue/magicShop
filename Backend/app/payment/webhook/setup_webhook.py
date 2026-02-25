from ..service import EfiService
from app.core.config import settings


def setup_pix_webhook():
    service = EfiService(sandbox=settings.EFI_SANDBOX)

    # Sua chave Pix cadastrada na EfiPay
    chave_pix = settings.PIX_KEY

    # URL do webhook
    if settings.EFI_SANDBOX:
        webhook_url = f"{settings.NGROK_URL}/pix?ignorar=sim"
        headers = {"x-skip-mtls-checking": "true"}  # IGNORA MTLS NO SANDBOX
    else:
        webhook_url = f"{settings.WEBHOOK_URL}/payment/webhook"
        headers = {}

    body = {"webhookUrl": webhook_url}
    params = {"chave": chave_pix}

    try:
        result = service.client.pix_config_webhook(
            params=params, body=body, headers=headers)
        print(result)
    except Exception as e:
        print(f"❌ Erro ao configurar webhook: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'json'):
            print("Resposta completa da API:", e.response.json())


if __name__ == "__main__":
    setup_pix_webhook()
