from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional
from .branch.schemas import BrandResponse  # ajuste o caminho se necessário


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    price: float = Field(..., ge=0.01, description="Preço em reais")
    stock: int = Field(..., ge=0)
    image_urls: Optional[List[str]] = None
    brand_id: int = Field(..., gt=0)

    # === CAMPOS DE FRETE (obrigatórios) ===
    weight_grams: int = Field(
        ..., gt=0, le=30_000, description="Peso em gramas (máx 30kg)"
    )
    height_cm: float = Field(..., ge=1, le=105, description="Altura em cm")
    width_cm: float = Field(..., ge=1, le=105, description="Largura em cm")
    length_cm: float = Field(..., ge=1, le=105, description="Comprimento em cm")

    # Validação da soma das dimensões (regra dos Correios)
    @field_validator("height_cm", "width_cm", "length_cm")
    @classmethod
    def check_dimensoes_maximas(cls, v: int, info) -> int:
        values = info.data
        h = values.get("height_cm", 0)
        w = values.get("width_cm", 0)
        l = values.get("length_cm", 0)

        # Só valida quando todos os 3 campos já foram preenchidos
        if info.field_name in ("height_cm", "width_cm", "length_cm") and h and w and l:
            if h + w + l > 200:
                raise ValueError("A soma altura + largura + comprimento não pode exceder 200cm (limite Correios)")
        return v

    # Configuração moderna do Pydantic v2
    model_config = ConfigDict(
        from_attributes=True,      # substitui orm_mode=True
        populate_by_name=True,     # permite usar alias ou nome do campo
        extra="forbid",            # rejeita campos extras no payload
    )


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    brand: BrandResponse

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )


# Schema leve para usar no carrinho/checkout
class CartItemFrete(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)
    weight_grams: int
    height_cm: int
    width_cm: int
    length_cm: int
    price: float = Field(..., ge=0)  # para valor declarado

    model_config = ConfigDict(from_attributes=True)