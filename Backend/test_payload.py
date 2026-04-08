
import httpx
import json

payload = {
    "shipment": {
        "id": "a15d5b49-541d-4240-8e19-7697430bdf9c",
        "tracking": "BR123456789BR",
        "tracking_url": "https://melhorrastreio.com.br/rastreio/BR123456789BR",
        "status": {
            "status": "delivered",
            "label": "Objeto entregue"
        }
    }
}

response = httpx.post(
    "http://localhost:8000/melhorenvio/webhook",
    json=payload
)

print("Status HTTP:", response.status_code)
print("Resposta:", response.json())
