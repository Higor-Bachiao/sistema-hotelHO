#!/bin/bash

# Script de deploy universal para VPS (Hostinger, DigitalOcean, etc.)

echo "🚀 Iniciando deploy universal..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Clonar/atualizar repositório
if [ ! -d "sistema-hotel" ]; then
    echo "📥 Clonando repositório..."
    git clone https://github.com/seu-usuario/sistema-hotel.git
    cd sistema-hotel
else
    echo "🔄 Atualizando repositório..."
    cd sistema-hotel
    git pull
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm run install:all

# Build
echo "🔨 Fazendo build..."
npm run build:production

# Configurar variáveis de ambiente
if [ ! -f ".env.local" ]; then
    echo "⚙️ Criando arquivo de ambiente..."
    cp .env.example .env.local
    echo "⚠️ CONFIGURE AS VARIÁVEIS DE AMBIENTE EM .env.local"
fi

if [ ! -f "api/.env" ]; then
    echo "⚙️ Criando arquivo de ambiente da API..."
    cp api/.env.example api/.env
    echo "⚠️ CONFIGURE AS VARIÁVEIS DE AMBIENTE EM api/.env"
fi

# Configurar Nginx (opcional)
if command -v nginx &> /dev/null; then
    echo "🌐 Configurando Nginx..."
    sudo tee /etc/nginx/sites-available/sistema-hotel > /dev/null <<EOF
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/sistema-hotel /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# Configurar SSL com Certbot (opcional)
if command -v certbot &> /dev/null; then
    echo "🔒 Configurando SSL..."
    sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
fi

# Configurar firewall
echo "🛡️ Configurando firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw --force enable

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save

echo "✅ Deploy concluído!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:3001"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente"
echo "2. Configure seu domínio"
echo "3. Verifique se tudo está funcionando"
echo ""
echo "📊 Monitoramento:"
echo "pm2 status      # Ver status"
echo "pm2 logs        # Ver logs"
echo "pm2 restart all # Reiniciar"