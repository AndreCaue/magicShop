from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict
from enum import Enum
from uuid import UUID

from .enums import RefundStatus, RefundReasonCode, PaymentMethod, RefundType


class RefundItemRequest(BaseModel):
    order_item_id: int
    qty: int


class CreateRefundRequest(BaseModel):
    order_uuid: UUID
    reason_code: RefundReasonCode
    description: Optional[str] = None
    items: Optional[List[RefundItemRequest]] = None

    # refund_type: RefundType = RefundType.FULL


class AddEvidenceRequest(BaseModel):
    file_url: str = Field(..., min_length=10)
    file_type: str = Field(..., pattern=r"^(image|application|video)/")
    file_name: Optional[str] = None
    description: Optional[str] = None


class RefundEvidenceResponse(BaseModel):
    id: int
    file_url: str
    file_type: str
    file_name: Optional[str]
    uploaded_by: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class RefundRequestResponse(BaseModel):
    public_id: str
    order_id: int
    status: RefundStatus
    refund_type: RefundType
    payment_method: PaymentMethod
    amount_requested: float
    amount_approved: Optional[float]
    reason_code: RefundReasonCode
    description: Optional[str]
    created_at: datetime
    evidences: List[RefundEvidenceResponse] = []

    class Config:
        from_attributes = True
