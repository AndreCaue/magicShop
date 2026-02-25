from fastapi import APIRouter, HTTPException, Request, Depends
from .schemas import PixRequest, CardOneStepRequest, InstallmentsRequest
from .models import PixCharge
from app.store.orders.models import Order
from sqlalchemy.orm import Session
from .service import EfiService
from app.models import User
import os
from app.auth.dependencies import get_db, get_current_user
from decimal import Decimal, ROUND_HALF_UP


router = APIRouter(prefix="/payment", tags=["payment"])

sandbox = os.getenv("EFI_SANDBOX", "true").lower() == "true"
service = EfiService(sandbox=sandbox)


def format_pix_value(value) -> str:
    return str(
        Decimal(value).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )
    )


@router.post("/pix")
def create_pix(
    request: PixRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not request.order_uuid:
        raise HTTPException(400, "order_uuid é obrigatório")

    order = db.query(Order).filter(
        Order.uuid == str(request.order_uuid)).first()
    if not order:
        raise HTTPException(404, "Pedido não encontrado")

    if order.user_id != current_user.id:
        raise HTTPException(403, "Você não tem permissão para este pedido")

    if order.payment_status != "aguardando_pagamento":
        raise HTTPException(
            400, "Este pedido já foi processado ou está em outro status")

    if order.efipay_charge_card_id:
        raise HTTPException(
            400, "Este pedido está aguardando pagamento pelo cartão. Caso não tenha solicitado pagamento pelo cartão aguardar 30 min ou entrar em contato com o suporte."
        )

    if order.efipay_charge_pix_id:
        try:
            charge_data = service.get_pix_charge_details(
                order.efipay_charge_pix_id)
            return {
                "success": True,
                "data": charge_data,
                "message": "Cobrança PIX já existia para este pedido"
            }
        except Exception as e:
            raise HTTPException(
                400, "Já existe uma cobrança PIX para este pedido")

    valor_formatado = format_pix_value(order.total)

    expiracao = min(
        max(request.expiracao or 1800, 300), 86400)  # 5 min a 24h

    try:
        result = service.create_pix_charge(
            db=db, order=order, valor_original=valor_formatado, expiracao=expiracao,)

        order.efipay_charge_pix_id = result["txid"]
        db.commit()

        return {"success": True, "data": result, "message": "PIX Gerado com sucesso"}

    except ValueError as ve:
        raise HTTPException(400, str(ve))
    except Exception as e:
        raise HTTPException(500, f"Erro interno ao criar PIX: {str(e)}")


@router.post("/card/one-step")
async def create_card_payment(
    request: CardOneStepRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = service.create_card_one_step(
            order_uuid=request.order_uuid,
            payment_token=request.payment_token,
            installments=request.installments,
            db=db,
            user_id=current_user.id,
            name_on_card=request.name_on_card
        )
        return {"success": True, "data": result}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao processar pagamento com cartão: {str(e)}")
    # OBS: verificar no pagamento do cartão se usa efipay_charge_id alterado para efipay_charge_card_id


@router.post("/card/installments")
def get_installments(request: InstallmentsRequest):
    try:
        result = service.get_card_installments(request)
        return {"success": True, "installments": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post('/webhook/pix')
async def webhook_pix(request: Request, db: Session = Depends(get_db)):
    """
    Webhook notification pix
    """

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
