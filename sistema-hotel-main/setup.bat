@echo off
echo 🚀 Setup automático - Sistema Hotel
echo ==================================

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 📥 Instale em: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install
cd api
call npm install
cd ..

REM Criar arquivo .env.local se não existir
if not exist ".env.local" (
    echo ⚙️ Criando .env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:3001/api
        echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
        echo NODE_ENV=development
    ) > .env.local
    echo ✅ .env.local criado
) else (
    echo ✅ .env.local já existe
)

REM Criar arquivo api/.env se não existir
if not exist "api\.env" (
    echo ⚙️ Criando api/.env...
    (
        echo NODE_ENV=development
        echo PORT=3001
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # Supabase
        echo SUPABASE_URL=https://yvwfgtyrqzfbukmhcgas.supabase.co
        echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2d2ZndHlycXpmYnVrbWhjZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU4NDA2OCwiZXhwIjoyMDc0MTYwMDY4fQ.7O5ZD4s3qG3HicEEpiWvJuyfqQy3HniM84B3OozcM1s
    ) > api\.env
    echo ✅ api/.env criado
) else (
    echo ✅ api/.env já existe
)

REM Testar build
echo 🔨 Testando builds...
call npm run build:all

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SETUP CONCLUÍDO COM SUCESSO!
    echo ================================
    echo.
    echo 📋 Próximos passos:
    echo 1. npm run dev:full    # Rodar projeto completo
    echo 2. Abrir: http://localhost:3000
    echo.
    echo 🔧 Comandos úteis:
    echo • npm run dev:full     # Frontend + Backend
    echo • npm run build:all    # Testar build
    echo • npm run build:vercel # Para deploy Vercel
    echo.
) else (
    echo ❌ Erro no build. Verifique os logs acima.
)

pause