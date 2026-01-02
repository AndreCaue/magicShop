from fastapi import APIRouter, HTTPException, Path
from fastapi.responses import JSONResponse
import httpx
from typing import Dict, Any
import re

# Cria o router para o módulo de CEP
router = APIRouter(
    prefix="/cep",
    tags=["CEP"],
    responses={404: {"description": "Não encontrado"}},
)

# Cache simples em memória (para evitar consultas repetidas)
cep_cache: Dict[str, Dict[str, Any]] = {}

@router.get(
    "/{cep}",
    summary="Busca endereço por CEP",
    description="Consulta endereço por CEP usando ViaCEP como principal e BrasilAPI como fallback",
    response_description="Dados do endereço no formato padrão"
)
async def buscar_cep(
    cep: str = Path(
        ...,
        title="CEP",
        description="CEP com 8 dígitos (sem hífen)",
        pattern=r"^\d{8}$",
        example="13454183"
    )
):
    # Remove qualquer hífen ou espaço
    cep_clean = re.sub(r"\D", "", cep)

    # Validação básica (redundante com o Path, mas por segurança)
    if len(cep_clean) != 8:
        raise HTTPException(status_code=400, detail="CEP deve conter exatamente 8 dígitos numéricos")

    # Verifica cache
    if cep_clean in cep_cache:
        return cep_cache[cep_clean]

    # Tenta ViaCEP primeiro
    viacep_url = f"https://viacep.com.br/ws/{cep_clean}/json/"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(viacep_url, timeout=8.0)
            response.raise_for_status()
            data = response.json()

            # Verifica se ViaCEP retornou erro
            if "erro" in data:
                raise ValueError("CEP não encontrado no ViaCEP")

            # Normaliza resposta
            result = {
                "cep": data["cep"],
                "logradouro": data["logradouro"],
                "complemento": data["complemento"],
                "bairro": data["bairro"],
                "localidade": data["localidade"],
                "uf": data["uf"],
                "ibge": data["ibge"],
                "gia": data.get("gia", ""),
                "ddd": data.get("ddd", ""),
                "siafi": data.get("siafi", "")
            }
            cep_cache[cep_clean] = result
            return result

    except (httpx.RequestError, httpx.HTTPStatusError, ValueError, Exception) as e:
        # Fallback: BrasilAPI
        brasilapi_url = f"https://brasilapi.com.br/api/cep/v2/{cep_clean}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(brasilapi_url, timeout=5.0)
                response.raise_for_status()
                data = response.json()

                # Normaliza para formato compatível com ViaCEP
                result = {
                    "cep": data["cep"],
                    "logradouro": data.get("street", ""),
                    "complemento": data.get("complement", ""),
                    "bairro": data.get("neighborhood", ""),
                    "localidade": data["city"],
                    "uf": data["state"],
                    "ibge": data.get("ibge", ""),
                    "gia": "",  # BrasilAPI não tem
                    "ddd": data.get("ddd", ""),
                    "siafi": ""
                }
                cep_cache[cep_clean] = result
                return result

        except Exception as fallback_error:
            raise HTTPException(
                status_code=503,
                detail="Serviço de CEP temporariamente indisponível. Tente novamente mais tarde."
            )