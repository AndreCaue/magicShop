from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


# ---------- ENTRADA DE DADOS ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


# ---------- SAÍDA DE DADOS (retorno seguro) ----------
class UserOut(BaseModel):
    id: int
    email: EmailStr
    scopes: Optional[List[str]] = []
    is_verified: Optional[bool] = False  # novo campo opcional
    is_master: bool = False

    class Config:
        from_attributes = True  # substitui orm_mode (FastAPI 0.110+)


# ---------- TOKEN ----------
class Token(BaseModel): 
    access_token: str
    token_type: str
    scopes: List[str] = []
    is_verified: bool
    is_master: Optional[bool] = None


# ---------- VERIFICAÇÃO DE E-MAIL ----------
class VerifyEmailRequest(BaseModel):
    code: str = Field(..., min_length=4, max_length=10, description="Código de verificação recebido por e-mail")

class VerifyEmailResponse(BaseModel):
    message: str