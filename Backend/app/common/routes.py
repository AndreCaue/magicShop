from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.models import User
from sqlalchemy.orm import Session
from .models import DropdownItem, ShippingPreset
from .schemas import ShippingPresetDropdown, ShippingPresetResponse
from app.auth.dependencies import get_db
from app.store.branch.models import Brand
from app.auth.dependencies import require_master_full_access

router = APIRouter(prefix="/dropdown", tags=["Dropdown/Helpers"])

@router.get("/branch", response_model=List[DropdownItem])
async def get_brands_dropdown(db: Session = Depends(get_db), _: User = Depends(require_master_full_access)):
    brands = db.query(Brand.id, Brand.name).order_by(Brand.name.asc()).all()
    return [{"id": b.id, "descricao": b.name} for b in brands]

@router.get("/shipping-presets", response_model=List[ShippingPresetDropdown])
def get_shipping_presets_dropdown(
    db: Session = Depends(get_db),
    _: User = Depends(require_master_full_access)  # BLOQUEIA NÃO-MASTER
):
    presets = db.query(ShippingPreset.id, ShippingPreset.name)\
                .filter(ShippingPreset.is_active == True)\
                .order_by(ShippingPreset.name)\
                .all()
    return [{"id": p.id, "name": p.name} for p in presets]
