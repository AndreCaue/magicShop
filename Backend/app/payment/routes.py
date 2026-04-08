from fastapi import APIRouter, HTTPException, Request, Depends
from .schemas import PixRequest, CardOneStepRequest, InstallmentsRequest, RefundRequest, RefundEmailRequest
from .models import PixCharge
from app.store.orders.models import Order
from sqlalchemy.orm import Session
from .service import EfiService
from app.models import User
import os
import logging
from app.auth.dependencies import get_db, get_current_user
from app.core.webhook_auth import verify_efipay_webhook_token
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


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

    if order.payment_status != "pending":
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
        max(request.expiracao or 1800, 300), 86400) 

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


@router.post('/webhook/efipay')
async def webhook_efipay(request: Request, db: Session = Depends(get_db)):
    """
    Webhook de notificação para cobranças de cartão (Efí Billing API).
    URL cadastrada na Efí deve incluir: ?webhook_token=<WEBHOOK_SECRET>
    """
    verify_efipay_webhook_token(request)

    try:
        form_data = await request.form()
        notification_token = form_data.get("notification")

        if not notification_token:
            body = await request.json()
            notification_token = body.get("notification")

        if not notification_token:
            logger.info("Webhook Efipay: token de notificação ausente")
            return {"status": "ignored", "reason": "no notification token"}

        logger.info(f"Webhook Efipay cartão recebido, token: {notification_token[:8]}...")

        result = service.process_card_webhook(notification_token, db)

        logger.info(f"Webhook cartão processado: {result}")
        return {"status": "success", "processed": result["processed"]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao processar webhook de cartão: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/card/installments")
def get_installments(request: InstallmentsRequest):
    try:
        result = service.get_card_installments(request)
        return {"success": True, "installments": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refund-card")
def refund_card(
    data: RefundRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
#Feature
    order = db.query(Order).filter(Order.uuid == data.order_uuid).first()
    if not order:
        raise HTTPException(404, "Pedido não encontrado")
    if order.user_id != current_user.id:
        raise HTTPException(403, "Sem permissão")
    if not order.efipay_charge_card_id:
        raise HTTPException(400, "Pedido sem cobrança de cartão")

    try:
        details = service.get_card_charge_details(order.efipay_charge_card_id)
        if details.get("status") != "paid":
            raise HTTPException(
                400, f"Status inválido para estorno: {details.get('status')}")

        result = service.refund_card_charge(
            charge_id=order.efipay_charge_card_id,
            amount=data.amount
        )

        order.payment_status = "refunded"
        order.updated_at = datetime.now(timezone.utc)
        db.commit()

        return result
    except ValueError as ve:
        raise HTTPException(400, str(ve))
    except Exception as e:
        raise HTTPException(500, f"Erro interno: {str(e)}")


@router.post('/webhook/pix')
async def webhook_pix(request: Request, db: Session = Depends(get_db)):
    """
    Webhook de notificação PIX — Efí.
    URL cadastrada na Efí deve incluir: ?webhook_token=<WEBHOOK_SECRET>
    """
    verify_efipay_webhook_token(request)

    try:
        data = await request.json()
        logger.info("Webhook PIX recebido")

        result = service.process_pix_webhook(data, db)

        logger.info(f"Webhook PIX processado: {result}")
        return {"status": "success", "processed": result["processed"]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao processar webhook PIX: {str(e)}", exc_info=True)
        return {"status": "error", "message": "Erro interno"}


@router.get("/pix/{txid}")
def get_pix_charge(
    txid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Consulta uma cobrança Pix pelo txid. Requer autenticação e verificação de proprietário.
    """
    try:
        pix_charge = db.query(PixCharge).filter(PixCharge.txid == txid).first()

        if not pix_charge:
            raise HTTPException(
                status_code=404, detail="Cobrança não encontrada")

        if pix_charge.order and pix_charge.order.user_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="Você não tem permissão para consultar esta cobrança")

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
