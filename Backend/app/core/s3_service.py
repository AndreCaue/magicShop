import boto3
import logging
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_s3_client():
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SECRET_ACCESS_KEY:
        logger.warning("Credenciais AWS não configuradas — S3 indisponível.")
        return None

    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION or "us-east-1",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def _get_bucket(is_public: bool = False) -> str | None:
    """Retorna o bucket correto conforme o ambiente e o nível de privacidade."""
    if is_public:
        if settings.ENVIRONMENT == "production":
            return settings.S3_BUCKET_PUBLIC_PROD
        return settings.S3_BUCKET_PUBLIC_DEV
    else:
        if settings.ENVIRONMENT == "production":
            return settings.S3_BUCKET_PRIVATE_PROD
        return settings.S3_BUCKET_PRIVATE_DEV


def generate_presigned_upload_url(
    s3_key: str,
    content_type: str,
    expiration_seconds: int = 900, 
) -> dict | None:
    """
    Gera URL pré-assinada para upload direto via PUT.

    Não retorna URL de download — o acesso aos vídeos é controlado
    pela API, que valida permissões antes de gerar URLs temporárias
    de visualização (ver generate_presigned_view_url).
    """
    client = _get_s3_client()
    if client is None:
        return None

    bucket = _get_bucket(is_public=False)
    if not bucket:
        logger.warning(
            "Bucket S3 não configurado para ENVIRONMENT=%s", settings.ENVIRONMENT)
        return None

    try:
        url = client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket,
                "Key": s3_key,
                "ContentType": content_type,
            },
            ExpiresIn=expiration_seconds,
            HttpMethod="PUT",
        )

        return {
            "upload_url": url,
            "s3_key": s3_key,
            "expires_in": expiration_seconds,
        }

    except ClientError:
        logger.exception(
            "Erro ao gerar presigned upload URL para key '%s'", s3_key)
        return None


def generate_presigned_view_url(
    s3_key: str,
    expiration_seconds: int = 900, 
) -> str | None:
    """
    Gera URL temporária de visualização (GET) para o player de vídeo.

    Esta função deve ser chamada APENAS após validar que o usuário
    tem permissão para acessar o conteúdo (ex: é premium ou tem acesso liberado).
    Nunca expor essa URL diretamente no frontend sem controle de acesso na API.
    """
    client = _get_s3_client()
    if client is None:
        return None

    bucket = _get_bucket(is_public=False)
    if not bucket:
        logger.warning(
            "Bucket S3 não configurado para ENVIRONMENT=%s", settings.ENVIRONMENT)
        return None

    try:
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": s3_key},
            ExpiresIn=expiration_seconds,
        )

    except ClientError:
        logger.exception(
            "Erro ao gerar presigned view URL para key '%s'", s3_key)
        return None


def upload_file_direct_to_s3(
    file_bytes: bytes,
    s3_key: str,
    content_type: str,
    is_public: bool = True,
) -> str | None:
    """
    Faz o upload direto do backend para a AWS S3.
    Ideal para arquivos pequenos (como fotos de produtos) recebidos no FormData
    e que não valem a complexidade de URL pré-assinada no client.
    Retorna a URL pública do objeto (assumindo que seja lido de forma pública ou via CloudFront,
    mas se for bloqueado, essa s3_key pode ser usada no gerador de URL temporária).
    """
    client = _get_s3_client()
    if client is None:
        return None

    bucket = _get_bucket(is_public=is_public)
    if not bucket:
        logger.warning(
            "Bucket S3 não configurado para ENVIRONMENT=%s", settings.ENVIRONMENT)
        return None

    try:
        client.put_object(
            Bucket=bucket,
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type,
        )

        region = settings.AWS_REGION or "sa-east-1"
        return f"https://{bucket}.s3.{region}.amazonaws.com/{s3_key}"

    except ClientError:
        logger.exception(
            "Erro ao fazer upload direto para S3 key '%s'", s3_key)
        return None


def delete_file_from_s3(file_url: str, is_public: bool = True) -> bool:
    """
    Remove um arquivo do S3 a partir da URL salva no banco.
    """
    client = _get_s3_client()
    if client is None:
        return False

    bucket = _get_bucket(is_public=is_public)
    if not bucket:
        logger.warning(
            "Bucket S3 não configurado para ENVIRONMENT=%s", settings.ENVIRONMENT)
        return False

    try:
        key = file_url.split(".amazonaws.com/")[-1]

        client.delete_object(
            Bucket=bucket,
            Key=key,
        )

        return True

    except ClientError:
        logger.exception("Erro ao deletar arquivo do S3 '%s'", file_url)
        return False


def list_files_from_s3(prefix: str, is_public: bool = True) -> list[str]:
    """
    Lista arquivos dentro de um prefixo (ex: products/DI-XXX/)
    """
    client = _get_s3_client()
    if client is None:
        return []

    bucket = _get_bucket(is_public=is_public)
    if not bucket:
        return []

    try:
        response = client.list_objects_v2(
            Bucket=bucket,
            Prefix=prefix
        )

        contents = response.get("Contents", [])

        region = settings.AWS_REGION or "sa-east-1"

        return [
            f"https://{bucket}.s3.{region}.amazonaws.com/{obj['Key']}"
            for obj in contents
        ]

    except ClientError:
        logger.exception("Erro ao listar arquivos do S3 prefix '%s'", prefix)
        return []


def cleanup_product_images(sku: str, valid_urls: list[str]):
    """
    Remove do S3 imagens que não estão mais no banco
    """
    prefix = f"products/{sku}/"

    s3_files = list_files_from_s3(prefix)

    for file_url in s3_files:
        if file_url not in valid_urls:
            delete_file_from_s3(file_url)
