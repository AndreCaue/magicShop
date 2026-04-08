from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging
from app.database import SessionLocal
from app.store.orders.models import Order, OrderItem
from app.store.models import Product
from app.store.orders.enums import OrderStatus, PaymentStatus

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def cleanup_expired_reservations():
    """
    Limpa reservas expiradas de pedidos não pagos.
    Roda a cada X minutos (ex: 5 ou 10 min). 6h
    """
    db: Session = SessionLocal()

    try:
        now = datetime.now(timezone.utc)
        expired_orders = (
            db.query(Order)
            .filter(
                Order.reservation_expires_at < now,
                Order.status == OrderStatus.PENDING,  
                Order.payment_status == PaymentStatus.PENDING, 
            )
            .all()
        )

        if not expired_orders:
            return

        for order in expired_orders:
            for item in order.items:
                product = db.query(Product).filter(
                    Product.id == item.product_id).first()
                if product:
                    product.reserved_stock = max(
                        0, (product.reserved_stock or 0) - (item.quantity or 0)
                    )

            order.status = OrderStatus.CANCELED
            order.payment_status = PaymentStatus.CANCELED
            order.reservation_expires_at = None
            order.updated_at = datetime.now(timezone.utc)

        db.commit()
        logger.info(f"[Cleanup] {len(expired_orders)} reservas expiradas liberadas.")

    except Exception as e:
        db.rollback()
        logger.error(f"[Cleanup] Erro ao limpar reservas expiradas: {e}", exc_info=True)
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(
        cleanup_expired_reservations,
        trigger=IntervalTrigger(hours=6),  # diminuir com o fluxo
        id="cleanup_reservations",
        name="Limpar reservas expiradas de PIX",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler iniciado: cleanup de reservas expiradas a cada 6 horas")
