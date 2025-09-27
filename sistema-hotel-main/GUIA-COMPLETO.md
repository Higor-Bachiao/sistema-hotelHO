# 🏨 **SISTEMA DE GERENCIAMENTO HOTELEIRO - GUIA COMPLETO**

## 📋 **ÍNDICE**
1. [O que é o Sistema](#o-que-é-o-sistema)
2. [Arquitetura Geral](#arquitetura-geral)
3. [Frontend (Interface do Usuário)](#frontend-interface-do-usuário)
4. [Backend (API)](#backend-api)
5. [Banco de Dados](#banco-de-dados)
6. [Como Tudo se Conecta](#como-tudo-se-conecta)
7. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
8. [Estrutura de Pastas](#estrutura-de-pastas)
9. [Tecnologias Utilizadas](#tecnologias-utilizadas)
10. [Como Executar](#como-executar)

---

## 🎯 **O QUE É O SISTEMA**

Este é um **Sistema Completo de Gerenciamento Hoteleiro** que permite:

### **👑 Para o ADMINISTRADOR:**
- ✅ **Gerenciar quartos** (adicionar, editar, excluir)
- ✅ **Controlar reservas** (check-in, check-out)
- ✅ **Ver estatísticas** em tempo real
- ✅ **Histórico de hóspedes**
- ✅ **Dashboard administrativo**

### **👤 Para o CLIENTE:**
- ✅ **Ver quartos disponíveis**
- ✅ **Fazer reservas**
- ✅ **Ver preços e amenidades**
- ✅ **Interface responsiva** (celular/desktop)

---

## 🏗️ **ARQUITETURA GERAL**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │◄──►│    BACKEND      │◄──►│   BANCO DADOS   │
│   (Next.js)     │    │   (Node.js)     │    │   (Supabase)    │
│                 │    │                 │    │                 │
│ • Interface     │    │ • API REST      │    │ • PostgreSQL    │
│ • Páginas       │    │ • Autenticação  │    │ • Tabelas       │
│ • Componentes   │    │ • Validação     │    │ • Relacionamen. │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                        ▲                        ▲
        │                        │                        │
   📱 USUÁRIO              🔌 REQUISIÇÕES           💾 ARMAZENAMENTO
```

---

## 🖥️ **FRONTEND (INTERFACE DO USUÁRIO)**

### **📁 Estrutura:**
```
app/                    ← Páginas principais
├── page.tsx           ← Página inicial (dashboard)
├── layout.tsx         ← Layout geral
└── globals.css        ← Estilos globais

components/            ← Componentes reutilizáveis
├── dashboard/         ← Painéis e estatísticas
├── rooms/             ← Gestão de quartos
├── reservations/      ← Sistema de reservas
├── admin/             ← Painel administrativo
├── auth/              ← Login/autenticação
├── layout/            ← Header, navbar
└── ui/                ← Componentes básicos (botões, cards)
```

### **🎨 O que faz:**
- **Mostra a interface** que o usuário vê
- **Coleta dados** dos formulários
- **Envia requisições** para a API
- **Exibe resultados** de forma bonita
- **Responsivo** para mobile/desktop

### **⚙️ Tecnologias:**
- **Next.js 15** → Framework React
- **TypeScript** → Tipagem segura
- **Tailwind CSS** → Estilos modernos
- **Radix UI** → Componentes acessíveis

---

## 🔧 **BACKEND (API)**

### **📁 Estrutura:**
```
api/
├── src/
│   ├── server.ts           ← Servidor principal
│   ├── config/
│   │   └── database.ts     ← Conexão Supabase
│   ├── controllers/        ← Lógica de negócio
│   │   ├── hotel.controller.ts
│   │   └── auth.controller.ts
│   ├── routes/             ← Rotas da API
│   │   ├── hotel.routes.ts
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── services/           ← Operações do banco
│   │   ├── hotel.service.ts
│   │   └── auth.service.ts
│   ├── middlewares/        ← Validações
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   └── types/              ← Tipos TypeScript
│       └── index.ts
```

### **🔌 O que faz:**
- **Recebe requisições** do frontend
- **Valida dados** enviados
- **Conecta com banco** de dados
- **Processa regras** de negócio
- **Retorna respostas** em JSON

### **🌐 Rotas Principais:**
```
GET    /api/rooms              ← Listar quartos
POST   /api/rooms              ← Criar quarto
PUT    /api/rooms/:id          ← Atualizar quarto
DELETE /api/rooms/:id          ← Deletar quarto

GET    /api/reservations       ← Listar reservas
POST   /api/reservations       ← Criar reserva
PUT    /api/reservations/:id   ← Atualizar reserva

GET    /api/guest-history      ← Histórico hóspedes
POST   /api/guest-history      ← Adicionar hóspede
PUT    /api/guest-history/:id  ← Atualizar status

GET    /api/statistics         ← Estatísticas do hotel
```

### **⚙️ Tecnologias:**
- **Node.js** → Runtime JavaScript
- **Express.js** → Framework web
- **TypeScript** → Tipagem segura
- **Supabase Client** → Conexão banco

---

## 💾 **BANCO DE DADOS**

### **🗄️ Plataforma:** Supabase (PostgreSQL na nuvem)

### **📊 Tabelas:**
```sql
-- Tabela de Quartos
rooms
├── id (UUID)              ← Identificador único
├── number (VARCHAR)       ← Número do quarto
├── type (VARCHAR)         ← Tipo (Solteiro, Casal, etc.)
├── capacity (INTEGER)     ← Capacidade pessoas
├── beds (INTEGER)         ← Número de camas
├── price (DECIMAL)        ← Preço por noite
├── amenities (JSON)       ← Comodidades [wifi, tv, etc.]
├── status (VARCHAR)       ← Status (available, occupied, etc.)
├── created_at (TIMESTAMP) ← Data criação
└── updated_at (TIMESTAMP) ← Data atualização

-- Tabela de Histórico de Hóspedes
guest_history
├── id (UUID)              ← Identificador único
├── guest_name (VARCHAR)   ← Nome do hóspede
├── guest_document (VARCHAR) ← CPF/documento
├── guest_phone (VARCHAR)  ← Telefone
├── guest_email (VARCHAR)  ← Email
├── room_id (UUID)         ← ID do quarto (FK)
├── room_number (VARCHAR)  ← Número do quarto
├── room_type (VARCHAR)    ← Tipo do quarto
├── check_in (TIMESTAMP)   ← Data check-in
├── check_out (TIMESTAMP)  ← Data check-out
├── total_price (DECIMAL)  ← Valor total
├── status (VARCHAR)       ← Status (active, completed, cancelled)
├── created_at (TIMESTAMP) ← Data criação
└── updated_at (TIMESTAMP) ← Data atualização

-- Tabela de Usuários (para autenticação)
users
├── id (UUID)              ← Identificador único
├── name (VARCHAR)         ← Nome completo
├── email (VARCHAR)        ← Email (único)
├── password_hash (VARCHAR) ← Senha criptografada
├── role (VARCHAR)         ← Função (admin, user)
├── created_at (TIMESTAMP) ← Data criação
└── updated_at (TIMESTAMP) ← Data atualização
```

### **🔗 Relacionamentos:**
- `guest_history.room_id` → `rooms.id`
- Um quarto pode ter vários históricos
- Um histórico pertence a um quarto

---

## 🔄 **COMO TUDO SE CONECTA**

### **1. USUÁRIO ACESSA O SITE:**
```
Usuário → Frontend (Next.js) → Exibe interface
```

### **2. USUÁRIO INTERAGE:**
```
Usuário clica → Frontend captura → Faz requisição HTTP
```

### **3. COMUNICAÇÃO:**
```
Frontend → HTTP Request → Backend (API) → Supabase → Banco de Dados
```

### **4. RESPOSTA:**
```
Banco de Dados → Supabase → Backend → JSON Response → Frontend → Interface atualizada
```

---

## 🚀 **FLUXO DE FUNCIONAMENTO**

### **📋 EXEMPLO: FAZER UMA RESERVA**

#### **1. Frontend (O que o usuário vê):**
```typescript
// components/reservations/reservation-form.tsx
const handleSubmit = async (data) => {
  // Coleta dados do formulário
  const reservationData = {
    guestName: data.name,
    roomId: selectedRoom.id,
    checkIn: data.checkIn,
    checkOut: data.checkOut
  }
  
  // Envia para API
  const response = await fetch('/api/guest-history', {
    method: 'POST',
    body: JSON.stringify(reservationData)
  })
}
```

#### **2. Backend (Processa a requisição):**
```typescript
// api/src/controllers/hotel.controller.ts
export const createGuestHistory = async (req, res) => {
  // Valida dados recebidos
  const { guestName, roomId, checkIn, checkOut } = req.body
  
  // Chama service para salvar
  const result = await HotelService.createGuestHistory(data)
  
  // Retorna resposta
  res.json({ success: true, data: result })
}
```

#### **3. Service (Conecta com banco):**
```typescript
// api/src/services/hotel.service.ts
export const createGuestHistory = async (data) => {
  // Conecta com Supabase
  const { data: result, error } = await supabase
    .from('guest_history')
    .insert(data)
    .select()
  
  return result
}
```

#### **4. Banco de Dados:**
```sql
-- Supabase executa:
INSERT INTO guest_history (
  guest_name, room_id, check_in, check_out, status
) VALUES (
  'João Silva', 'uuid-123', '2025-01-01', '2025-01-05', 'active'
);
```

#### **5. Resposta volta:**
```
Banco → Service → Controller → Frontend → Interface atualizada
```

---

## 📂 **ESTRUTURA DE PASTAS COMPLETA**

```
sistema-hotel-main/
├── 📄 package.json           ← Dependências e scripts
├── 📄 next.config.mjs        ← Configuração Next.js
├── 📄 tailwind.config.js     ← Configuração Tailwind
├── 📄 tsconfig.json          ← Configuração TypeScript
├── 📄 .env.local             ← Variáveis ambiente (local)
├── 📄 .env.production        ← Variáveis ambiente (produção)
├── 📄 netlify.toml           ← Configuração Netlify
├── 📄 vercel.json            ← Configuração Vercel
├── 📄 Dockerfile             ← Configuração Docker
├── 📄 README.md              ← Documentação
│
├── 📁 app/                   ← PÁGINAS PRINCIPAIS
│   ├── layout.tsx            ← Layout geral da aplicação
│   ├── page.tsx              ← Página inicial (dashboard)
│   └── globals.css           ← Estilos globais
│
├── 📁 components/            ← COMPONENTES REUTILIZÁVEIS
│   ├── 📁 dashboard/         ← Painéis e estatísticas
│   │   └── statistics-panel.tsx
│   ├── 📁 rooms/             ← Gestão de quartos
│   │   ├── room-card.tsx
│   │   ├── room-grid.tsx
│   │   └── room-filters.tsx
│   ├── 📁 reservations/      ← Sistema de reservas
│   │   ├── reservation-form.tsx
│   │   └── future-reservations-list.tsx
│   ├── 📁 admin/             ← Painel administrativo
│   │   ├── admin-panel.tsx
│   │   └── admin-panel-new.tsx
│   ├── 📁 auth/              ← Autenticação
│   │   └── login-form.tsx
│   ├── 📁 layout/            ← Layout components
│   │   └── navbar.tsx
│   └── 📁 ui/                ← Componentes básicos
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ componentes)
│
├── 📁 contexts/              ← GERENCIAMENTO DE ESTADO
│   ├── auth-context.tsx      ← Estado autenticação
│   ├── hotel-context.tsx     ← Estado principal do hotel
│   └── hotel-context-api.tsx ← Conexão com API
│
├── 📁 hooks/                 ← HOOKS CUSTOMIZADOS
│   ├── use-api-statistics.ts ← Hook para estatísticas
│   ├── use-mobile.tsx        ← Hook para mobile
│   └── use-toast.ts          ← Hook para notificações
│
├── 📁 lib/                   ← BIBLIOTECAS E UTILITÁRIOS
│   ├── utils.ts              ← Funções utilitárias
│   ├── date-utils.ts         ← Manipulação de datas
│   ├── price-utils.ts        ← Cálculos de preços
│   ├── network-utils.ts      ← Detecção de rede
│   ├── hotel-service.ts      ← Serviços do hotel
│   └── 📁 api/
│       └── client.ts         ← Cliente HTTP
│
├── 📁 types/                 ← TIPOS TYPESCRIPT
│   └── hotel.ts              ← Tipos do sistema
│
├── 📁 public/                ← ARQUIVOS ESTÁTICOS
│   ├── placeholder-logo.png
│   └── placeholder.jpg
│
├── 📁 styles/                ← ESTILOS ADICIONAIS
│   └── globals.css
│
└── 📁 api/                   ← BACKEND (API)
    ├── 📄 package.json       ← Dependências API
    ├── 📄 tsconfig.json      ← Config TypeScript API
    ├── 📄 .env               ← Variáveis ambiente API
    ├── 📄 .env.example       ← Exemplo variáveis
    │
    ├── 📁 src/               ← CÓDIGO FONTE
    │   ├── server.ts         ← Servidor principal
    │   │
    │   ├── 📁 config/        ← CONFIGURAÇÕES
    │   │   └── database.ts   ← Conexão Supabase
    │   │
    │   ├── 📁 controllers/   ← CONTROLADORES
    │   │   ├── hotel.controller.ts
    │   │   └── auth.controller.ts
    │   │
    │   ├── 📁 routes/        ← ROTAS
    │   │   ├── index.ts      ← Rotas principais
    │   │   ├── hotel.routes.ts
    │   │   ├── auth.routes.ts
    │   │   └── guest-history.routes.ts
    │   │
    │   ├── 📁 services/      ← SERVIÇOS
    │   │   ├── hotel.service.ts
    │   │   └── auth.service.ts
    │   │
    │   ├── 📁 middlewares/   ← MIDDLEWARES
    │   │   ├── error.middleware.ts
    │   │   └── validation.middleware.ts
    │   │
    │   └── 📁 types/         ← TIPOS API
    │       └── index.ts
    │
    ├── 📁 scripts/           ← SCRIPTS SQL
    │   ├── 001_create_tables.sql
    │   ├── 002_seed_rooms.sql
    │   ├── 003_add_users_and_uuid.sql
    │   └── 003_create_guest_history.sql
    │
    └── 📁 dist/              ← CÓDIGO COMPILADO
        └── ... (gerado automaticamente)
```

---

## 🛠️ **TECNOLOGIAS UTILIZADAS**

### **🖥️ FRONTEND:**
- **Next.js 15** → Framework React moderno
- **React 19** → Biblioteca de interface
- **TypeScript** → Tipagem estática
- **Tailwind CSS** → Framework CSS utilitário
- **Radix UI** → Componentes acessíveis
- **Lucide React** → Ícones modernos
- **Date-fns** → Manipulação de datas
- **React Hook Form** → Formulários performáticos
- **Zod** → Validação de esquemas

### **🔧 BACKEND:**
- **Node.js** → Runtime JavaScript
- **Express.js** → Framework web minimalista
- **TypeScript** → Tipagem estática
- **Supabase Client** → Cliente banco de dados
- **CORS** → Controle de acesso
- **Dotenv** → Variáveis de ambiente

### **💾 BANCO DE DADOS:**
- **Supabase** → Backend-as-a-Service
- **PostgreSQL** → Banco relacional
- **Row Level Security** → Segurança de dados

### **🚀 DEPLOYMENT:**
- **Vercel** → Hosting frontend
- **Netlify** → Hosting estático
- **Railway** → Hosting fullstack
- **Docker** → Containerização
- **PM2** → Gerenciador de processos

---

## 🏃‍♂️ **COMO EXECUTAR**

### **🔧 PRÉ-REQUISITOS:**
- Node.js 18+ instalado
- Git instalado
- Conta no Supabase (grátis)

### **1. CLONAR PROJETO:**
```bash
git clone https://github.com/seu-usuario/sistema-hotel.git
cd sistema-hotel
```

### **2. INSTALAR DEPENDÊNCIAS:**
```bash
npm run install:all
# ou separadamente:
npm install              # Frontend
cd api && npm install   # Backend
```

### **3. CONFIGURAR AMBIENTE:**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend (api/.env)
NODE_ENV=development
PORT=3001
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
CORS_ORIGIN=http://localhost:3000
```

### **4. CONFIGURAR BANCO DE DADOS:**
1. Criar conta no [Supabase](https://supabase.com)
2. Criar novo projeto
3. Executar scripts SQL na ordem:
   - `api/scripts/001_create_tables.sql`
   - `api/scripts/002_seed_rooms.sql`
   - `api/scripts/003_add_users_and_uuid.sql`

### **5. EXECUTAR:**
```bash
# Desenvolvimento (roda frontend + backend)
npm run dev:full

# Ou separadamente:
npm run api:dev    # Backend na porta 3001
npm run dev        # Frontend na porta 3000
```

### **6. ACESSAR:**
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api

---

## 🎯 **FUNCIONALIDADES PRINCIPAIS**

### **📊 DASHBOARD:**
- Estatísticas em tempo real
- Gráficos de ocupação
- Resumo financeiro
- Status dos quartos

### **🏠 GESTÃO DE QUARTOS:**
- Listar todos os quartos
- Adicionar novos quartos
- Editar informações
- Definir preços e amenidades
- Controlar status (disponível, ocupado, manutenção)

### **📅 SISTEMA DE RESERVAS:**
- Fazer check-in de hóspedes
- Calcular preços automaticamente
- Histórico completo de reservas
- Controle de check-out

### **👥 GERENCIAMENTO DE HÓSPEDES:**
- Cadastro completo (nome, CPF, telefone, email)
- Histórico de estadias
- Status de reservas (ativa, concluída, cancelada)

### **📱 INTERFACE RESPONSIVA:**
- Funciona perfeitamente no celular
- Design moderno e intuitivo
- Componentes acessíveis
- Tema claro/escuro

### **🔒 SEGURANÇA:**
- Validação de dados
- Headers de segurança
- CORS configurado
- Tratamento de erros

---

## 🎉 **RESUMO FINAL**

Este é um **Sistema Completo de Gerenciamento Hoteleiro** que funciona como uma aplicação web moderna:

1. **Interface bonita** (Frontend Next.js)
2. **API robusta** (Backend Node.js)
3. **Banco confiável** (Supabase PostgreSQL)
4. **Deploy fácil** (múltiplas opções)
5. **Código limpo** (TypeScript, boas práticas)

**É como ter um software de hotel profissional, mas web-based, moderno e totalmente customizável!** 🏆

Qualquer dúvida específica sobre alguma parte, é só perguntar! 😊