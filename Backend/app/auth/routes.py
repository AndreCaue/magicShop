from fastapi import APIRouter, Depends, HTTPException, status, Security, Response, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
import hashlib
import binascii
from uuid import uuid4

from .. import models, schemas
from .schemas import ForgotPasswordRequest, ResetPasswordRequest
from ..database import SessionLocal
from .dependencies import get_current_user, get_current_user_from_cookie
from .email_service import send_verification_email, send_reset_password_email
from .jwt import decode_token, hash_password, verify_password, create_access_token, save_refresh_token, RefreshToken, revoke_refresh_token, is_refresh_token_valid, create_reset_password_token, verify_reset_password_token
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", scopes={
    "basic": "Acesso básico",
    "premium": "Acesso premium",
})


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_verification_code():
    code = str(secrets.randbelow(999999)).zfill(6)
    salt = secrets.token_bytes(16)
    hash_code = hashlib.pbkdf2_hmac("sha256", code.encode(), salt, 100_000)
    code_hash_hex = binascii.hexlify(hash_code).decode()
    salt_hex = binascii.hexlify(salt).decode()
    return code, code_hash_hex, salt_hex


@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    hashed_pw = hash_password(user.password)

    new_user = models.User(email=user.email, password=hashed_pw, scopes=["basic"])
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    code, code_hash_hex, salt_hex = generate_verification_code()
    expiry = datetime.now(timezone.utc) + timedelta(minutes=15)

    new_user.verification_code = code_hash_hex
    new_user.salt = salt_hex
    new_user.code_expiry = expiry
    db.commit()

    try:
        send_verification_email(user.email, code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar e-mail: {str(e)}")

    return schemas.UserOut.model_validate(new_user)


@router.post("/verify", response_model=schemas.VerifyEmailResponse)
def verify_email(
    data: schemas.VerifyEmailRequest,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.verification_code or not user.salt:
        raise HTTPException(status_code=400, detail="Usuário inválido ou sem código de verificação")

    salt = binascii.unhexlify(user.salt)
    hash_code = hashlib.pbkdf2_hmac("sha256", data.code.encode(), salt, 100_000)
    hash_code_hex = binascii.hexlify(hash_code).decode()

    if hash_code_hex != user.verification_code:
        raise HTTPException(status_code=400, detail="Código incorreto")

    expiry = user.code_expiry
    if expiry is None:
        raise HTTPException(status_code=400, detail="Código expirado")
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expiry:
        raise HTTPException(status_code=400, detail="Código expirado")

    user.is_verified = True
    user.verification_code = None
    user.salt = None
    user.code_expiry = None

    db.commit()
    db.refresh(user)

    return schemas.VerifyEmailResponse(message="E-mail verificado com sucesso!")


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == request.email.lower()).first()
    
    if not user:
        return {"message": "Se o e-mail estiver cadastrado, enviaremos um link de recuperação."}


    reset_token = create_reset_password_token(user_id=user.id)

    if settings.ENVIRONMENT == 'production':
     reset_link = f"https://doceilusao.store/reset_password?token={reset_token}"
    else:
     reset_link = f"http://localhost:5173/reset_password?token={reset_token}"

    background_tasks.add_task(
        send_reset_password_email,
        to_email=user.email,
        username=user.email,  # to do
        reset_link=reset_link,
    )

    return {"message": "Se o e-mail estiver cadastrado, enviaremos um link de recuperação."}

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user_id = verify_reset_password_token(request.token)

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    hashed_password = hash_password(request.new_password) 

    user.password = hashed_password
    user.updated_at = datetime.now(timezone.utc)

    db.commit()

    return {"message": "Senha redefinida com sucesso!"}

@router.post("/token", response_model=schemas.Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )

    scopes = db_user.scopes or []
    if isinstance(scopes, str):
        scopes = scopes.split(",")

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "scopes": scopes
        },
        token_type="access"
    )

    refresh_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=timedelta(days=7),
        token_type="refresh",
        include_jti=True 
    )

    try:
        payload = decode_token(refresh_token)
        jti = payload["jti"]
        expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao gerar refresh token"
        )

    save_refresh_token(db=db, user_id=db_user.id, jti=jti, expires_at=expires_at)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/"
    )

    token_response = {
        "access_token": access_token,
        "token_type": "bearer",
        "scopes": scopes,
        "is_verified": db_user.is_verified
    }

    if "master" in scopes and getattr(db_user, "role", None) == "master":
        token_response["is_master"] = True

    return token_response


