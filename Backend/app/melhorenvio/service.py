from typing import List, Dict, Any

from .client import melhor_envio_client
from .schemas import CotacaoFreteResponse
from app.core.config import settings

CEP_KEY = settings.CEP_KEY


async def cotar_frete(
    cep_destino: str,
    peso_gramas: float,
    largura_cm: float,
    altura_cm: float,
    comprimento_cm: float,
    usar_seguro: int = 0,
    valor_declarado: float = 0.0,
    cep_origem: str | None = None,
) -> List[CotacaoFreteResponse]:

    cep_destino = cep_destino.replace("-", "").strip()
    cep_origem = (cep_origem or CEP_KEY).replace("-", "").strip()
 # precisa fazer, parei aqui, fazer integração para gerar etiqueta e proximos passos.
    payload = {
        "from": {
            "postal_code": cep_origem
        },
        "to": {
            "postal_code": cep_destino
        },
        "package": {
            "height": float(altura_cm),
            "width": float(largura_cm),
            "length": float(comprimento_cm),
            "weight": round(peso_gramas / 1000, 5)
        },
        "options": {
            "insurance_value": float(valor_declarado) if usar_seguro else 0,
            "receipt": False,
            "own_hand": False,
            "reverse": False,
            "non_commercial": False,
            "platform": "Doce Ilusão",
            "invoice": {
                "value": float(valor_declarado)
            }
        }
    }

    try:
        raw_response = await melhor_envio_client.post(
            "/me/shipment/calculate",
            json=payload,
            timeout=20
        )

    except Exception as e:
        raise

    opcoes_filtradas = []
    for item in raw_response:
        if item.get("error"):
            continue

        opcao = CotacaoFreteResponse(
            id=str(item["id"]),
            nome=item["name"],
            empresa=item["company"]["name"],
            empresa_picture=item["company"].get("picture", ""),
            preco=float(item["price"]),
            preco_com_desconto=float(item.get("discount", item["price"])),
            prazo_dias=item["delivery_time"],
            entrega_domiciliar=item.get("home_delivery", True),
            entrega_sabado=item.get("saturday_delivery", False),
        )
        opcoes_filtradas.append(opcao)

    opcoes_filtradas.sort(key=lambda x: x.preco)
    return opcoes_filtradas
