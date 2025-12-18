from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models import User
from sqlalchemy.orm import Session
from .models import ShippingPreset
from .schemas import ShippingPresetResponse, ShippingPresetCreate, ShippingPresetUpdate
from app.auth.dependencies import get_db
from app.store.branch.models import Brand
from app.auth.dependencies import require_master_full_access
from app.schemas import UserOut
from app.generics.schemas import SuccessMessage

router = APIRouter(prefix="/helpers", tags=["Helpers"])

@router.get("/shipping-presets/{preset_id}", response_model=ShippingPresetResponse)
def get_shipping_preset_details(
    preset_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_master_full_access)  # BLOQUEIA NÃO-MASTER
):
    preset = db.query(ShippingPreset)\
               .filter(ShippingPreset.id == preset_id,
                       ShippingPreset.is_active == True)\
               .first()
    if not preset:
        raise HTTPException(404, "Preset não encontrado")
    return preset

@router.post("/shipping-presets/create", response_model=ShippingPresetResponse, status_code=status.HTTP_201_CREATED)
def create_shipping_preset(
    preset: ShippingPresetCreate,
    db: Session = Depends(get_db),
     _: UserOut = Depends(require_master_full_access)
):
    # Verifica se já existe um com o mesmo name (unique=True)
    db_preset = db.query(ShippingPreset).filter(ShippingPreset.name == preset.name).first()
    if db_preset:
        raise HTTPException(
            status_code=400,
            detail="Já existe um Shipping Preset com esse nome."
        )

    # Cria o novo objeto
    new_preset = ShippingPreset(**preset.model_dump())
    db.add(new_preset)
    db.commit()
    db.refresh(new_preset)

    return new_preset

@router.put("/shipping-presets/update/{preset_id}", response_model=ShippingPresetResponse)
def update_shipping_preset(
    preset_id: int,
    preset_update: ShippingPresetUpdate,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    # Busca o preset pelo ID
    db_preset = db.query(ShippingPreset).filter(ShippingPreset.id == preset_id).first()
    if not db_preset:
        raise HTTPException(status_code=404, detail="Shipping Preset não encontrado")

    # Verifica unicidade do name se estiver sendo alterado
    if preset_update.name is not None:
        existing = db.query(ShippingPreset).filter(
            ShippingPreset.name == preset_update.name,
            ShippingPreset.id != preset_id  # Exclui o próprio registro
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Já existe outro preset com esse nome")

    # Atualiza apenas os campos fornecidos
    update_data = preset_update.model_dump(exclude_unset=True)  # Ignora campos não enviados
    for key, value in update_data.items():
        setattr(db_preset, key, value)

    db.commit()
    db.refresh(db_preset)
    return db_preset


# ROTA DELETE - Remover um preset
@router.delete("/shipping-presets/delete/{preset_id}", response_model=SuccessMessage ,status_code=status.HTTP_200_OK)
def delete_shipping_preset(
    preset_id: int,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    db_preset = db.query(ShippingPreset).filter(ShippingPreset.id == preset_id).first()
    if not db_preset:
        raise HTTPException(status_code=404, detail="Shipping Preset não encontrado")

    db.delete(db_preset)
    db.commit()

    return SuccessMessage(
        message=f"Shipping Preset '{db_preset.name}' (ID: {preset_id}) removido com sucesso.",
        detail={"id_removido": preset_id}
    )