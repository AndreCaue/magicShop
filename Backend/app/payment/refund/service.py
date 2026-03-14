# payment/refund/service.py

from fastapi import HTTPException, Depends
from sqlalchemy import select, and_
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import uuid
import json
from decimal import Decimal


from app.auth.dependencies import get_db
from .models import (
    RefundRequest, RefundEvidence, RefundTransaction, RefundStatusHistory, RefundItem
)
from app.store.orders.models import Order, OrderItem
from ..models import PixCharge
from .schemas import CreateRefundRequest, AddEvidenceRequest
from .enums import (
    RefundStatus, RefundTransactionStatus, RefundType, RefundReasonCode, PaymentMethod
)
from app.store.orders.enums import PaymentStatus
from app.payment.efi_client import get_efi_client, EfiClient
from typing import Optional


def create_refund_request(
    request: CreateRefundRequest,
    user_id: int,
    db: Session = Depends(get_db)
) -> RefundRequest:
    print("UUID recebido:", request.order_uuid)
    order = _get_validated_order(db, request.order_uuid, user_id)

    if order.payment_method == PaymentMethod.PIX:
        _validate_pix_payment(order)
    else:
        _validate_card_payment(order)

    _validate_refund_deadline(request, order)

    is_partial, amount_calculated, refund_items = _resolve_refund_type_and_amount(
        db, request, order
    )

    refund = _create_refund_record(
        db, request, user_id, order, is_partial, amount_calculated, refund_items
    )

    return refund


def _get_validated_order(db, order_uuid, user_id):

    stmt = select(Order).where(Order.uuid == str(order_uuid))
    result = db.execute(stmt)
    order = result.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return order


def _validate_pix_payment(order: Order) -> None:
    """Verifica se o pedido possui pagamento confirmado via PIX."""

    if order.payment_method != PaymentMethod.PIX:
        raise HTTPException(400, "O pedido não foi pago via PIX")

    if order.payment_status != PaymentStatus.PAID:
        raise HTTPException(
            400, "O pagamento do pedido ainda não foi confirmado")

    if not order.pix_charge:
        raise HTTPException(
            400, "Cobrança PIX não encontrada para este pedido")

    if not order.pix_charge.end_to_end_id:
        raise HTTPException(
            400, "Pagamento PIX não possui end_to_end_id confirmado")


def _validate_card_payment(order: Order) -> None:
    """Verifica se o pedido possui pagamento confirmado por cartão."""

    if order.payment_method != PaymentMethod.CREDIT_CARD:
        raise HTTPException(400, "O pedido não foi pago com cartão de crédito")

    if order.payment_status != PaymentStatus.PAID:
        raise HTTPException(
            400, "O pagamento do pedido ainda não foi confirmado")

    if not order.efipay_charge_card_id:
        raise HTTPException(
            400, "Charge do cartão não encontrada para este pedido")


def _validate_refund_deadline(request: CreateRefundRequest, order: Order) -> None:
    """Validação de prazo CDC (exemplo básico)."""
    if request.reason_code == RefundReasonCode.REGRET:
        # alterar aqui para delivered_at: / feature
        if datetime.now(timezone.utc) - order.created_at > timedelta(days=7):
            raise HTTPException(
                400, "Prazo de 7 dias para arrependimento expirado (art. 49 CDC)"
            )


def _resolve_refund_type_and_amount(
    db: Session,
    request: CreateRefundRequest,
    order: Order,
) -> tuple[bool, Decimal, list[RefundItem]]:
    total_order_quantity = sum(item.quantity for item in order.items)
    requested_quantity = sum(item.qty for item in request.items)

    is_partial = requested_quantity < total_order_quantity

    if is_partial:
        amount_calculated, refund_items = _calculate_partial_refund(
            db, request, order)
    else:
        amount_calculated, refund_items = _calculate_full_refund(order)

    return is_partial, amount_calculated, refund_items


