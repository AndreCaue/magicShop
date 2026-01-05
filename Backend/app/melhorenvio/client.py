import httpx
from app.core.config import settings


BASE_URLS = {
    "production": "https://melhorenvio.com.br/api/v2",
    "sandbox": "https://sandbox.melhorenvio.com.br/api/v2",
}
class MelhorEnvioClient:
    def __init__(self):
        env = (settings.MELHOR_ENVIO_ENV or "production").lower()
        self.environment = env
        self.base_url = BASE_URLS.get(env, BASE_URLS["production"])

        if env == "sandbox":
            token = settings.MELHOR_ENVIO_TOKEN_SANDBOX
            token_name = "MELHOR_ENVIO_TOKEN_SANDBOX"
        else:
            token = settings.MELHOR_ENVIO_TOKEN or settings.MELHOR_ENVIO_TOKEN_SANDBOX  
            token_name = "MELHOR_ENVIO_TOKEN"

        if not token:
            raise ValueError(f"Token não configurado: {token_name} está faltando no .env")

        self.token = token.strip()

        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=20.0,
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.token}", 
                "User-Agent": f"MagicShop/{getattr(settings, 'APP_VERSION', '1.0')} (seuemail@gmail.com)",
            },
        )


    async def close(self):
        await self.client.aclose()

    async def post(self, endpoint: str, json: dict | None = None, **kwargs):
        url = endpoint if endpoint.startswith("http") else f"/{endpoint.lstrip('/')}"
        try:
            response = await self.client.post(url, json=json, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            raise
        except httpx.RequestError as exc:
            raise

    async def get(self, endpoint: str, **kwargs):
        url = endpoint if endpoint.startswith("http") else f"/{endpoint.lstrip('/')}"
        try:
            response = await self.client.get(url, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            raise
        except httpx.RequestError as exc:
            raise


melhor_envio_client = MelhorEnvioClient()