from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import (
    Column, Integer, Float, String, Text,
    DateTime, Enum as SaEnum, ForeignKey, JSON,
)
from sqlalchemy.orm import relationship

from app.database import Base
from .enums import RefundStatus, RefundTransactionStatus, RefundReasonCode, PaymentMethod, RefundType, RefundMethod


def utc_now():
    return datetime.now(timezone.utc)


class RefundRequest(Base):
    __tablename__ = "refund_requests"

    id = Column(Integer, primary_key=True)
    public_id = Column(String(36), default=lambda: str(
        uuid4()), unique=True, nullable=False, index=True)

    order_id = Column(Integer, ForeignKey("orders.id"),
                      nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     nullable=False, index=True)

    payment_method = Column(SaEnum(PaymentMethod), nullable=False, index=True)
    refund_method = Column(
        SaEnum(RefundMethod), default=RefundMethod.ORIGINAL_PAYMENT, nullable=False)
    refund_type = Column(SaEnum(RefundType),
                         default=RefundType.FULL, nullable=False)

    reason_code = Column(SaEnum(RefundReasonCode), nullable=False)
    description = Column(Text, nullable=True)

    amount_requested = Column(Float, nullable=False)
    amount_approved = Column(Float, nullable=True)

    status = Column(SaEnum(RefundStatus),
                    default=RefundStatus.PENDING, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True),
                        default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True),
                        default=utc_now, onupdate=utc_now, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    gateway_payment_id = Column(
        String(100), nullable=True, index=True)
    gateway_refund_id = Column(
        String(100), nullable=True, unique=True, index=True)
    gateway_extra = Column(JSON, nullable=True)

    # Relacionamentos
    order = relationship("Order", back_populates="refunds")
    items = relationship(
        "RefundItem", back_populates="refund_request", cascade="all, delete-orphan")
    transaction = relationship(
        "RefundTransaction", back_populates="refund_request", uselist=False)
    status_history = relationship(
        "RefundStatusHistory", back_populates="refund_request", cascade="all, delete-orphan")
    evidences = relationship(
        "RefundEvidence", back_populates="refund_request", cascade="all, delete-orphan")

    @property
    def requires_evidence(self) -> bool:
        evidence_required_reasons = {
            RefundReasonCode.DEFECTIVE_PRODUCT,
            RefundReasonCode.WRONG_PRODUCT,
            RefundReasonCode.DAMAGED_IN_SHIPPING,
            RefundReasonCode.NOT_RECEIVED,
        }
        return self.reason_code in evidence_required_reasons


class RefundItem(Base):
    """Itens específicos para reembolso parcial"""
    __tablename__ = "refund_items"

    id = Column(Integer, primary_key=True)
    refund_request_id = Column(Integer, ForeignKey(
        "refund_requests.id"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey(
        "order_items.id"), nullable=False, index=True)

    quantity = Column(Integer, nullable=False, default=1)
    amount = Column(Float, nullable=False)

    refund_request = relationship("RefundRequest", back_populates="items")
    order_item = relationship("OrderItem")


class RefundEvidence(Base):
    """Evidências/anexos enviados para suportar a solicitação"""
    __tablename__ = "refund_evidences"

    id = Column(Integer, primary_key=True)
    refund_request_id = Column(Integer, ForeignKey(
        "refund_requests.id"), nullable=False, index=True)

    file_url = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_name = Column(String(255), nullable=True)
    uploaded_by = Column(String(100), nullable=False, default="customer")
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True),
                        default=utc_now, nullable=False)

    refund_request = relationship("RefundRequest", back_populates="evidences")


class RefundTransaction(Base):
    """Registro da operação financeira na Efí"""
    __tablename__ = "refund_transactions"

    id = Column(Integer, primary_key=True)
    refund_request_id = Column(Integer, ForeignKey(
        "refund_requests.id"), unique=True, nullable=False, index=True)

    amount = Column(Float, nullable=False)
    status = Column(SaEnum(RefundTransactionStatus),
                    default=RefundTransactionStatus.PENDING, nullable=False, index=True)

    gateway_response_json = Column(Text, nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True),
                        default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True),
                        default=utc_now, onupdate=utc_now, nullable=False)

    refund_request = relationship(
        "RefundRequest", back_populates="transaction")


class RefundStatusHistory(Base):
    """Histórico de mudanças de status"""
    __tablename__ = "refund_status_history"

    id = Column(Integer, primary_key=True)
    refund_request_id = Column(Integer, ForeignKey(
        "refund_requests.id"), nullable=False, index=True)

    from_status = Column(SaEnum(RefundStatus), nullable=True)
    to_status = Column(SaEnum(RefundStatus), nullable=False)
    changed_by = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True),
                        default=utc_now, nullable=False)

    refund_request = relationship(
        "RefundRequest", back_populates="status_history")
