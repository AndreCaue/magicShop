from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.models import User
from typing import Optional, List
from sqlalchemy import func

from uuid import UUID
from app.auth.dependencies import get_db, require_user, require_master_full_access
from app.store.orders.models import Order, OrderItem
from app.store.orders.enums import PaymentStatus
from .schemas import OrderDetailOut, HasOrderDetail, OrderListItemOut
from datetime import datetime, timezone, tzinfo
from .services import finalizar_envio_pedido, get_admin_orders
import logging


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
        "message": '',
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


@router.get("/list/admin")
async def list_admin_orders(
    user: User = Depends(require_master_full_access),
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    try:
        orders, total = get_admin_orders(
            db=db,
            status=status,
            page=page,
            page_size=page_size,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:

        raise HTTPException(
            status_code=500, detail="Erro interno ao listar pedidos")

    return {
        "data": orders,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
        },
    }


@router.get("/admin/{order_uuid}")
async def get_admin_order(
    order_uuid: str,
    _: User = Depends(require_master_full_access),
    db: Session = Depends(get_db),
):
    """
    Retorna todos os dados detalhados de um pedido para o admin.
    """

    order = (
        db.query(Order)
        .options(
            joinedload(Order.items),
            joinedload(Order.shipping),
            joinedload(Order.refunds),
        )
        .filter(Order.uuid == order_uuid)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    items = [
        {
            "id": item.id,
            "name": item.product_name,
            "qty": item.quantity,
            "unit_price": float(item.unit_price),
            "total_price": float(item.total_price),
            "image": item.img_product,
        }
        for item in order.items
    ]

    shipping = None
    if order.shipping:
        shipping = {
            "recipient_name": order.shipping.recipient_name,
            "recipient_phone": order.shipping.recipient_phone,
            "recipient_email": order.shipping.recipient_email,
            "street": order.shipping.street,
            "number": order.shipping.number,
            "complement": order.shipping.complement,
            "city": order.shipping.city,
            "state": order.shipping.state,
            "postal_code": order.shipping.postal_code,
        }

    refunds = [
        {
            "id": refund.id,
            "status": refund.status,
            "created_at": refund.created_at,
        }
        for refund in order.refunds
    ]

    return {
        "id": order.uuid,
        "short_id": f"P-{str(order.uuid)[:5].upper()}",
        "status": order.status,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "subtotal": float(order.subtotal),
        "total": float(order.total),
        "created_at": order.created_at,
        "paid_at": order.paid_at,
        "shipping_carrier": order.shipping_carrier,
        "shipping_method": order.shipping_method,
        "shipping_cost": order.shipping_cost,
        "shipping_delivery_days": order.shipping_delivery_days,
        "melhorenvio_shipment_id": order.melhorenvio_shipment_id,
        "items": items,
        "shipping": shipping,
        "refunds": refunds,
    }


@router.post("/{order_uuid}/checkout")
async def gerar_etiqueta(
    order_uuid: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_master_full_access),
):
    """
     Checkout externo.
     Geração etiqueta.
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.shipments))
        .filter(Order.uuid == order_uuid)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if order.payment_status != PaymentStatus.PAID:
        raise HTTPException(
            status_code=400, detail="Pedido não pago — não é possível gerar etiqueta")

    try:
        shipment_data = await finalizar_envio_pedido(order, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"[gerar_etiqueta] Erro inesperado: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail="Erro interno ao gerar etiqueta")

    return {
        "success": True,
        "message": "Etiqueta gerada com sucesso",
        "order_uuid": order_uuid,
        "data": shipment_data,
    }
