# MagicShop Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> A complete Single Page e-commerce Application — catalog, cart, real-time shipping costs, and payments via PIX or Credit Card.

Part of the **MagicShop** ecosystem (operating as **Doce Ilusão**), this frontend covers the entire flow of a modern electronic commerce: multiple domains (store interface, admin area, user profile), performance data viewing & admin dashboard (currently with dummy/mocked data for region sales metrics prototyping), a robust shopping cart with concurrent stock reservation features, automated shipping fees fetching, and seamless payment gateway connection with EFI/Gerencianet.

> **Related Repository:** [MagicShop Backend (API) →](../Backend)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Main Integrations](#main-integrations)
- [Folder Architecture](#folder-architecture)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Useful Commands](#useful-commands)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Core | React 19 + TypeScript (strict) + Vite |
| Routing | react-router-dom v7 |
| Server state | TanStack Query (cache, refetch, loading states) |
| Client state | Zustand (cart, shipping logic) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Animations | Framer Motion + tsparticles |
| Forms | react-hook-form + Zod |
| HTTP Client | Axios (abstracted in `src/Repositories`) |

---

## Main Integrations

### 🚚 Logistics — Melhor Envio
Automatic fetching of shipping quotes based on the given Destination ZIP (CEP), retrieving choices spanning national "Correios" and partner delivery services in real-time right at the checkout screen.

### 💳 Payments — EFI / Gerencianet
- **PIX:** Instant static and dynamic QR Code generation straight to the checkout completion interface.
- **Credit Card:** Safe Tokenization via the official EFI plugin (`payment-token-efi`) — ensuring that the consumer's sensitive data traces bypass our custom backend permanently.

### 📊 Dashboard and Metrics
Performance visualization board rendering up-to-date regional metrics and KPIs. On its current iteration, listed properties and values displayed on screen are *temporarily mocked* scaffolding the UI layout. This intends to welcome an upcoming complete backend wiring (via the `admin` restricted routes recently implemented server-side).

---

## Folder Architecture

```
src/
├── assets/          # Static elements, images, logos...
├── components/      # UI basic reusable parts (Buttons, Dialogs...)
├── global/          # Overall entities types & context bindings
├── helpers/         # Utility functions (Masks, dates, formatting)
├── Hooks/           # Local Custom Hooks 
├── lib/             # Third Party tooling
├── Pages/           # Split layout for multiple boundaries (Shop, Cart, Admin)
├── Repositories/    # Data Access Layer / Axios decouplers
├── Routes/          # Path tree based in react-router-dom 
├── Security/        # Auth flow control / router barriers
├── stores/          # App Global State managers via Zustand
└── axiosInstance.ts # Root Axios Instance config + interceptors
```

---

## Requirements

Ensure the below is properly configured in your system before engaging:

- [Node.js](https://nodejs.org/) **v20 (LTS) or higher**
- [Yarn](https://yarnpkg.com/) (`npm install -g yarn`)
- Internal API running side-to-side for data consuming.

---

## Installation

**1. Go fetching code**
```bash
git clone <repo-url>
cd MagicShop/Frontend
```

**2. Hydrate module dependencies**
```bash
yarn install
```

**3. Setup configuration**
Clone `.env` with the rules shown right below.

---

## Environment Variables

Make a base `.env` file at the exact `/Frontend` root directory:

```env
# URL for your locally running MagicShop API endpoint.
VITE_API_URL="http://localhost:8000"

# EFI API context toggle. Often "sandbox" locally.
VITE_ENVIRONMENT="sandbox"

# Account ID from your personal EFI/Gerencianet profile context
VITE_EMI_ACCOUNTID="your_assigned_account_id_hex"

# ZIP origin point (CEP format base calculation)
VITE_CEP_ORIGEM="00000000"
```

---

## Running the Project

```bash
yarn dev
```
Wait to compile on its HMR mode and follow the path presented (`http://localhost:5173` typically).

---

## Useful Commands

| Command | Usage |
|---|---|
| `yarn dev` | Spawns HMR based Vite instance. |
| `yarn build` | TS checker (`tsc`) + Bundler. |
| `yarn lint` | Starts ESLint checking standard based on the project local configuration (`.eslint.config.js`). |
| `yarn preview` | Generates a quick built visualization to validate previous to any deployment attempts. |
