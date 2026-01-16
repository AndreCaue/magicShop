from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.auth.dependencies import get_db, require_master_full_access
from app.store.models import Product
from app.store.categories.schemas import CategoryCreate, CategoryResponse
from app.store.categories.models import Category
from app.schemas import UserOut
from app.store.schemas import ProductResponse

router = APIRouter(prefix="/category", tags=["Category"])

@router.post("/register", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    
    normalized_name = category.name.strip().lower()

    existing_category = db.query(Category).filter(Category.name == normalized_name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma categoria com este nome."
        )

    new_category = Category(
        name=category.name,
        description=category.description,
        website=category.website,
        logo_url=category.logo_url,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.get("/", response_model=List[CategoryResponse])
async def list_categories(
    db: Session = Depends(get_db),
):

    return db.query(Category).all()


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category_by_id(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")
    return category

@router.get("/{category_id}/products", response_model=List[ProductResponse])
async def get_products_by_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    products = db.query(Product).filter(Product.category_id == category_id).options(
        joinedload(Product.category)
    ).all()
    return products

@router.put("/update/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_update: CategoryCreate,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    if category_update.name:
        normalized_name = category_update.name.strip().lower()
        
        existing_category = db.query(Category).filter(
            Category.name.ilike(normalized_name),
            Category.id != category_id
        ).first()
        
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe outra categoria com este nome."
            )

        category.name = category_update.name.strip()

    if category_update.description is not None:
        category.description = category_update.description
    if category_update.website is not None:
        category.website = category_update.website
    if category_update.logo_url is not None:
        category.logo_url = category_update.logo_url

    db.commit()
    db.refresh(category)
    return category


@router.delete("/delete/{category_id}", status_code=status.HTTP_200_OK)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: UserOut = Depends(require_master_full_access)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada.")

    product_count = db.query(Product).filter(Product.category_id == category_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não é possível excluir a marca '{category.name}'. Ela possui {product_count} produto(s) associado(s)."
        )

    db.delete(category)
    db.commit()

    return {
        "message": f"Categoria '{category.name}' (ID: {category_id}) foi removida com sucesso.",
        "id_removido": category_id
    }