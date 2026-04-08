from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from .service import get_cart_with_items
from app.melhorenvio.service import cotar_frete_service

from app.auth.dependencies import get_db, require_user
from app.store.models import Product
from .schemas import CartResponse, CartItemResponse, AddToCartRequest, AddToCartResponse, CheckoutRequest
from .models import Cart, CartItem
from app.schemas import UserOut
from app.store.orders.models import Order, OrderItem, OrderShipping
from datetime import datetime, timezone, timedelta
import re
import logging
from ..orders.enums import OrderStatus, PaymentStatus
from app.core.config import settings


router = APIRouter(prefix="/cart", tags=["Cart"])


def sanitize_phone(phone: str) -> str:
    cleaned = re.sub(r'\D', '', phone)
    if len(cleaned) not in (10, 11):
        raise HTTPException(400, "Telefone inválido.")
    return cleaned


def calculate_cart_total(cart: Cart):
    return sum(item.total_price for item in cart.items)


def calculate_discount_item(cart: Cart):
    return sum(item.discount for item in cart.items)


@router.get("/", response_model=CartResponse)
def get_cart(
    user: UserOut = Depends(require_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).options(joinedload(Cart.items).joinedload(CartItem.product))\
        .filter(Cart.user_id == user.id, Cart.status == "active").first()
    if not cart:
        return {"id": 0, "user_id": user.id, "status": "active", "items": [], "total": 0}

    total = calculate_cart_total(cart)
    total_discount = calculate_discount_item(cart)

    return CartResponse(
        id=cart.id,
        user_id=user.id,
        status=cart.status,
        items=[
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
                product_name=item.product.name,
                product_image_urls=item.product.image_urls or [],
                discount=total_discount,
                height=item.product.height_cm,
                width=item.product.width_cm,
                length=item.product.length_cm,
                weight=item.product.weight_grams
            ) for item in cart.items
        ],
        total=total
    )


@router.post("/add", response_model=AddToCartResponse)
def add_to_cart(
    item: AddToCartRequest,
    user: UserOut = Depends(require_user),
    db: Session = Depends(get_db),
):
    product_id = item.product_id
    quantity = item.quantity

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Produto não entrado.")
    if product.stock < quantity:
        raise HTTPException(
            400, "Quantidade solicitada maior que estoque disponível.")

    cart = db.query(Cart).filter(Cart.user_id == user.id,
                                 Cart.status == "active").first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id, CartItem.product_id == product.id).first()

    if cart_item:
        cart_item.quantity += quantity
        cart_item.total_price = cart_item.quantity * cart_item.unit_price
        cart_item.discount = product.discount * cart_item.quantity

    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            product_name=product.name,
            quantity=quantity,
            unit_price=product.price,
            total_price=product.price * quantity,
            discount=product.discount * quantity,
            img_product=product.image_urls[0],
            sku=product.sku,

        )
        db.add(cart_item)

    db.commit()

    return AddToCartResponse(
        message="Item adicionado ao carrinho com sucesso.",
    )


