from sqlalchemy.orm import Session
from .schemas import CartResponse, CartItemResponse
from .models import Cart, CartItem
from ...store.models import Product

def get_cart_with_items(db: Session, user_id: int) -> CartResponse:

    cart = db.query(Cart).filter(
        Cart.user_id == user_id,
        Cart.status == 'active').first()
    
    if not cart: 
        return CartResponse(
            id=0,
            user_id=user_id,
            status='active',
            items=[],
            total=0.0
        )
    
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()

    items_response = []
    total = 0.0

    for cart_item in cart_items: 
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    
    if product:
        items_response.append(CartItemResponse(
            id=cart_item.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            unit_price=cart_item.unit_price,
            total_price=cart_item.total_price,
            product_name=cart_item.product.name,
            product_image_urls=product.image_urls or [],
            height=product.height_cm or 0.0,
            width=product.width_cm or 0.0,  
            weight=product.weight_grams or 0.0,
            length=product.length_cm or 0.0
        ))
        total += cart_item.total_price


    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        status=cart.status,
        items=items_response,
        total=total   
    )