# python app\payment\webhook\script.py
import requests
import base64
import os
from app.core.config import settings

# ================== CONFIG ==================
SANDBOX = settings.EFI_SANDBOX

CLIENT_ID = settings.EFI_CLIENT_ID
CLIENT_SECRET = settings.EFI_CLIENT_SECRET
CERT_PATH = settings.EFI_CERTIFICATE_PATH

# URL do webhook - IMPORTANTE: deve terminar com /webhook/efipay
WEBHOOK_URL = "https://pseudoregal-mysticly-gilbert.ngrok-free.dev/webhook/efipay"

# URLs CORRETAS
if SANDBOX:
    API_BASE_URL = "https://sandbox.gerencianet.com.br"
else:
    API_BASE_URL = "https://api.gerencianet.com.br"

# ============================================


def get_access_token():
    """Gera o access token OAuth2"""
    print("🔑 Gerando access token...")

    if not os.path.exists(CERT_PATH):
        raise FileNotFoundError(f"❌ Certificado não encontrado: {CERT_PATH}")

    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64_credentials}",
        "Content-Type": "application/json"
    }

    body = {"grant_type": "client_credentials"}

    response = requests.post(
        f"{API_BASE_URL}/v1/authorize",
        headers=headers,
        json=body,
        cert=CERT_PATH,
        timeout=30
    )

    if response.status_code != 200:
        raise Exception(f"Erro ao gerar token: {response.text}")

    token = response.json().get("access_token")
    print("✅ Token gerado com sucesso\n")
    return token


def try_all_webhook_endpoints(access_token):
    """
    Testa todos os possíveis endpoints de webhook para cartão
    """
    print("=" * 60)
    print("🔍 TESTANDO ENDPOINTS DE WEBHOOK")
    print("=" * 60 + "\n")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Lista de endpoints possíveis baseado na documentação Efipay
    endpoints_to_test = [
        # Webhooks gerais
        {
            "method": "PUT",
            "url": f"{API_BASE_URL}/v1/webhooks",
            "payload": {"url": WEBHOOK_URL},
            "description": "Webhook geral (v1/webhooks)"
        },
        {
            "method": "POST",
            "url": f"{API_BASE_URL}/v1/webhooks",
            "payload": {"url": WEBHOOK_URL},
            "description": "Webhook geral POST (v1/webhooks)"
        },
        # Notificações
        {
            "method": "PUT",
            "url": f"{API_BASE_URL}/v1/notification",
            "payload": {"url": WEBHOOK_URL},
            "description": "Notificação v1 (v1/notification)"
        },
        {
            "method": "PUT",
            "url": f"{API_BASE_URL}/v1/notifications",
            "payload": {"url": WEBHOOK_URL},
            "description": "Notificações v1 (v1/notifications)"
        },
        {
            "method": "PUT",
            "url": f"{API_BASE_URL}/notification",
            "payload": {"url": WEBHOOK_URL},
            "description": "Notificação raiz (notification)"
        },
        # Charges/Transactions
        {
            "method": "PUT",
            "url": f"{API_BASE_URL}/v1/charge/notification",
            "payload": {"url": WEBHOOK_URL},
            "description": "Notificação de cobrança (v1/charge/notification)"
        },
        # Settings/Config
        {
            "method": "PUT",
            "url": f"{API_BASE_URL}/v1/config",
            "payload": {"notification_url": WEBHOOK_URL},
            "description": "Configuração v1 (v1/config)"
        },
        {
            "method": "POST",
            "url": f"{API_BASE_URL}/v1/config",
            "payload": {"notification_url": WEBHOOK_URL},
            "description": "Configuração POST v1 (v1/config)"
        },
        # Account settings
        {
            "method": "PUT",
            "url": f"{API_BASE_URL}/v1/account/settings",
            "payload": {"notification_url": WEBHOOK_URL},
            "description": "Account settings (v1/account/settings)"
        },
    ]

    successful_endpoints = []

    for i, endpoint_config in enumerate(endpoints_to_test, 1):
        print(
            f"[{i}/{len(endpoints_to_test)}] Testando: {endpoint_config['description']}")
        print(f"    {endpoint_config['method']} {endpoint_config['url']}")

        try:
            if endpoint_config["method"] == "PUT":
                response = requests.put(
                    endpoint_config["url"],
                    json=endpoint_config["payload"],
                    headers=headers,
                    cert=CERT_PATH,
                    timeout=30
                )
            else:  # POST
                response = requests.post(
                    endpoint_config["url"],
                    json=endpoint_config["payload"],
                    headers=headers,
                    cert=CERT_PATH,
                    timeout=30
                )

            print(f"    STATUS: {response.status_code}")

            if response.status_code in [200, 201, 204]:
                print(f"    ✅ SUCESSO!")
                print(f"    Resposta: {response.text}")
                successful_endpoints.append(endpoint_config)
            elif response.status_code == 404:
                print(f"    ❌ 404 - Endpoint não existe")
            elif response.status_code == 400:
                print(f"    ⚠️  400 - Payload inválido")
                print(f"    Resposta: {response.text}")
            else:
                print(f"    ⚠️  {response.status_code}")
                print(f"    Resposta: {response.text}")

        except Exception as e:
            print(f"    ❌ Erro: {e}")

        print()

    # Resumo
    print("=" * 60)
    if successful_endpoints:
        print(f"✅ {len(successful_endpoints)} ENDPOINT(S) BEM-SUCEDIDO(S):")
        for endpoint in successful_endpoints:
            print(f"   • {endpoint['description']}")
            print(f"     {endpoint['method']} {endpoint['url']}")
    else:
        print("❌ NENHUM ENDPOINT FUNCIONOU")
        print("\n💡 SOLUÇÃO: Configure o webhook manualmente")
        print("\n📌 Passos:")
        print("1. Acesse https://sejaefi.com.br/ ou https://sandbox.gerencianet.com.br/")
        print("2. Login → Configurações → API")
        print("3. Procure 'URL de Notificação' ou 'Webhook'")
        print(f"4. Insira: {WEBHOOK_URL}")
        print("5. Salve")
        print("\nOu adicione o webhook diretamente ao criar cada cobrança:")
        print(
            'payload = {"items": [...], "metadata": {"notification_url": "URL"}}')

    print("=" * 60)


if __name__ == "__main__":
    print("\n")
    print("=" * 60)
    print("🚀 TESTANDO ENDPOINTS DE WEBHOOK EFIPAY")
    print("=" * 60)
    print(f"🌐 URL do webhook: {WEBHOOK_URL}")
    print("=" * 60)
    print("\n")

    try:
        token = get_access_token()
        try_all_webhook_endpoints(token)

        print("\n" + "=" * 60)
        print("✅ PROCESSO FINALIZADO")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\n❌ ERRO FATAL: {e}")
        import traceback
        traceback.print_exc()
        print()
