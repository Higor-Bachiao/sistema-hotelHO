# 🚀 **SETUP EM NOVO PC - GUIA RÁPIDO**

## 📋 **CHECKLIST COMPLETO:**

### **✅ PRÉ-REQUISITOS:**
- [ ] Node.js 18+ instalado ([nodejs.org](https://nodejs.org))
- [ ] Git instalado
- [ ] Internet funcionando

### **✅ PROCESSO AUTOMÁTICO (RECOMENDADO):**

#### **Windows:**
```cmd
git clone https://github.com/Higor-Bachiao/sistema-hotelHO.git
cd sistema-hotelHO/sistema-hotel-main
setup.bat
```

#### **Mac/Linux:**
```bash
git clone https://github.com/Higor-Bachiao/sistema-hotelHO.git
cd sistema-hotelHO/sistema-hotel-main
chmod +x setup.sh
./setup.sh
```

### **✅ PROCESSO MANUAL:**

#### **1. Clonar projeto:**
```bash
git clone https://github.com/Higor-Bachiao/sistema-hotelHO.git
cd sistema-hotelHO/sistema-hotel-main
```

#### **2. Instalar dependências:**
```bash
npm run install:all
```

#### **3. Criar arquivos .env:**

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

**Backend (api/.env):**
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Supabase
SUPABASE_URL=https://yvwfgtyrqzfbukmhcgas.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2d2ZndHlycXpmYnVrbWhjZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU4NDA2OCwiZXhwIjoyMDc0MTYwMDY4fQ.7O5ZD4s3qG3HicEEpiWvJuyfqQy3HniM84B3OozcM1s
```

#### **4. Testar:**
```bash
npm run build:all    # Testar se compila
npm run dev:full     # Rodar projeto
```

---

## 🌐 **CONFIGURAÇÕES DE REDE:**

### **Para acessar de outros dispositivos:**

#### **Descobrir seu IP:**
```bash
# Windows:
ipconfig | findstr IPv4

# Mac/Linux:
ifconfig | grep inet
```

#### **Atualizar .env files:**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://SEU_IP:3001/api

# api/.env
CORS_ORIGIN=http://localhost:3000,http://SEU_IP:3000
```

---

## 🔧 **COMANDOS PRINCIPAIS:**

### **Desenvolvimento:**
```bash
npm run dev:full     # Frontend + Backend
npm run dev          # Apenas frontend
npm run api:dev      # Apenas backend
```

### **Build/Deploy:**
```bash
npm run build:all        # Build completo
npm run build:vercel     # Para Vercel
npm run build:netlify    # Para Netlify
npm run build:hostinger  # Para Hostinger
```

### **Utilitários:**
```bash
npm run clean:windows    # Limpar builds (Windows)
npm run type-check       # Verificar tipos
npm run lint            # Verificar código
```

---

## ⚠️ **PROBLEMAS COMUNS:**

### **"npm not found":**
- Instalar Node.js: https://nodejs.org

### **"Port 3000 already in use":**
```bash
# Windows:
netstat -ano | findstr :3000  # Ver processos
taskkill /PID número_do_pid /F  # Matar processo

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### **Erro de permissão (Mac/Linux):**
```bash
chmod +x setup.sh
```

### **Erro de dependências:**
```bash
rm -rf node_modules package-lock.json
rm -rf api/node_modules api/package-lock.json
npm run install:all
```

---

## 🎯 **RESUMO:**

### **O QUE VOCÊ PRECISA RECRIAR:**
- ✅ **Arquivos .env** (obrigatório)
- ✅ **Instalar dependências** (npm install)
- ✅ **Configurar IPs** (se necessário)

### **O QUE NÃO PRECISA:**
- ❌ **Banco de dados** (Supabase na nuvem)
- ❌ **Código fonte** (vem do Git)
- ❌ **Configurações** (já estão no projeto)

**Em 90% dos casos, só precisa rodar o script `setup.bat` e pronto! 🚀**