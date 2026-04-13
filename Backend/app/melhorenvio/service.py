from typing import List, Dict, Any

from sqlalchemy.orm import Session
from .client import melhor_envio_client
from .schemas import CotacaoFreteResponse, MECartResponse, CarrinhoItem
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.store.orders.enums import PaymentStatus
from app.store.orders.models import Order, OrderShipping, OrderShipment, OrderStatus
from app.store.models import Product
from app.melhorenvio.models import MelhorEnvioToken
from datetime import datetime, timezone, timedelta
from app.store.cart.models import Cart
import math
import unicodedata
import httpx
import logging


logger = logging.getLogger(__name__)


def sanitize_user_agent(value: str) -> str:
    return unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')


def get_base_url() -> str:
    return "https://sandbox.melhorenvio.com.br" if settings.MELHOR_ENVIO_ENV == "sandbox" else "https://www.melhorenvio.com.br"


def get_me_client_id() -> str:
    return settings.MELHOR_ENVIO_CLIENT_ID_DEV if settings.MELHOR_ENVIO_ENV == 'sandbox' else settings.MELHOR_ENVIO_CLIENT_ID


def get_me_client_secret() -> str:
    return settings.MELHOR_ENVIO_CLIENT_SECRET_DEV if settings.MELHOR_ENVIO_ENV == 'sandbox' else settings.MELHOR_ENVIO_CLIENT_SECRET


def get_redirect_uri() -> str:
    return settings.MELHOR_ENVIO_REDIRECT_URI_DEV if settings.MELHOR_ENVIO_ENV == 'sandbox' else settings.MELHOR_ENVIO_REDIRECT_URI


async def refresh_melhor_envio_token(token_record: MelhorEnvioToken, db: Session) -> MelhorEnvioToken:
    BASE_URL = get_base_url()
    CLIENT_ID = get_me_client_id
    CLIENT_SECRET = get_me_client_secret
    token_url = f"{BASE_URL}/api/v2/oauth/token"
    if settings.MELHOR_ENVIO_ENV == 'sandbox':
        token_url = f"{BASE_URL}/oauth/token"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                token_url,
                data={
                    "grant_type": "refresh_token",
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "refresh_token": token_record.refresh_token,
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": f"{settings.STORE_NAME} ({settings.STORE_EMAIL})"
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"Refresh token falhou: {response.text}")
                raise HTTPException(
                    401, "Falha ao renovar token do Melhor Envio. Faça nova autorização.")

            token_data = response.json()

        token_record.access_token = token_data["access_token"]
        token_record.refresh_token = token_data.get(
            "refresh_token") or token_record.refresh_token
        token_record.expires_at = datetime.now(
            timezone.utc) + timedelta(seconds=token_data.get("expires_in", 2592000))
        token_record.updated_at = datetime.now(timezone.utc) if hasattr(
            token_record, 'updated_at') else None

        db.commit()
        db.refresh(token_record)

        logger.info("✅ Token do Melhor Envio renovado com sucesso")
        return token_record

    except Exception as e:
        logger.error(f"Erro ao fazer refresh do token: {e}", exc_info=True)
        raise HTTPException(
            500, "Erro interno ao renovar token do Melhor Envio")


async def get_valid_melhor_envio_token(db: Session) -> str:
    token = db.query(MelhorEnvioToken).first()
    if not token:
        raise HTTPException(
            401, "Melhor Envio não autorizado. Faça login primeiro.")

    if token.is_expired():
        token = await refresh_melhor_envio_token(token, db)

    return token.access_token


async def _make_authenticated_request(method: str, endpoint: str, db: Session, json: dict = None, **kwargs):
    token = await get_valid_melhor_envio_token(db)

    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": f"{sanitize_user_agent(settings.STORE_NAME)} ({settings.STORE_EMAIL})",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    if method.upper() == "POST":
        return await melhor_envio_client.post(endpoint, json=json, headers=headers, **kwargs)
    elif method.upper() == "GET":
        return await melhor_envio_client.get(endpoint, headers=headers, **kwargs)
    elif method.upper() == "DELETE":
        return await melhor_envio_client.delete(endpoint, headers=headers, **kwargs)


