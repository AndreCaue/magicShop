# app/melhorenvio/webhook/routes.py

from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
import logging
import json
from app.auth.dependencies import get_db
from app.core.webhook_auth import verify_melhorenvio_webhook_token, _is_validation_enabled
from .schemas import MelhorEnvioWebhookPayload
from .service import handle_melhorenvio_webhook, _send_status_email
from ..service import get_order_by_melhor_envio_id
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/melhorenvio", tags=["Melhor Envio - Webhook"])


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def melhorenvio_webhook(
    request: Request,
    db: Session = Depends(get_db),
):

    # Parei aqui, re-verificar quando ME voltar.
    try:
        raw_body = await request.body()
        payload_dict = json.loads(raw_body)
        event: str = payload_dict.get("event", "")
    except Exception as e:
        logger.warning(f"Webhook ME: Payload não é JSON válido: {e}")
        return {"ok": True}

    # 2. Valida a assinatura ANTES de processar (passando o body já lido)
    try:
        await verify_melhorenvio_webhook_token(request, raw_body)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Erro inesperado na validação do webhook: {e}", exc_info=True)
        raise HTTPException(
            status_code=401, detail="Falha na validação de segurança")

    # 3. Processamento do evento
    try:
        payload = MelhorEnvioWebhookPayload(**payload_dict)

        # Eventos que só enviam e-mail (conforme sua lógica atual)
        if event in ["order.received", "order.delivered", "order.paused"]:
            order = get_order_by_melhor_envio_id(db, payload.data.id)

            if not order:
                logger.warning(
                    f"Order não encontrada para evento {event} (ID: {payload.data.id})")
                return {"ok": True}

            status_map = {
                "order.received": "received",
                "order.delivered": "delivered",
                "order.paused": "paused",
            }

            status_key = status_map[event]
            _send_status_email(order=order, status=status_key, payload=payload)

            logger.info(
                f"✅ Evento {event} processado - e-mail enviado para order {order.uuid}")

        # Demais eventos (posted, shipped, etc.) - processa tudo (status, estoque, histórico)
        else:
            await handle_melhorenvio_webhook(payload, db)
            logger.info(
                f"✅ Evento {event} processado via handle_melhorenvio_webhook")

    except Exception as e:
        logger.error(f"Erro ao processar evento {event}: {e}", exc_info=True)
        # Não retorna erro 500 para o Melhor Envio (ele tenta reenviar)
        # Apenas loga e retorna 200

    return {"ok": True}
