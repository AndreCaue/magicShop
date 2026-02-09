# test_webhook_simulation.py
import requests
import json

# ✅ SUBSTITUA pela sua URL real do ngrok
NGROK_URL = "https://pseudoregal-mysticly-gilbert.ngrok-free.dev"


def test_webhook_paid():
    """Simula notificação de pagamento aprovado"""

    payload = {
        "notification": {
            "charge_id": "44897041",  # Substitua por um charge_id real do seu banco
            "status": "paid",
            "custom_id": "order_1"
        }
    }

    print("🚀 Testando webhook - Pagamento APROVADO")
    print(f"📍 URL: {NGROK_URL}/webhook/efipay")
    print(f"📦 Payload:\n{json.dumps(payload, indent=2)}\n")

    response = requests.post(f"{NGROK_URL}/webhook/efipay", json=payload)

    print(f"📊 Status HTTP: {response.status_code}")
    print(f"📄 Resposta: {json.dumps(response.json(), indent=2)}\n")

    if response.status_code == 200:
        print("✅ Webhook processado com sucesso!")
    else:
        print("❌ Erro ao processar webhook")


def test_webhook_unpaid():
    """Simula notificação de pagamento pendente"""

    payload = {
        "notification": {
            "charge_id": "44897041",
            "status": "unpaid",
            "custom_id": "order_1"
        }
    }

    print("🚀 Testando webhook - Pagamento PENDENTE")
    print(f"📦 Payload:\n{json.dumps(payload, indent=2)}\n")

    response = requests.post(f"{NGROK_URL}/webhook/efipay", json=payload)

    print(f"📊 Status HTTP: {response.status_code}")
    print(f"📄 Resposta: {json.dumps(response.json(), indent=2)}\n")


def test_webhook_canceled():
    """Simula notificação de pagamento cancelado"""

    payload = {
        "notification": {
            "charge_id": "44897041",
            "status": "canceled",
            "custom_id": "order_1"
        }
    }

    print("🚀 Testando webhook - Pagamento CANCELADO")
    print(f"📦 Payload:\n{json.dumps(payload, indent=2)}\n")

    response = requests.post(f"{NGROK_URL}/webhook/efipay", json=payload)

    print(f"📊 Status HTTP: {response.status_code}")
    print(f"📄 Resposta: {json.dumps(response.json(), indent=2)}\n")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🧪 TESTES DE WEBHOOK EFIPAY")
    print("=" * 60 + "\n")

    # Escolha qual testar
    print("Escolha o teste:")
    print("1 - Pagamento Aprovado (paid)")
    print("2 - Pagamento Pendente (unpaid)")
    print("3 - Pagamento Cancelado (canceled)")
    print("4 - Todos os testes")

    choice = input("\nOpção (1-4): ").strip() or "1"
    print()

    if choice == "1":
        test_webhook_paid()
    elif choice == "2":
        test_webhook_unpaid()
    elif choice == "3":
        test_webhook_canceled()
    elif choice == "4":
        test_webhook_paid()
        print("-" * 60 + "\n")
        test_webhook_unpaid()
        print("-" * 60 + "\n")
        test_webhook_canceled()

    print("=" * 60)
    print("✅ TESTES FINALIZADOS")
    print("=" * 60 + "\n")
