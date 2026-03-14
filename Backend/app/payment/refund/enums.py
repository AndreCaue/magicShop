from enum import Enum


class RefundStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    PIX = "PIX"
    CREDIT_CARD = "CREDIT_CARD"


class RefundType(str, Enum):
    FULL = "full"
    PARTIAL = "partial"


class RefundMethod(str, Enum):
    # Estorno no método original (PIX, cartão)
    ORIGINAL_PAYMENT = "original_payment"
    # STORE_CREDIT = "store_credit"
    BANK_TRANSFER = "bank_transfer"


class RefundReasonCode(str, Enum):
    DEFECTIVE_PRODUCT = "defective_product"
    WRONG_PRODUCT = "wrong_product"
    NOT_RECEIVED = "not_received"
    REGRET = "regret"
    DUPLICATE_ORDER = "duplicate_order"
    DAMAGED_IN_SHIPPING = "damaged_in_shipping"
    OTHER = "other"


class RefundTransactionStatus(str, Enum):
    # Parei, feature futura.
    PENDING = "pending"       # Aguardando envio para Efipay
    PROCESSING = "processing"  # Enviado para Efipay, aguardando confirmação
    SUCCEEDED = "succeeded"   # Estorno confirmado pela Efipay
    FAILED = "failed"         # Falha retornada pela Efipay
