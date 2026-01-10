from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/test")

@router.get("/protected-expiration-test")
def test_expiration(current_user = Depends(get_current_user)):
    # (FastAPI + oauth2_scheme já rejeita token expirado com 401 automaticamente)
    return {"message": "Token ainda válido", "user": current_user.email}