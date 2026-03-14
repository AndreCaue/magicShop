from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.auth.dependencies import get_db
from .schemas import CreateRefundRequest, AddEvidenceRequest, RefundRequestResponse, RefundEvidenceResponse
from .service import create_refund_request, add_evidence_to_refund, approve_and_process_refund, review_refund_request
from app.auth.dependencies import get_current_user, require_master_full_access
from ..efi_client import get_efi_client

router = APIRouter(prefix="/refunds", tags=["refunds"])


@router.post("", response_model=RefundRequestResponse)
def solicitar_refund(
    request: CreateRefundRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    refund = create_refund_request(request, current_user.id, db)
    # Quando houver uma solicitação para o pedido em questão bloquear ou redirecionar para o modal de evidencia (verificar que passo se encontra.)
    # Feature, Parei aqui, fazer Adicionar função de cancelar solicitação, (somente se tiver pedido o primeiro step (Criar solicitação))
    return refund


@router.post("/{public_id}/evidences", response_model=RefundEvidenceResponse)
async def adicionar_evidencia(
    public_id: str,
    evidence: AddEvidenceRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ev = await add_evidence_to_refund(public_id, evidence, current_user.id, db)
    return ev


class ReviewRefundRequest(BaseModel):
    to_status: str = Field(..., description="under_review ou rejected")
    notes: Optional[str] = None


@router.post("/{public_id}/review")
async def revisar_refund(
    public_id: str,
    review_data: ReviewRefundRequest,
    current_admin=Depends(require_master_full_access),
    db: Session = Depends(get_db)
):
    result = await review_refund_request(public_id, review_data.to_status, review_data.notes, current_admin.id, db)
    return result


class ApproveRefundRequest(BaseModel):
    approved_amount: float = Field(..., gt=0)
    notes: Optional[str] = None


@router.post("/{public_id}/approve")
async def aprovar_e_processar(
    public_id: str,
    approve_data: ApproveRefundRequest,
    current_admin=Depends(require_master_full_access),
    db: Session = Depends(get_db),
    efi=Depends(get_efi_client)
):
    result = await approve_and_process_refund(
        public_id, approve_data.approved_amount, approve_data.notes, current_admin.id, db, efi
    )
    return result
