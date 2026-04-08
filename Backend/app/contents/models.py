from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database import Base
from sqlalchemy.orm import relationship


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    s3_key = Column(String, nullable=False, unique=True)
    thumbnail_s3_key = Column(String, nullable=True)

    duration = Column(Integer, nullable=True)  
    difficulty = Column(String, nullable=True, index=True)
    magic_type = Column(String, nullable=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="contents")

    @property
    def user_uuid(self) -> str:
        return self.user.uuid if self.user else None

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
