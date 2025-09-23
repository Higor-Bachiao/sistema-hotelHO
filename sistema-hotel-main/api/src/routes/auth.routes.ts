import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();

// Rotas públicas
router.post('/login', AuthController.login);

// Rotas protegidas
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/change-password', authenticate, AuthController.changePassword);

// Rotas apenas para admin
router.post('/register', authenticate, authorize(['admin']), AuthController.register);
router.get('/users', authenticate, authorize(['admin']), AuthController.getAllUsers);
router.put('/users/:id', authenticate, authorize(['admin']), AuthController.updateUser);
router.delete('/users/:id', authenticate, authorize(['admin']), AuthController.deleteUser);

export default router;