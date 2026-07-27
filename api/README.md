# E-commerce API

[🇬🇧 English](#english) · [🇧🇷 Português](#portugues)

---

## English <a id="english"></a>

Express + PostgreSQL REST API for products and users.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or remotely)

## Setup

```bash
# Install dependencies (from project root)
npm install

# Configure database via environment variables (optional, defaults below):
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_USER=postgres
#   DB_PASSWORD=postgres
#   DB_NAME=ecommerce
```

Create the database if it doesn't exist:

```bash
psql -U postgres -c "CREATE DATABASE ecommerce;"
```

## Run

```bash
npx tsx api/src/server.ts
```

Tables (`products`, `users`, `orders`) are created automatically on startup.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List all products |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/orders` | List all orders (includes user and product details) |
| GET | `/orders/:id` | Get order by ID |
| POST | `/orders` | Create order |
| PUT | `/orders/:id` | Update order |
| DELETE | `/orders/:id` | Delete order |

### Example requests

```bash
# Create a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","price":2999.99,"description":"16GB RAM, 512GB SSD"}'

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Create an order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2,"total":"39.98"}'
```

---

## Português <a id="portugues"></a>

API REST com Express + PostgreSQL para produtos e usuários.

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou remotamente)

### Configuração

```bash
# Instalar dependências (da raiz do projeto)
npm install

# Configurar banco via variáveis de ambiente (opcional, valores padrão abaixo):
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_USER=postgres
#   DB_PASSWORD=postgres
#   DB_NAME=ecommerce
```

Crie o banco de dados se não existir:

```bash
psql -U postgres -c "CREATE DATABASE ecommerce;"
```

### Executar

```bash
npx tsx api/src/server.ts
```

As tabelas (`products`, `users`, `orders`) são criadas automaticamente na inicialização.

### Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/products` | Listar todos os produtos |
| GET | `/products/:id` | Buscar produto por ID |
| POST | `/products` | Criar produto |
| PUT | `/products/:id` | Atualizar produto |
| DELETE | `/products/:id` | Excluir produto |
| POST | `/users` | Criar usuário |
| GET | `/users/:id` | Buscar usuário por ID |
| PUT | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Excluir usuário |
| GET | `/orders` | Listar todos os pedidos (inclui detalhes do usuário e produto) |
| GET | `/orders/:id` | Buscar pedido por ID |
| POST | `/orders` | Criar pedido |
| PUT | `/orders/:id` | Atualizar pedido |
| DELETE | `/orders/:id` | Excluir pedido |

### Exemplos de requisição

```bash
# Criar um produto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook","price":2999.99,"description":"16GB RAM, 512GB SSD"}'

# Criar um usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com"}'

# Criar um pedido
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2,"total":"39.98"}'
```
