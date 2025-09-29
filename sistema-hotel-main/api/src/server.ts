import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { config } from './config/database';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// CORS - configuração baseada em ambiente
const corsOrigins = process.env.CORS_ORIGIN ? 
  process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
  ['http://localhost:3000'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? corsOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de teste para verificar se a API está funcionando
app.get('/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = Number(config.port) || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${config.nodeEnv}`);
  console.log(`🌐 Acesso local: http://localhost:${PORT}`);
  console.log(`📱 Acesso remoto: http://192.168.100.36:${PORT}`);
});

export default app;