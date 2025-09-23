import { Router } from 'express';
import hotelRoutes from './hotel.routes';

const router = Router();

// Definir rotas - usar diretamente na raiz para simplicidade
router.use('/', hotelRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Hotel está funcionando!',
    timestamp: new Date().toISOString()
  });
});

export default router;