import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { authenticate, generateToken, generateRefreshToken, getUserByEmail } from '../middleware/auth';
import { AuthProviderFactory } from '../services/authProviders';
import logger from '../utils/logger';
import { LoginRequest, LoginResponse, AuthenticatedRequest, JwtPayload } from '../types';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

const refreshValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token é obrigatório')
];

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, password, accessToken }: LoginRequest & { accessToken?: string } = req.body;

    // Try authentication with all enabled providers
    const authResult = await AuthProviderFactory.authenticateWithProviders(email, password, accessToken);
    
    if (!authResult.success || !authResult.user) {
      logger.security('LOGIN_ATTEMPT_FAILED', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: authResult.error
      });
      return res.status(401).json({
        success: false,
        error: authResult.error || 'Credenciais inválidas'
      });
    }

    const user = authResult.user;

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      department: user.department,
      permissions: user.permissions,
      active: true,
      password: '' // Not needed for token generation
    });
    
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      department: user.department,
      permissions: user.permissions,
      active: true,
      password: '' // Not needed for token generation
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    logger.audit('USER_LOGIN', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        department: user.department
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { refreshToken } = req.body;

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'sefaz-to-refresh-secret') as JwtPayload;

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      }

      // Find user
      const user = await getUserByEmail(decoded.email);
      if (!user || !user.active) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado ou inativo',
          code: 'USER_NOT_FOUND'
        });
      }

      // Generate new tokens
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Log token refresh
      logger.audit('TOKEN_REFRESHED', user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          expiresIn: '8h'
        }
      });

    } catch (jwtError: any) {
      logger.security('INVALID_REFRESH_TOKEN', {
        error: jwtError.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        error: 'Token de renovação inválido ou expirado',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

  } catch (error) {
    logger.error('Erro na renovação do token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Log logout
    logger.audit('LOGOUT', req.user!.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Clear cookie
    res.clearCookie('token');

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user!.id,
          name: req.user!.name,
          email: req.user!.email,
          profile: req.user!.profile,
          department: req.user!.department,
          permissions: req.user!.permissions
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar usuário atual:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   POST /api/auth/validate
// @desc    Validate token
// @access  Private
router.post('/validate', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        valid: true,
        user: {
          id: req.user!.id,
          name: req.user!.name,
          email: req.user!.email,
          profile: req.user!.profile,
          department: req.user!.department,
          permissions: req.user!.permissions
        }
      }
    });

  } catch (error) {
    logger.error('Erro na validação do token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;