from pydantic import BaseModel, field_validator, Field, model_validator
from typing import List, Optional
from uuid import UUID


class Item(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class Customer(BaseModel):
    name: str
    email: str
    cpf: str
    phone_number: str | None = None


class BillingAddress(BaseModel):
    street: str
    number: str
    neighborhood: str
    city: str
    state: str
    zipcode: str


class ShippingInfo(BaseModel):
    name: str
    value: int  # cents
    payee_code: Optional[str] = None


class CardOneStepRequest(BaseModel):
    order_uuid: UUID
    payment_token: str
    installments: int = Field(1, ge=1, le=12)
    name_on_card: str


class PixRequest(BaseModel):
    expiracao: int = 3600
    order_uuid: UUID

    @field_validator("expiracao")
    @classmethod
    def validate_expiration(cls, v):
        return min(max(v or 1800, 300), 86400)


class InstallmentsRequest(BaseModel):
    total_value: float
    brand: str
