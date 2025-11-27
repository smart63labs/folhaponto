import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from '../types';

interface ErrorWithCode extends Error {
  statusCode?: number;
  code?: string | number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: unknown;
  errorNum?: number;
  type?: string;
}

const errorHandler = (err: ErrorWithCode, req: Request, res: Response, next: NextFunction): void => {
  let error: ErrorWithCode = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message: string = 'Resource not found';
    error = { name: 'CastError', message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message: string = 'Duplicate field value entered';
    error = { name: 'DuplicateError', message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message: string = Object.values(err.errors || {}).map((val: { message: string }) => val.message).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { name: 'JsonWebTokenError', message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { name: 'TokenExpiredError', message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Arquivo muito grande';
    error = { name: 'MulterError', message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Tipo de arquivo não permitido';
    error = { name: 'MulterError', message, statusCode: 400 };
  }

  // Oracle database errors
  if (err.errorNum) {
    switch (err.errorNum) {
      case 1:
        error = { name: 'OracleError', message: 'Violação de restrição única', statusCode: 400 };
        break;
      case 1017:
        error = { name: 'OracleError', message: 'Credenciais de banco de dados inválidas', statusCode: 500 };
        break;
      case 12541:
        error = { name: 'OracleError', message: 'Erro de conexão com o banco de dados', statusCode: 500 };
        break;
      default:
        error = { name: 'OracleError', message: 'Erro interno do banco de dados', statusCode: 500 };
    }
  }

  // Rate limiting errors
  if (err.type === 'entity.too.large') {
    const message = 'Payload muito grande';
    error = { name: 'PayloadError', message, statusCode: 413 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;