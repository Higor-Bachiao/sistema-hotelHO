import { Router } from 'express';
import hotelRoutes from './hotel.routes';
import guestHistoryRoutes from './guest-history.routes';

const router = Router();

// Definir rotas - usar diretamente na raiz para simplicidade
router.use('/', hotelRoutes);
router.use('/guest-history', guestHistoryRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Hotel está funcionando!',
    timestamp: new Date().toISOString()
  });
});

export default router;