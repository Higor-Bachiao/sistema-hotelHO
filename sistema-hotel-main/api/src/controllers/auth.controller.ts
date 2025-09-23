import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { AuthenticatedRequest } from '@/middlewares/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
        return;
      }

      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name || !role) {
        res.status(400).json({
          success: false,
          error: 'Todos os campos são obrigatórios'
        });
        return;
      }

      if (!['admin', 'staff'].includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Role deve ser admin ou staff'
        });
        return;
      }

      const user = await AuthService.register({ email, password, name, role });

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Não autenticado'
        });
        return;
      }

      const user = await AuthService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await AuthService.getAllUsers();

      res.json({
        success: true,
        data: users
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await AuthService.updateUser(id, updates);

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await AuthService.deleteUser(id);

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Não autenticado'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Senha atual e nova senha são obrigatórias'
        });
        return;
      }

      await AuthService.changePassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}