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


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Webhook de atualização de envio — Melhor Envio",
)
async def melhorenvio_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Endpoint registrado no painel do Melhor Envio.
    O webhook deve ser configurado com o header: Authorization: Bearer <WEBHOOK_SECRET>
    """
    verify_melhorenvio_webhook_token(request)

    try:
        raw_body = await request.json()
    except Exception:
        logger.warning("Webhook ME: payload não é JSON válido.")
        return {"ok": True}

    try:
        payload = MelhorEnvioWebhookPayload(**raw_body)
        await handle_melhorenvio_webhook(payload, db)
    except Exception as e:
        logger.error(f"Erro ao processar webhook ME: {e}", exc_info=True)

    return {"ok": True}
