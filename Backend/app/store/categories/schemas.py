from pydantic import BaseModel
from typing import Optional

# class BrandBase(BaseModel):
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True
        validate_by_name = True


# class BrandCreate(BrandBase):
class CategoryCreate(CategoryBase):
    pass


# class BrandResponse(CategoryBase):
class CategoryResponse(CategoryBase):
    id: int