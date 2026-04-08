from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
import logging
from app.auth.dependencies import get_db
from app.core.webhook_auth import verify_efipay_webhook_token
from app.store.orders.models import Order
from datetime import datetime, timezone
from app.store.orders.enums import OrderStatus, PaymentStatus
from app.payment.service import EfiService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["Webhook"])


@router.post("/efipay")
async def efipay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook da Efí para cobranças de cartão.
    URL deve incluir: ?webhook_token=<WEBHOOK_SECRET>
    """
    verify_efipay_webhook_token(request)

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Payload inválido")

    notification = (
        payload.get("notification")
        or payload.get("data")
        or payload
    )

    charge_id = str(notification.get("charge_id", ""))
    status = notification.get("status", "").lower()

    if not charge_id:
        return {"received": True, "warning": "Sem charge_id"}

    order = db.query(Order).filter(
        Order.efipay_charge_card_id == charge_id
    ).first()

    if not order:
        return {"received": True, "warning": "Pedido não encontrado"}

    # Evita reprocessamento
    if order.payment_status == PaymentStatus.PAID and status == "confirmed":
        return {"received": True, "ignored": "já pago"}

    if status == "paid":
        order.payment_status = PaymentStatus.PAID
        order.status = OrderStatus.CONFIRMED

    elif status in ["waiting", "unpaid"]:
        order.payment_status = PaymentStatus.PENDING

    elif status == "canceled":
        order.payment_status = PaymentStatus.CANCELED
        order.status = OrderStatus.CANCELED
        EfiService.release_stock(order, db)

    elif status == "refunded":
        order.payment_status = PaymentStatus.REFUNDED
        order.status = OrderStatus.REFUNDED

    elif status == "denied":
        order.payment_status = PaymentStatus.FAILED
        order.status = OrderStatus.CANCELED
        EfiService.release_stock(order, db)

    else:
        order.payment_status = PaymentStatus.PENDING

    order.updated_at = datetime.now(timezone.utc)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(500, "Erro ao atualizar pedido")

    logger.info(f"Webhook EfiPay processado: order={order.uuid}, status={status}")
    return {
        "received": True,
        "order_id": order.uuid,
        "status": status,
    }
