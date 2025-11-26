import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import middleware
// import errorHandler from './middleware/errorHandler';
// import notFound from './middleware/notFound';

// Import routes will be loaded after database initialization

import logger from './utils/logger';
import database from './config/database';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://localhost:8081'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
// if (process.env.NODE_ENV !== 'test') {
//   app.use(morgan('combined', {
//     stream: {
//       write: (message) => logger.info(message.trim())
//     }
//   }));
// }

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.SISTEMA_VERSAO || '2.0.0'
  });
});

// Test route for bulk import
// app.post('/api/sectors/bulk-import', (req, res) => {
//   res.json({
//     preview: true,
//     totalRecords: 0,
//     data: [],
//     message: 'Test endpoint working'
//   });
// });

// Routes will be configured after database initialization

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: process.env.SISTEMA_NOME || 'Sistema de Controle de Ponto - SEFAZ-TO',
    version: process.env.SISTEMA_VERSAO || '2.0.0',
    description: 'API Backend para Sistema de Controle de Ponto',
    endpoints: {
      auth: '/api/auth',
      authConfig: '/api/auth-config',
      users: '/api/users',
      point: '/api/point',
      approvals: '/api/approvals',
      reports: '/api/reports',
      audit: '/api/audit',
      sectors: '/api/sectors',
      servidores: '/api/servidores',
      setores: '/api/setores'
    },
    documentation: '/api/docs'
  });
});

// 404 handler
// app.use(notFound);

// Error handling middleware
// app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    try {
      await database.initialize();
      logger.info('✅ Conexão com banco de dados Oracle estabelecida');
    } catch (error) {
      logger.error('❌ Erro ao inicializar servidor:', error);
    }

    // Import and configure routes after database initialization
    try {
      const { default: sectorRoutes } = await import('./routes/sectors');
      app.use('/api/sectors', sectorRoutes);
      
      const { default: servidorRoutes } = await import('./routes/servidores');
      app.use('/api/servidores', servidorRoutes);
      
      const { default: setorRoutes } = await import('./routes/setores');
      app.use('/api/setores', setorRoutes);
      const { default: geoRoutes } = await import('./routes/geo');
      app.use('/api/geo', geoRoutes);
      const { default: auditRoutes } = await import('./routes/audit');
      app.use('/api/audit', auditRoutes);
      const { default: alertsRoutes } = await import('./routes/alerts');
      app.use('/api/alerts', alertsRoutes);
      const { default: faceRoutes } = await import('./routes/face');
      app.use('/api/face', faceRoutes);
      
      logger.info('✅ Rotas configuradas com sucesso');
    } catch (routeError) {
      logger.error('❌ Erro ao configurar rotas:', routeError);
      throw routeError;
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Info: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM recebido. Encerrando servidor graciosamente...');
      await database.close();
      server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT recebido. Encerrando servidor graciosamente...');
      await database.close();
      server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
  }
};

startServer();

export default app;