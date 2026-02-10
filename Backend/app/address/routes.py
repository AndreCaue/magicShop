from fastapi import APIRouter, HTTPException, Path
from fastapi.responses import JSONResponse
import httpx
from typing import Dict, Any
import re

router = APIRouter(
    prefix="/cep",
    tags=["CEP"],
    responses={404: {"description": "Não encontrado"}},
)

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
    cep_clean = re.sub(r"\D", "", cep)

    if len(cep_clean) != 8:
        raise HTTPException(
            status_code=400, detail="CEP deve conter exatamente 8 dígitos numéricos")

    if cep_clean in cep_cache:
        return cep_cache[cep_clean]

    viacep_url = f"https://viacep.com.br/ws/{cep_clean}/json/"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(viacep_url, timeout=8.0)
            response.raise_for_status()
            data = response.json()

            if "erro" in data:
                raise ValueError("CEP não encontrado no ViaCEP")

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
        brasilapi_url = f"https://brasilapi.com.br/api/cep/v2/{cep_clean}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(brasilapi_url, timeout=5.0)
                response.raise_for_status()
                data = response.json()

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
