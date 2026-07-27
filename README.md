# Playwright API Test Suite

[🇬🇧 English](#english) · [🇧🇷 Português](#portugues)

---

## English <a id="english"></a>

This project is first and foremost a **study on API testing with Playwright**. The API itself is intentionally minimal — a basic Express + PostgreSQL scaffold built solely to give the tests something to run against. The real focus is the test suite, not the API.

The API lives in the `api/` directory — see its [README](api/README.md) for setup and endpoint details.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- API server running on `http://localhost:3000`

## Setup

```bash
npm install
```

Configure the database via `.env` (see `.env.example`), then start the server:

```bash
npm run server
```

## Running Tests

Tests run with **2 parallel workers** by default (`workers: 2` in `playwright.config.ts`).

```bash
# Run all tests
npm test

# Run tests by endpoint
npm run test:get-products
npm run test:post-product
npm run test:put-product
npm run test:delete-product
npm run test:get-user
npm run test:post-user
npm run test:put-user
npm run test:delete-user
npm run test:get-orders
npm run test:get-order-by-id
npm run test:post-order
npm run test:put-order
npm run test:delete-order
```

## CI Pipeline

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Spins up a **PostgreSQL 16** container with health checks
2. Installs dependencies with `npm ci`
3. Starts the **API server** in the background
4. **Polls** `http://localhost:3000/` until the API responds (up to 60s)
5. Runs the full test suite with **4 parallel workers** (`--workers=4`) — **no browser download** needed since tests are API-only

## Project Structure

```
tests/api/
├── clients/          # API request wrappers (ProductsClient, UsersClient, OrdersClient)
├── helpers/          # Assertion helpers (response, user, product, order)
├── models/           # TypeScript interfaces (Product, User, Order)
└── tests/            # Test specs (products.spec.ts, users.spec.ts, orders.spec.ts)
```

## Test Coverage

The test suite covers **CRUD operations** for three resources:

### Products (`/products`)
- **GET** — list all products, get by ID (including error cases: invalid ID, non-existent, negative, decimal)
- **POST** — create product (validation: missing fields, non-string name, invalid price, negative price, non-string description)
- **PUT** — update product (partial updates, validation errors, non-existent ID)
- **DELETE** — delete product (idempotency, invalid IDs)

### Users (`/users`)
- **GET** — get user by ID (error cases: non-existent, invalid, negative, decimal)
- **POST** — create user (validation: missing fields, empty fields, invalid email, duplicate email)
- **PUT** — update user (partial updates, duplicate email, validation errors)
- **DELETE** — delete user (idempotency, invalid IDs)

### Orders (`/orders`)
- **GET** — list all orders (includes JOINed user/product details), get by ID (error cases: invalid ID, non-existent, negative, decimal)
- **POST** — create order (validation: missing/required fields per field, invalid types for user_id/product_id/quantity/total, non-existent FK references)
- **PUT** — update order (partial updates, FK validation, data unchanged after failed update)
- **DELETE** — delete order (idempotency, invalid IDs)

Each test validates:
- HTTP status code
- Response body structure and types
- Response time (< 1000ms)
- `Content-Type: application/json` header

## Test Architecture

- **Clients** (`tests/api/clients/`) — wrap Playwright's `APIRequestContext` for each resource, providing typed methods and response time tracking
- **Helpers** (`tests/api/helpers/`) — reusable assertions for responses, users, and products, plus a **teardown helper** that connects directly to PostgreSQL (via `.env`) to delete test data
- **Models** (`tests/api/models/`) — TypeScript interfaces for `Product`, `User`, and `Order`
- **Tests** (`tests/api/tests/`) — Playwright test specs organized by HTTP method

### Test Data Convention

All generated test data uses names containing **"Test"** (e.g. `"Test User"`, `"Test New Product"`).  
The `teardown_helper.ts` leverages this convention to clean the database by deleting records where `name ILIKE '%test%'`.

---

## Português <a id="portugues"></a>

Este projeto é, antes de tudo, um **estudo sobre testes de API com Playwright**. A API é intencionalmente mínima — um scaffold básico com Express + PostgreSQL criado apenas para dar aos testes algo onde rodar. O foco real é a suíte de testes, não a API.

A API está no diretório `api/` — veja o [README](api/README.md) para detalhes de configuração e endpoints.

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando
- Servidor da API rodando em `http://localhost:3000`

## Configuração

```bash
npm install
```

Configure o banco via `.env` (veja `.env.example`), então inicie o servidor:

```bash
npm run server
```

## Executando os Testes

Os testes rodam com **2 workers paralelos** por padrão (`workers: 2` no `playwright.config.ts`).

```bash
# Rodar todos os testes
npm test

# Rodar testes por endpoint
npm run test:get-products
npm run test:post-product
npm run test:put-product
npm run test:delete-product
npm run test:get-user
npm run test:post-user
npm run test:put-user
npm run test:delete-user
npm run test:get-orders
npm run test:get-order-by-id
npm run test:post-order
npm run test:put-order
npm run test:delete-order
```

## Pipeline CI

O repositório inclui um workflow do GitHub Actions (`.github/workflows/ci.yml`) que:

1. Inicia um container **PostgreSQL 16** com health checks
2. Instala as dependências com `npm ci`
3. Sobe o **servidor da API** em background
4. **Verifica** `http://localhost:3000/` até a API responder (até 60s)
5. Executa a suíte completa de testes com **4 workers paralelos** (`--workers=4`) — **sem download de navegadores** já que os testes são apenas de API

## Estrutura do Projeto

```
tests/api/
├── clients/          # Wrappers de requisição (ProductsClient, UsersClient, OrdersClient)
├── helpers/          # Asserções reutilizáveis (response, user, product, order)
├── models/           # Interfaces TypeScript (Product, User, Order)
└── tests/            # Specs de teste (products.spec.ts, users.spec.ts, orders.spec.ts)
```

## Cobertura de Testes

A suíte de testes cobre **operações CRUD** para três recursos:

### Produtos (`/products`)
- **GET** — listar todos, buscar por ID (casos de erro: ID inválido, inexistente, negativo, decimal)
- **POST** — criar produto (validação: campos ausentes, nome não-string, preço inválido, preço negativo, descrição não-string)
- **PUT** — atualizar produto (atualização parcial, validação de campos, ID inexistente)
- **DELETE** — excluir produto (idempotência, IDs inválidos)

### Usuários (`/users`)
- **GET** — buscar por ID (casos de erro: ID inválido, inexistente, negativo, decimal)
- **POST** — criar usuário (validação: campos vazios/ausentes, email inválido, email duplicado)
- **PUT** — atualizar usuário (atualização parcial, email duplicado, validação de campos)
- **DELETE** — excluir usuário (idempotência, IDs inválidos)

### Pedidos (`/orders`)
- **GET** — listar todos os pedidos (inclui dados do usuário e produto via JOIN), buscar por ID (casos de erro: ID inválido, inexistente, negativo, decimal)
- **POST** — criar pedido (validação: campo ausente por campo, tipos inválidos para user_id/product_id/quantity/total, referência FK inexistente)
- **PUT** — atualizar pedido (atualização parcial, validação de FK, dados inalterados após falha)
- **DELETE** — excluir pedido (idempotência, IDs inválidos)

Cada teste valida:
- Código de status HTTP
- Estrutura e tipos do corpo da resposta
- Tempo de resposta (< 1000ms)
- Cabeçalho `Content-Type: application/json`

## Arquitetura dos Testes

- **Clients** (`tests/api/clients/`) — encapsulam o `APIRequestContext` do Playwright para cada recurso, com métodos tipados e medição de tempo de resposta
- **Helpers** (`tests/api/helpers/`) — asserções reutilizáveis para respostas, usuários e produtos, além de um **teardown helper** que conecta direto no PostgreSQL (via `.env`) para limpar dados de teste
- **Models** (`tests/api/models/`) — interfaces TypeScript para `Product`, `User` e `Order`
- **Tests** (`tests/api/tests/`) — specs do Playwright organizados por método HTTP

### Convenção de Dados de Teste

Todos os dados gerados nos testes usam nomes contendo **"Test"** (ex.: `"Test User"`, `"Test New Product"`).  
O `teardown_helper.ts` aproveita essa convenção para limpar o banco excluindo registros onde `name ILIKE '%test%'`.