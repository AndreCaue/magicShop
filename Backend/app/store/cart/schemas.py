from pydantic import BaseModel
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