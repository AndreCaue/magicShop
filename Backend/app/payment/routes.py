from fastapi import APIRouter, HTTPException, Request
from .schemas import PixRequest, CardOneStepRequest
from .service import EfiService
import os

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
async def create_card_payment(request: CardOneStepRequest):
    try:
        result = await service.create_card_one_step(request)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro Efí Cartão: {str(e)}")
    

@router.post('/webhook/pix')
async def webhook_pix(request: Request):
    data = await request.json()
    print("Webhook recebido:", data)

    return {"status": "received"}