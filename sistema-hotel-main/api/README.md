# API do Sistema de Hotel

Esta é uma API simplificada para gerenciar um sistema de hotel usando Node.js, TypeScript e Supabase.

## 🚀 Configuração

### 1. Instalar Dependências

```bash
cd api
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `api` com:

```env
SUPABASE_URL=https://tvnxpqdivtyxdkmjjdyb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bnhwcWRpdnR5eGRrbWpqZHliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzY1NDEyOCwiZXhwIjoyMDUzMjMwMTI4fQ.Qs2lX3o0nBJJZo8tPjLm0JlFLUo8QokPsZwUgfN1LAY
PORT=5000
NODE_ENV=development
```

Configure as seguintes variáveis no arquivo `.env`:

```env
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://ulsrvmysrxlakbwgnrsh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsc3J2bXlzcnhsYWtid2ducnNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjA0OSwiZXhwIjoyMDczNzc4MDQ5fQ.ippCq5Rg1uiy5UqeS5t9agOblVa3lb8IIwRf7ztaj6I

# JWT
JWT_SECRET=hotel_system_jwt_secret_2024_secure_key_32chars
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configurar banco de dados

Execute os scripts SQL no seu Supabase na seguinte ordem:

1. `scripts/001_create_tables.sql` - Cria as tabelas básicas
2. `scripts/002_seed_rooms.sql` - Popula os quartos iniciais
3. `scripts/003_add_users_and_uuid.sql` - Adiciona tabela de usuários e ajusta para UUID

### 4. Executar a API

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📡 Endpoints

### Autenticação (`/api/auth`)

#### POST `/api/auth/login`
Fazer login no sistema.

**Body:**
```json
{
  "email": "admin@hotel.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@hotel.com",
      "name": "Administrador",
      "role": "admin"
    },
    "token": "jwt_token"
  }
}
```

#### GET `/api/auth/profile`
Obter perfil do usuário logado.

**Headers:** `Authorization: Bearer {token}`

#### PUT `/api/auth/change-password`
Alterar senha do usuário logado.

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha"
}
```

#### POST `/api/auth/register` (Admin apenas)
Registrar novo usuário.

#### GET `/api/auth/users` (Admin apenas)
Listar todos os usuários.

### Hotel (`/api/hotel`)

#### GET `/api/hotel/rooms`
Listar todos os quartos com filtros opcionais.

**Query params:**
- `type` - Tipo do quarto
- `status` - Status do quarto
- `minPrice` - Preço mínimo
- `maxPrice` - Preço máximo

#### GET `/api/hotel/rooms/:id`
Obter quarto por ID.

#### POST `/api/hotel/rooms` (Autenticado)
Criar novo quarto.

**Body:**
```json
{
  "number": "101",
  "type": "Standard",
  "capacity": 2,
  "beds": 1,
  "price": 150.00,
  "amenities": ["TV", "WiFi", "Ar condicionado"],
  "status": "available"
}
```

#### PUT `/api/hotel/rooms/:id` (Autenticado)
Atualizar quarto.

#### DELETE `/api/hotel/rooms/:id` (Admin apenas)
Deletar quarto.

#### GET `/api/hotel/reservations/future`
Listar reservas futuras.

#### POST `/api/hotel/reservations` (Autenticado)
Criar nova reserva.

**Body:**
```json
{
  "roomId": "uuid",
  "guest": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "cpf": "123.456.789-00",
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-20",
    "guests": 2
  }
}
```

#### PUT `/api/hotel/reservations/:id/cancel` (Autenticado)
Cancelar reserva.

#### PUT `/api/hotel/reservations/:id/checkin` (Autenticado)
Fazer check-in.

#### PUT `/api/hotel/reservations/:id/checkout` (Autenticado)
Fazer check-out.

#### GET `/api/hotel/statistics`
Obter estatísticas do hotel.

#### POST `/api/hotel/guests/:guestId/expenses` (Autenticado)
Adicionar despesa ao hóspede.

#### GET `/api/hotel/guests/:guestId/expenses`
Listar despesas do hóspede.

### Health Check

#### GET `/api/health`
Verificar se a API está funcionando.

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer {seu_jwt_token}
```

### Níveis de Acesso

- **Público**: Rotas de leitura básica (quartos, estatísticas)
- **Staff**: Operações de hotel (criar reservas, check-in/out)
- **Admin**: Gerenciamento completo (criar/deletar quartos, gerenciar usuários)

## 🏗️ Arquitetura

```
src/
├── config/          # Configurações (database, env)
├── controllers/     # Controladores das rotas
├── middlewares/     # Middlewares (auth, validation, error)
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
├── types/           # Tipos TypeScript
└── server.ts        # Arquivo principal
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executar em modo desenvolvimento
- `npm run build` - Compilar TypeScript
- `npm start` - Executar versão compilada
- `npm test` - Executar testes

## 🌐 Integração com Frontend

Para integrar com o frontend Next.js, configure a variável `CORS_ORIGIN` para `http://localhost:3000` em desenvolvimento.

A API estará disponível em `http://localhost:3001/api`.

## 📝 Usuário Padrão

**Email:** admin@hotel.com  
**Senha:** admin123

## 🚨 Segurança

- Rate limiting configurado
- Helmet para headers de segurança
- CORS configurado
- Senhas hasheadas com bcrypt
- JWT com expiração configurável
- Validação de dados com Zod