from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db
from app.store.orders.models import Order
from datetime import datetime, timezone
import logging

router = APIRouter(prefix="/webhook", tags=["Webhook"])
logger = logging.getLogger(__name__)


@router.post("/efipay")
async def efipay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Recebe notificações da Efipay sobre transações de cartão
    """
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"❌ Erro ao parsear payload: {e}")
        raise HTTPException(status_code=400, detail="Payload inválido")

    # Log completo para debug
    print("\n" + "=" * 60)
    print("🔔 WEBHOOK EFIPAY RECEBIDO")
    print("=" * 60)
    print(f"📦 Payload completo: {payload}")
    print("=" * 60 + "\n")

    # ✅ CORREÇÃO: A Efipay pode enviar o payload de diferentes formas
    # Vamos verificar ambas as estruturas possíveis

    # Estrutura 1: {"notification": {"charge_id": ..., "status": ...}}
    notification = payload.get("notification")

    # Estrutura 2: {"type": "charge", "data": {"charge_id": ..., "status": ...}}
    if not notification:
        notification = payload.get("data")

    # Estrutura 3: Payload direto (raro, mas possível)
    if not notification and payload.get("charge_id"):
        notification = payload

    if not notification:
        logger.warning(f"⚠️ Webhook sem notification/data válido: {payload}")
        # ✅ IMPORTANTE: Retornar 200 mesmo assim para não fazer a Efipay reenviar
        return {"received": True, "warning": "Payload não contém notification"}

    # Extrair dados
    charge_id = notification.get("charge_id")
    if charge_id:
        charge_id = str(charge_id)

    status = notification.get("status")
    custom_id = notification.get("custom_id")

    logger.info(
        f"Charge ID: {charge_id}, Status: {status}, Custom ID: {custom_id}")

    if not charge_id:
        logger.warning(f"⚠️ Webhook sem charge_id: {payload}")
        return {"received": True, "warning": "Sem charge_id"}

    # Buscar pedido
    order = db.query(Order).filter(
        Order.efipay_charge_id == charge_id
    ).first()

    if not order:
        logger.warning(f"⚠️ Pedido não encontrado para charge_id: {charge_id}")
        # ✅ IMPORTANTE: Retornar 200 para não fazer a Efipay reenviar
        return {"received": True, "warning": f"Pedido não encontrado para charge_id {charge_id}"}

    # ✅ Atualizar status do pedido
    logger.info(
        f"📝 Atualizando pedido {order.id} - Status atual: {order.payment_status} -> Novo: {status}")

    # if status == "paid":
    # order.payment_status = "pago"
    # order.status = "confirmed"
    # logger.info(f"✅ Pagamento confirmado para pedido {order.id}")

    # 📧 Enviar email de confirmação (implementar depois)
    # await send_payment_confirmation_email(order)

# Adicionar webhook para outros eventos
# elif status == "refunded":
    # order.payment_status = "reembolsado"
    # order.status = "refunded"
    # logger.info(f"💰 Pedido {order.id} reembolsado")

    # 📧 Enviar email de reembolso
    # await send_refund_notification_email(order)

    if status == "paid":
        order.payment_status = "pago"
        order.status = "confirmed"
        logger.info(f"✅ Pagamento confirmado para pedido {order.id}")

    elif status == "unpaid":
        order.payment_status = "aguardando_pagamento"
        logger.info(f"⏳ Pedido {order.id} aguardando pagamento")

    elif status == "canceled":
        order.payment_status = "cancelado"
        order.status = "canceled"
        logger.info(f"❌ Pedido {order.id} cancelado")

    elif status == "refunded":
        order.payment_status = "reembolsado"
        order.status = "refunded"
        logger.info(f"💰 Pedido {order.id} reembolsado")

    elif status == "waiting":
        order.payment_status = "aguardando_pagamento"
        logger.info(f"⏳ Pedido {order.id} em espera")

    else:
        # Status desconhecido - apenas logar
        logger.warning(
            f"⚠️ Status desconhecido '{status}' para pedido {order.id}")
        order.payment_status = status  # Salvar o status original

    order.updated_at = datetime.now(timezone.utc)
# proximo passo, retirar o os prints, loggs, fazer teste em prod.
# melhorias, criar um disparo de email para pedidos prontos e processados (feedback .)
# fazer webhook pix.
    try:
        db.commit()
        logger.info(f"✅ Pedido {order.id} atualizado com sucesso no banco")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao salvar pedido {order.id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar pedido")

    return {
        "received": True,
        "order_id": order.id,
        "charge_id": charge_id,
        "status": status,
        "updated_at": order.updated_at.isoformat()
    }


@router.get("/efipay/test")
async def test_webhook_endpoint():
    """Endpoint de teste para verificar se o webhook está acessível"""
    return {
        "status": "ok",
        "message": "Webhook endpoint Efipay está funcionando!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
