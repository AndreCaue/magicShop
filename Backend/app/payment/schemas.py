from pydantic import BaseModel, field_validator, Field, model_validator
from typing import List, Optional


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
    items: List[Item]
    payment_token: str
    installments: int = Field(1, ge=1, le=12)
    customer: Customer
    billing_address: BillingAddress
    shipping: Optional[ShippingInfo] = None


class PixRequest(BaseModel):
    chave: str
    valor_original: str = "5.00"
    expiracao: int = 3600
    solicitacao_pagador: str | None = "Teste de cobrança Pix"
    devedor_cpf: str | None = "12345678909"
    devedor_nome: str | None = "Nome Teste"
    order_id: int | None = None

    @field_validator("valor_original", mode="before")
    @classmethod
    def validate_and_format_value(cls, v) -> str:
        v = float(v)
        if v <= 0:
            raise ValueError("Valor deve ser positivo")
        return f"{v:.2f}"

    @model_validator(mode="after")
    def validate_devedor(self) -> "PixRequest":
        cpf_preenchido = bool(self.devedor_cpf)
        nome_preenchido = bool(self.devedor_nome)

        if cpf_preenchido != nome_preenchido:
            raise ValueError(
                "Informe CPF e Nome do devedor juntos, ou nenhum dos dois")

        return self


class InstallmentsRequest(BaseModel):
    total_value: float
    brand: str