async def registrar_envio_cart(
    order_uuid: str,
    db: Session,
    from_address: dict
) -> MECartResponse:

    order = db.query(Order).filter(Order.uuid == order_uuid).first()

    if not order:
        raise HTTPException(404, "Pedido não encontrado")

    if order.payment_status != PaymentStatus.PAID:
        raise HTTPException(400, "Pedido não pago – não pode gerar envio")

    existing_shipment = db.query(OrderShipment).filter(
        OrderShipment.order_id == order.id,
        OrderShipment.is_reverse == False
    ).first()

    if existing_shipment and existing_shipment.melhorenvio_cart_id:
        return MECartResponse(
            cart_id=existing_shipment.melhorenvio_cart_id,
            status=existing_shipment.shipping_status,
            price=existing_shipment.shipping_cost or 0.0,
            delivery_min=0,
            delivery_max=0,
        )

    shipping = db.query(OrderShipping).filter(
        OrderShipping.order_id == order.id
    ).first()

    if not shipping:
        raise HTTPException(400, 'Endereço de entrega não encontrado')

    produtos_qtd: list[tuple[Product, int]] = []

    for item in order.items:
        product = item.product
        if not product:
            raise ValueError(f"Produto do item {item.id} não encontrado")

        produtos_qtd.append((product, item.quantity))

    if not produtos_qtd:
        raise ValueError("Pedido sem itens.")

    embalagem = _calcular_embalagem(produtos_qtd)

    weight_kg = max(0.1, round(embalagem["peso_gramas"] / 1000, 3))

    volumes = [{
        "height": float(embalagem["altura_cm"]),
        "width":  float(embalagem["largura_cm"]),
        "length": float(embalagem["comprimento_cm"]),
        "weight": weight_kg
    }]

    products = []

    for item in order.items:
        products.append({
            "name": item.product_name,
            "quantity": int(item.quantity),
            "unitary_value": float(item.unit_price)
        })

    declared_value = max(5, order.subtotal or (
        order.total - (order.shipping_cost or 0)))

    payload = {
        "service": order.shipping_service_id,

        "from": from_address,
        "to": {
            "name": shipping.recipient_name,
            "email": shipping.recipient_email,
            "phone": shipping.recipient_phone,
            "document": shipping.recipient_document,
            "address": shipping.street,
            "complement": shipping.complement or "",
            "number": shipping.number,
            "district": shipping.neighborhood,
            "city": shipping.city,
            "postal_code": shipping.postal_code.replace("-", "").strip(),
            "country_id": "BR",
            "state_abbr": shipping.state
        },
        "products": products,
        "volumes": volumes,
        "options": {
            "insurance_value": float(declared_value),
            "receipt": False,
            "own_hand": False,
            "reverse": False,
            "platform": "Doce Ilusão",
        }
    }

    try:
        response = await _make_authenticated_request("POST", "/me/cart", db, json=payload)

        logging.info(f"Resposta completa do /me/cart: {response}")

        if isinstance(response, list):
            if not response:
                raise ValueError("Carrinho retornado vazio (lista vazia)")
            cart = response[0]

        elif isinstance(response, dict):
            cart = response

        else:
            raise ValueError(
                f"Formato inesperado de resposta: {type(response)}")

        cart_id = cart.get("id")
        if not cart_id:
            raise ValueError("ID do envio não encontrado na resposta")

        altura_cm = embalagem["altura_cm"]
        largura_cm = embalagem["largura_cm"]
        comprimento_cm = embalagem["comprimento_cm"]

        if existing_shipment:
            existing_shipment.melhorenvio_cart_id = cart_id
            existing_shipment.shipping_status = cart.get("status")
            existing_shipment.shipping_cost = float(cart.get("price") or 0)
            existing_shipment.weight = weight_kg
            existing_shipment.height = altura_cm
            existing_shipment.width = largura_cm
            existing_shipment.length = comprimento_cm
            shipment = existing_shipment
        else:
            shipment = OrderShipment(
                order_id=order.id,
                melhorenvio_cart_id=cart_id,
                shipping_status=cart.get("status"),
                shipping_cost=float(cart.get("price") or 0),
                shipping_company=order.shipping_carrier,
                shipping_service=order.shipping_method,
                is_reverse=False,
                weight=weight_kg,
                height=altura_cm,
                width=largura_cm,
                length=comprimento_cm,
            )
            db.add(shipment)

        db.commit()
        db.refresh(shipment)

        return MECartResponse(
            cart_id=cart_id,
            status=cart.get("status"),
            price=cart.get("price", 0.0),
            delivery_min=cart.get("delivery_min", 0),
            delivery_max=cart.get("delivery_max", 0),
        )

    except Exception as api_error:
        logging.error(
            f"Erro ao processar resposta do Melhor Envio: {api_error}", exc_info=True)
        db.rollback()
        raise ValueError(f"Erro ao registrar envio: {str(api_error)}")


