from pydantic import BaseModel, ConfigDict
from typing import Optional

class ShippingPresetDropdown(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class ShippingPresetResponse(BaseModel):
    id: int
    name: str
    weight_grams: float
    discount: float
    height_cm: float
    width_cm: float
    length_cm: float
    model_config = ConfigDict(from_attributes=True)

class ShippingPresetCreate(BaseModel):
    name: str
    weight_grams: int
    discount: float
    height_cm: float
    width_cm: float
    length_cm: float
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)

class ShippingPresetUpdate(BaseModel):
    name: Optional[str] = None
    weight_grams: Optional[int] = None
    height_cm: Optional[float] = None
    width_cm: Optional[float] = None
    discount: Optional[float] = None
    length_cm: Optional[float] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)    