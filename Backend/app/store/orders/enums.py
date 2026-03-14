from enum import Enum


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    EXPIRED = "expired"
    CANCELED = "canceled"
    REFUNDED = "refunded"
    REFUSED = "refused"
    FAILED = "failed"
    DISPUTED = "disputed"
    CHARGEBACK = "chargeback"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELED = "canceled"

    PAYMENT_FAILED = "payment_failed"
    REFUNDED = "refunded"
    RETURNED = "returned"
    DISPUTED = "disputed"
