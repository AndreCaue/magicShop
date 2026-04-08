from fastapi import HTTPException
from app.melhorenvio.service import gerar_etiqueta_melhor_envio
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from .models import Order, OrderItem, OrderStatus, OrderShipment


async def finalizar_envio_pedido(order: Order, db: Session) -> dict:

    active_shipment = (
        db.query(OrderShipment)
        .filter(
            OrderShipment.order_id == order.id,
            OrderShipment.is_reverse == False
        )
        .with_for_update()
        .first()
    )

    if not active_shipment:
        raise ValueError(
            "Pedido não possui envio registrado no carrinho do ME")

    if active_shipment.melhorenvio_order_id:
        raise ValueError("Etiqueta já foi gerada para este pedido")

    response = await gerar_etiqueta_melhor_envio(
        active_shipment.melhorenvio_cart_id
    )

    purchase = response.get("purchase") or {}
    orders_list = purchase.get("orders") or response.get("orders") or []

    if not orders_list:
        raise ValueError(f"Resposta sem orders: {response}")

    shipment_data = orders_list[0]

    active_shipment.melhorenvio_order_id = shipment_data.get("id")
    active_shipment.tracking_code = shipment_data.get("tracking")
    active_shipment.label_url = (
        shipment_data.get("self_tracking")
        or shipment_data.get("label")
        or shipment_data.get("url")
    )
    active_shipment.shipping_status = shipment_data.get("status", "purchased")

    db.commit()
    db.refresh(active_shipment)

    return shipment_data


def get_admin_orders(
    db: Session,
    status: Optional[str],
    page: int,
    page_size: int,
) -> tuple[list[dict], int]:
    """
    Retorna (lista de pedidos serializados, total de registros).
    """
    query = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.shipping),
            joinedload(Order.shipments),  
            joinedload(Order.refunds),
        )
    )

    if status:
        try:
            query = query.filter(Order.status == OrderStatus(status))
        except ValueError:
            raise ValueError(f"Status inválido: '{status}'")

    total = query.with_entities(func.count(Order.id)).scalar()

    orders = (
        query
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return [_serialize_order(o) for o in orders], total


def _serialize_order(order: Order) -> dict:
    active_shipment = next(
        (s for s in sorted(order.shipments, key=lambda s: s.created_at, reverse=True)
         if not s.is_reverse),
        None
    )

    return {
        "id": order.uuid,
        "short_id": f"P-{str(order.uuid)[:5].upper()}",

        "status": order.status,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "paid_at": order.paid_at,

        "total": float(order.total),
        "subtotal": float(order.subtotal),

        "shipping_cost": float(order.shipping_cost),
        "shipping_discount": float(order.shipping_discount or 0),
        "shipping_original": float(order.shipping_original),
        "shipping_carrier": order.shipping_carrier,
        "shipping_method": order.shipping_method,
        "shipping_delivery_days": order.shipping_delivery_days,
        "shipping_service_id": order.shipping_service_id,

        "melhorenvio_cart_id": active_shipment.melhorenvio_cart_id if active_shipment else None,
        "melhorenvio_order_id": active_shipment.melhorenvio_order_id if active_shipment else None,
        "tracking_code": active_shipment.tracking_code if active_shipment else None,
        "shipping_status": active_shipment.shipping_status if active_shipment else None,

        "delivered_at": order.delivered_at,
        "shipped_at": order.shipped_at,
        "created_at": order.created_at,
        "updated_at": order.updated_at,

        "items": [
            {
                "id": item.id,
                "name": item.product_name,
                "image": item.img_product,
                "qty": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
                "product_id": item.product_id,
            }
            for item in order.items
        ],

        "shipping": {
            "recipient_name": order.shipping.recipient_name,
            "recipient_document": order.shipping.recipient_document,
            "recipient_phone": order.shipping.recipient_phone,
            "recipient_email": order.shipping.recipient_email,
            "street": order.shipping.street,
            "number": order.shipping.number,
            "complement": order.shipping.complement,
            "neighborhood": order.shipping.neighborhood,
            "city": order.shipping.city,
            "state": order.shipping.state,
            "postal_code": order.shipping.postal_code,
        } if order.shipping else None,

        "refunds": [
            {
                "id": r.id,
                "status": r.status,
                "created_at": r.created_at,
            }
            for r in order.refunds
        ],
    }
