from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timezone


class PixCharge(Base):
    __tablename__ = "pix_charges"

    id = Column(Integer, primary_key=True, index=True)
    txid = Column(String, unique=True, index=True, nullable=False)
    location = Column(String)
    pix_copia_e_cola = Column(String)
    imagem_qrcode = Column(String)
    devedor_cpf = Column(String(11), index=True)
    devedor_nome = Column(String(100))
    valor_original = Column(Float, nullable=False)
    status = Column(String(50), default="ATIVA", index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime, nullable=True)
    end_to_end_id = Column(String(100), unique=True, nullable=True)

    order = relationship("Order", back_populates="pix_charge")
