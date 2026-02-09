from fastapi import APIRouter, HTTPException, Request, Depends
from .schemas import PixRequest, CardOneStepRequest, InstallmentsRequest
from sqlalchemy.orm import Session
from .service import EfiService
from app.models import User
import os
# from app.auth.dependencies import get_db, require_master_full_access
from app.auth.dependencies import get_db, get_current_user

router = APIRouter(prefix="/payment", tags=["payment"])

sandbox = os.getenv("EFI_SANDBOX", "true").lower() == "true"
service = EfiService(sandbox=sandbox)


@router.post("/pix")
def create_pix(request: PixRequest):
    try:
        result = service.create_pix_charge(request)
        return {
            "txid": result["txid"],
            "location": result["location"],
            "pix_copia_e_cola": result.get("pixCopiaECola"),
            "imagem_qrcode": result.get("imagemQrcode"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro Efí Pix: {str(e)}")


@router.post("/card/one-step")
async def create_card_payment(request: CardOneStepRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        result = service.create_card_one_step(request, db, current_user.id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro Efí Cartão: {str(e)}")


@router.post("/card/installments")
def get_installments(request: InstallmentsRequest):
    try:
        result = service.get_card_installments(request)
        return {"success": True, "installments": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post('/webhook/pix')
async def webhook_pix(request: Request):
    data = await request.json()
    print("Webhook recebido:", data)

    return {"status": "received"}
