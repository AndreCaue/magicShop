# MagicShop Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> Single Page Application de e-commerce completa — catálogo, carrinho, frete em tempo real e pagamentos via PIX e Cartão de Crédito.

Parte do ecossistema **MagicShop**, este frontend cobre todo o fluxo de um comércio eletrônico moderno: múltiplos domínios (loja, administração, perfil de usuário), carrinho robusto com reserva de estoque, cálculo de frete automatizado e integração transparente com o gateway de pagamento EFI/Gerencianet.

> **Repositório relacionado:** [MagicShop Backend →](../Backend)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Principais Integrações](#principais-integrações)
- [Arquitetura de Pastas](#arquitetura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodando o Projeto](#rodando-o-projeto)
- [Comandos Úteis](#comandos-úteis)

---

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Core | React 19 + TypeScript (strict) + Vite |
| Roteamento | react-router-dom v7 |
| Server state | TanStack Query (cache, refetch, loading states) |
| Client state | Zustand (carrinho, frete) |
| Estilização | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Animações | Framer Motion + tsparticles |
| Formulários | react-hook-form + Zod |
| HTTP Client | Axios (abstraído em `src/Repositories`) |

---

## Principais Integrações

### 🚚 Logística — Melhor Envio
Consulta automática de cotação de frete com base no CEP de destino, retornando opções via Correios e transportadoras parceiras em tempo real durante o checkout.

### 💳 Pagamento — EFI / Gerencianet
- **PIX:** Geração de QR Codes estáticos e dinâmicos diretamente na tela de fechamento de pedido.
- **Cartão de Crédito:** Tokenização segura via plugin `payment-token-efi` — dados sensíveis nunca trafegam pelo backend próprio.

---

## Arquitetura de Pastas

```
src/
├── assets/          # Ícones, imagens estáticas e logos
├── components/      # Componentes de UI reutilizáveis (Botões, Inputs, Dialogs)
├── global/          # Tipagens globais de entidades e contextos persistentes
├── helpers/         # Funções utilitárias (formatação, máscaras, parsing)
├── Hooks/           # Custom hooks (useCart, useAuth, useShippingStore)
├── lib/             # Configurações e utilitários auxiliares
├── Pages/           # Views e rotas por domínio (Checkout, Cart, Admin, Perfil)
├── Repositories/    # Data Access Layer — chamadas Axios desacopladas por entidade
├── Routes/          # Árvore do react-router-dom separada por área do sistema
├── Security/        # Proteção de rotas e lógica de autenticação JWT
├── stores/          # Estados atômicos via Zustand
└── axiosInstance.ts # Instância base do Axios com interceptadores globais
```

---

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) **v20 ou superior**
- [Yarn](https://yarnpkg.com/) — gerenciador de pacotes recomendado (`npm install -g yarn`)
- Backend do MagicShop rodando localmente (veja o [README do Backend](../Backend/README.md))

---

## Instalação

**1. Clone o repositório**

```bash
git clone <repo-url>
cd MagicShop/Frontend
```

**2. Instale as dependências**

```bash
yarn install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto (veja a seção abaixo).

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# URL base do backend MagicShop
VITE_API_URL="http://localhost:8000"

# Ambiente da API EFI: "sandbox" (testes) ou "producao"
VITE_ENVIRONMENT="sandbox"

# Account ID da sua conta EFI/Gerencianet
# Obtido em: https://sejaefi.com.br → Configurações → Credenciais
VITE_EMI_ACCOUNTID="seu_accountId_aqui"

# CEP de origem para cálculo de frete (CEP do remetente/estoque)
VITE_CEP_ORIGEM="00000000"
```

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | Endereço do backend. Em produção, substitua pelo domínio público. |
| `VITE_ENVIRONMENT` | Controla o modo da API EFI. Use `sandbox` para testes e `producao` para o ambiente real. |
| `VITE_EMI_ACCOUNTID` | Identificador da conta EFI, necessário para geração de tokens de pagamento no client. |
| `VITE_CEP_ORIGEM` | CEP do ponto de origem para cotação de frete via Melhor Envio. |

---

## Rodando o Projeto

```bash
yarn dev
```

O Vite inicializará o servidor local com Hot Module Replacement (HMR). A URL será exibida no terminal (padrão: `http://localhost:5173`).

---

## Comandos Úteis

| Comando | Descrição |
|---|---|
| `yarn dev` | Inicia o servidor de desenvolvimento com hot-reload. |
| `yarn build` | Executa checagem TypeScript (`tsc`) e gera o bundle de produção via Vite. |
| `yarn lint` | Analisa o código com ESLint segundo as regras do `.eslint.config.js`. |
| `yarn preview` | Serve o bundle de produção localmente para validação antes do deploy. |
