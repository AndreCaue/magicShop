import logging
from typing import List, Dict, Any

from .client import melhor_envio_client
from .schemas import CotacaoFreteResponse

logger = logging.getLogger(__name__)

async def cotar_frete(
    cep_destino: str,
    peso_gramas: float,
    largura_cm: float,
    altura_cm: float,
    comprimento_cm: float,
    valor_declarado: float = 0.0,
    cep_origem: str | None = None,
) -> List[CotacaoFreteResponse]:

    # Garante CEP limpo (sem traço)
    cep_destino = cep_destino.replace("-", "").strip()
    cep_origem = (cep_origem or "01001000").replace("-", "").strip()  # fallback seguro

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
            "weight": round(peso_gramas / 1000, 5)  # kg com até 5 casas
        },
        "options": {
            "insurance_value": float(valor_declarado),
            "receipt": False,
            "own_hand": False,
            "reverse": False,
            "non_commercial": False,
            # <<< CAMPOS OBRIGATÓRIOS em 2025 >>>
            "platform": "Minha Loja",                        # pode ser qualquer nome
            "invoice": {                                      # campo novo e obrigatório
                "value": float(valor_declarado)
            }
        }
        # Removi "services" de propósito → assim ele devolve TODAS as transportadoras disponíveis
    }

    logger.info(f"Payload final enviado para Melhor Envio: {payload}")

    try:
        raw_response = await melhor_envio_client.post(
            "/me/shipment/calculate",
            json=payload,
            timeout=20  # eles estão lentos às vezes
        )
        logger.info(f"Resposta completa do Melhor Envio: {raw_response}")

    except Exception as e:
        response_text = getattr(e, 'text', '') or getattr(getattr(e, 'response', None), 'text', '')
        logger.error(f"Erro 502/4xx/5xx no Melhor Envio → {e}")
        logger.error(f"Response body: {response_text}")
        raise

    # ... resto do seu parsing continua igual
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