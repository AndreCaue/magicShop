# app/melhorenvio/webhook/routes.py

from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.auth.dependencies import get_db
from app.core.webhook_auth import verify_melhorenvio_webhook_token
from .schemas import MelhorEnvioWebhookPayload
from .service import handle_melhorenvio_webhook

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/melhorenvio", tags=["Melhor Envio - Webhook"])


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def melhorenvio_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """Endpoint do webhook Melhor Envio."""
    raw_body = await request.body()  

    try:
        payload_dict = json.loads(raw_body)
        event = payload_dict.get("event")
    except Exception:
        logger.warning("Webhook ME: payload não é JSON válido.")
        return {"ok": True}

    if event != "webhook.ping":
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            logger.warning(
                f"[WebhookAuth] Header Authorization ausente (evento: {event}). "
                f"IP: {request.client.host if request.client else 'unknown'}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de webhook inválido"
            )

        received_token = auth_header.removeprefix("Bearer ").strip()
        if received_token != settings.WEBHOOK_SECRET:
            logger.warning(
                f"[WebhookAuth] Token ME inválido (evento: {event}). "
                f"IP: {request.client.host if request.client else 'unknown'}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de webhook inválido"
            )

    try:
        payload = MelhorEnvioWebhookPayload(**payload_dict)
        await handle_melhorenvio_webhook(payload, db)
    except Exception as e:
        logger.error(f"Erro ao processar webhook ME: {e}", exc_info=True)

    return {"ok": True}
