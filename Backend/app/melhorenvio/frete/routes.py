import asyncio
from app.core.config import settings
from fastapi import APIRouter, HTTPException, status, Depends, Request
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from app.auth.dependencies import get_db, require_master_full_access, get_current_user
from app.models import User
from app.store.orders.models import Order, OrderShipment
from app.store.cart.models import Cart, CartItem
from datetime import datetime, timedelta
from fastapi.responses import RedirectResponse
from models import MelhorEnvioTokenModel
from urllib.parse import urlencode

from app.melhorenvio.service import cotar_frete_service, registrar_envio_cart, listar_itens_carrinho_melhor_envio, remover_item_carrinho_melhor_envio, criar_logistica_reversa
from app.melhorenvio.schemas import CotacaoFreteResponse, MECartResponse, MECartCreateRequest, CotarFreteRequest
import logging
import httpx
import os
import secrets


BASE_URL = "https://www.melhorenvio.com.br" if settings.MELHOR_ENVIO_ENV == "production" else "https://sandbox.melhorenvio.com.br"

TOKEN_URL = "https://melhorenvio.com.br/api/v2/oauth/token"
router = APIRouter(prefix="/melhor-envio", tags=["Frete - Melhor Envio"])


@router.post(
    "/cotar",
    response_model=List[CotacaoFreteResponse],
    summary="Cotar frete — calcula peso e dimensões pelo banco",
)
async def cotar_frete_route(
    payload: CotarFreteRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    # if not current_user:
    #     return {"redirect": "/register" }  #FEATURE
    cart = db.query(Cart).filter(
        Cart.id == payload.cart_id,
        Cart.user_id == current_user.id,
        Cart.status == "active"
    ).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).first()

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carrinho não encontrado ou não pertence a você."
        )

    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O carrinho está vazio."
        )

    logging.info(f"O que está vindo no cart ao cotar {cart}")

    try:
        opcoes = await asyncio.wait_for(
            cotar_frete_service(
                cart=cart,
                cep_destino=payload.cep_destino,
                valor_declarado=payload.valor_declarado,
                cep_origem=settings.STORE_POSTAL_CODE,
                db=db,
            ),
            timeout=15.0,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Timeout ao consultar transportadoras. Tente novamente.",
        )

    if not opcoes:
        raise HTTPException(
            status_code=status.HTTP_424_FAILED_DEPENDENCY,
            detail="Nenhuma opção de frete disponível para os dados informados.",
        )

    return opcoes


@router.post(
    "/registrar-envio",
    response_model=MECartResponse,
    summary="Registrar envio no Melhor Envio após pagamento (POST /me/cart)",
)
async def registrar_envio(payload: MECartCreateRequest, db: Session = Depends(get_db)):

    try:
        from_address = {
            "name": settings.STORE_NAME,
            "phone": settings.STORE_PHONE,
            "email": settings.STORE_EMAIL,
            "document": settings.STORE_DOCUMENT,
            "postal_code": settings.STORE_POSTAL_CODE,
            "address": settings.STORE_STREET,
            "number": settings.STORE_NUMBER,
            "district": settings.STORE_NEIGHBORHOOD,
            "city": settings.STORE_CITY,
            "state_abbr": settings.STORE_STATE
        }

        result = await registrar_envio_cart(
            order_uuid=payload.order_uuid,
            db=db,
            from_address=from_address,
        )
        return result

    except ValueError as e:
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Erro interno: {repr(e)}")


@router.get(
    "/carrinho",
    response_model=List[Dict[str, Any]],
    summary="Listar todos os itens no carrinho do Melhor Envio (apenas master)",
    description="Retorna todos os fretes adicionados ao carrinho. Exige usuário master."
)
async def listar_carrinho_admin(
    _: User = Depends(require_master_full_access),
):
    try:
        return await listar_itens_carrinho_melhor_envio()
    except ValueError as e:
        raise HTTPException(
            status_code=502, detail=f"Erro ao consultar carrinho: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {repr(e)}")


