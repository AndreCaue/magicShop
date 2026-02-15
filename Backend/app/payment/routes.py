from fastapi import APIRouter, HTTPException, Request, Depends
from .schemas import PixRequest, CardOneStepRequest, InstallmentsRequest
from .models import PixCharge
from sqlalchemy.orm import Session
from .service import EfiService
from app.models import User
import os
from app.auth.dependencies import get_db, get_current_user

router = APIRouter(prefix="/payment", tags=["payment"])

sandbox = os.getenv("EFI_SANDBOX", "true").lower() == "true"
service = EfiService(sandbox=sandbox)


@router.post("/pix")
def create_pix(request: PixRequest, db: Session = Depends(get_db),
               # current_user=Depends(get_current_user)
               ):
    try:
        order_id = request.order_id if hasattr(request, 'order_id') else None

        result = service.create_pix_charge(request, db, order_id=order_id)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar cobrança Pix: {str(e)}"
        )


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


# @router.post('/webhook/pix/pix')  # Aceita o path duplicado
# async def webhook_pix_duplicado(request: Request, db: Session = Depends(get_db)):
#     return await webhook_pix(request, db)  # Chama a mesma função


@router.post('/webhook/pix')
async def webhook_pix(request: Request, db: Session = Depends(get_db)):
    """
    Webhook notification pix
    """
    # Checagem básica de origem
    # user_agent = request.headers.get('user-agent', '')
    # if 'Gerencianet-Webhook' not in user_agent:  # Ou o header específico da EFI
    #     raise HTTPException(status_code=403, detail="Origem não autorizada")

    try:
        data = await request.json()
        print("Webhook Pix recebido:", data)

        result = service.process_pix_webhook(data, db)

        print(f"Webhook processando: {result}")
        return {"status": "success", "processed": result["processed"]}

    except Exception as e:
        print(f"Erro ao processar webhook: {str(e)}")
        return {"status": "error", "message": str(e)}


@router.get("/pix/{txid}")
def get_pix_charge(
    txid: str,
    db: Session = Depends(get_db)
):
    """
    Consulta uma cobrança Pix pelo txid
    """

    try:
        pix_charge = db.query(PixCharge).filter(PixCharge.txid == txid).first()

        if not pix_charge:
            raise HTTPException(
                status_code=404, detail="Cobrança não encontrada")

        # Busca status atualizado

        charge_details = service.client.pix_detail_charge(
            params={"txid": txid})

        return {
            "txid": pix_charge.txid,
            "status": charge_details.get("status"),
            "valor": pix_charge.valor_original,
            "pix_copia_e_cola": pix_charge.pix_copia_e_cola,
            "imagem_qrcode": pix_charge.imagem_qrcode,
            "created_at": pix_charge.created_at,
            "paid_at": pix_charge.paid_at
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao consultar cobrança: {str(e)}"
        )
