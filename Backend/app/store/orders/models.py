import uuid
from sqlalchemy import Column, Integer, Float, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(
        String(36),
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
        index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    status = Column(String, default="pending")

    efipay_charge_pix_id = Column(String, index=True, nullable=True)
    efipay_charge_card_id = Column(String, index=True, nullable=True)
    payment_status = Column(String, default="aguardando_pagamento")

    paid_at = Column(DateTime, nullable=True)
    reservation_expires_at = Column(DateTime, nullable=True)

    shipping_carrier = Column(String, nullable=False)
    shipping_method = Column(String, nullable=False)
    shipping_cost = Column(Float, nullable=False)  # final value
    shipping_discount = Column(Float, nullable=True)  # discount
    shipping_original = Column(Float, nullable=False)
    shipping_delivery_days = Column(Integer, nullable=False)

    subtotal = Column(Float)
    total = Column(Float)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc))

    # pix
    pix_charge = relationship(
        "PixCharge", back_populates="order", uselist=False)

    items = relationship("OrderItem", back_populates="order",
                         cascade="all, delete-orphan")
    shipping = relationship(
        "OrderShipping",
        back_populates="order",
        uselist=False,
        cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    img_product = Column(String, nullable=True, default='')
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class OrderShipping(Base):
    __tablename__ = "order_shippings"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"),
                      unique=True, nullable=False)

    recipient_name = Column(String, nullable=False)
    recipient_document = Column(String, nullable=False)  # CPF/CNPJ
    recipient_phone = Column(String, nullable=False)
    recipient_email = Column(String, nullable=False)

    street = Column(String, nullable=False)
    number = Column(String, nullable=False)
    complement = Column(String, nullable=True)
    neighborhood = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String(2), nullable=False)   # SP, RJ...
    postal_code = Column(String(8), nullable=False)   # 00000000

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(
        timezone.utc), onupdate=datetime.now(timezone.utc))

    order = relationship("Order", back_populates="shipping")
