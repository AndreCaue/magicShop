from pydantic import BaseModel
from typing import List

class CotacaoFreteResponse(BaseModel):
    id: int
    nome: str
    empresa: str
    empresa_picture: str = ""
    preco: float
    preco_com_desconto: float
    prazo_dias: int
    entrega_domiciliar: bool = True
    entrega_sabado: bool = False

    class Config:
        from_attributes = True