def _calculate_partial_refund(
    db: Session,
    request: CreateRefundRequest,
    order: Order
) -> tuple[Decimal, list[RefundItem]]:

    amount_calculated = Decimal("0.00")
    refund_items = []
    seen_items = set()

    for item_data in request.items:

        order_item_id = item_data.order_item_id
        qty_requested = item_data.qty

        if order_item_id in seen_items:
            raise HTTPException(
                status_code=400,
                detail=f"Item {order_item_id} duplicado na solicitação"
            )

        seen_items.add(order_item_id)

        order_item = db.get(OrderItem, order_item_id)

        if not order_item or order_item.order_id != order.id:
            raise HTTPException(
                status_code=403,
                detail=f"Item {order_item_id} não pertence ao pedido"
            )

        if qty_requested < 1:
            raise HTTPException(
                status_code=400,
                detail=f"Quantidade inválida para item {order_item_id}"
            )

        stmt = (
            select(RefundItem)
            .join(RefundRequest)
            .where(
                RefundItem.order_item_id == order_item_id,
                RefundRequest.status.in_([
                    RefundStatus.PENDING,
                    RefundStatus.APPROVED,
                    RefundStatus.PROCESSING,
                    RefundStatus.COMPLETED
                ])
            )
        )

        result = db.execute(stmt)
        previous_refunds = result.scalars().all()

        already_refunded_qty = sum(r.quantity for r in previous_refunds)

        if qty_requested + already_refunded_qty > order_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Quantidade excede o comprado para item: {order_item.product_name}"
            )

        unit_price = Decimal(str(order_item.unit_price))

        item_amount = unit_price * Decimal(qty_requested)

        amount_calculated += item_amount

        refund_items.append(
            RefundItem(
                order_item_id=order_item_id,
                quantity=qty_requested,
                amount=item_amount
            )
        )

    return amount_calculated, refund_items


def _calculate_full_refund(order: Order) -> tuple[Decimal, list]:
    amount_calculated = order.total
    if amount_calculated > order.total:
        raise HTTPException(
            400, "Valor solicitado maior que o total do pedido")
    return amount_calculated, []


def _create_refund_record(
    db: Session,
    request: CreateRefundRequest,
    user_id: int,
    order: Order,
    is_partial: bool,
    amount_calculated: Decimal,
    refund_items: list[RefundItem],
) -> RefundRequest:
    """Persiste o RefundRequest, itens parciais e histórico inicial."""
    refund = RefundRequest(
        order_id=order.id,
        user_id=user_id,
        payment_method=order.payment_method,
        refund_type=RefundType.PARTIAL if is_partial else RefundType.FULL,
        reason_code=request.reason_code,
        description=request.description,
        amount_requested=amount_calculated,
        amount_approved=None,
        status=RefundStatus.PENDING,
        gateway_payment_id=order.efipay_charge_pix_id,  # or txid
        gateway_extra={"e2e_id": order.pix_charge.end_to_end_id},
    )
    db.add(refund)
    db.flush()

    for item in refund_items:
        item.refund_request_id = refund.id
        db.add(item)

    db.add(RefundStatusHistory(
        refund_request_id=refund.id,
        from_status=None,
        to_status=RefundStatus.PENDING,
        changed_by=str(user_id),
        notes="Solicitação criada pelo cliente",
    ))

    db.commit()
    db.refresh(refund)
    return refund


