from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
import httpx
import os

from app.auth.dependencies import get_db, require_master_full_access
from app.store.models import Product
from app.store.schemas import ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")


async def upload_to_imgbb(image: UploadFile, api_key: str = IMGBB_API_KEY):
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chave de API do ImgBB não configurada."
        )
    allowed_types = ["image/jpeg", "image/png"]
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de imagem inválido. Tipos permitidos: {', '.join(allowed_types)}"
        )
    url = "https://api.imgbb.com/1/upload"
    async with httpx.AsyncClient() as client:
        try:
            content = await image.read()
            files = {"image": (image.filename, content, image.content_type)}
            data = {"key": api_key}
            response = await client.post(url, files=files, data=data)
            response.raise_for_status()
            return response.json()["data"]["url"]
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao fazer upload da imagem: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro inesperado ao fazer upload: {str(e)}"
            )


@router.get("", response_model=List[ProductResponse])
async def list_products(
    db: Session = Depends(get_db),
):
    products = db.query(Product).options(joinedload(Product.category)).all()
    return products


@router.post("/register", response_model=ProductResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_master_full_access)]
             )
async def create_product(
    name: str = Form(...),
    description: str = Form(None),
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
    if height_cm + width_cm + length_cm > 200:
        raise HTTPException(
            status_code=400, detail="Soma das dimensões excede 200cm (limite Correios)")

    image_urls = []
    if images:
        for img in images:
            url = await upload_to_imgbb(img)
            image_urls.append(url)

    new_product = Product(
        name=name,
        description=description,
        price=price,
        stock=stock,
        weight_grams=weight_grams,
        height_cm=height_cm,
        width_cm=width_cm,
        length_cm=length_cm,
        category_id=category_id,
        discount=discount,
        shipping_preset_id=preset_id,
        image_urls=image_urls or None
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return ProductResponse.model_validate(new_product, from_attributes=True)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.query(Product).options(joinedload(
        Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return product
