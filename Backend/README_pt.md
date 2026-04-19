# MagicShop Backend API

> API de alta performance, pronta para produção, impulsionando uma plataforma de e-commerce híbrida — loja física + entrega segura de conteúdo digital.

Desenvolvido em **FastAPI**, o MagicShop gerencia desde o catálogo de produtos e lógicas de carrinho até a entrega de vídeos restritos via URLs pré-assinadas da AWS S3. A segurança e escalabilidade são conceitos essenciais: controle de acesso via escopos (*scopes*), validações e um isolamento completo entre *buckets* na nuvem.

---

## Índice

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
- [Configuração AWS S3](#configuração-aws-s3)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Instalação](#instalação)
- [Rodando Localmente](#rodando-localmente)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Considerações de Segurança](#considerações-de-segurança)
- [Melhorias Futuras](#melhorias-futuras)

---

## Features

- **Autenticação e Autorização** — Baseado em JWT com escopos: `basic`, `premium` e `admin`.
- **Dashboard e Métricas** — Rotas e serviços desenhados para métricas precisas de performance por região e relatórios de venda (Atualmente aguardando a integração do Frontend, escopo limitador: `admin`).
- **Core de E-commerce** — Catálogo de produtos, fluxo de carrinho, reserva de estoque de forma idempotente e *checkout*.
- **Entrega de Conteúdo Digital** — Vídeos e PDFs exclusivos bloqueáveis por assinaturas ou compra avulsa.
- **Integração S3 Segura**
  - URLs pré-assinadas (*pre-signed*) para leitura de forma extremamente rápida diretamente da AWS (bypassa toda banda do Backend).
  - Conteúdo `premium` não tem acesso público.
  - Upload de imagens das vitrines (pequenas) através das chamadas de API feitas por adminstradores.
- **Banco de Dados** — SQLAlchemy ORM mirando num PostgreSQL em ambiente de produção.
- **Background Scheduler** — Restauração automática de produtos estagnados ou que não fecharam via sessões de expiração.

---

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Framework | FastAPI |
| Banco de Dados | PostgreSQL (prod) / SQLite (dev) |
| ORM | SQLAlchemy |
| Cloud Storage | AWS S3 via Boto3 |
| Segurança | Passlib (Bcrypt) + Python-JOSE (JWT) |
| Servidor | Uvicorn |

---

## Visão Geral da Arquitetura

```mermaid
graph TD
    Client[Client Browser / App]
    API[FastAPI Backend]
    DB[(PostgreSQL)]
    PublicBucket[AWS S3 — Public Bucket]
    PrivateBucket[AWS S3 — Private Bucket]

    Client -- "1. Login / Auth" --> API
    API -- "Query" --> DB

    API -- "2. Upload Product Images" --> PublicBucket
    Client -- "3. Read Open Catalog" --> API

    Client -- "4. Request Presigned Upload URL (Admin)" --> API
    API -- "5. Return Signed PUT URL" --> Client
    Client -- "6. Upload Video Directly" --> PrivateBucket
    Client -- "7. Request to Watch Video" --> API
    API -- "8. Verify Scopes (DB)" --> DB
    API -- "9. Generate Signed GET URL" --> Client
    Client -- "10. Securely Stream" --> PrivateBucket
```

A arquitetura cria uma separação estrita na nuvem:
- **Ativos Públicos** (logoscopia e capas) - Direcionadas por admin e geridas num bucket aberto.
- **Conteúdo Privado Premium** - Entregues localizados em repositórios selados de buckets privados; onde a própria API faz a arbitragem do token expirável e manda o link único (`GET`).

---

## Configuração AWS S3

Necessita-se de duas divisões (`dev/prod`). Exemplo abaixo:

### Public Bucket (`magicshop-public-prod`)

| Setting | Valor |
|---|---|
| Block Public Access | **Off** |
| Usage | Avatars, logos de categorias, capas e thumbs |
| Bucket Policy | Autorizar `s3:GetObject` em `Principal: "*"` |

### Private Bucket (`magicshop-private-prod`)

| Setting | Valor |
|---|---|
| Block Public Access | **On (rigorosamente ligado)** |
| Usage | Vídeos em HD/4k e premium PDFs |
| Security | Entrega via token temporário apenas |

---

## Variáveis de Ambiente

Crie o arquivo `.env` na raiz do escopo backend:

```env
# Application
ENVIRONMENT=development
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CREATE_TABLES=True

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/magicshop
DATABASE_URL_DEV=sqlite:///./app.db

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=sa-east-1

# Public Buckets (Avatars, Product Images)
S3_BUCKET_PUBLIC_DEV=magicshop-public-dev
S3_BUCKET_PUBLIC_PROD=magicshop-public-prod

# Private Buckets (Premium Content, Videos)
S3_BUCKET_PRIVATE_DEV=magicshop-private-dev
S3_BUCKET_PRIVATE_PROD=magicshop-private-prod

# Webhooks
WEBHOOK_SECRET=your_webhook_secret_token
```

---

## Instalação

```bash
git clone <repo-url>
cd MagicShop/Backend

# Crie e inicie a env (Windows)
python -m venv venv
venv\Scripts\activate

# Linux OSX
# source venv/bin/activate

pip install -r requirements.txt
```

---

## Rodando Localmente

```bash
uvicorn app.main:app --reload
```
Acesse a página Swagger do FastAPI no local configurado `http://localhost:8000/docs`.

---

## Endpoints da API

| Group | Endpoint Base | Descrição |
|---|---|---|
| Auth | `/auth` | Credenciais, re-emissão de base tokens.|
| Store | `/products` / `/category` | Leitura catalográfica global e área de *post* de produto com up via form S3 interno.|
| Cart & Checkout | `/cart` | Assumir carrinhos parciais, fazer travas nos bounds das DBs, finalizar checkout.|
| Contents | `/contents` | O real hub para as referências das aulas online. A API atua aqui. |
| Dashboard | `/dashboard` | Rotas prontas para processamento regional (*mockado no Front, mas vivo pelo prisma do backend*) |

---

## Estrutura de Pastas

```
app/
├── auth/               # Controle JWT
├── contents/           # Digital media models e schema local
├── core/
│   ├── config.py       # Pydantic ENV Loader
│   ├── security.py     # Hashing
│   └── s3_service.py   # Handlers AWS S3
├── melhorenvio/        # Webhooks ME Logsíticas
├── payment/            # Gateway Efí PIX Webhook callbacks
├── store/              # Ecommerce flow model
├── tasks/              # Tarefas cron-job / background scheduler
├── database.py         # DB Setup engine local ou URL Prod
└── main.py
```
