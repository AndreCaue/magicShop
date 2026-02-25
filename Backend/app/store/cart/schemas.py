from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    product_name: str
    product_image_urls: list[str]
    discount: Optional[float]
    height: float
    width: float
    weight: float
    length: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    status: str
    items: List[CartItemResponse]
    discount: Optional[float] | None = None
    total: float

    class Config:
        from_attributes = True


class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1


class AddToCartResponse(BaseModel):
    message: str
    cart: CartResponse

# Checkout


class CheckoutRequest(BaseModel):
    recipient_name: str = Field(..., min_length=3)
    recipient_document: str = Field(..., min_length=11, max_length=14)
    recipient_email: EmailStr
    recipient_phone: str = Field(..., min_length=10, max_length=15)

    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str = Field(..., min_length=2, max_length=2)  # ex: "SP"
    postal_code: str = Field(..., min_length=8, max_length=8)
    shipping_option_id: int

    usar_seguro: bool = False
