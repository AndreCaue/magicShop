from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class PackageItem(BaseModel):
    height: float = Field(..., gt=0, description="Altura em cm")
    width: float = Field(..., gt=0, description="Largura em cm")
    length: float = Field(..., gt=0, description="Comprimento em cm")
    weight: float = Field(..., gt=0, description="Peso em kg")


class AddressFrom(BaseModel):
    name: str = Field(..., min_length=3)
    phone: str = Field(..., min_length=10)
    email: str = Field(..., example="contato@sualoja.com")
    company: Optional[str] = None
    document: str = Field(..., description="CPF do remetente")
    postal_code: str = Field(..., min_length=8, max_length=8)
    street: str = Field(...)
    number: str = Field(...)
    complement: Optional[str] = None
    neighborhood: str = Field(...)
    city: str = Field(...)
    state: str = Field(min_length=2, max_length=2)


class AddressTo(BaseModel):
    name: str = Field(...)
    phone: str = Field(...)
    email: str = Field(...)
    document: str = Field(..., description="CPF/CNPJ destinatário")
    postal_code: str = Field(...)
    street: str = Field(...)
    number: str = Field(...)
    complement: Optional[str] = None
    neighborhood: str = Field(...)
    city: str = Field(...)
    state: str = Field(min_length=2, max_length=2)


class InvoiceMinimal(BaseModel):
    value: float = Field(..., ge=0,
                         description="Valor declarado da mercadoria")
    description: Optional[str] = Field(
        None, description="Descrição simples dos itens (para DC)")


class MECartCreateRequest(BaseModel):
    order_uuid: str = Field(..., description="UUID do pedido interno")


class MECartResponse(BaseModel):
    cart_id: str
    shipment_id: Optional[str] = None
    status: str
    price: float
    delivery_max: int
    delivery_min: int


class CotacaoFreteResponse(BaseModel):
    id: str
    nome: str
    empresa: str
    empresa_picture: str
    preco: float
    preco_com_desconto: float  # revisar necessidade / rever
    prazo_dias: int
    entrega_domiciliar: bool
    entrega_sabado: bool
    peso_gramas: float
    largura_cm: float
    altura_cm: float
    comprimento_cm: float


class CarrinhoItem(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class CotarFreteRequest(BaseModel):
    itens: List[CarrinhoItem] = Field(..., min_length=1)
    cart_id: int
    cep_destino: str = Field(..., example="01001000")
    valor_declarado: float = Field(0.0, ge=0, example=89.90)

    @field_validator("cep_destino")
    @classmethod
    def validar_cep(cls, v: str | None) -> str | None:
        if v is not None:
            if len(v) != 8 or not v.isdigit():
                raise ValueError(
                    "CEP deve conter exatamente 8 dígitos numéricos")
        return v
