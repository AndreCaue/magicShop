from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html

import re

from . import models
from .database import engine
from .auth import routes as auth_routes
from .store import routes as products_router
from .store.categories import routes as categories_router
from .store.cart import routes as cart_router
from .common.routes import router as dropdown_router
from .common.helpers import router as helpers_router
from app.melhorenvio.frete.routes import router as menvio_frete_router
from .address.routes import router as address_router
from .payment.routes import router as payment_router
from .core.routes import router as test_router
from .payment.webhook.routes import router as webhook_router
from .store.orders.routes import router as orders_router
from .payment.refund.routes import router as refund_router
from .sidebar.routes import router as sidebar_router
from .melhorenvio.webhook.routes import router as menvio_webhook_router
from .contents.routes import router as contents_router
from .contents import models as _contents_models
from app.tasks.scheduler import start_scheduler, scheduler
from contextlib import asynccontextmanager

from .core.config import settings
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter
import logging

# if settings.ENVIRONMENT == "development":
models.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):

    start_scheduler()
    yield

    scheduler.shutdown()


is_dev = settings.ENVIRONMENT == "development"

logging.basicConfig(
    level=logging.DEBUG if is_dev else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    docs_url=None,
    redoc_url="/redoc" if is_dev else None,
    openapi_url="/openapi.json" if is_dev else None,
    title=f"{settings.APP_NAME}",
    redirect_slashes=False,
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

if is_dev:
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        return get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=app.title + " - Swagger UI",
            swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
            swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
            swagger_ui_parameters={
                "persistAuthorization": True, "tryItOutEnabled": True}
        )


if settings.ENVIRONMENT == 'development':
    @app.middleware("http")
    async def sanitize_logs(request: Request, call_next):
        try:
            body = await request.body()
            text = body.decode("utf-8")

            sanitized = re.sub(
                r'("password"\s*:\s*")[^"]+(")',
                r'\1[REDACTED]\2',
                text
            )

            sanitized = re.sub(
                r'("access_token"\s*:\s*")[^"]+(")',
                r'\1[REDACTED]\2',
                sanitized
            )

        except Exception:
            sanitized = None

        response = await call_next(request)

        if sanitized and response.status_code >= 400:
            print("Request sanitized:", sanitized)

        return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://doceilusao.vercel.app",
        "https://www.doceilusao.store",
        "https://doceilusao.store",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(products_router.router)
app.include_router(categories_router.router)
app.include_router(cart_router.router)
app.include_router(dropdown_router)
app.include_router(helpers_router)
app.include_router(menvio_frete_router)
app.include_router(address_router)
app.include_router(payment_router)
app.include_router(test_router)
app.include_router(webhook_router)
app.include_router(orders_router)
app.include_router(refund_router)
app.include_router(sidebar_router)
app.include_router(menvio_webhook_router)
app.include_router(contents_router)


@app.get("/")
def home():
    return {"message": "API Online 🚀"}