@router.delete(
    "/carrinho/del/{cart_id}",
    response_model=dict,
    summary="Remover item do carrinho do Melhor Envio (apenas master)"
)
async def remover_item_carrinho(
    cart_id: str,
    _: User = Depends(require_master_full_access),
    db: Session = Depends(get_db)
):

    shipment = db.query(OrderShipment).filter(
        OrderShipment.melhorenvio_cart_id == cart_id
    ).first()

    if not shipment:
        raise HTTPException(
            404, detail="Envio não encontrado nos registros da lojaa")

    order = shipment.order

    try:
        await remover_item_carrinho_melhor_envio(cart_id)

        shipment.melhorenvio_cart_id = None
        shipment.shipping_status = "removed"
        db.commit()

        return {
            "success": True,
            "cart_id": cart_id,
            "order_uuid": order.uuid,
            "message": "Item removido do carrinho com sucesso"
        }

    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail="Erro interno ao remover item do carrinho")


@router.post("/{order_id}/reverse")
async def gerar_reversa(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(404, "Pedido não encontrado")

    if not order.melhor_envio_id:
        raise HTTPException(400, "Pedido não possui envio no Melhor Envio")

    response = await criar_logistica_reversa(
        order_me_id=order.melhor_envio_id,
        customer=order.customer
    )

    return {
        "success": True,
        "data": response
    }


@router.get("/callback")
async def melhor_envio_callback(code: str, state: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    if error:
        raise HTTPException(400, f"Erro do Melhor Envio: {error}")

    if not code:
        raise HTTPException(400, "Código de autorização não recebido")

    token_url = f"{BASE_URL}/api/v2/oauth/token"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            token_url,
            data={
                "grant_type": "authorization_code",
                "client_id": settings.MELHOR_ENVIO_CLIENT_ID,
                "client_secret": settings.MELHOR_ENVIO_CLIENT_SECRET,
                "redirect_uri": settings.MELHOR_ENVIO_REDIRECT_URI,
                "code": code,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": f"{settings.STORE_NAME} ({settings.STORE_EMAIL})"
            },
            timeout=30.0,
        )

        if response.status_code != 200:
            error_detail = response.json() if response.content else response.text
            logging.error(f"Erro ao obter token: {error_detail}")
            raise HTTPException(400, "Falha ao obter token do Melhor Envio")

        token_data = response.json()

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 2592000)

    if not access_token or not refresh_token:
        raise HTTPException(400, "Token inválido recebido")

    # === SALVAR NO BANCO ===
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    # Exemplo simples (crie uma tabela MelhorEnvioToken no seu models)
    token_record = db.query(MelhorEnvioTokenModel).first()
    if token_record:
        token_record.access_token = access_token
        token_record.refresh_token = refresh_token
        token_record.expires_at = expires_at
    else:
        token_record = MelhorEnvioTokenModel(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at
        )
        db.add(token_record)

    db.commit()

    logging.info("Tokens do Melhor Envio salvos com sucesso!")

    # Redirecione para o admin
    return RedirectResponse(url="https://doceilusao.store/admin?melhor_envio=success")


@router.get("/authorize")
async def melhor_envio_authorize():
    """Inicia o fluxo OAuth2 — acesse esta rota manualmente (ou botão no painel admin)"""

    state = secrets.token_urlsafe(32)  # Proteção CSRF

    params = {
        "client_id": settings.MELHOR_ENVIO_CLIENT_ID,
        "redirect_uri": settings.MELHOR_ENVIO_REDIRECT_URI,
        "response_type": "code",
        "scope": "cart.read cart.write shipments.read shipments.write companies.read",
        "state": state,
    }

    auth_url = f"{BASE_URL}/oauth/authorize?" + urlencode(params)

    # Opcional: salvar o state temporariamente se quiser validar no callback
    return RedirectResponse(auth_url)
