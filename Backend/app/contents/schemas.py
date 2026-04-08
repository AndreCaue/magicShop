from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from decimal import Decimal




ContentTypeLiteral = Literal["video", "book", "pdf"]
DifficultyLiteral = Literal["easy", "medium", "hard"]
MagicTypeLiteral = Literal["clean_magic", "dirty_magic", "camera_magic"]


class PresignedUrlRequest(BaseModel):
    filename: str = Field(..., description="Nome original do arquivo (ex: introducao.mp4)")
    content_type: str = Field(..., description="MIME type (ex: video/mp4, image/jpeg)")
    folder: str = Field(..., description="Pasta base no S3 (ex: contents/videos)")
    difficulty: Optional[DifficultyLiteral] = Field(None)
    magic_type: Optional[MagicTypeLiteral] = Field(None)

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, v: str) -> str:
        if "." not in v or len(v.split(".")[-1]) < 2:
            raise ValueError("Filename deve conter uma extensão válida")
        return v.lower().strip()

    @field_validator("content_type")
    @classmethod
    def validate_content_type(cls, v: str) -> str:
        allowed = {
            "video/mp4", "video/quicktime", "video/webm",
            "image/jpeg", "image/png", "image/webp",
            "application/pdf",
        }
        if v not in allowed:
            raise ValueError(f"Content-Type não permitido: {v}")
        return v


class PresignedUrlResponse(BaseModel):
    """Resposta para upload direto via PUT no S3"""
    upload_url: str = Field(..., description="URL pré-assinada para fazer PUT do arquivo")
    s3_key: str = Field(..., description="Chave completa que será usada no S3")
    expires_in: int = Field(..., description="Tempo de expiração em segundos (900 = 15 minutos)")


class ContentCreate(BaseModel):
    type: ContentTypeLiteral = Field(..., description="Tipo do conteúdo")
    title: str = Field(..., min_length=3, max_length=300)
    description: Optional[str] = Field(None, max_length=2000)

    s3_key: str = Field(..., description="Chave do arquivo principal (vídeo ou PDF)")
    thumbnail_s3_key: Optional[str] = Field(None)

    duration: Optional[int] = Field(None, ge=1, description="Duração em segundos - apenas para vídeos")
    difficulty: Optional[DifficultyLiteral] = None
    magic_type: Optional[MagicTypeLiteral] = None

    is_public: bool = Field(True, description="Conteúdo acessível sem login")
    is_paid: bool = Field(False, description="Conteúdo pago")
    price_cents: Optional[int] = Field(None, ge=0, description="Preço em centavos (ex: 2990 = R$ 29,90)")
    required_scope: Optional[Literal["premium", "master"]] = Field(None)

    status: Literal["draft", "published", "private"] = Field(
        "published",
        description="Status do conteúdo ao ser criado"
    )

class ContentResponse(BaseModel):
    id: int
    type: str
    title: str
    description: Optional[str]
    thumbnail_s3_key: Optional[str]
    duration: Optional[int]
    difficulty: Optional[str]
    magic_type: Optional[str]
    is_public: bool
    is_paid: bool
    price_cents: Optional[int]
    required_scope: Optional[str]
    status: str
    views: int
    user_uuid: str
    created_at: datetime
    updated_at: Optional[datetime]

    view_url: Optional[str] = Field(None, description="URL temporária de visualização (S3 presigned GET)")

    model_config = ConfigDict(from_attributes=True)


class ContentListResponse(BaseModel):
    items: list[ContentResponse]
    total: int
    skip: int
    limit: int


class ContentFilter(BaseModel):
    type: Optional[ContentTypeLiteral] = None
    difficulty: Optional[DifficultyLiteral] = None
    magic_type: Optional[MagicTypeLiteral] = None
    is_public: Optional[bool] = None
    is_paid: Optional[bool] = None