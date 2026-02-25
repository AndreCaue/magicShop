from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID


class OrderShippingOut(BaseModel):
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str
    postal_code: str


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
    status: str
    payment_status: str
    subtotal: float
    shipping_method: str
    shipping_carrier: str
    shipping_cost: float
    shipping_discount: Optional[float] = 0
    shipping_original: float
    shipping_delivery_days: int
    # Falta imagem da empresa do transporte, melhoria futura.
    total: float
    created_at: Optional[str] = None
    reservation_expires_at: Optional[str] = None
    user: Optional[OrderUserOut] = None
    shipping: Optional[OrderShippingOut] = None
    items: List[OrderItemOut]
