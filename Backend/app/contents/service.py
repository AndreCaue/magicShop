import uuid
import logging
from fastapi import HTTPException, status
from app.core.s3_service import generate_presigned_upload_url
from app.contents.schemas import PresignedUrlRequest, PresignedUrlResponse

logger = logging.getLogger(__name__)


_ALLOWED: dict[str, set[str]] = {
    "contents/videos":     {"video/mp4", "video/quicktime", "video/webm"},
    "contents/thumbnails": {"image/jpeg", "image/png", "image/webp"},
    "contents/books":      {"application/pdf"},
}


def _build_s3_key(
    folder: str,
    filename: str,
    difficulty: str | None,
    magic_type: str | None,
) -> str:
    """
    Monta o path organizado no S3:
      contents/videos/{difficulty}/{magic_type}/{uuid}-{filename}
    Segmentos opcionais são suprimidos se None.
    """
    parts = [folder]
    if difficulty:
        parts.append(difficulty)
    if magic_type:
        parts.append(magic_type)
    parts.append(f"{uuid.uuid4().hex}-{filename}")
    return "/".join(parts)


def get_presigned_url_for_content(request: PresignedUrlRequest) -> PresignedUrlResponse:
    """
    Valida combinação pasta/tipo e gera presigned PUT URL no S3.

    Raises:
        422 — content_type inválido para a pasta informada.
        503 — S3 indisponível (credenciais não configuradas ou erro AWS).
    """
    allowed = _ALLOWED.get(request.folder)
    if allowed is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Pasta '{request.folder}' não permitida. Permitidas: {list(_ALLOWED.keys())}",
        )

    if request.content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"content_type '{request.content_type}' inválido para '{request.folder}'. "
                f"Permitidos: {sorted(allowed)}"
            ),
        )

    s3_key = _build_s3_key(
        folder=request.folder,
        filename=request.filename,
        difficulty=request.difficulty,
        magic_type=request.magic_type,
    )

    presigned = generate_presigned_upload_url(s3_key=s3_key, content_type=request.content_type)
    if presigned is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="S3 indisponível. Verifique as credenciais AWS no servidor.",
        )

    return PresignedUrlResponse(
        upload_url=presigned["upload_url"],
        s3_key=presigned["s3_key"],
        expires_in=presigned["expires_in"],
    )