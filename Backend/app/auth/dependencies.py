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
import logging

load_dotenv()


logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "meusegredo123")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/token",
    scopes={
        "basic": "Acesso básico",
        "premium": "Acesso premium",
        "master": "Acesso completo (admin)"
    }
)

# ---------------------------
# Sessão de banco
# ---------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        

async def get_token_from_request(request: Request) -> str:
    # 1️⃣ Tenta pegar do header Authorization
    auth = request.headers.get("Authorization")
    scheme, token = get_authorization_scheme_param(auth)

    # 2️⃣ Se não veio no header, tenta pegar do cookie
    if not token:
        token = request.cookies.get("access_token")

    # 3️⃣ Se ainda assim não há token, lança erro
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token


# ---------------------------
# Usuário autenticado
# ---------------------------
def get_current_user(
    request: Request,
    security_scopes: SecurityScopes,
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_request)
) -> User:
    """Obtém o usuário autenticado, via Cookie HttpOnly OU Header Bearer."""

    # 🔥 Fallback: tenta pegar o token do cookie, se não veio no header

    logger.info(f"Headers recebidos: {dict(request.headers)}")
    logger.info(f"Cookies recebidos: {dict(request.cookies)}")
    
    # Exceção padrão
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

       #try:
        #payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        #email: str = payload.get("sub")
        #token_scopes = payload.get("scopes", [])
        #if isinstance(token_scopes, str):
        #    token_scopes = token_scopes.split(",")
        #elif not isinstance(token_scopes, list):
        #    token_scopes = []
        #if email is None:
        #    raise credentials_exception
    #except JWTError:
        #raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        scopes = payload.get("scopes", [])
        if isinstance(scopes, str):
            scopes = scopes.split(",")
        elif not isinstance(scopes, list):
            scopes = []
        if email is None:
            raise credentials_exception
    except JWTError as e:
        logger.error(f"Erro ao decodifcar JWT: {e}")
        raise credentials_exception

    # Busca o usuário no banco
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning(f"Usuário não encontrado para email {email}")
        raise credentials_exception

    # Verifica escopos (opcional)
    #for scope in security_scopes.scopes:
     #   if scope not in token_scopes:
      #      raise HTTPException(
       #         status_code=status.HTTP_403_FORBIDDEN,
        #        detail="Não autorizado para esse recurso",
         #   )
    logger.info(f"Usuário autenticado: {user.email} | Scopes: {scopes}")
    return user
# ---------------------------
# Requer MASTER
# ---------------------------
def require_master_full_access(
    current_user: User = Depends(get_current_user)
) -> User:
    """Permite acesso apenas a usuários 'master' verificados."""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário não verificado. Verifique seu e-mail para continuar."
        )
    
    if not getattr(current_user, "is_master", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas usuários com papel 'master' podem acessar esta rota."
        )

 #   if not current_user.is_master:
  #      raise HTTPException(
   #         status_code=status.HTTP_403_FORBIDDEN,
    #        detail="Apenas usuários com papel ou escopo '******' podem acessar esta rota."
     #   )

    return current_user


# ---------------------------
# Requer BASIC ou PREMIUM
# ---------------------------
def require_basic_or_premium(
    current_user: User = Depends(get_current_user)
) -> User:
    if not any(scope in (current_user.scopes or []) for scope in ["basic", "premium"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requer acesso basic ou premium"
        )
    return current_user


# ---------------------------
# Requerimento
# ---------------------------
def require_user(user: UserOut = Depends(get_current_user)) -> UserOut:
    """
    Dependência para rotas que precisam de usuário logado.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado"
        )
    return user


def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ausente"
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


