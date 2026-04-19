"""


- Melhor Envio: token secreto no header Authorization do webhook registrado

O WEBHOOK_SECRET é definido no .env e lido via settings.WEBHOOK_SECRET.
Em desenvolvimento (WEBHOOK_SECRET vazio), a validação é ignorada.
"""

import hmac
import hashlib
import logging
import base64
import json
from fastapi import HTTPException, Request, status
from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_validation_enabled() -> bool:
    """Retorna se a validação de assinatura deve ser feita."""
    if settings.MELHOR_ENVIO_ENV == "sandbox":
        if not settings.MELHOR_ENVIO_CLIENT_SECRET_DEV:
            logger.error(
                "[WebhookAuth] CRITICAL: SECRET não configurado em production!")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro de configuração: SECRET ausente em produção."
            )
        return True

    if not settings.MELHOR_ENVIO_CLIENT_SECRET:
        logger.warning(
            "[WebhookAuth] SECRET não configurado. Validação desabilitada no ambiente dev/ngrok.")
        return False

    return True


def verify_efipay_webhook_token(request: Request) -> None:
    """
    Valida o token de webhook EfiPay recebido como query param.
    A URL cadastrada na Efí deve ser: /webhook/efipay?webhook_token=<WEBHOOK_SECRET>
    Lança HTTPException 401 se inválido.
    """
    if not _is_validation_enabled():
        logger.warning(
            "[WebhookAuth] SECRET não configurado — validação desabilitada. "
            "Configure antes de ir para produção."
        )
        return

    received_token = request.query_params.get("webhook_token", "")

    if not received_token or received_token != settings.WEBHOOK_SECRET:
        logger.warning(
            f"[WebhookAuth] Token EfiPay inválido. IP: {request.client.host if request.client else 'unknown'}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de webhook inválido"
        )


async def verify_melhorenvio_webhook_token(request: Request, body: bytes) -> None:
    """
    Valida a assinatura do webhook do Melhor Envio.
    - Em desenvolvimento (ngrok/local): pode desabilitar a validação se WEBHOOK_SECRET estiver vazio.
    - Em produção: sempre valida e exige o secret.
    - Recebe o body já lido para evitar erro de body já consumido.
    """
    if not _is_validation_enabled():
        return  # Validação desabilitada (útil para testes com ngrok)

    # Ignora validação para webhook.ping (o Melhor Envio geralmente não envia assinatura no ping)
    try:
        if body:
            payload = json.loads(body)
            if payload.get("event") == "webhook.ping":
                logger.info(
                    "✅ webhook.ping recebido - ignorando validação de assinatura")
                return
    except Exception:
        pass
    # Se não conseguir ler como JSON, continua com validação normal

    signature = request.headers.get("X-ME-Signature")
    if not signature:
        logger.warning(
            f"[WebhookAuth] X-ME-Signature ausente. IP: {getattr(request.client, 'host', 'unknown')}")
        raise HTTPException(status_code=401, detail="Assinatura ausente")

    # Define qual secret usar (sandbox ou production)
    if settings.MELHOR_ENVIO_ENV == "sandbox":
        secret_key = settings.MELHOR_ENVIO_CLIENT_SECRET_DEV or ""
    else:
        secret_key = settings.MELHOR_ENVIO_CLIENT_SECRET or ""

    if not secret_key:
        logger.error(
            "[WebhookAuth] Client Secret do Melhor Envio não configurado!")
        raise HTTPException(
            status_code=500,
            detail="Erro de configuração: MELHOR_ENVIO_CLIENT_SECRET ausente"
        )

    computed_hmac = hmac.new(
        key=secret_key.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256
    ).digest()

    expected_signature = base64.b64encode(
        computed_hmac).decode("utf-8").strip()

    # Comparação segura
    if not hmac.compare_digest(expected_signature, signature.strip()):
        logger.warning(
            f"[WebhookAuth] Assinatura inválida! IP: {getattr(request.client, 'host', 'unknown')}\n"
            f"Recebido : {signature[:60]}...\n"
            f"Esperado: {expected_signature[:60]}..."
        )
        raise HTTPException(
            status_code=401, detail="Assinatura de webhook inválida")

    logger.info(
        f"✅ Assinatura Melhor Envio validada com sucesso para evento: {payload.get('event') if 'payload' in locals() else 'unknown'}")
