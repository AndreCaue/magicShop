from pydantic import BaseModel, field_validator, Field
from typing import List

class Item(BaseModel):
    name: str
    quantity: int = Field(..., gt=0)
    unit_price: int = Field(..., gt=0) 

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

class CardOneStepRequest(BaseModel):
    items: List[Item]
    payment_token: str
    installments: int = Field(1, ge=1, le=12)
    customer: Customer
    billing_address: BillingAddress

class PixRequest(BaseModel):
    chave: str
    valor_original: float = 5.00
    expiracao: int = 3600
    solicitacao_pagador: str | None = "Teste de cobrança Pix"
    devedor_cpf: str | None = "12345678909"
    devedor_nome: str | None = "Nome Teste"

    @field_validator("valor_original")
    @classmethod
    def validate_and_format_value(cls, v: float) -> str:
        if v <= 0:
            raise ValueError("Valor deve ser positivo")
        return f"{v:.2f}"