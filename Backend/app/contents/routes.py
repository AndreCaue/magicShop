from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_user, require_master_full_access, get_current_user_optional
from app.models import User
from app.contents.models import Content
from app.contents.schemas import (
    ContentCreate,
    ContentResponse,
    PresignedUrlRequest,
    PresignedUrlResponse,
)
from app.contents.service import get_presigned_url_for_content
from app.core.s3_service import generate_presigned_view_url

router = APIRouter(prefix="/contents", tags=["Contents"])


SCOPE_HIERARCHY = ["basic", "premium", "master"]


def _user_has_scope(user: User, required_scope: str) -> bool:
    """
    Retorna True se o usuário possui o scope exigido ou um scope superior.
    Master libera tudo, premium libera premium, basic só libera basic.
    """
    user_scopes = user.scopes or []
    required_level = SCOPE_HIERARCHY.index(required_scope) if required_scope in SCOPE_HIERARCHY else 0

    for scope in user_scopes:
        if scope in SCOPE_HIERARCHY:
            if SCOPE_HIERARCHY.index(scope) >= required_level:
                return True
    return False


@router.post(
    "/presigned-url",
    response_model=PresignedUrlResponse,
    summary="Gerar URL pré-assinada para upload direto no S3 (somente master)",
)
def generate_presigned_url(
    request: PresignedUrlRequest,
    current_user: User = Depends(require_master_full_access),
):
    return get_presigned_url_for_content(request)


@router.post(
    "/",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Salvar metadados de um conteúdo após upload no S3 (somente master)",
)
def create_content(
    payload: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_master_full_access),
):
    if db.query(Content).filter(Content.s3_key == payload.s3_key).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um conteúdo registrado com essa s3_key.",
        )

    content = Content(
        type=payload.type,
        title=payload.title,
        description=payload.description,
        s3_key=payload.s3_key,
        thumbnail_s3_key=payload.thumbnail_s3_key,
        duration=payload.duration,
        difficulty=payload.difficulty,
        magic_type=payload.magic_type,
        is_public=payload.is_public,
        is_paid=payload.is_paid,
        price_cents=payload.price_cents,
        required_scope=payload.required_scope,
        status=payload.status,
        user_id=current_user.id,
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.get(
    "/",
    response_model=list[ContentResponse],
    summary="Listar conteúdos publicados (vitrine aberta para visitantes)",
)
def list_contents(
    type: Optional[str] = None,
    difficulty: Optional[str] = None,
    magic_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(Content).filter(Content.status == "published")

    if type:
        query = query.filter(Content.type == type)
    if difficulty:
        query = query.filter(Content.difficulty == difficulty)
    if magic_type:
        query = query.filter(Content.magic_type == magic_type)

    contents = query.order_by(Content.created_at.desc()).all()

    if current_user and current_user.is_master:
        return contents

    return contents


@router.get(
    "/{content_id}",
    response_model=ContentResponse,
    summary="Detalhe de um conteúdo — retorna view_url se o usuário for master, ou se o conteúdo exigir escopo e o usuário tiver (vitrine aberta).",
)
def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.status == "published",
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conteúdo não encontrado.",
        )

    has_access = False
    
    if current_user:
        has_access = (
            current_user.is_master
            or not content.required_scope
            or _user_has_scope(current_user, content.required_scope)
        )
    else:
        has_access = not content.required_scope

    content.view_url = (
        generate_presigned_view_url(content.s3_key) if has_access else None
    )

    return content