import winston, { Logger, format } from 'winston';
import path from 'path';
import fs from 'fs';

// Extend the Logger interface to include custom methods
interface ExtendedLogger extends Logger {
  audit: (action: string, userId: number | null, details?: any) => void;
  security: (event: string, details?: any) => void;
  performance: (operation: string, duration: number, details?: any) => void;
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create logs directory if it doesn't exist

// Create the logger
const logger: ExtendedLogger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'exceptions.log') 
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'rejections.log') 
    })
  ],
}) as ExtendedLogger;
const logsDir: string = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper functions for specific log types
logger.audit = (action: string, userId: number | null, details: any = {}) => {
  logger.info('AUDIT', {
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.security = (event: string, details: any = {}) => {
  logger.warn('SECURITY', {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.performance = (operation: string, duration: number, details: any = {}) => {
  logger.info('PERFORMANCE', {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString()
  });
};

export default logger;