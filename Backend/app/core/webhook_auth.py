"""
Utilitários de autenticação para webhooks externos.

Estratégia:
- EfiPay (cartão + PIX): token secreto via query param na URL cadastrada.
  A URL registrada na EfiPay inclui ?webhook_token=<WEBHOOK_SECRET>.
  Toda requisição recebida deve trazer esse parâmetro.

- Melhor Envio: token secreto no header Authorization do webhook registrado
  no painel. Validamos o Bearer token enviado pelo ME.

O WEBHOOK_SECRET é definido no .env e lido via settings.WEBHOOK_SECRET.
Em desenvolvimento (WEBHOOK_SECRET vazio), a validação é ignorada.
"""

import logging
from fastapi import HTTPException, Request, status
from app.core.config import settings

logger = logging.getLogger(__name__)


def _is_validation_enabled() -> bool:
    """Retorna True se a validação de webhook está ativa. Em produção, se não estiver configurado, bloqueia requerimento com erro 500."""
    if not settings.WEBHOOK_SECRET:
        if settings.ENVIRONMENT == "production":
            logger.error("[WebhookAuth] CRITICAL: WEBHOOK_SECRET vazio em ambiente 'production'! Bloqueando requisição.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro de configuração do servidor. Webhook secreto não definido em produção."
            )
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
            "[WebhookAuth] WEBHOOK_SECRET não configurado — validação desabilitada. "
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


def verify_melhorenvio_webhook_token(request: Request) -> None:
    """
    Valida o token de webhook Melhor Envio recebido no header Authorization.
    O webhook deve ser cadastrado no painel do ME com o header:
      Authorization: Bearer <WEBHOOK_SECRET>
    Lança HTTPException 401 se inválido.
    """
    if not _is_validation_enabled():
        logger.warning(
            "[WebhookAuth] WEBHOOK_SECRET não configurado — validação desabilitada. "
            "Configure antes de ir para produção."
        )
        return

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        logger.warning(
            f"[WebhookAuth] Header Authorization ausente no webhook ME. "
            f"IP: {request.client.host if request.client else 'unknown'}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de webhook inválido"
        )

    received_token = auth_header.removeprefix("Bearer ").strip()

    if received_token != settings.WEBHOOK_SECRET:
        logger.warning(
            f"[WebhookAuth] Token ME inválido. "
            f"IP: {request.client.host if request.client else 'unknown'}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de webhook inválido"
        )
