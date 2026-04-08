# ✨ MagicShop Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Uma Single Page Application (SPA) de e-commerce completa construída com agilidade, foco em experiência do usuário e alta integração com meios de pagamento e logística brasileiros. 

## 📌 Sobre o Projeto

O **MagicShop** visa promover a venda de produtos (Mágica, Acessórios, Baralhos e afins) contendo todo o fluxo de um comércio eletrônico moderno: catálogos, múltiplos domínios (loja, administração, usuário), carrinho de compras robusto, cálculo de fretes em tempo real e pagamentos sem fricção através de transparência em PIX ou Cartão de Crédito.

## 🚀 Tech Stack

A estrutura técnica do projeto foi montada visando garantir o máximo de performance, alinhamento aos novos padrões do React e segurança de estado assíncrono:

- **Core**: React 19 executado em cima da plataforma de build Vite. Devido a esta característica, ele roda rápido nas re-renderizações (HMR) e propicia builds eficientes. Tipado com TypeScript Rígido.
- **Roteamento**: `react-router-dom` (V7).
- **Gerenciadores de Estado**: 
  - `@tanstack/react-query`: para cache robusto, requisições HTTP lidando com *server-state*.
  - `zustand`: para estado client-side (ex: estado efêmero do Carrinho e Cálculos de Frete).
- **Estilização e UI**:
  - `tailwindcss` (v4): o motor base, gerando classes utilitárias via PostCSS.
  - Componentização escalável baseada nas primitivas visuais do `shadcn/ui` através da lib Radix.
  - Animações fluidas geridas pelo `framer-motion` e modulos de visuais (`tsparticles`).
- **Formulários**: Construídos utilizando `react-hook-form` integrados diretamente a validações complexas e puras via `zod`.
- **Comunicação com API**: Abstração limpa baseada no `axios` (`src/Repositories`).

## 📦 Principais Integrações
Neste e-commerce encontram-se dependências de extrema valia de negócios:
* 🚚 **Logística (Melhor Envio)**: Chamadas automatizadas para consultar dimensões de pacotes baseando-se no CEP alvo usando cotação na API e determinando o frete via Correios/Transportadoras de imediato.
* 💳 **Gateway de Pagamento (EFI / Gerencianet)**:
   - Emissão de QR Codes Pix estáticos/dinâmicos diretamente no fechamento.
   - Geração de Payment Tokens no processo de Cartão de Crédito (via plugin seguro `payment-token-efi`), encapsulado para evitar vazamentos diretos de dados sensíveis para o BackEnd próprio.

## 📂 Arquitetura de Pastas de `src/`

```sh
src/
├── assets/          # Ícones, imagens estáticas e logos gerais.
├── components/      # (UI) Botões, Inputs, Dialogs e fragmentos de alta reutilização do design system.
├── global/          # Tipagens estáticas de entidades e contextos persistentes.
├── helpers/         # Funções utilitárias avulsas (formatações, cálculos de máscara e parsing).
├── Hooks/           # Logic reutilizável do React (ex: useCart, useAuth, useShippingStore).
├── lib/             # Predefinições e utilitários auxiliares do front-end utilitário.
├── Pages/           # Domínio central da aplicação, onde moram as views e rotas de fato (Checkout, Cart, Admin).
├── Repositories/    # Data Access Layer. Chamadas assíncronas do axios externalizadas p/ desacoplamento.
├── Routes/          # Estruturação e árvore do react-router-dom separada por "áreas" do sistema.
├── Security/        # Encapsulamento de rotas e lógicas puramente ligadas à proteção/Autenticação (JWT).
├── stores/          # Ponto de entrada de estados atômicos via Zustand.
└── axiosInstance.ts # Central interceptadora base para conexões com o Server.
```

## ⚙️ Variáveis de Ambiente

Crie um novo arquivo arquivo `.env` na raiz (se baseando no bloco abaixo ou no histórico do projeto) injetando as devidas referências:

```sh
# .env
VITE_API_URL="http://localhost:8000" # Exemplo: Host local do seu backend.
VITE_ENVIRONMENT="sandbox" # Operando a API EFI em ambiente de testes ou "producao".
VITE_EMI_ACCOUNTID="seu_accountId_da_efi_aqui" #
VITE_CEP_ORIGEM="seu_cep_aqui" 
```

## 💻 Como Rodar o Projeto

1. Certifique-se de usar o **Node 20+** e possuir o **Yarn** ou **NPM/PNPM** atualizado.
2. Baixe o código fonte.
3. Acesse a pasta do arquivo (`cd Frontend`).
4. Execute `yarn install` para instalar as dependências atreladas ao `package.json`.
5. Inicie em modo de desenvolvimento rodando `yarn dev`.

O aplicativo inicializará via Vite na porta local exibida em seu terminal.

## 🛠 Comandos Úteis

| Script       | O que ele faz |
| :---         | :--- |
| `yarn dev`   | Inicia o servidor local do vite servindo o código em Hot-Reload. |
| `yarn build` | Efetua a checagem do TypeScript via `tsc` e compacta o projeto para enviar à nuvem via Vite. |
| `yarn lint`  | Checa erros semânticos segundo o `.eslint.config.js`. |
