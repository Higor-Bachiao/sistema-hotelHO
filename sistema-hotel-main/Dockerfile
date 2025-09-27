FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY api/package*.json ./api/

# Instalar dependências
RUN npm install
RUN cd api && npm install

# Copiar código fonte
COPY . .

# Build da API
RUN cd api && npm run build

# Build do frontend
RUN npm run build

# Expor portas
EXPOSE 3000 3001

# Script de inicialização
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]