async def listar_itens_carrinho_melhor_envio(db: Session) -> List[Dict[str, Any]]:
    try:
        response = await _make_authenticated_request("GET", "/me/cart", db)
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        body = e.response.text
        raise ValueError(f"Melhor Envio retornou HTTP {status}: {body}")
    except httpx.RequestError as e:
        raise ValueError(f"Erro de conexão com Melhor Envio: {e}")

    if isinstance(response, list):
        return response

    if isinstance(response, dict):
        if not response or "error" in response or "message" in response:
            return []

        if "data" in response and isinstance(response["data"], list):
            return response["data"]

        if "id" in response:
            return [response]

        raise ValueError(
            f"Dict sem formato reconhecido. Chaves: {list(response.keys())}")

    raise ValueError(
        f"Formato de resposta inválido: {type(response).__name__}")


async def criar_logistica_reversa(order_me_id: str, customer) -> dict:  # rever dps
    payload = {
        "service": 1,  # 1 = PAC | 2 = SEDEX
        "order_id": order_me_id,
        "new_sender_mail": customer.email,
        "new_sender_phone": customer.phone,
        "insurance_value": 0,
        "package": {
            "weight": 1.0,
            "height": 10,
            "width": 15,
            "length": 20
        },
        "options": {
            "own_hand": False,
            "receipt": False
        }
    }

    return await melhor_envio_client.post(
        "/me/cart/reverse",
        json=payload
    )


async def remover_item_carrinho_melhor_envio(cart_id: str, db: Session) -> None:
    try:
        await _make_authenticated_request("DELETE", f"/me/cart/{cart_id}", db)
    except Exception as e:
        logger.error(f"Erro ao remover item {cart_id}: {e}")
        raise


async def gerar_etiqueta_melhor_envio(cart_id: str, db: Session) -> dict:
    payload = {"orders": [cart_id]}
    try:
        return await _make_authenticated_request("POST", "/me/shipment/checkout", db, json=payload)
    except Exception as e:
        logger.error(f"Erro ao gerar etiqueta: {e}")
        raise


