# 🚀 **GUIA DE HOSPEDAGEM - SISTEMA HOTEL**

## ✅ **PROBLEMAS CORRIGIDOS:**

### 1. **Configuração Next.js**
- ❌ Estava como site estático (`output: 'export'`)  
- ✅ Agora permite funcionalidades de servidor

### 2. **Variáveis de Ambiente**
- ✅ Criado `.env.production` para produção
- ✅ Criado `.env.example` como template
- ✅ CORS configurado adequadamente

### 3. **Arquivos de Deploy**
- ✅ `vercel.json` criado para Vercel  
- ✅ `Dockerfile` criado para Docker
- ✅ `docker-compose.yml` para containers

---

## 🏗️ **OPÇÕES DE HOSPEDAGEM:**

### **OPÇÃO 1: VERCEL (RECOMENDADO)**

1. **Preparar projeto:**
```bash
# Fazer build de teste
npm run build:all

# Verificar se não há erros
npm run type-check
```

2. **Configurar variáveis no Vercel:**
```env
NEXT_PUBLIC_API_URL=https://seu-projeto.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://seu-projeto.vercel.app
NODE_ENV=production
SUPABASE_URL=https://yvwfgtyrqzfbukmhcgas.supabase.co
SUPABASE_KEY=sua_chave_aqui
CORS_ORIGIN=https://seu-projeto.vercel.app
```

3. **Deploy:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### **OPÇÃO 2: NETLIFY**

1. **Configurar build:**
   - Build command: `npm run build`  
   - Publish directory: `out`

2. **Variáveis de ambiente:**
   - Mesmo que Vercel acima

### **OPÇÃO 3: DOCKER/VPS**

```bash
# Build e executar
docker-compose up -d

# Ou individual:
docker build -t hotel-system .
docker run -p 3000:3000 -p 3001:3001 hotel-system
```

---

## 🔧 **CONFIGURAÇÕES CRÍTICAS:**

### **API Backend:**
- ✅ CORS configurado por ambiente
- ✅ Variáveis de ambiente separadas
- ✅ Build TypeScript funcionando

### **Frontend:**
- ✅ Next.js configurado para produção
- ✅ Imagens otimizadas
- ✅ Rotas dinâmicas funcionando

### **Banco de Dados:**
- ✅ Supabase já configurado
- ✅ Scripts SQL prontos

---

## 🚨 **ANTES DE HOSPEDAR:**

1. **Atualizar URLs:**
   - Substituir `192.168.100.155` pelas URLs de produção
   - Configurar CORS_ORIGIN corretamente

2. **Testar localmente:**
```bash
# Testar build
npm run build:all

# Testar produção local
npm run start:production
```

3. **Verificar Supabase:**
   - RLS (Row Level Security) configurado
   - Chaves de API válidas
   - Tabelas criadas

---

## 📋 **CHECKLIST FINAL:**

- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas  
- [ ] CORS permitindo domínio de produção
- [ ] Supabase funcionando
- [ ] Imagens otimizadas
- [ ] SSL/HTTPS configurado
- [ ] Domínio customizado (se necessário)

---

## 🆘 **POSSÍVEIS ERROS E SOLUÇÕES:**

### **Erro: "API não encontrada"**
- Verificar NEXT_PUBLIC_API_URL
- Verificar se API está online

### **Erro: "CORS blocked"**  
- Adicionar domínio em CORS_ORIGIN
- Verificar protocolo (http/https)

### **Erro: "Database connection"**
- Verificar SUPABASE_URL e SUPABASE_KEY
- Verificar se tabelas existem

### **Erro: "Build failed"**
- Rodar `npm run type-check`
- Verificar imports/exports
- Verificar dependências

---

✅ **AGORA SEU PROJETO ESTÁ PRONTO PARA HOSPEDAGEM!** 🎉