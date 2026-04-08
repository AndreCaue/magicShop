# MagicShop Backend API

> High-performance, production-ready API powering a hybrid e-commerce platform — physical storefront + secure digital content delivery.

Built with **FastAPI**, MagicShop handles everything from product catalogs and cart management to subscription-gated video streaming via AWS S3 pre-signed URLs. Security and scalability are first-class citizens: role-based access control, strict scope validation, and full isolation between public and private cloud storage.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [AWS S3 Configuration](#aws-s3-configuration)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)

---

## Features

- **Authentication & Authorization** — JWT-based auth with granular scopes: `basic`, `premium`, and `master`.
- **E-commerce Core** — Full product catalog, cart logic, idempotent stock reservation, and checkout flow.
- **Digital Content Locking** — Videos and premium PDFs gated behind subscription tiers or one-time purchases.
- **Secure S3 Integration**
  - Pre-signed URLs for safe, direct video streaming from AWS — bypassing the backend entirely.
  - Zero public access to premium content.
  - Backend-proxied uploads for lightweight product images.
  - S3 strict policies prevent direct video downloads.
- **Database** — SQLAlchemy ORM targeting PostgreSQL in production.
- **Background Scheduler** — Automatic release of expired cart reservations and stock sync.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Database | PostgreSQL (prod) / SQLite (dev) |
| ORM | SQLAlchemy |
| Cloud Storage | AWS S3 via Boto3 |
| Security | Passlib (Bcrypt) + Python-JOSE (JWT) |
| Server | Uvicorn |

---

## Architecture Overview

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

    Client -- "4. Request Presigned Upload URL (Master)" --> API
    API -- "5. Return Signed PUT URL" --> Client
    Client -- "6. Upload Video Directly" --> PrivateBucket
    Client -- "7. Request to Watch Video" --> API
    API -- "8. Verify Scopes (DB)" --> DB
    API -- "9. Generate Signed GET URL" --> Client
    Client -- "10. Securely Stream" --> PrivateBucket
```

The architecture enforces a hard separation between public storefront assets and private premium content:

- **Public assets** (product images, category logos) — Uploaded via the backend to a public S3 bucket, served freely via S3/CloudFront URLs. No authentication required.
- **Private assets** (tutorial videos, premium PDFs) — Stored in a fully blocked S3 bucket. The API acts as a strict gatekeeper: it validates the user's scope against the required tier, then issues a short-lived (e.g. 15-minute) pre-signed URL. Once expired, the link is dead — sharing it does nothing.

---

## AWS S3 Configuration

This project requires **two separate S3 buckets** per environment (dev/prod).

### Public Bucket (`magicshop-public-prod`)

| Setting | Value |
|---|---|
| Block Public Access | **Off** |
| Usage | Avatars, category logos, product photos |
| Bucket Policy | Must allow `s3:GetObject` for `Principal: "*"` on the `/products/*` prefix |

### Private Bucket (`magicshop-private-prod`)

| Setting | Value |
|---|---|
| Block Public Access | **On (strictly enforced)** |
| Usage | Locked tutorial videos, premium PDFs |
| Security Mechanism | Pre-signed URLs generated server-side via Boto3 after scope validation |

**How pre-signed URLs work:**
1. Client requests a video from the API.
2. API checks `user.scopes` against `required_scope` in PostgreSQL.
3. If authorized, API signs a temporary `GET` URL using `AWS_SECRET_ACCESS_KEY`.
4. Client streams the video directly from S3 using that tokenized URL.
5. After expiry, the URL is worthless — cannot be shared or reused.

---

## Environment Variables

Create a `.env` file at the project root:

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

## Installation

**1. Clone the repository**

```bash
git clone <repo-url>
cd MagicShop/Backend
```

**2. Create and activate a virtual environment**

```bash
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure environment**

Copy the template above into a `.env` file at the project root and fill in your values.

---

## Running Locally

```bash
uvicorn app.main:app --reload
```

| Interface | URL |
|---|---|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## API Endpoints

| Group | Prefix | Description |
|---|---|---|
| Auth | `/auth` | Login, account verification, scope upgrades |
| Store | `/products`, `/category` | Public catalog listing; admin product registration with S3 image upload |
| Cart & Checkout | `/cart` | Assemble orders, reserve stock, dispatch to payment |
| Contents | `/contents` | Digital content metadata and secure video access |

### Key Content Routes

- `GET /contents/` — Returns public metadata for all products (physical and digital).
- `GET /contents/{id}` — Returns content definition. If the user is authorized, includes a `view_url` (AWS pre-signed GET).
- `POST /contents/presigned-url` — **Admin only.** Generates a pre-signed PUT URL for direct large-file video uploads from the dashboard to S3.

---

## Folder Structure

```
app/
├── auth/               # Authentication, JWT logic, user models
├── contents/           # Digital content schemas, routes, and S3 logic
├── core/
│   ├── config.py       # Pydantic Settings & environment variable loading
│   ├── security.py     # Password hashing and verification
│   └── s3_service.py   # Boto3 handlers (pre-signed URLs, uploads)
├── melhorenvio/        # Shipping API integrations and webhooks
├── payment/            # Pix / Credit Card handlers and webhooks
├── store/              # E-commerce core (products, categories, cart)
├── tasks/              # Background schedulers (e.g. freeing expired cart slots)
├── database.py         # SQLAlchemy session and engine setup
└── main.py             # FastAPI application entry point
```

---

## Security Considerations

| Threat | Mitigation |
|---|---|
| **Webhook Spoofing** | All external webhooks (Efí, Melhor Envios) are validated against `WEBHOOK_SECRET` or trusted IPs before any order/stock action is taken. |
| **Race Conditions / Overselling** | Stock reservation uses `with_for_update()` at the DB level for idempotent, concurrent-safe checkouts. |
| **Admin Abuse** | Product registration and video uploads are guarded by the `require_master_full_access` Dependency Injection wrapper. |
| **Bot / Spam Purchases** | Only users with `is_verified=True` can complete checkout. |

---

## Future Improvements

- **Alembic Migrations** — Replace `Base.metadata.create_all()` with Alembic for robust, versioned schema management across environments.
- **Redis Cache** — Cache `GET /products` and `GET /contents` responses to cut DB load on the heaviest storefront routes.
- **CloudFront CDN** — Place both S3 buckets behind CloudFront to reduce global video streaming latency.
- **Celery / RQ** — Migrate background tasks (email delivery, stock restoration) from the built-in Python scheduler to a production-grade task queue.

---

*MagicShop Backend — built with FastAPI. Contributions welcome.*
