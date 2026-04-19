from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.auth.dependencies import get_db, require_master_full_access
from app.store.orders.models import Order, OrderShipping
from app.store.models import Product
from app.models import User
from .schemas import DashboardMetricsResponse, StockSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardMetricsResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_master_full_access)
):
    regions = db.query(
        OrderShipping.state, func.count(OrderShipping.id)
    ).group_by(OrderShipping.state).all()
    sales_by_region = {state: count for state,
                       count in regions if state is not None}

    payment_methods = db.query(
        Order.payment_method, func.count(Order.id)
    ).group_by(Order.payment_method).all()

    payment_dict = {}
    for pm, count in payment_methods:
        if pm is not None:
            pm_name = pm.value if hasattr(pm, 'value') else str(pm)
            payment_dict[pm_name] = count

    total_gross = db.query(func.sum(Order.subtotal)).scalar() or 0.0

    stock_data = db.query(
        func.sum(Product.stock), func.sum(Product.reserved_stock)
    ).first()
    stock_summary = StockSummary(
        available=int(stock_data[0] or 0) if stock_data else 0,
        reserved=int(stock_data[1] or 0) if stock_data else 0
    )

    orders_status = db.query(
        Order.status, func.count(Order.id)
    ).group_by(Order.status).all()

    status_dict = {}
    for st, count in orders_status:
        if st is not None:
            st_name = st.value if hasattr(st, 'value') else str(st)
            status_dict[st_name] = count

    users = db.query(User.scopes, User.role).all()
    users_by_role = {}

    for scopes, role in users:
        is_master = False
        sc_list = []
        if scopes:
            if isinstance(scopes, str):
                sc_list = scopes.split(',')
            elif isinstance(scopes, list):
                sc_list = scopes

        if "master" in sc_list and role == "master":
            is_master = True

        if not is_master:
            if sc_list:
                for sc in sc_list:
                    users_by_role[sc] = users_by_role.get(sc, 0) + 1
            else:
                users_by_role["without_scope"] = users_by_role.get(
                    "without_scope", 0) + 1

    return DashboardMetricsResponse(
        sales_by_region=sales_by_region,
        payment_methods=payment_dict,
        total_gross_sales=float(total_gross),
        stock_summary=stock_summary,
        users_by_role=users_by_role,
        orders_by_status=status_dict
    )
