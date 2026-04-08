from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.auth.dependencies import get_db, require_master_full_access
from app.store.schemas import ProductResponse, ProductOption
from app.store.service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
async def list_products(db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.list_products()


@router.post("/register", response_model=ProductResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_master_full_access)])
async def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    stock: int = Form(...),
    weight_grams: int = Form(..., gt=0),
    height_cm: float = Form(..., ge=1, le=105),
    width_cm: float = Form(..., ge=1, le=105),
    length_cm: float = Form(..., ge=1, le=105),
    category_id: int = Form(...),
    preset_id: int = Form(...),
    discount: float = Form(..., ge=0),
    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    product = await service.create_product(
        name=name,
        description=description,
        price=price,
        stock=stock,
        weight_grams=weight_grams,
        height_cm=height_cm,
        width_cm=width_cm,
        length_cm=length_cm,
        category_id=category_id,
        preset_id=preset_id,
        discount=discount,
        images=images,
    )
    return ProductResponse.model_validate(product, from_attributes=True)


@router.get("/options", response_model=List[ProductOption])
async def get_product_options(db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_product_options()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.get_product(product_id)
    return ProductResponse.model_validate(product, from_attributes=True)


@router.put("/{product_id}", response_model=ProductResponse, dependencies=[Depends(require_master_full_access)])
async def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    stock: Optional[int] = Form(None),
    weight_grams: Optional[int] = Form(None, gt=0),
    height_cm: Optional[float] = Form(None, ge=1, le=105),
    width_cm: Optional[float] = Form(None, ge=1, le=105),
    length_cm: Optional[float] = Form(None, ge=1, le=105),
    category_id: Optional[int] = Form(None),
    preset_id: Optional[int] = Form(None),
    discount: Optional[float] = Form(None, ge=0),
    images: Optional[List[UploadFile]] = File(None),
    replace_images: bool = Form(False),
    delete_image_indices: Optional[List[int]] = Form(None),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    product = await service.update_product(
        product_id=product_id,
        name=name,
        description=description,
        price=price,
        stock=stock,
        weight_grams=weight_grams,
        height_cm=height_cm,
        width_cm=width_cm,
        length_cm=length_cm,
        category_id=category_id,
        preset_id=preset_id,
        discount=discount,
        images=images,
        replace_images=replace_images,
        delete_image_indices=delete_image_indices,
    )
    return ProductResponse.model_validate(product, from_attributes=True)