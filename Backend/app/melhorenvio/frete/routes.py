# app/melhorenvio/frete/routes.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

from app.melhorenvio.service import cotar_frete as cotar_frete_service
from app.melhorenvio.schemas import CotacaoFreteResponse

router = APIRouter(prefix="/frete", tags=["Frete - Melhor Envio"])


class CotarFreteRequest(BaseModel):
    cep_destino: str = Field(..., example="01001000", description="CEP apenas números")
    peso_gramas: float = Field(..., gt=0, example=500)
    largura_cm: float = Field(..., gt=0, example=16)
    altura_cm: float = Field(..., gt=0, example=6)
    comprimento_cm: float = Field(..., gt=0, example=23)
    valor_declarado: float = Field(0.0, ge=0, example=89.90)
    cep_origem: Optional[str] = Field(None, example="01001000")

    @field_validator("cep_destino", "cep_origem")
    @classmethod
    def validar_cep(cls, v: str | None) -> str | None:
        if v is not None:
            if len(v) != 8 or not v.isdigit():
                raise ValueError("CEP deve conter exatamente 8 dígitos numéricos")
            return v
        return v


@router.post(
    "/cotar",
    response_model=List[CotacaoFreteResponse],
    summary="Cotar frete em tempo real",
)
async def cotar_frete_route(payload: CotarFreteRequest):
    try:
        opcoes = await cotar_frete_service(
            cep_destino=payload.cep_destino,
            peso_gramas=payload.peso_gramas,
            largura_cm=payload.largura_cm,
            altura_cm=payload.altura_cm,
            comprimento_cm=payload.comprimento_cm,
            valor_declarado=payload.valor_declarado,
            cep_origem=payload.cep_origem,
        )

        if not opcoes:
            raise HTTPException(
                status_code=status.HTTP_424_FAILED_DEPENDENCY,
                detail="Nenhuma opção de frete disponível para os dados informados",
            )

        return opcoes

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
        status_code=500,
        detail=f"Erro interno: {repr(e)}",
    )