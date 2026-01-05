from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    scopes: Optional[List[str]] = []
    is_verified: Optional[bool] = False
    is_master: bool = False

    class Config:
        from_attributes = True 


class Token(BaseModel): 
    access_token: str
    token_type: str
    scopes: List[str] = []
    is_verified: bool
    is_master: Optional[bool] = None


class VerifyEmailRequest(BaseModel):
    code: str = Field(..., min_length=4, max_length=10, description="Código de verificação recebido por e-mail")

class VerifyEmailResponse(BaseModel):
    message: str