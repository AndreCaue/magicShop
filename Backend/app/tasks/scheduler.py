# app/tasks/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.auth.dependencies import get_db  # ou SessionLocal se for sync
from app.store.orders.models import Order, OrderItem  # ajuste o import
from app.store.models import Product  # ajuste

scheduler = AsyncIOScheduler()


async def cleanup_expired_reservations():
    """
    Limpa reservas expiradas de pedidos não pagos.
    Roda a cada X minutos (ex: 5 ou 10 min). 6h
    """
    db: Session = next(get_db())  # ou SessionLocal() se sync

    try:
        now = datetime.now(timezone.utc)
        expired_orders = (
            db.query(Order)
            .filter(
                Order.reservation_expires_at < now,
                Order.status.in_(["pending", "awaiting_payment"]),
                Order.payment_status == "aguardando_pagamento",
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
                    product.reserved_stock -= item.quantity

            order.reservation_expires_at = None

        db.commit()
        print(f"[Cleanup] {len(expired_orders)} reservas expiradas liberadas.")

    except Exception as e:
        db.rollback()
        print(f"[Cleanup Error] {e}")
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
    print("Scheduler iniciado: cleanup de reservas a cada 10 min")
