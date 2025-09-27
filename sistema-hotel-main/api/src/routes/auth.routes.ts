import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';

const router = Router();

// Rotas públicas
router.post('/login', AuthController.login);

// Rotas administrativas (sem middleware por simplicidade)
router.get('/users', AuthController.getAllUsers);
router.put('/users/:id', AuthController.updateUser);
router.delete('/users/:id', AuthController.deleteUser);

export default router;
