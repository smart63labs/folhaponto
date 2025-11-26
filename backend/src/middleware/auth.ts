import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { JwtPayload, AuthenticatedRequest, User, UserProfile } from '../types';

// Mock user data (será substituído pela integração com Oracle)
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin_protocolo@sefaz.to.gov.br',
    password: '$2b$10$8K1p/a0drtIzIqbllDbzXeP7.aqjb6UBn8DqXKxkMdY5zUjrGlvSW', // admin123
    name: 'Ana Paula Santos',
    profile: 'Admin',
    department: 'Protocolo',
    active: true,
    permissions: ['all']
  },
  {
    id: 2,
    email: 'rh_coordenacao@sefaz.to.gov.br',
    password: '$2b$10$8K1p/a0drtIzIqbllDbzXeP7.aqjb6UBn8DqXKxkMdY5zUjrGlvSW', // rh123
    name: 'Carlos Silva',
    profile: 'RH',
    department: 'Recursos Humanos',
    active: true,
    permissions: ['users.read', 'users.write', 'reports.read', 'approvals.write']
  },
  {
    id: 3,
    email: 'servidor.fiscal@sefaz.to.gov.br',
    password: '$2b$10$8K1p/a0drtIzIqbllDbzXeP7.aqjb6UBn8DqXKxkMdY5zUjrGlvSW', // server123
    name: 'Maria Oliveira',
    profile: 'Server',
    department: 'Fiscalização',
    active: true,
    permissions: ['point.read', 'point.write', 'reports.read']
  }
];

// Generate JWT token
const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    profile: user.profile,
    department: user.department,
    permissions: user.permissions
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'sefaz-to-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: 'sefaz-to-ponto',
    audience: 'sefaz-to-users'
  });
};

// Generate refresh token
const generateRefreshToken = (user: User): string => {
  const payload = {
    id: user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'sefaz-to-refresh-secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'sefaz-to-ponto',
    audience: 'sefaz-to-users'
  });
};

// Verify JWT token middleware
const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;

    // Get user from mock data (replace with database query)
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

// Authorization middleware
const authorize = (...profiles: UserProfile[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Admin has all permissions
    if (req.user.profile === 'Admin' || req.user.permissions.includes('all')) {
      return next();
    }

    // Check if user has required permissions
    const hasPermission = profiles.some(profile =>
      req.user.profile === profile
    );

    if (!hasPermission) {
      logger.security('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: req.user.id,
        requiredProfiles: profiles,
        userProfile: req.user.profile,
        resource: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({
        success: false,
        error: 'Acesso negado - perfil insuficiente',
        code: 'INSUFFICIENT_PROFILE',
        required: profiles,
        current: req.user.profile
      });
    }

    next();
  };
};

// Check if user has specific profile
const requireProfile = (...profiles: UserProfile[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!profiles.includes(req.user.profile)) {
      logger.security('PROFILE_ACCESS_DENIED', {
        userId: req.user.id,
        userProfile: req.user.profile,
        requiredProfiles: profiles,
        resource: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: 'Acesso negado - perfil insuficiente',
        code: 'INSUFFICIENT_PROFILE',
        required: profiles,
        current: req.user.profile
      });
    }

    next();
  };
};

// Get user by email (Oracle database function)
const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const oracledb = require('oracledb');
    const connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT id, email, name, perfil as profile, departamento as department, is_active as active
       FROM usuarios 
       WHERE LOWER(email) = LOWER(:email)`,
      { email }
    );

    await connection.close();

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0] as any[];
    const [id, userEmail, name, profile, department, active] = user;

    // Get user permissions based on profile
    let permissions: string[] = [];
    if (profile === 'ADMIN') {
      permissions = ['all'];
    } else if (profile === 'RH') {
      permissions = ['users.read', 'users.write', 'reports.read', 'approvals.write'];
    } else if (profile === 'Server') {
      permissions = ['point.read', 'point.write', 'reports.read'];
    }

    return {
      id,
      email: userEmail,
      name,
      profile,
      department,
      active: active === 1,
      permissions,
      password: '' // Not needed for authentication middleware
    };
  } catch (error) {
    logger.error('Error getting user by email:', error);
    return null;
  }
};

// Get user by ID (Oracle database function)
const getUserById = async (id: number): Promise<User | null> => {
  try {
    const oracledb = require('oracledb');
    const connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT id, email, name, perfil as profile, departamento as department, is_active as active
       FROM usuarios 
       WHERE id = :id`,
      { id }
    );

    await connection.close();

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0] as any[];
    const [userId, email, name, profile, department, active] = user;

    // Get user permissions based on profile
    let permissions: string[] = [];
    if (profile === 'ADMIN') {
      permissions = ['all'];
    } else if (profile === 'RH') {
      permissions = ['users.read', 'users.write', 'reports.read', 'approvals.write'];
    } else if (profile === 'Server') {
      permissions = ['point.read', 'point.write', 'reports.read'];
    }

    return {
      id: userId,
      email,
      name,
      profile,
      department,
      active: active === 1,
      permissions,
      password: '' // Not needed for authentication middleware
    };
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    return null;
  }
};

export {
  authenticate,
  authorize,
  requireProfile,
  generateToken,
  generateRefreshToken,
  getUserByEmail,
  getUserById,
  mockUsers
};
