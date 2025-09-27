@echo off
echo 🚀 Deploy Windows/Hostinger cPanel

echo 📦 Instalando dependências...
call npm run install:all

echo 🔨 Fazendo build estático...
call npm run build:hostinger

echo 📁 Arquivos prontos em: out/
echo.
echo 📋 Próximos passos para Hostinger:
echo 1. Acesse o cPanel
echo 2. Vá em File Manager
echo 3. Navegue até public_html/
echo 4. Delete todos os arquivos
echo 5. Upload da pasta out/
echo 6. Extrair arquivos
echo.
echo ✅ Build concluído!
pause