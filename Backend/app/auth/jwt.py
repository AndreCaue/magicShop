from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
from .models import RefreshToken
from ..core.config import settings
from sqlalchemy.orm import Session
import uuid
from fastapi import HTTPException
from ..core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


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


def create_reset_password_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode = {
        "exp": expire,
        "sub": str(user_id),
        "type": "password_reset"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_reset_password_token(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Token inválido")
        
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Token inválido")
        
        return int(user_id)
    except JWTError:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")