from pydantic import BaseModel, Field
from typing import List, Optional

class BrandBase(BaseModel):
    name: str # frontend usa 'descricao', backend continua com 'name'
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True
        validate_by_name = True


class BrandCreate(BrandBase):
    pass


class BrandResponse(BrandBase):
    id: int