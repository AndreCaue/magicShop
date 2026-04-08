"""
payments/efi_client.py

Gerencia a inicialização e acesso ao cliente da Efí (ex-Gerencianet).
- Usa variáveis de ambiente para credenciais.
- Suporta sandbox vs produção via variável EFI_SANDBOX.
- Cria instância única (lazy) para reutilizar autenticação/token.
"""

from efipay import EfiPay
from pathlib import Path
import os
from typing import Optional
from ..core.config import settings
import base64
from fastapi import HTTPException, requests


class EfiClient:
    """
    Classe wrapper para o SDK oficial da Efí.
    Instancia o EfiPay com credenciais do ambiente.
    """

    def __init__(self, sandbox: bool = True):
        client_id = settings.EFI_CLIENT_ID
        client_secret = settings.EFI_CLIENT_SECRET
        cert_path = settings.EFI_CERTIFICATE_PATH

        if not all([client_id, client_secret, cert_path]):
            raise ValueError(
                "Credenciais EFI incompletas. Verifique as variáveis: "
                "EFI_CLIENT_ID, EFI_CLIENT_SECRET e EFI_CERTIFICATE_PATH"
            )

        cert_absolute = Path(cert_path).resolve()

        if not cert_absolute.exists():
            raise FileNotFoundError(
                f"Certificado EFI não encontrado em: {cert_absolute}")

        credentials = {
            "client_id": client_id,
            "client_secret": client_secret,
            "certificate": str(cert_absolute),
            "sandbox": sandbox,
            "timeout": 30,
        }

        self.efi = EfiPay(credentials)

    def __getattr__(self, name):
        """Permite acessar diretamente os métodos do SDK: client.pix_create_charge()"""
        return getattr(self.efi, name)


_efi_instance: Optional[EfiClient] = None


def get_efi_client() -> EfiClient:
    """
    Função de dependência para FastAPI.
    Retorna a instância única do EfiClient (cacheada).
    Uso: efi_client: EfiClient = Depends(get_efi_client)
    """
    global _efi_instance
    if _efi_instance is None:
        sandbox_str = os.getenv("EFI_SANDBOX", "true").lower()
        is_sandbox = sandbox_str in ("true", "1", "yes", "sandbox")

        _efi_instance = EfiClient(sandbox=is_sandbox)

        print(f"[EFI Client] Instância criada - sandbox: {is_sandbox}")

    return _efi_instance


def test_efi_connection():
    try:
        client = get_efi_client()
        response = client.efi.pix_list_keys()
        print("Conexão OK! Resposta das chaves Pix:", response)
    except Exception as e:
        print("Erro ao testar conexão com Efí:", str(e))


def pix_create_devolution_manual(e2e_id: str, devolucao_id: str, valor: str, descricao: str = ""):
    client_id = os.getenv("EFI_CLIENT_ID")
    client_secret = os.getenv("EFI_CLIENT_SECRET")
    cert_path = os.getenv("EFI_CERTIFICATE_PATH")

    auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    # sandbox
    url = f"https://pix-h.api.efipay.com.br/v2/pix/{e2e_id}/devolucao/{devolucao_id}"

    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json"
    }

    body = {
        "valor": valor,
        "descricao": descricao
    }

    response = requests.put(
        url,
        json=body,
        headers=headers,
        cert=(cert_path, None), 
        verify=True
    )

    if response.status_code not in (200, 201):
        raise Exception(f"Erro Efí: {response.status_code} - {response.text}")

    return response.json()


def create_pix_devolution(e2e_id: str, devolucao_id: str, valor: float, descricao: str = "") -> dict:
    """
    Devolução Pix via requests direto (bypass SDK para evitar problemas de mapeamento).
    Retorna o response da Efí.
    """
    client_id = os.getenv("EFI_CLIENT_ID")
    client_secret = os.getenv("EFI_CLIENT_SECRET")
    cert_path = os.getenv("EFI_CERTIFICATE_PATH")

    if not all([client_id, client_secret, cert_path]):
        raise HTTPException(500, "Credenciais Efí incompletas no ambiente")

    auth_str = f"{client_id}:{client_secret}"
    auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

    # sandbox
    url = f"https://pix-h.api.efipay.com.br/v2/pix/{e2e_id}/devolucao/{devolucao_id}"

    headers = {
        "Authorization": f"Basic {auth_b64}",
        "Content-Type": "application/json"
    }

    body = {
        "valor": f"{valor:.2f}"
    }
    if descricao:
        body["descricao"] = descricao[:140]

    try:
        response = requests.put(
            url,
            json=body,
            headers=headers,
            cert=(cert_path, None),
            timeout=30
        )
        response.raise_for_status()  
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        raise HTTPException(
            500, f"Erro HTTP na Efí: {http_err.response.status_code} - {http_err.response.text}")
    except Exception as exc:
        raise HTTPException(500, f"Erro ao processar devolução: {str(exc)}")