def _calcular_embalagem(produtos_qtd: list[tuple[Product, int]]) -> dict:
    """
    Calcula as dimensões e peso da embalagem consolidada para envio.
    Retorna dimensões em cm e peso em gramas.
    """
    if not produtos_qtd:
        raise ValueError("Lista de produtos vazia")

    peso_total_produto = 0.0
    largura_total = 0.0

    ALTURA_BASE = 4
    LIMITE_LARGURA = 13

    for produto, qtd in produtos_qtd:
        if not produto:
            continue
        peso_total_produto += produto.weight_grams * qtd
        largura_total += produto.width_cm * qtd

    camadas = math.ceil(largura_total / LIMITE_LARGURA)
    altura = (ALTURA_BASE * camadas) + 1

    peso_embalagem = 60.0
    peso_total = peso_total_produto + peso_embalagem + 100

    return {
        "peso_gramas": math.ceil(peso_total),
        "altura_cm": math.ceil(altura),
        "largura_cm": 18,
        "comprimento_cm": 15,
    }


async def cotar_frete_service(
    cart: Cart,
    cep_destino: str,
    valor_declarado: float,
    db: Session,
    cep_origem: str | None = None,
) -> list[CotacaoFreteResponse]:

    itens = cart.items

    ids = [item.product_id for item in itens]
    produtos_db = db.query(Product).filter(Product.id.in_(ids)).all()

    ids_encontrados = {p.id for p in produtos_db}
    ids_faltando = set(ids) - ids_encontrados
    if ids_faltando:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produtos não encontrados: {sorted(ids_faltando)}",
        )

    produto_map = {p.id: p for p in produtos_db}
    produtos_qtd = [(produto_map[item.product_id], item.quantity)
                    for item in itens]

    embalagem = _calcular_embalagem(produtos_qtd)

    cep_origem_final = (
        cep_origem or settings.CEP_ORIGEM).replace("-", "").strip()
    cep_destino = cep_destino.replace("-", "").strip()

    payload = {
        "from": {"postal_code": cep_origem_final},
        "to":   {"postal_code": cep_destino},
        "package": {
            "height": float(embalagem["altura_cm"]),
            "width":  float(embalagem["largura_cm"]),
            "length": float(embalagem["comprimento_cm"]),
            "weight": round(embalagem["peso_gramas"] / 1000, 5),
        },
        "options": {
            "insurance_value": float(valor_declarado),
            "receipt":         False,
            "own_hand":        False,
            "reverse":         False,
            "non_commercial":  False,
            "platform":        "Doce Ilusão",
            "invoice":         {"value": float(valor_declarado)},
        },
    }

    try:
        raw_response = await _make_authenticated_request(
            "POST", "/me/shipment/calculate", db, json=payload, timeout=20
        )
        logger.info(
            f"Resposta da cotação recebida com {len(raw_response) if isinstance(raw_response, list) else 1} opções"
        )
    except HTTPException:
        raise
    except httpx.HTTPStatusError as http_err:
        status_code = http_err.response.status_code
        error_body = http_err.response.text
        logger.error(f"Melhor Envio retornou {status_code}: {error_body}")
        raise HTTPException(
            status_code=502,
            detail=f"Erro na cotação do Melhor Envio ({status_code}): {error_body[:300]}"
        )
    except Exception as e:
        logger.error(
            f"Erro inesperado ao chamar /me/shipment/calculate: {e}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Erro ao consultar transportadoras. Tente novamente.",
        )

    opcoes: list[CotacaoFreteResponse] = []
    for item in raw_response:
        if item.get("error"):
            continue

        preco = float(item["price"])
        discount = float(item.get("discount") or 0)

        opcoes.append(CotacaoFreteResponse(
            id=str(item["id"]),
            nome=item["name"],
            empresa=item["company"]["name"],
            empresa_picture=item["company"].get("picture", ""),
            preco=preco,
            preco_com_desconto=preco - discount,
            prazo_dias=item["delivery_time"],
            entrega_domiciliar=item.get("home_delivery", True),
            entrega_sabado=item.get("saturday_delivery", False),
            peso_gramas=embalagem["peso_gramas"],
            largura_cm=embalagem["largura_cm"],
            altura_cm=embalagem["altura_cm"],
            comprimento_cm=embalagem["comprimento_cm"],
        ))

    opcoes.sort(key=lambda x: x.preco)
    return opcoes
