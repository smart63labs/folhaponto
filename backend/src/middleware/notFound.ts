import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  // Log 404 attempts
  logger.warn(`404 - Rota não encontrada: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não foi encontrada`,
    availableEndpoints: {
      auth: [
        'POST /api/auth/login',
        'POST /api/auth/refresh',
        'POST /api/auth/logout',
        'GET /api/auth/me',
        'POST /api/auth/validate'
      ],
      users: [
        'GET /api/users',
        'GET /api/users/:id',
        'POST /api/users',
        'PUT /api/users/:id',
        'DELETE /api/users/:id'
      ],
      point: [
        'POST /api/point/register',
        'GET /api/point/today',
        'GET /api/point/history',
        'GET /api/point/date/:date'
      ],
      approvals: [
        'POST /api/approvals',
        'GET /api/approvals',
        'GET /api/approvals/:id',
        'PUT /api/approvals/:id'
      ],
      reports: [
        'GET /api/reports/attendance',
        'GET /api/reports/hours-bank',
        'GET /api/reports/dashboard'
      ]
    }
  });
};

export default notFound;