from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from .auth.jwt import RefreshToken


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # uuid = Column(
    #     String(36),
    #     default=lambda: str(uuid.uuid4()),
    #     unique=True,
    #     nullable=False,
    #     index=True
    # ) Feature / futuro.
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    scopes = Column(JSON, default=["basic"])

    role = Column(String, nullable=True)

    verification_code = Column(String, nullable=True)
    salt = Column(String, nullable=True)
    code_expiry = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Boolean, default=False)

    refresh_tokens = relationship(
        RefreshToken, back_populates="user", cascade="all, delete-orphan")
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(
        timezone.utc), onupdate=datetime.now(timezone.utc))

    @property
    def is_master(self) -> bool:
        return self.role == "master" and "master" in (self.scopes or [])
