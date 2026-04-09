from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
import httpx
import os
from urllib.parse import urlencode

router = APIRouter()

# Configurações (use .env em produção!)
CLIENT_ID = os.getenv("MELHOR_ENVIO_CLIENT_ID")
CLIENT_SECRET = os.getenv("MELHOR_ENVIO_CLIENT_SECRET")
# ex: https://seusite.com/api/auth/melhorenvio/callback
REDIRECT_URI = os.getenv("MELHOR_ENVIO_REDIRECT_URI")
ENV = "production"  # ou "sandbox" durante testes

BASE_URL = "https://www.melhorenvio.com.br" if ENV == "production" else "https://sandbox.melhorenvio.com.br"


@router.get("/authorize")
async def authorize_melhor_envio():
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        # ajuste os scopes necessários
        "scope": "cart.read cart.write companies.read companies.write shipments.read shipments.write",
        "state": "sp"  # recomendado para CSRF protection
    }
    auth_url = f"{BASE_URL}/oauth/authorize?" + urlencode(params)
    return RedirectResponse(auth_url)
