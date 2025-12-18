# auth/jwt.py
# Módulo central de autenticação: JWT, senhas e tokens
# Tudo relacionado a auth deve ser importado daqui

from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
from .models import RefreshToken
from sqlalchemy.orm import Session
import uuid

load_dotenv()

# Configurações
SECRET_KEY = os.getenv("JWT_SECRET", "meusegredo123")  # MUDE EM PRODUÇÃO!
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ======================
# Senhas
# ======================
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ======================
# Tokens JWT
# ======================
def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
    token_type: str = "access",
    include_jti: bool = False
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": token_type
    })
    if include_jti:
        to_encode["jti"] = str(uuid.uuid4())
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ======================
# Validação
# ======================
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Token inválido ou expirado")
    

def save_refresh_token(db: Session, user_id: int, jti: str, expires_at: datetime):
    db_token = RefreshToken(
        jti=jti,
        user_id=user_id,
        expires_at=expires_at,
        revoked=False
    )
    db.add(db_token)
    db.commit()

def revoke_refresh_token(db: Session, jti: str):
    db_token = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
    if db_token:
        db_token.revoked = True
        db.commit()

def is_refresh_token_valid(db: Session, jti: str) -> bool:
    token = db.query(RefreshToken).filter(
        RefreshToken.jti == jti,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.now(timezone.utc)
    ).first()
    return token is not None