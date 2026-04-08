
import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.store.orders.models import Order, OrderShipment, ShippingStatusHistory
from app.store.orders.enums import OrderStatus
from app.store.models import Product
from .schemas import MelhorEnvioWebhookPayload
from .email import send_shipping_status_email, STATUS_INFO



MELHORENVIO_TO_ORDER_STATUS: dict[str, OrderStatus] = {
    "posted": OrderStatus.PROCESSING,   
    "shipped": OrderStatus.SHIPPED,
    "delivered": OrderStatus.DELIVERED,
    "returned": OrderStatus.RETURNED,
}

EMAIL_NOTIFY_STATUSES = {"posted", "shipped", "delivered", "returned"}


async def handle_melhorenvio_webhook(
    payload: MelhorEnvioWebhookPayload,
    db: Session,
) -> None:
    """
    Ponto de entrada do webhook.
    1. Identifica o envio pelo melhorenvio_order_id
    2. Atualiza OrderShipment
    3. Atualiza OrderStatus se aplicável
    4. Salva ShippingStatusHistory
    5. Dispara e-mail se o status for relevante
    """

    shipment_me_id = payload.get_shipment_id()
    new_status = payload.get_status()

    if not shipment_me_id:
        print("⚠️ Webhook ME recebido sem shipment_id — ignorando.")
        return

    if not new_status:
        print(
            f"⚠️ Webhook ME sem status para shipment {shipment_me_id} — ignorando.")
        return

    shipment = (
        db.query(OrderShipment)
        .filter(OrderShipment.melhorenvio_order_id == shipment_me_id)
        .first()
    )

    if not shipment:
        shipment = (
            db.query(OrderShipment)
            .filter(OrderShipment.melhorenvio_cart_id == shipment_me_id)
            .first()
        )

    if not shipment:
        print(
            f"⚠️ Nenhum OrderShipment encontrado para ME id={shipment_me_id}")
        return

    order: Order = shipment.order

    if not order:
        print(f"⚠️ OrderShipment {shipment.id} sem Order vinculado.")
        return

    now = datetime.now(timezone.utc)

    tracking_code = payload.get_tracking()
    tracking_url = payload.get_tracking_url()

    shipment.shipping_status = new_status

    if tracking_code and not shipment.tracking_code:
        shipment.tracking_code = tracking_code

    if tracking_url and not shipment.tracking_url:
        shipment.tracking_url = tracking_url

    if new_status == "posted" and not shipment.posted_at:
        shipment.posted_at = now

    if new_status == "delivered" and not shipment.delivered_at:
        shipment.delivered_at = now

    new_order_status = MELHORENVIO_TO_ORDER_STATUS.get(new_status)

    if new_order_status:
        order.status = new_order_status

        if new_status == "shipped" and not order.shipped_at:
            order.shipped_at = now

        if new_status == "delivered" and not order.delivered_at:
            order.delivered_at = now

    if tracking_code and not order.melhorenvio_shipment_id:
        order.melhorenvio_shipment_id = shipment_me_id

    history_entry = ShippingStatusHistory(
        order_id=order.id,
        shipment_id=shipment.id,
        melhorenvio_status=new_status,
        melhorenvio_status_label=payload.get_status_label(),
        message=payload.get_message(),
        location=payload.get_location(),
        raw_payload=json.dumps(payload.model_dump()),
    )
    db.add(history_entry)

    db.commit()
    db.refresh(shipment)
    db.refresh(order)

    if new_status in ("posted", "delivered"):
        _confirm_stock(order=order, db=db)

    print(f"✅ Webhook ME processado: order={order.uuid} status={new_status}")

    if new_status in EMAIL_NOTIFY_STATUSES:
        _send_status_email(order=order, status=new_status, payload=payload)


def _confirm_stock(order: Order, db: Session) -> None:
    """
    Decrementa definitivamente o stock real do produto e libera o reserved_stock.
    Idempotente: só executa uma vez por pedido (verifica order.stock_reserved).
    Chamado quando o Melhor Envio confirma que o item saiu fisicamente (posted/delivered).
    """
    if not getattr(order, "stock_reserved", True):
        return

    try:
        for item in order.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if product is None:
                continue

            qty = item.quantity or 0

            product.stock = max(0, (product.stock or 0) - qty)

            product.reserved_stock = max(0, (product.reserved_stock or 0) - qty)

        order.stock_reserved = False
        db.commit()
        print(f"[Stock] Estoque confirmado para order {order.uuid}")

    except Exception as e:
        db.rollback()
        print(f"[Stock Error] Falha ao confirmar estoque para order {order.uuid}: {e}")


def _send_status_email(
    order: Order,
    status: str,
    payload: MelhorEnvioWebhookPayload,
) -> None:
    """Dispara e-mail de notificação para o destinatário do pedido."""
    try:
        shipping = order.shipping 

        if not shipping or not shipping.recipient_email:
            print(
                f"⚠️ Order {order.uuid} sem shipping/email — e-mail não enviado.")
            return

        latest_shipment = (
            order.shipments[-1] if order.shipments else None
        )
        tracking_code = (
            payload.get_tracking()
            or (latest_shipment.tracking_code if latest_shipment else None)
        )
        tracking_url = (
            payload.get_tracking_url()
            or (latest_shipment.tracking_url if latest_shipment else None)
        )

        send_shipping_status_email(
            to_email=shipping.recipient_email,
            recipient_name=shipping.recipient_name,
            order_uuid=order.uuid,
            status=status,
            status_label=payload.get_status_label(),
            tracking_code=tracking_code,
            tracking_url=tracking_url,
        )

        print(
            f"📧 E-mail de '{status}' enviado para {shipping.recipient_email}")

    except Exception as e:
        print(f"❌ Falha ao enviar e-mail de status '{status}': {e}")
