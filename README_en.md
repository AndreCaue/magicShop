# Doce Ilusão E-commerce Platform

Welcome to **Doce Ilusão**, a complete ecosystem for hybrid e-commerce, designed to support both the sale of physical products with logistics integration and the secure delivery of digital content (such as protected videos and PDFs).

The project is divided into two main domains: a modern *Single Page Application* (SPA) frontend and a robust backend responsible for all business logic, security, and third-party integrations.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Global Tech Stack](#global-tech-stack)
3. [Ecosystem Architecture](#ecosystem-architecture)
4. [Key Integrations](#key-integrations)
5. [Repository Structure](#repository-structure)
6. [How to Run Locally](#how-to-run-locally)

---

## 🎯 Overview

- **Frontend (`/Frontend`)**: Developed to offer a rich and performant user experience. It handles the entire purchasing flow, from the product catalog and dynamic shopping cart using Zustand to real-time shipping calculation and checkout.
- **Backend (`/Backend`)**: Built focusing on high performance and security. It manages users, access to exclusive content via AWS S3 pre-signed URLs, payment and shipping webhooks, and orchestrates idempotent stock reservation to ensure sale stability.
- **Dashboard Admin (Metrics)**: Admin interface for sales performance visualization by region and data analysis. Currently, it has routes and services in the Backend operating under strict administrator permission, while the Frontend displays the structure based on mocked data for prototyping prior to the final integration.

---

## 💻 Global Tech Stack

Doce Ilusão's architecture relies on modern technologies to ensure maintainability and scalability:

### Frontend
- **Core Framework**: React 19 + TypeScript + Vite
- **State Management**: Zustand (cart/shipping) and TanStack Query (server state cache)
- **Routing**: React Router v7
- **Styling and UI**: Tailwind CSS v4 + shadcn/ui

### Backend
- **Core Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Production) / SQLite (Development) with SQLAlchemy ORM
- **Storage and Streaming**: AWS S3 via Boto3 (strict separation between public buckets for product images and private buckets for paid digital content)
- **Security**: JWT with scopes (`basic`, `premium`, `admin`) and Bcrypt

---

## 🏗 Ecosystem Architecture

The system follows a Client-Server architecture where the Frontend consumes the RESTful API exposed by the Backend. One of the most critical points of the system is the separation of digital content:

```mermaid
graph TD
    Client[Frontend React / Browser]
    API[Backend FastAPI]
    DB[(PostgreSQL)]
    PublicBucket[AWS S3 — Public Bucket]
    PrivateBucket[AWS S3 — Private Bucket]
    GatewayEnvios[Melhor Envio API]
    GatewayPag[Efí / Gerencianet]

    Client -- "Queries and Purchases" --> API
    API -- "CRUD / Auth" --> DB
    Client -- "Shipping Calc. / Tracking" --> GatewayEnvios
    Client -- "Credit Token / PIX" --> GatewayPag
    API -- "Webhooks" <-- GatewayPag
    API -- "Image Upload / Read" --> PublicBucket
    
    %% Secure Streaming
    Client -- "Request Video (Post-Purchase)" --> API
    API -- "Validate Permissions" --> DB
    API -- "Generate Pre-signed URL" --> Client
    Client -- "Direct Streaming (Secure)" --> PrivateBucket
```

Premium videos and PDFs are stored in an isolated environment in **private S3 buckets**. The Backend acts as a middleman that issues signed and temporary URLs after verifying the user's authorization scope.

---

## 🔌 Key Integrations

1. **Efí / Gerencianet (Payments)**:
   - **PIX:** Native QR Code generation.
   - **Credit Card:** The Frontend securely generates tokens, which are then sent to the Backend, ensuring that raw credit card data never touches our servers.
2. **Melhor Envio (Logistics)**: 
   - Real-time calculation of shipping costs based on the ZIP code provided by the Frontend during checkout.
3. **AWS S3 (Cloud Storage)**: 
   - Public store images (products, avatars).
   - Secure premium content delivery.

---

## 📁 Repository Structure

| Directory | Description |
|---|---|
| [`/Frontend`](./Frontend/) | React SPA source code. More details in [README_frontend_en.md](./Frontend/README_frontend_en.md). |
| [`/Backend`](./Backend/) | Main API built with FastAPI. More details in [README_en.md](./Backend/README_en.md) inside its folder. |

---

## 🚀 How to Run Locally

To run the ecosystem appropriately, it is recommended to start the Backend first, making the API available for the Frontend to consume.

### Step 1: Initialize the Backend
1. Navigate to the `Backend/` folder.
2. Follow the instructions in the [Backend README](./Backend/README_en.md) to set up your `.env`, which includes DB settings and AWS credentials.
3. Create and activate your Python virtual environment (`venv`).
4. Install dependencies with `pip install -r requirements.txt`.
5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Step 2: Initialize the Frontend
1. Navigate to the `Frontend/` folder.
2. Create an `.env` file mapping the required keys (API URL, EFI sandbox environment public keys - see details in the [Frontend README](./Frontend/README_frontend_en.md)).
3. Install dependencies:
   ```bash
   yarn install
   ```
4. Start the development server:
   ```bash
   yarn dev
   ```

Once done, explore the API Swagger at `http://localhost:8000/docs` and access the Online Store at `http://localhost:5173`.
