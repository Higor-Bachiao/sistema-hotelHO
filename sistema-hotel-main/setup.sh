#!/bin/bash

echo "🚀 Setup automático - Sistema Hotel"
echo "=================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "📥 Instale em: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install
cd api && npm install
cd ..

# Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    echo "⚙️ Criando .env.local..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
EOF
    echo "✅ .env.local criado"
else
    echo "✅ .env.local já existe"
fi

# Criar arquivo api/.env se não existir
if [ ! -f "api/.env" ]; then
    echo "⚙️ Criando api/.env..."
    cat > api/.env << 'EOF'
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Supabase
SUPABASE_URL=https://yvwfgtyrqzfbukmhcgas.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2d2ZndHlycXpmYnVrbWhjZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU4NDA2OCwiZXhwIjoyMDc0MTYwMDY4fQ.7O5ZD4s3qG3HicEEpiWvJuyfqQy3HniM84B3OozcM1s
EOF
    echo "✅ api/.env criado"
else
    echo "✅ api/.env já existe"
fi

# Verificar se builds funcionam
echo "🔨 Testando builds..."
npm run build:all

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SETUP CONCLUÍDO COM SUCESSO!"
    echo "================================"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. npm run dev:full    # Rodar projeto completo"
    echo "2. Abrir: http://localhost:3000"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "• npm run dev:full     # Frontend + Backend"
    echo "• npm run build:all    # Testar build"
    echo "• npm run build:vercel # Para deploy Vercel"
    echo ""
else
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi