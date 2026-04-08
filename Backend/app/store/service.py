from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
from fastapi import HTTPException, status, UploadFile, File

from app.store.models import Product
from app.core.s3_service import upload_file_direct_to_s3, delete_file_from_s3, cleanup_product_images
from sqlalchemy.orm.attributes import flag_modified


async def validate_and_upload_images(images: List[UploadFile], sku: str) -> List[str]:
    """Valida e faz upload das imagens para S3."""
    if not images:
        return []

    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    image_urls: List[str] = []

    for img in images:
        if img.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de imagem inválido. Permitidos: {', '.join(allowed_types)}"
            )

        content = await img.read()
        file_extension = img.filename.split(
            ".")[-1].lower() if "." in img.filename else "png"

        unique_id = uuid.uuid4().hex[:8]
        s3_key = f"products/{sku}/image_{unique_id}.{file_extension}"

        s3_url = upload_file_direct_to_s3(
            file_bytes=content,
            s3_key=s3_key,
            content_type=img.content_type
        )

        if not s3_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Falha ao enviar imagem para a AWS S3."
            )
        image_urls.append(s3_url)

    return image_urls


class ProductService:
    """Camada de serviço com toda a lógica de negócio de produtos."""

    def __init__(self, db: Session):
        self.db = db

    def get_product(self, product_id: int) -> Product:
        product = self.db.query(Product).options(joinedload(
            Product.category)).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=404, detail="Produto não encontrado.")
        return product

    def list_products(self):
        return self.db.query(Product).options(joinedload(Product.category)).all()

    def get_product_options(self):
        options = self.db.query(Product.id, Product.name).all()
        return [{"id": r.id, "name": r.name} for r in options]

    async def create_product(
        self,
        name: str,
        price: float,
        stock: int,
        weight_grams: int,
        height_cm: float,
        width_cm: float,
        length_cm: float,
        category_id: int,
        preset_id: int,
        discount: float,
        description: Optional[str] = None,
        images: Optional[List[UploadFile]] = None,
    ) -> Product:
        if height_cm + width_cm + length_cm > 200:
            raise HTTPException(
                status_code=400, detail="Soma das dimensões excede 200cm (limite Correios)")

        sku = f"DI-{uuid.uuid4().hex[:6].upper()}"
        image_urls = await validate_and_upload_images(images, sku) if images else []

        while self.db.query(Product).filter(Product.sku == sku).first():
            sku = f"DI-{uuid.uuid4().hex[:6].upper()}"

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
            shipping_preset_id=preset_id,
            discount=discount,
            sku=sku,
            image_urls=image_urls or None,
        )

        self.db.add(new_product)
        self.db.commit()
        self.db.refresh(new_product)

        return self.get_product(new_product.id)

    async def update_product(
        self,
        product_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        price: Optional[float] = None,
        stock: Optional[int] = None,
        weight_grams: Optional[int] = None,
        height_cm: Optional[float] = None,
        width_cm: Optional[float] = None,
        length_cm: Optional[float] = None,
        category_id: Optional[int] = None,
        preset_id: Optional[int] = None,
        discount: Optional[float] = None,
        images: Optional[List[UploadFile]] = None,
        replace_images: bool = False,
        delete_image_indices: Optional[List[int]] = None,
    ) -> Product:
        product = self.get_product(product_id) 

        new_height = height_cm if height_cm is not None else product.height_cm
        new_width = width_cm if width_cm is not None else product.width_cm
        new_length = length_cm if length_cm is not None else product.length_cm

        if new_height + new_width + new_length > 200:
            raise HTTPException(
                status_code=400, detail="Soma das dimensões excede 200cm (limite Correios)")

        if name is not None:
            product.name = name
        if description is not None:
            product.description = description
        if price is not None:
            product.price = price
        if stock is not None:
            product.stock = stock
        if weight_grams is not None:
            product.weight_grams = weight_grams
        if height_cm is not None:
            product.height_cm = height_cm
        if width_cm is not None:
            product.width_cm = width_cm
        if length_cm is not None:
            product.length_cm = length_cm
        if category_id is not None:
            product.category_id = category_id
        if preset_id is not None:
            product.shipping_preset_id = preset_id
        if discount is not None:
            product.discount = discount

        current_images = list(product.image_urls or [])

        if delete_image_indices:
            delete_image_indices = sorted(
                set(idx for idx in delete_image_indices if 0 <=
                    idx < len(current_images)),
                reverse=True
            )
            for idx in delete_image_indices:
                url = current_images[idx]
                delete_file_from_s3(url)
                current_images.pop(idx)

        if images:
            new_image_urls = await validate_and_upload_images(images, product.sku)

            if replace_images:
                current_images = new_image_urls
            else:
                current_images.extend(new_image_urls)

        product.image_urls = current_images if current_images else None

        flag_modified(product, "image_urls")

        self.db.flush()

        self.db.commit()
        self.db.refresh(product)

        cleanup_product_images(
            product.sku,
            product.image_urls or []
        )

        return self.get_product(product.id)
