from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from app.payment.refund.enums import PaymentMethod


class OrderShippingOut(BaseModel):
    address: str


class OrderItemOut(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    img_product: str


class OrderUserOut(BaseModel):
    recipient_name: str
    recipient_document: str


class OrderDetailOut(BaseModel):
    id: UUID
    uuid: str
    subtotal: float
    shipping_method: str
    shipping_carrier: str
    shipping_cost: float
    shipping_discount: Optional[float] = 0
    shipping_original: float
    shipping_delivery_days: int
    expires_at: Optional[int]
    total: float
    user: Optional[OrderUserOut] = None
    shipping: Optional[OrderShippingOut] = None
    items: List[OrderItemOut]


class HasOrderDetail(BaseModel):
    success: bool
    message: str
    redirect: Optional[str]
    expires_at: Optional[int] = None


class OrderItemSummaryOut(BaseModel):
    name: str
    qty: int
    price: float
    order_item_id: int


class OrderListItemOut(BaseModel):
    id: UUID
    short_id: str
    status: str
    total: float
    created_at: datetime
    items: List[OrderItemSummaryOut]
    shipping_carrier: Optional[str]
    payment_method: PaymentMethod
    recipient_name: Optional[str]

    model_config = {"from_attributes": True}
