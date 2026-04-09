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
from datetime import datetime
from fastapi.responses import RedirectResponse

from app.melhorenvio.service import cotar_frete_service, registrar_envio_cart, listar_itens_carrinho_melhor_envio, remover_item_carrinho_melhor_envio, criar_logistica_reversa
from app.melhorenvio.schemas import CotacaoFreteResponse, MECartResponse, MECartCreateRequest, CotarFreteRequest
import logging
import httpx
import os


REDIRECT_URI = "https://api.doceilusao.store/melhor-envio/callback"

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
async def melhor_envio_callback(code: str):
    """
    Callback simples do Melhor Envio
    Recebe o code → troca por token → mostra sucesso e redireciona para o Home
    """
    if not code:
        raise HTTPException(
            status_code=400, detail="Código de autorização não recebido")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "client_id": settings.MELHOR_ENVIO_TOKEN,
                "client_secret": settings.SECRET_KEY,
                "redirect_uri": REDIRECT_URI,
                "code": code,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30.0,
        )

        if response.status_code != 200:
            error = response.json() if response.content else response.text
            raise HTTPException(
                status_code=400,
                detail="Falha ao conectar com o Melhor Envio. Verifique os logs."
            )

        token_data = response.json()

    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=400, detail="Não foi possível obter o access token")

    print("=" * 80)

    print(access_token)
    print("=" * 80)

    return RedirectResponse(url="https://doceilusao.store/?melhor_envio=success")
