from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.auth.dependencies import get_db, require_master_full_access
from app.store.models import Product
from app.store.branch.schemas import BrandCreate, BrandResponse
from app.store.branch.models import Brand
from app.schemas import UserOut
from app.store.schemas import ProductResponse

router = APIRouter(prefix="/brands", tags=["Brands"])

@router.post("/register", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    brand: BrandCreate,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    
    normalized_name = brand.name.strip().lower()

    existing_brand = db.query(Brand).filter(Brand.name == normalized_name).first()
    if existing_brand:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma marca com este nome."
        )

    new_brand = Brand(
        name=brand.name,
        description=brand.description,
        website=brand.website,
        logo_url=brand.logo_url,
    )

    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)

    return new_brand


@router.get("/", response_model=List[BrandResponse])
async def list_brands(
    db: Session = Depends(get_db),
):

    return db.query(Brand).all()


@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand_by_id(
    brand_id: int,
    db: Session = Depends(get_db),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Marca não encontrada.")
    return brand

@router.get("/{brand_id}/products", response_model=List[ProductResponse])
async def get_products_by_brand(
    brand_id: int,
    db: Session = Depends(get_db),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Marca não encontrada.")

    products = db.query(Product).filter(Product.brand_id == brand_id).options(
        joinedload(Product.brand)
    ).all()
    return products

@router.put("/update/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: int,
    brand_update: BrandCreate,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Marca não encontrada.")

    if brand_update.name:
        normalized_name = brand_update.name.strip().lower()
        
        existing_brand = db.query(Brand).filter(
            Brand.name.ilike(normalized_name),
            Brand.id != brand_id
        ).first()
        
        if existing_brand:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe outra marca com este nome."
            )

        brand.name = brand_update.name.strip()

    if brand_update.description is not None:
        brand.description = brand_update.description
    if brand_update.website is not None:
        brand.website = brand_update.website
    if brand_update.logo_url is not None:
        brand.logo_url = brand_update.logo_url

    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/delete/{brand_id}", status_code=status.HTTP_200_OK)
async def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Marca não encontrada.")

    product_count = db.query(Product).filter(Product.brand_id == brand_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não é possível excluir a marca '{brand.name}'. Ela possui {product_count} produto(s) associado(s)."
        )

    db.delete(brand)
    db.commit()

    return {
        "message": f"Marca '{brand.name}' (ID: {brand_id}) foi removida com sucesso.",
        "id_removido": brand_id
    }