@router.put("/update", response_model=CartResponse)
def update_cart_item(
    cart_item_id: int = Body(...),
    quantity: int = Body(..., gt=0),
    user: UserOut = Depends(require_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == user.id,
                                 Cart.status == "active").first()
    if not cart:
        raise HTTPException(404, "Carrinho não encontrado.")

    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(404, "Item não encontrado no carrinho.")

    product = db.query(Product).filter(
        Product.id == cart_item.product_id).first()
    if quantity > product.stock:
        raise HTTPException(
            400, "Quantidade solicitada maior que o estoque disponível.")

    cart_item.quantity = quantity
    cart_item.total_price = cart_item.unit_price * quantity

    db.commit()
    db.refresh(cart)
    return get_cart(user=user, db=db)


@router.delete("/remove", response_model=CartResponse)
def remove_cart_item(
    cart_item_id: int = Query(...),
    user: UserOut = Depends(require_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == user.id,
                                 Cart.status == "active").first()
    if not cart:
        raise HTTPException(404, "Carrinho não encontrado.")

    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(404, "Item não encontrado no carrinho.")

    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return get_cart(user=user, db=db)


@router.post("/checkout", response_model=dict)
async def checkout_cart(
    checkout_data: CheckoutRequest,
    user: UserOut = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Checkout interno
    """
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "EMAIL_NOT_VERIFIED",
                "message": "Seu e-mail precisa ser verificado antes de realizar uma compra.",

            }
        )

    existing_order = db.query(Order).filter(
        Order.user_id == user.id,
        Order.status == OrderStatus.PENDING,
        Order.reservation_expires_at > datetime.now(timezone.utc)
    ).first()

    if existing_order:
        remaining_seconds = int(
            (existing_order.reservation_expires_at.replace(
                tzinfo=timezone.utc) - datetime.now(timezone.utc)).total_seconds()
        )

        return {
            "message": f"Você já possui um pedido em andamento.",
            "redirect": f"/checkout/{existing_order.uuid}",
            "expires_in_seconds": max(remaining_seconds, 0)
        }

    cart = db.query(Cart).filter(
        Cart.id == checkout_data.cart_id,
        Cart.user_id == user.id,
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
            detail="Carrinho vazio."
        )

    product_ids = [i.product_id for i in cart.items]
    products = {
        p.id: p for p in db.query(Product)
        .filter(Product.id.in_(product_ids))
        .with_for_update()
        .all()
    }

    subtotal = 0
    shipping_discount_total = 0

    total_weight = 0
    max_height = 0
    max_width = 0
    max_length = 0 
    declared_value = 0

    for item in cart.items:
        product = products.get(item.product_id)

        if not product:
            raise HTTPException(
                404, f"Produto {item.product_id} não encontrado.")

        estoque_disponivel = product.stock - (product.reserved_stock or 0)
        if item.quantity > estoque_disponivel:
            raise HTTPException(
                400, f"Estoque insuficiente para {product.name}.")

        if not product.weight_grams:
            raise HTTPException(
                400, f"Produto {product.name} sem peso definido.")

        if product.height_cm <= 0 or product.width_cm <= 0 or product.length_cm <= 0:
            raise HTTPException(
                400, f"Produto {product.name} possui dimensões inválidas.")

        subtotal += item.total_price
        declared_value += item.total_price

        total_weight += product.weight_grams * item.quantity
        max_height = max(max_height, product.height_cm)
        max_width = max(max_width, product.width_cm)
        max_length = max(max_length, product.length_cm)

        if product.discount:
            shipping_discount_total += product.discount * item.quantity

    if subtotal <= 0:
        raise HTTPException(400, 'Subtotal Inválido')

    opcoes = await cotar_frete_service(
        cep_destino=checkout_data.postal_code,
        valor_declarado=declared_value,
        cart=cart,
        db=db,
        cep_origem=settings.CEP_KEY
    )

    if not opcoes:
        raise HTTPException(400, "Nenhuma opção de frete disponível")

    selected = next(
        (s for s in opcoes if s.id == str(checkout_data.shipping_option_id)), None
    )

    if not selected:
        raise HTTPException(400, "Opção de frete inválida")

    original_shipping = selected.preco
    final_shipping = max(selected.preco -
                         shipping_discount_total, 0)
    total = subtotal + final_shipping

    recipient_phone = sanitize_phone(checkout_data.recipient_phone)

    try:
        PRAZO_RESERVA_MINUTOS = 30

        order = Order(
            user_id=user.id,
            subtotal=subtotal,
            total=total,
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            reservation_expires_at=datetime.now(
                timezone.utc) + timedelta(minutes=PRAZO_RESERVA_MINUTOS),
            shipping_carrier=selected.empresa,
            shipping_method=selected.nome,
            shipping_service_id=selected.id,
            shipping_cost=final_shipping,
            shipping_discount=shipping_discount_total,
            shipping_original=original_shipping,
            shipping_delivery_days=selected.prazo_dias,
        )
        db.add(order)
        db.flush()

        db.add(OrderShipping(
            order_id=order.id,
            recipient_name=checkout_data.recipient_name,
            recipient_document=checkout_data.recipient_document,
            recipient_email=checkout_data.recipient_email,
            recipient_phone=recipient_phone,
            street=checkout_data.street,
            number=checkout_data.number,
            complement=checkout_data.complement,
            neighborhood=checkout_data.neighborhood,
            city=checkout_data.city,
            state=checkout_data.state.upper(),
            postal_code=checkout_data.postal_code,
        ))

        for item in cart.items:
            db.add(OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
                img_product=item.img_product
            ))
            db.query(Product).filter(Product.id == item.product_id).update(
                {Product.reserved_stock: Product.reserved_stock + item.quantity}
            )

        cart.status = "closed"
        db.commit()

    except Exception as e:
        db.rollback()

        raise HTTPException(
            500, "Erro ao processar o checkout. Tente novamente.")

    db.refresh(order)

    return {
        "success": True,
        "message": "Checkout realizado com sucesso. Finalize o pagamento em até 30 minutos.",
        "redirect": f"/checkout/{order.uuid}",
        "expires_in_seconds": PRAZO_RESERVA_MINUTOS * 60,
    }
