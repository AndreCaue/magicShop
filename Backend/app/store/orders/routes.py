from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.models import User
from typing import Optional, List

from uuid import UUID
from app.auth.dependencies import get_db, require_user
from app.store.orders.models import Order, OrderItem
from app.store.orders.enums import PaymentStatus
from .schemas import OrderDetailOut, HasOrderDetail, OrderListItemOut
from datetime import datetime, timezone, tzinfo


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get('/by-user', response_model=HasOrderDetail)
async def get_order_detail(
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Retorna se possui ordem aberta.
    Nunca retorna erro — sempre retorna o mesmo shape com success=False se não houver pedido.
    """

    NO_ORDER = {
        "message": None,
        "success": False,
        "redirect": None,
        "expires_at": 0,
    }

    try:
        order = (
            db.query(Order)
            .filter(
                Order.user_id == user.id,
                Order.reservation_expires_at > datetime.now(timezone.utc),
            )
            .first()
        )

        if not order:
            return NO_ORDER

        now = datetime.now(timezone.utc)
        expires_at = order.reservation_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        expires_in_seconds = max(0, int((expires_at - now).total_seconds()))
        short_uuid = f"P-{str(order.uuid)[:5].upper()}"

        if order.efipay_charge_card_id:
            return {
                "message": f"Pedido aguardando pagamento ou já pago, aguarde o tempo para realizar outra compra! Pedido Nº #{short_uuid}",
                "success": True,
                "redirect": "/",
                "expires_at": expires_in_seconds,
            }

        if order.efipay_charge_pix_id:
            if order.paid_at or order.payment_status == PaymentStatus.PAID:
                return {
                    "message": f"Pedido pago via PIX, aguarde o tempo para realizar outra compra! Pedido Nº #{short_uuid}",
                    "success": True,
                    "redirect": "/",
                    "expires_at": expires_in_seconds,
                }
            return {
                "message": f"Pedido aguardando pagamento. Se já realizou o pagamento, ignore e aguarde. Pedido Nº #{short_uuid}",
                "success": True,
                "redirect": f"/checkout/{str(order.uuid)}",
                "expires_at": expires_in_seconds,
            }

        return {
            "message": f"Pedido Nº #{short_uuid} — finalize o pagamento ou aguarde o tempo para realizar outra compra!",
            "success": True,
            "redirect": f"/checkout/{str(order.uuid)}",
            "expires_at": expires_in_seconds,
        }

    except Exception:
        return NO_ORDER


@router.get("/list", response_model=List[OrderListItemOut])
async def list_orders(
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """
    Lista todos os pedidos do usuário autenticado.
    Suporta filtro por status e paginação.
    """
    query = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.shipping),
        )
        .filter(Order.user_id == user.id)
    )

    if status_filter:
        query = query.filter(Order.payment_status == status_filter)

    query = query.order_by(Order.created_at.desc())

    offset = (page - 1) * page_size
    orders = query.offset(offset).limit(page_size).all()

    result = []
    for order in orders:
        short_uuid = f"P-{str(order.uuid)[:5].upper()}"

        items = []

        for item in order.items:
            items.append({
                "name": item.product_name,
                "qty": item.quantity,
                "price": float(item.unit_price),
                "order_item_id": item.id,
            })

        result.append({
            "id": order.uuid,
            "short_id": short_uuid,
            "status": order.status,
            "total": float(order.total),
            "created_at": order.created_at,
            "items": items,
            "shipping_carrier": order.shipping_carrier,
            "payment_method": order.payment_method,
            "recipient_name": order.shipping.recipient_name if order.shipping else None,
        })

    return result


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

    expires_in_seconds = max(
        0, int((expires_at - now).total_seconds())) if expires_at else None

    short_uuid = f"P-{str(order.uuid)[:5].upper()}"

    return {
        "id": order.uuid,
        "uuid": short_uuid,
        # "user_id": order.user_id,
        # "status": order.status,
        "payment_status": order.payment_status,
        "subtotal": float(order.subtotal),
        "shipping_cost": float(order.shipping_cost),
        "shipping_discount": float(order.shipping_discount or 0),
        "shipping_original": float(order.shipping_original or 1),

        "shipping_carrier": order.shipping_carrier,
        "shipping_method": order.shipping_method,
        "shipping_delivery_days": order.shipping_delivery_days,

        "expires_at": expires_in_seconds,

        "total": float(order.total),

        "user": {
            "recipient_name": order.shipping.recipient_name if order.shipping else None,
            "recipient_document": order.shipping.recipient_document if order.shipping else None,
        },

        "shipping": {
            "address": f"{order.shipping.street} - {order.shipping.number} - {order.shipping.neighborhood}",
            #     "number": order.shipping.number if order.shipping else None,
            #     "complement": order.shipping.complement if order.shipping else None,
            # "neighborhood": order.shipping.neighborhood if order.shipping else None,
            #     "city": order.shipping.city if order.shipping else None,
            #     "state": order.shipping.state if order.shipping else None,
            #     "postal_code": order.shipping.postal_code if order.shipping else None,
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
