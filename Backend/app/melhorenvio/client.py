import httpx
from app.core.config import settings
import logging

BASE_URLS = {
    "production": "https://melhorenvio.com.br/api/v2",
    "sandbox": "https://sandbox.melhorenvio.com.br/api/v2",
}

logger = logging.getLogger(__name__)


class MelhorEnvioClient:
    def __init__(self):
        env = (getattr(settings, 'MELHOR_ENVIO_ENV', 'production')).lower()
        self.base_url = BASE_URLS.get(env, BASE_URLS["production"])

        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            limits=httpx.Limits(
                max_connections=50,
                max_keepalive_connections=10
            ),
        )

    async def close(self):
        await self.client.aclose()

    def _build_headers(self, extra: dict | None) -> dict:
        base = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        if extra:
            base.update(extra)
        return base

    async def post(self, endpoint: str, json: dict | None = None, headers: dict | None = None, **kwargs):
        url = f"/{endpoint.lstrip('/')}" if not endpoint.startswith(
            "http") else endpoint
        try:
            response = await self.client.post(url, json=json, headers=self._build_headers(headers), **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            logger.error(
                f"Melhor Envio HTTP Error {exc.response.status_code}: {exc.response.text}")
            raise
        except httpx.RequestError as exc:
            logger.error(f"Erro de conexão com Melhor Envio: {exc}")
            raise

    async def get(self, endpoint: str, headers: dict | None = None, **kwargs):
        url = f"/{endpoint.lstrip('/')}" if not endpoint.startswith(
            "http") else endpoint
        try:
            response = await self.client.get(url, headers=self._build_headers(headers), **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            logger.error(
                f"Melhor Envio HTTP Error {exc.response.status_code}: {exc.response.text}")
            raise
        except httpx.RequestError as exc:
            logger.error(f"Erro de conexão com Melhor Envio: {exc}")
            raise

    async def delete(self, endpoint: str, headers: dict | None = None, **kwargs) -> dict:
        url = f"/{endpoint.lstrip('/')}" if not endpoint.startswith(
            "http") else endpoint
        try:
            response = await self.client.delete(url, headers=self._build_headers(headers), **kwargs)
            response.raise_for_status()
            return response.json() if response.content else {}
        except httpx.HTTPStatusError as exc:
            logger.error(
                f"Melhor Envio HTTP Error {exc.response.status_code}: {exc.response.text}")
            raise
        except httpx.RequestError as exc:
            logger.error(f"Erro de conexão com Melhor Envio: {exc}")
            raise


melhor_envio_client = MelhorEnvioClient()
