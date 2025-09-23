import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Erro personalizado
  if (error.message) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message
    });
    return;
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
};