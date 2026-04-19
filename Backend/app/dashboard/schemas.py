from pydantic import BaseModel
from typing import Dict

class StockSummary(BaseModel):
    available: int
    reserved: int

class DashboardMetricsResponse(BaseModel):
    sales_by_region: Dict[str, int]
    payment_methods: Dict[str, int]
    total_gross_sales: float
    stock_summary: StockSummary
    users_by_role: Dict[str, int]
    orders_by_status: Dict[str, int]
