from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session, joinedload
from typing import List
from .service import get_cart_with_items

from app.auth.dependencies import get_db, require_user
from app.store.models import  Product
from .schemas import CartResponse, CartItemResponse, AddToCartRequest, AddToCartResponse
from .models import Cart, CartItem
from app.schemas import UserOut
from app.store.orders.models import Order, OrderItem

router = APIRouter(prefix="/cart", tags=["Cart"])


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
        raise HTTPException(404, "Produto não encontrado.")
    if product.stock < quantity:
        raise HTTPException(400, "Quantidade solicitada maior que estoque disponível.")

    cart = db.query(Cart).filter(Cart.user_id == user.id, Cart.status == "active").first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product.id).first()

    if cart_item:
        cart_item.quantity += quantity
        cart_item.total_price = cart_item.quantity * cart_item.unit_price
        cart_item.discount = product.discount * cart_item.quantity


    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.price,
            total_price=product.price * quantity,
            discount=product.discount * quantity
        )
        db.add(cart_item)

    db.commit()

    updated_cart = get_cart_with_items(db, user.id)
    
    return AddToCartResponse(
        message="Item adicionado ao carrinho com sucesso.",
        cart=updated_cart
    )



@router.put("/update", response_model=CartResponse)
def update_cart_item(
    cart_item_id: int = Body(...),
    quantity: int = Body(..., gt=0),
    user: UserOut = Depends(require_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == user.id, Cart.status == "active").first()
    if not cart:
        raise HTTPException(404, "Carrinho não encontrado.")

    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(404, "Item não encontrado no carrinho.")

    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if quantity > product.stock:
        raise HTTPException(400, "Quantidade solicitada maior que o estoque disponível.")

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
    cart = db.query(Cart).filter(Cart.user_id == user.id, Cart.status == "active").first()
    if not cart:
        raise HTTPException(404, "Carrinho não encontrado.")

    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(404, "Item não encontrado no carrinho.")

    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return get_cart(user=user, db=db)


@router.post("/checkout", response_model=dict)
def checkout_cart(
    user: UserOut = Depends(require_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).options(joinedload(Cart.items)).filter(Cart.user_id == user.id, Cart.status == "active").first()
    if not cart or not cart.items:
        raise HTTPException(400, "Carrinho vazio.")

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if item.quantity > product.stock:
            raise HTTPException(400, f"Estoque insuficiente para {product.name}.")

    order = Order(user_id=user.id, total=sum(i.total_price for i in cart.items))
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price
        )
        db.add(order_item)

        product = db.query(Product).filter(Product.id == item.product_id).first()
        product.stock -= item.quantity

    cart.status = "closed"
    db.commit()

    return {"order_id": order.id, "message": "Checkout realizado com sucesso."}