from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from . import models
from .database import engine
from .auth import routes as auth_routes
from .store import routes as products_router
from .store.branch import routes as branchs_router
from .store.cart import routes as cart_router
from .common.routes import router as dropdown_router
from .common.helpers import router as helpers_router
from app.melhorenvio.frete.routes import router as menvio_frete_router

# Cria tabelas do banco, se ainda não existirem
models.Base.metadata.create_all(bind=engine)

app = FastAPI(docs_url="/docs", title="Minha Loja Backend")

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        # Esta linha desativa o Service Worker e o cache agressivo
        swagger_ui_parameters={"persistAuthorization": True, "tryItOutEnabled": True}
    )

# 👇 Middleware de sanitização de logs (ADICIONE AQUI)
@app.middleware("http")
async def sanitize_logs(request: Request, call_next):
    """
    Middleware simples para evitar que senhas e tokens apareçam em logs.
    """
    try:
        # tenta ler o corpo da requisição
        body = await request.body()
        text = body.decode("utf-8")

        # substitui dados sensíveis antes de logar
        sanitized = (
            text.replace("password=", "password=[REDACTED]")
                .replace("access_token=", "access_token=[REDACTED]")
        )

        # exibe no console apenas o texto sanitizado
        print(f"{request.method} {request.url.path} body:", sanitized)
    except Exception:
        pass  # evita erros caso o body já tenha sido consumido

    response = await call_next(request)
    return response


# 👇 Configuração do CORS

#allow_origins=["https://seu-dominio.com"] -> Produção.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # porta do Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 👇 Registro das rotas de autenticação
app.include_router(auth_routes.router)
app.include_router(products_router.router)
app.include_router(branchs_router.router)
app.include_router(cart_router.router)
app.include_router(dropdown_router)
app.include_router(helpers_router)
app.include_router(menvio_frete_router) 

# 👇 Rota raiz simples
@app.get("/")
def home():
    return {"message": "API Online 🚀"}
