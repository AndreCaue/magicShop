from fastapi import Depends, HTTPException, status, Security, Request
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from fastapi.security.utils import get_authorization_scheme_param
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import List
from app import models
from app.models import User
from app.schemas import UserOut
from app.database import SessionLocal
import os
from dotenv import load_dotenv
from ..core.config import SECRET_KEY, ALGORITHM 

load_dotenv()


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/token",
    scopes={
        "basic": "Acesso básico",
        "premium": "Acesso premium",
        "master": "Acesso completo (admin)"
    }
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        

async def get_token_from_request(request: Request) -> str:
    auth = request.headers.get("Authorization")
    scheme, token = get_authorization_scheme_param(auth)

    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token


def get_current_user(
    security_scopes: SecurityScopes,
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_request),
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("type") != "access":
            raise credentials_exception
        

        email: str = payload.get("sub")
        token_scopes = payload.get("scopes", [])

        if isinstance(token_scopes, str):
            token_scopes = token_scopes.split(",")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise credentials_exception

    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente",
            )

    return user


def is_master_user(user: User) -> bool:
    return (
        user.is_master
        and user.is_verified
        and "master" in user.scopes
    )


def require_master_full_access(
    current_user: User = Depends(get_current_user)
) -> User:
    if not is_master_user(current_user):
        raise HTTPException(
            status_code=403,
            detail="Acesso restrito a usuários master verificados."
        )

    return current_user


def require_basic_or_premium(
    current_user: User = Depends(get_current_user)
) -> User:
    if not any(scope in (current_user.scopes or []) for scope in ["basic", "premium"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requer acesso basic"
        )
    return current_user


def require_user(user: UserOut = Depends(get_current_user)) -> UserOut:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado"
        )
    return user


def get_token_from_cookie(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ausente asd"
        )
    return token



def get_current_user_from_cookie(
    token: str = Depends(get_token_from_cookie),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user


