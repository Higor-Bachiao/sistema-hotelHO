# 🚀 **DEPLOY UNIVERSAL - TODAS AS PLATAFORMAS**

## 📋 **PLATAFORMAS SUPORTADAS:**
- ✅ Vercel
- ✅ Netlify  
- ✅ Hostinger
- ✅ Railway
- ✅ Render
- ✅ Docker (VPS)
- ✅ Heroku

---

## 🔧 **VERCEL**

### **Deploy Automático:**
```bash
# Instalar CLI
npm install -g vercel

# Deploy
vercel --prod
```

### **Variáveis de Ambiente:**
```env
NEXT_PUBLIC_API_URL=https://seu-projeto.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://seu-projeto.vercel.app
NODE_ENV=production
SUPABASE_URL=https://yvwfgtyrqzfbukmhcgas.supabase.co
SUPABASE_KEY=sua_chave_aqui
CORS_ORIGIN=https://seu-projeto.vercel.app
```

### **Configurações:**
- Build Command: `npm run build:all`
- Output Directory: `.next`
- Node.js Version: 18.x

---

## 🔧 **NETLIFY**

### **Deploy via Git:**
1. Conectar repositório GitHub
2. Configurar build

### **Build Settings:**
- Build command: `npm run build:netlify`
- Publish directory: `out`
- Node version: 18

### **Variáveis de Ambiente:**
```env
NEXT_PUBLIC_API_URL=https://sua-api.netlify.app/.netlify/functions/api
NEXT_PUBLIC_SITE_URL=https://seu-site.netlify.app
NODE_ENV=production
SUPABASE_URL=https://yvwfgtyrqzfbukmhcgas.supabase.co
SUPABASE_KEY=sua_chave_aqui
```

---

## 🔧 **HOSTINGER**

### **Deploy via FTP/cPanel:**
1. Build local: `npm run build:static`
2. Upload pasta `out/` para `public_html/`

### **Para VPS Hostinger:**
```bash
# Via SSH
git clone seu-repositorio
cd projeto
npm install
npm run build:production
pm2 start ecosystem.config.js
```

---

## 🔧 **RAILWAY**

### **Deploy via Git:**
```bash
# Railway CLI
npm install -g @railway/cli
railway login
railway deploy
```

### **Variáveis:**
```env
NEXT_PUBLIC_API_URL=https://seu-projeto.railway.app/api
NODE_ENV=production
PORT=3000
```

---

## 🔧 **RENDER**

### **Web Service:**
- Build Command: `npm run build:render`
- Start Command: `npm start`
- Environment: Node

### **Static Site:**
- Build Command: `npm run build:static`
- Publish Directory: `out`

---

## 🔧 **DOCKER (VPS Universal)**

```bash
# Build e deploy
docker-compose up -d
```

**Funciona em:** DigitalOcean, Linode, AWS EC2, Google Cloud, Azure

---

## ⚙️ **COMANDOS DE BUILD ESPECÍFICOS:**

### **Build Universal (Padrão):**
```bash
npm run build:all        # Frontend + API
```

### **Build Estático (Netlify/Hostinger):**
```bash
npm run build:static     # Site estático
```

### **Build Servidor (Railway/Render):**
```bash
npm run build:server     # Com funcionalidades de servidor
```

### **Build Produção (VPS):**
```bash
npm run build:production # Otimizado para produção
```

---

## 🌐 **CONFIGURAÇÃO DE DOMÍNIO:**

### **Domínio Personalizado:**
1. **DNS Settings:** Apontar para a plataforma
2. **SSL:** Configurado automaticamente
3. **Variáveis:** Atualizar URLs com novo domínio

### **Subdomínio API:**
- `api.seudominio.com` → Backend
- `app.seudominio.com` → Frontend
- `seudominio.com` → Landing Page

---

## 🔒 **CONFIGURAÇÕES DE SEGURANÇA:**

### **Headers de Segurança:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### **CORS Produção:**
```env
CORS_ORIGIN=https://seudominio.com,https://app.seudominio.com
```

---

## 📊 **MONITORAMENTO:**

### **Analytics:**
- Google Analytics
- Vercel Analytics
- Plausible

### **Uptime Monitoring:**
- UptimeRobot
- Pingdom
- StatusPage

---

## 🚨 **TROUBLESHOOTING:**

### **Erro: "API não encontrada"**
- Verificar NEXT_PUBLIC_API_URL
- Verificar CORS_ORIGIN

### **Erro: "Build failed"**
- Verificar Node.js version (18+)
- Limpar cache: `npm run clean`

### **Erro: "Database connection"**
- Verificar SUPABASE_URL/KEY
- Verificar IP whitelist

---

## ✅ **CHECKLIST DEPLOY:**

- [ ] Build sem erros localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio configurado (se necessário)
- [ ] SSL ativado
- [ ] CORS configurado
- [ ] Base de dados funcionando
- [ ] Testes de funcionalidade
- [ ] Monitoramento ativo

**SEU PROJETO ESTÁ PRONTO PARA QUALQUER PLATAFORMA! 🎉**