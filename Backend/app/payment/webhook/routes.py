from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db
from app.store.orders.models import Order
from datetime import datetime, timezone

router = APIRouter(prefix="/webhook", tags=["Webhook"])


@router.post("/efipay")
async def efipay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Recebe notificações da Efipay sobre transações de cartão
    """
    try:
        payload = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Payload inválido")

    notification = payload.get("notification")

    if not notification:
        notification = payload.get("data")

    if not notification and payload.get("charge_id"):
        notification = payload

    if not notification:
        return {"received": True, "warning": "Payload não contém notification"}

    charge_id = notification.get("charge_id")
    if charge_id:
        charge_id = str(charge_id)

    status = notification.get("status")

    if not charge_id:
        return {"received": True, "warning": "Sem charge_id"}

    order = db.query(Order).filter(
        Order.efipay_charge_id == charge_id
    ).first()

    if not order:
        return {"received": True, "warning": f"Pedido não encontrado para charge_id {charge_id}"}

    if status == "paid":
        order.payment_status = "pago"
        order.status = "confirmed"

    elif status == "unpaid":
        order.payment_status = "aguardando_pagamento"

    elif status == "canceled":
        order.payment_status = "cancelado"
        order.status = "canceled"

    elif status == "refunded":
        order.payment_status = "reembolsado"
        order.status = "refunded"

    elif status == "waiting":
        order.payment_status = "aguardando_pagamento"

    else:
        order.payment_status = status

    order.updated_at = datetime.now(timezone.utc)
# melhorias, criar um disparo de email para pedidos prontos e processados (feedback .)
# fazer webhook pix.

    try:
        db.commit()
    except Exception as e:
        db.rollback()
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
