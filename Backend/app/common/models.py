from pydantic import BaseModel
from sqlalchemy import Column, Integer, Boolean, String
from app.database import Base 

class DropdownItem(BaseModel):
    id: int
    descricao: str

class ShippingPreset(Base):
    __tablename__ = "shipping_presets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True, index=True)
    weight_grams = Column(Integer, nullable=False)
    height_cm = Column(Integer, nullable=False)
    width_cm = Column(Integer, nullable=False)
    length_cm = Column(Integer, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)