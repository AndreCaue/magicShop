import uuid
from sqlalchemy import Column, Integer, Float, ForeignKey, String, DateTime, Enum as SqlEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from .enums import PaymentStatus, OrderStatus
from app.payment.refund.enums import PaymentMethod


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

    status = Column(SqlEnum(OrderStatus), default=OrderStatus.PENDING)
    payment_status = Column(SqlEnum(PaymentStatus),
                            default=PaymentStatus.PENDING)
    efipay_charge_pix_id = Column(String, index=True, nullable=True)
    efipay_charge_card_id = Column(String, index=True, nullable=True)

    delivered_at = Column(DateTime, nullable=True, index=True)
    shipped_at = Column(DateTime, nullable=True)

    paid_at = Column(DateTime, nullable=True)
    payment_method = Column(SqlEnum(PaymentMethod), nullable=True)
    reservation_expires_at = Column(DateTime, nullable=True)

    shipping_carrier = Column(String, nullable=False)
    shipping_method = Column(String, nullable=False)
    shipping_cost = Column(Float, nullable=False)
    shipping_discount = Column(Float, nullable=True)
    shipping_original = Column(Float, nullable=False)
    shipping_delivery_days = Column(Integer, nullable=False)
    melhorenvio_shipment_id = Column(String(50), nullable=True, index=True)
    shipping_service_id = Column(Integer, nullable=True)

    subtotal = Column(Float)
    total = Column(Float)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(
        timezone.utc), onupdate=datetime.now(timezone.utc))

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
    shipments = relationship(
        "OrderShipment",
        back_populates="order",
        cascade="all, delete-orphan"
    )
    refunds = relationship(
        "RefundRequest",
        back_populates="order",
        cascade="all, delete-orphan",  
        passive_deletes=True
    )
    status_history = relationship(
        "ShippingStatusHistory",
        back_populates="order",
        cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
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
    recipient_document = Column(String, nullable=False) 
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


class OrderShipment(Base):
    __tablename__ = "order_shipments"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id"),
                      nullable=False, index=True)

    melhorenvio_cart_id = Column(String(50), nullable=True, index=True)
    melhorenvio_order_id = Column(String(50), nullable=True, index=True)

    tracking_code = Column(String(50), nullable=True, index=True)
    tracking_url = Column(String, nullable=True)

    label_url = Column(String, nullable=True)

    shipping_company = Column(String(50), nullable=True)
    shipping_service = Column(String(50), nullable=True)

    shipping_status = Column(String(30), nullable=True, index=True)

    posted_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    estimated_delivery_at = Column(DateTime, nullable=True)

    is_reverse = Column(Boolean, default=False)
    reverse_order_id = Column(String(50), nullable=True)

    shipping_cost = Column(Float, nullable=True)

    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    width = Column(Float, nullable=True)
    length = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(
        timezone.utc), onupdate=datetime.now(timezone.utc))

    order = relationship("Order", back_populates="shipments")

    status_history = relationship(
        "ShippingStatusHistory",
        back_populates="shipment",
        cascade="all, delete-orphan"
    )


class ShippingStatusHistory(Base):
    __tablename__ = "shipping_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"),
                      nullable=False, index=True)
    shipment_id = Column(Integer, ForeignKey(
        "order_shipments.id"), nullable=True, index=True)

    melhorenvio_status = Column(String(50), nullable=False)
    melhorenvio_status_label = Column(
        String(100), nullable=True)

    message = Column(String(500), nullable=True)
    location = Column(String(200), nullable=True)

    raw_payload = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    order = relationship("Order", back_populates="status_history")
    shipment = relationship("OrderShipment", back_populates="status_history")