def add_evidence_to_refund(
    refund_public_id: str,
    evidence_data: AddEvidenceRequest,
    user_id: int,
    db: Session = Depends(get_db)
) -> RefundEvidence:
    stmt = select(RefundRequest).where(
        RefundRequest.public_id == refund_public_id)
    result = db.execute(stmt)
    refund = result.scalars().first()

    if not refund:
        raise HTTPException(404, "Solicitação não encontrada")
    if refund.user_id != user_id:
        raise HTTPException(403, "Sem permissão")

    evidence = RefundEvidence(
        refund_request_id=refund.id,
        file_url=evidence_data.file_url,
        file_type=evidence_data.file_type,
        file_name=evidence_data.file_name,
        uploaded_by="customer",
        description=evidence_data.description
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence


def review_refund_request(
    public_id: str,
    to_status: str,
    notes: Optional[str],
    admin_id: int,
    db: Session = Depends(get_db)
):
    stmt = select(RefundRequest).where(RefundRequest.public_id == public_id)
    result = db.execute(stmt)
    refund: RefundRequest = result.scalars().first()

    if not refund:
        raise HTTPException(404, "Solicitação não encontrada")

    allowed_transitions = {
        "under_review": RefundStatus.UNDER_REVIEW,
        "rejected": RefundStatus.REJECTED,
    }
    if to_status not in allowed_transitions:
        raise HTTPException(400, "Status inválido para revisão")

    new_status = allowed_transitions[to_status]
    if refund.status not in [RefundStatus.PENDING]:
        raise HTTPException(400, "Solicitação não está em estado inicial")

    refund.status = new_status
    db.add(RefundStatusHistory(
        refund_request_id=refund.id,
        from_status=refund.status,
        to_status=new_status,
        changed_by=f"admin-{admin_id}",
        notes=notes or f"Revisão manual: {to_status}"
    ))

    db.commit()
    db.refresh(refund)

    return {"message": f"Status alterado para {new_status}", "public_id": public_id}


def approve_and_process_refund(
    public_id: str,
    approved_amount: float,
    notes: Optional[str],
    admin_id: int,
    db: Session = Depends(get_db),
    efi_client: EfiClient = Depends(get_efi_client)
) -> dict:
    stmt = select(RefundRequest).where(RefundRequest.public_id == public_id)
    result = db.execute(stmt)
    refund: RefundRequest = result.scalars().first()

    if not refund:
        raise HTTPException(404, "Solicitação não encontrada")

    if refund.status != RefundStatus.PENDING:
        raise HTTPException(
            400, "Solicitação não está pendente para aprovação")

    if approved_amount > refund.amount_requested or approved_amount <= 0:
        raise HTTPException(400, "Valor aprovado inválido")

    if refund.requires_evidence:
        stmt_ev = select(RefundEvidence).where(
            RefundEvidence.refund_request_id == refund.id)
        ev_result = db.execute(stmt_ev)
        if not ev_result.scalars().first():
            raise HTTPException(
                400, "Evidências obrigatórias para este motivo de reembolso")

    refund.amount_approved = approved_amount
    refund.status = RefundStatus.APPROVED
    refund.resolved_at = datetime.now(timezone.utc)

    db.add(RefundStatusHistory(
        refund_request_id=refund.id,
        from_status=RefundStatus.PENDING,
        to_status=RefundStatus.APPROVED,
        changed_by=f"admin-{admin_id}",
        notes=notes or f"Aprovado valor de {approved_amount:.2f}"
    ))

    transaction = RefundTransaction(
        refund_request_id=refund.id,
        amount=approved_amount,
        status=RefundTransactionStatus.PENDING
    )
    db.add(transaction)
    db.flush()

    devolucao_id = str(uuid.uuid4())
    motivo = (refund.description or "Devolução aprovada pela loja")[:140]

    try:
        response = efi_client.efi.pix_devolucao(
            e2eId=refund.gateway_extra.get("e2e_id"),
            id=devolucao_id,
            body={
                "valor": f"{approved_amount:.2f}",
                "descricao": motivo
            }
        )

        # Sucesso
        transaction.gateway_response_json = json.dumps(response)
        transaction.status = RefundTransactionStatus.PROCESSING
        transaction.processed_at = datetime.now(timezone.utc)

        refund.gateway_refund_id = devolucao_id
        refund.gateway_extra = refund.gateway_extra or {}
        refund.gateway_extra.update({
            "devolucao_id": devolucao_id,
            "motivo_enviado": motivo,
            "sdk_response": response
        })

        refund.status = RefundStatus.PROCESSING
        db.add(RefundStatusHistory(
            refund_request_id=refund.id,
            from_status=RefundStatus.APPROVED,
            to_status=RefundStatus.PROCESSING,
            changed_by="system",
            notes=f"Devolução enviada via SDK Efí (devolucao_id: {devolucao_id})"
        ))

    except Exception as exc:
        transaction.status = RefundTransactionStatus.FAILED
        db.add(RefundStatusHistory(
            refund_request_id=refund.id,
            from_status=RefundStatus.APPROVED,
            to_status=RefundStatus.FAILED,
            changed_by="system",
            notes=f"Erro ao enviar devolução: {str(exc)}"
        ))
        raise HTTPException(
            500, f"Erro ao processar devolução na Efí: {str(exc)}")

    db.commit()
    db.refresh(refund)

    return {
        "message": "Devolução processada e enviada para Efí",
        "refund_public_id": refund.public_id,
        "devolucao_id": devolucao_id,
        "status": refund.status.value
    }
