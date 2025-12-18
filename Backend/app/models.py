from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base  # ajuste o import conforme seu projeto
from .auth.jwt import RefreshToken

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    # Scopes (lista de permissões: ex: ["basic", "premium", "master"])
    scopes = Column(JSON, default=["basic"])

    # Papel do usuário: 'master' ou None (futuramente admin, staff etc.)
    role = Column(String, nullable=True)

    # Verificação de e-mail
    verification_code = Column(String, nullable=True)
    salt = Column(String, nullable=True)
    code_expiry = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Boolean, default=False)

    refresh_tokens = relationship(RefreshToken, back_populates="user", cascade="all, delete-orphan")
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    # -------------------------------------------------------------
    # 🟩 Propriedade computada
    # -------------------------------------------------------------
    @property
    def is_master(self) -> bool:
        """Retorna True se o usuário for master por role ou scope."""
        return self.role == "master" and "master" in (self.scopes or [])