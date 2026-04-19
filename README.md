# Doce Ilusão E-commerce Platform

Bem-vindo ao **Doce Ilusão**, um ecossistema completo para comércio eletrônico híbrido, projetado para suportar tanto a venda de produtos físicos com integração logística quanto a entrega segura de conteúdo digital (como vídeos protegidos e PDFs).

O projeto é dividido em dois domínios principais: um frontend moderno de *Single Page Application* (SPA) e um backend robusto responsável por toda a lógica de negócio, segurança e integrações com serviços de terceiros.

---

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [Tech Stack Global](#tech-stack-global)
3. [Arquitetura do Ecossistema](#arquitetura-do-ecossistema)
4. [Integrações Principais](#integrações-principais)
5. [Estrutura do Repositório](#estrutura-do-repositório)
6. [Como Iniciar o Projeto Localmente](#como-iniciar-o-projeto-localmente)

---

## 🎯 Visão Geral

- **Frontend (`/Frontend`)**: Desenvolvido para oferecer uma experiência de usuário rica e performática. Cuida de todo o fluxo de compra, desde o catálogo de produtos e carrinho de compras dinâmico usando Zustand, até o cálculo de frete em tempo real e finalização do pagamento.
- **Backend (`/Backend`)**: Construído focado em alta performance e segurança. Gerencia usuários, acesso a conteúdos exclusivos via pre-signed URLs do AWS S3, webhooks de pagamentos e envios, além de orquestrar a reserva idempotente de estoque para garantir a estabilidade nas vendas.
- **Dashboard Admin (Métricas)**: Interface para visualização de desempenho de vendas por região e análise de dados. Atualmente, possui rotas e serviços no Backend operando sob permissão restrita de administrador, enquanto o Frontend exibe a estrutura baseada com dados mocados para prototipação antes da integração final.

---

## 💻 Tech Stack Global

A arquitetura da Doce Ilusão baseia-se em tecnologias modernas para garantir manutenibilidade e escalabilidade:

### Frontend
- **Framework Core**: React 19 + TypeScript + Vite
- **Gerenciamento de Estado**: Zustand (carrinho/frete) e TanStack Query (server state cache)
- **Roteamento**: React Router v7
- **Estilização e UI**: Tailwind CSS v4 + shadcn/ui

### Backend
- **Framework Core**: FastAPI (Python)
- **Banco de Dados**: PostgreSQL (Produção) / SQLite (Desenvolvimento) com SQLAlchemy ORM
- **Armazenamento e Streaming**: AWS S3 via Boto3 (separação estrita entre buckets públicos para imagens de produtos e buckets privados para conteúdo digital pago)
- **Segurança**: JWT com scopes (`basic`, `premium`, `admin`) e Bcrypt

---

## 🏗 Arquitetura do Ecossistema

O sistema segue uma arquitetura Cliente-Servidor onde o Frontend consome a API RESTful exposta pelo Backend. Um dos pontos mais críticos do sistema é a separação do conteúdo digital:

```mermaid
graph TD
    Client[Frontend React / Browser]
    API[Backend FastAPI]
    DB[(PostgreSQL)]
    PublicBucket[AWS S3 — Public Bucket]
    PrivateBucket[AWS S3 — Private Bucket]
    GatewayEnvios[Melhor Envio API]
    GatewayPag[Efí / Gerencianet]

    Client -- "Consultas e Compras" --> API
    API -- "CRUD / Auth" --> DB
    Client -- "Cálculo Frete / Rastreio" --> GatewayEnvios
    Client -- "Token Crédito / PIX" --> GatewayPag
    API -- "Webhooks" <-- GatewayPag
    API -- "Upload / Leitura Imagens" --> PublicBucket
    
    %% Streaming Seguro
    Client -- "Solicita Vídeo (Após Compra)" --> API
    API -- "Valida Permissões" --> DB
    API -- "Gera Pre-signed URL" --> Client
    Client -- "Streaming Direto (Seguro)" --> PrivateBucket
```

Os vídeos e PDFs premium são armazenados num ambiente confinado em **buckets privados do S3**. O Backend age como um intermediário que emite URLs assinadas e temporárias após verificar o escopo de autorização do usuário.

---

## 🔌 Integrações Principais

1. **Efí / Gerencianet (Pagamentos)**:
   - **PIX:** Geração de QR Code nativa.
   - **Cartão de Crédito:** O Frontend gera tokens de forma segura, o qual é enviado ao Backend, garantindo que os dados do cartão nunca toquem nossos servidores permanentemente.
2. **Melhor Envio (Logística)**: 
   - Cálculo em tempo real dos custos de frete baseados no CEP fornecido pelo Frontend durante o checkout.
3. **AWS S3 (Armazenamento Cloud)**: 
   - Imagens públicas da loja (produtos, avatares).
   - Entrega segura de conteúdo premium.

---

## 📁 Estrutura do Repositório

| Diretório | Descrição |
|---|---|
| [`/Frontend`](./Frontend/) | Código-fonte da aplicação React SPA. Mais detalhes no [README_frontend.md](./Frontend/README_frontend.md). |
| [`/Backend`](./Backend/) | API principal desenvolvida em FastAPI. Mais detalhes no [README.md](./Backend/README.md) nativo da pasta. |

---

## 🚀 Como Iniciar o Projeto Localmente

Para rodar o ecossistema adequadamente, é recomendado subir o Backend primeiro, permitindo que a API fique disponível para consumo do Frontend.

### Passo 1: Inicializar o Backend
1. Navegue até a pasta `Backend/`.
2. Siga as instruções do [README do Backend](./Backend/README.md) para configurar seu `.env`, que inclui configurações do DB e credenciais da AWS.
3. Crie e ative seu ambiente virtual Python (`venv`).
4. Instale as dependências com `pip install -r requirements.txt`.
5. Inicie o servidor:
   ```bash
   uvicorn app.main:app --reload
   ```

### Passo 2: Inicializar o Frontend
1. Navegue até a pasta `Frontend/`.
2. Crie um arquivo `.env` mapeando as chaves necessárias (URL da API, chaves públicas do ambiente EFI de sandbox para testes - veja detalhes no [README do Frontend](./Frontend/README_frontend.md)).
3. Instale as dependências:
   ```bash
   yarn install
   ```
4. Inicie o sevidor de desenvolvimento:
   ```bash
   yarn dev
   ```

Feito isso, explore o Swagger da API em `http://localhost:8000/docs` e acesse a Loja Online em `http://localhost:5173`.
