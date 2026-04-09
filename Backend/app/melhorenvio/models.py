from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base  # ajuste o import conforme seu projeto


class MelhorEnvioToken(Base):
    __tablename__ = "melhor_envio_tokens"

    id = Column(Integer, primary_key=True, index=True)
    access_token = Column(String(500), nullable=False)
    refresh_token = Column(String(500), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.expires_at