@router.get("/basic-area")
def basic_area(current_user: models.User = Security(get_current_user, scopes=["basic"])):
    return {"message": f"Acesso básico concedido para {current_user.email}"}


@router.get("/premium-area")
def premium_area(current_user: models.User = Security(get_current_user, scopes=["premium"])): 
    return {"message": f"Acesso premium concedido para {current_user.email}"}


@router.put("/upgrade")
def upgrade_user_to_premium(
    current_user: models.User = Security(get_current_user, scopes=["basic"]),
    db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if "premium" not in db_user.scopes:
        db_user.scopes.append("premium")
        db.commit()
        db.refresh(db_user)

    return {"message": f"Usuário {db_user.email} agora é premium!", "scopes": db_user.scopes}

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    refresh_token_str = request.cookies.get("refresh_token")
    if not refresh_token_str:
        raise HTTPException(status_code=401, detail="Refresh token ausente")

    token = refresh_token_str.replace("Bearer ", "")

    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")

        jti = payload.get("jti")
        email = payload.get("sub")
        if not jti or not email:
            raise HTTPException(status_code=401, detail="Token inválido")
    except ValueError:
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado")

    if not is_refresh_token_valid(db, jti):
        raise HTTPException(status_code=401, detail="Refresh token revogado ou expirado")

    revoke_refresh_token(db, jti)

    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    scopes = db_user.scopes if isinstance(db_user.scopes, list) else db_user.scopes.split(",") if db_user.scopes else []
    new_access_token = create_access_token(
        data={
            "sub": db_user.email,
            "scopes": scopes,
            "is_master": ("master" in scopes and db_user.role == "master")
        },
        expires_delta=timedelta(minutes=60),
        token_type="access"
    )

    new_refresh_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=timedelta(days=30),
        token_type="refresh",
        include_jti=True
    )

    new_payload = decode_token(new_refresh_token)
    new_jti = new_payload["jti"]
    new_expires_at = datetime.fromtimestamp(new_payload["exp"], tz=timezone.utc)
    save_refresh_token(db, db_user.id, new_jti, new_expires_at)

    response.set_cookie("access_token", new_access_token, httponly=True, secure=True, domain=".doceilusao.store",samesite="none", max_age=3600, path="/")
    response.set_cookie("refresh_token", new_refresh_token, httponly=True, secure=True, domain=".doceilusao.store", samesite="none", max_age=60*60*24*30, path="/")

    token_response = {
        "access_token": new_access_token,
        "token_type": "bearer",
        "scopes": scopes,
        "is_verified": db_user.is_verified
    }
    if "master" in scopes and db_user.role == "master":
        token_response["is_master"] = True

    return token_response


@router.post("/logout")
def logout(
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked == False
    ).update({RefreshToken.revoked: True})
    db.commit()
    

    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=True,
        samesite="strict"         # ou "strict" se não precisar cross-site "lax" cross
    )
    
    response.delete_cookie(
        key="refresh_token",
        path="/",
        httponly=True,
        secure=True,
        samesite="strict"
    )

    return {"message": "Logout global realizado com sucesso"}

@router.get("/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "scopes": current_user.scopes,
        "is_verified": current_user.is_verified,
        "is_master": "master" in current_user.scopes and current_user.role == "master"
    }