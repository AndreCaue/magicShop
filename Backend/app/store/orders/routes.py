from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.models import User

from uuid import UUID
from app.auth.dependencies import get_db, require_user
from app.store.orders.models import Order
from .schemas import OrderDetailOut, OrderItemOut, OrderShippingOut
from datetime import datetime, timezone


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/{order_uuid}", response_model=OrderDetailOut)
async def get_order_for_payment(
    order_uuid: UUID,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Retorna os detalhes completos de um pedido específico.
    """
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items),
            joinedload(Order.shipping),
        )
        .filter(Order.uuid == str(order_uuid), Order.user_id == user.id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado"
        )

    if order.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para visualizar este pedido"
        )

    now = datetime.now(timezone.utc)

    expires_at = order.reservation_expires_at

    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at and expires_at < now:
        if order.status in ["pending", "awaiting_payment"]:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="O prazo de reserva deste pedido expirou. Inicie um novo checkout."
            )

    return {
        "id": order.uuid,
        # "user_id": order.user_id,
        "status": order.status,
        "payment_status": order.payment_status,
        "subtotal": float(order.subtotal),
        "shipping_cost": float(order.shipping_cost),
        "shipping_discount": float(order.shipping_discount or 0),
        "shipping_original": float(order.shipping_original or 1),

        "shipping_carrier": order.shipping_carrier,
        "shipping_method": order.shipping_method,
        "shipping_delivery_days": order.shipping_delivery_days,



        "total": float(order.total),
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "reservation_expires_at": (
            order.reservation_expires_at.isoformat()
            if order.reservation_expires_at
            else None
        ),
        "user": {
            "recipient_name": order.shipping.recipient_name if order.shipping else None,
            "recipient_document": order.shipping.recipient_document if order.shipping else None,
        },

        "shipping": {
            "street": order.shipping.street if order.shipping else None,
            "number": order.shipping.number if order.shipping else None,
            "complement": order.shipping.complement if order.shipping else None,
            "neighborhood": order.shipping.neighborhood if order.shipping else None,
            "city": order.shipping.city if order.shipping else None,
            "state": order.shipping.state if order.shipping else None,
            "postal_code": order.shipping.postal_code if order.shipping else None,
        } if order.shipping else None,
        "items": [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
                "img_product": item.img_product,
                "product_name": item.product.name if hasattr(item, "product") else None
            }
            for item in order.items
        ],
    }
