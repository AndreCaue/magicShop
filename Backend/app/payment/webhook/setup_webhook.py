from ..service import EfiService
from app.core.config import settings


def setup_pix_webhook():
    service = EfiService(sandbox=settings.EFI_SANDBOX)

    # Sua chave Pix cadastrada na EfiPay
    chave_pix = settings.PIX_KEY  # CPF, CNPJ, email, telefone ou chave aleatória

    print(f"Chave pix {chave_pix}")
    # URL do webhook
    if settings.EFI_SANDBOX:
        webhook_url = f"{settings.NGROK_URL}/pix?ignorar=sim"
    else:
        webhook_url = f"{settings.WEBHOOK_URL}/payment/webhook"

    body = {"webhookUrl": webhook_url}
    params = {"chave": chave_pix}

    headers = {"x-skip-mtls-checking": "true"}  # Forçando aqui para teste

    try:
        # Chame diretamente o client para debug
        result = service.client.pix_config_webhook(
            params=params, body=body, headers=headers)
        print("✅ Webhook configurado com sucesso!")
        print(result)
    except Exception as e:
        print(f"❌ Erro ao configurar webhook: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'json'):
            print("Resposta completa da API:", e.response.json())


if __name__ == "__main__":
    setup_pix_webhook()
