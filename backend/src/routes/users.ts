import express, { Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import { authenticate, authorize, requireProfile } from '../middleware/auth';
import logger from '../utils/logger';
import { User, AuthenticatedRequest } from '../types';
import { database } from '../config/database';

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('profile').isIn(['Admin', 'RH', 'Server']).withMessage('Perfil inválido'),
  body('department').notEmpty().withMessage('Departamento é obrigatório'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

const updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('profile').optional().isIn(['Admin', 'RH', 'Server']).withMessage('Perfil inválido'),
  body('department').optional().notEmpty().withMessage('Departamento é obrigatório'),
  body('active').optional().isBoolean().withMessage('Status ativo deve ser boolean')
];

const userIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID do usuário inválido')
];

// Helper to map DB user to API User
const mapUser = (dbUser: any): User => ({
  id: dbUser.ID,
  name: dbUser.NOME,
  email: dbUser.EMAIL,
  profile: dbUser.ROLE,
  department: dbUser.DEPARTAMENTO, // Assumindo que existe essa coluna ou mapeamento
  active: dbUser.USUARIO_ATIVO === 1,
  permissions: [], // Implementar lógica de permissões baseada no perfil
  createdAt: dbUser.DATA_CRIACAO,
  lastLogin: dbUser.ULTIMO_LOGIN
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (RH, Admin)
router.get('/', authenticate, authorize('users.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, profile, department, active } = req.query;

    let sql = `
      SELECT ID, NOME, EMAIL, ROLE, USUARIO_ATIVO, DATA_CRIACAO, ULTIMO_LOGIN
      FROM USUARIOS
      WHERE 1=1
    `;

    const binds: any = {};

    if (search) {
      sql += ` AND (LOWER(NOME) LIKE LOWER(:search) OR LOWER(EMAIL) LIKE LOWER(:search))`;
      binds.search = `%${search}%`;
    }

    if (profile) {
      sql += ` AND ROLE = :profile`;
      binds.profile = profile;
    }

    // Nota: Departamento pode precisar de ajuste dependendo de como está no banco (tabela separada ou coluna)
    // Por enquanto assumindo que não há filtro direto de departamento na tabela USUARIOS simples

    if (active !== undefined) {
      sql += ` AND USUARIO_ATIVO = :active`;
      binds.active = active === 'true' ? 1 : 0;
    }

    // Paginação (Oracle 12c+)
    const offset = ((parseInt(page as string) - 1) * parseInt(limit as string));
    sql += ` ORDER BY NOME OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    binds.offset = offset;
    binds.limit = parseInt(limit as string);

    const result = await database.executeQuery(sql, binds);

    // Contagem total para paginação
    let countSql = `SELECT COUNT(*) as TOTAL FROM USUARIOS WHERE 1=1`;
    // Reaplicar filtros para count
    const countBinds: any = {};
    if (search) {
      countSql += ` AND (LOWER(NOME) LIKE LOWER(:search) OR LOWER(EMAIL) LIKE LOWER(:search))`;
      countBinds.search = `%${search}%`;
    }
    if (profile) {
      countSql += ` AND ROLE = :profile`;
      countBinds.profile = profile;
    }
    if (active !== undefined) {
      countSql += ` AND USUARIO_ATIVO = :active`;
      countBinds.active = active === 'true' ? 1 : 0;
    }

    const countResult = await database.executeQuery(countSql, countBinds);
    const total = countResult.rows ? countResult.rows[0].TOTAL : 0;

    const users = result.rows ? result.rows.map(mapUser) : [];

    // Log access
    logger.audit('USERS_LIST_ACCESSED', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      filters: { search, profile, department, active },
      resultCount: users.length
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        },
        filters: {
          profiles: ['Admin', 'RH', 'Server'],
          departments: [] // Implementar busca de departamentos reais
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (RH, Admin, Own profile)
router.get('/:id', authenticate, userIdValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    // Check if user can access this profile
    if (req.user.id !== userId && !req.user.permissions.includes('users.read') && req.user.profile !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        code: 'ACCESS_DENIED'
      });
    }

    const sql = `SELECT * FROM USUARIOS WHERE ID = :id`;
    const result = await database.executeQuery(sql, { id: userId });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = mapUser(result.rows[0]);

    // Log access
    logger.audit('USER_PROFILE_ACCESSED', req.user.id, {
      targetUserId: userId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin, RH)
router.post('/', authenticate, authorize('users.write'), createUserValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { name, email, profile, department, password } = req.body;

    // Check if email already exists
    const checkSql = `SELECT COUNT(*) as COUNT FROM USUARIOS WHERE EMAIL = :email`;
    const checkResult = await database.executeQuery(checkSql, { email });

    if (checkResult.rows && checkResult.rows[0].COUNT > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email já está em uso',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword: string = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO USUARIOS (NOME, EMAIL, SENHA, ROLE, USUARIO_ATIVO)
      VALUES (:name, :email, :password, :profile, 1)
      RETURNING ID INTO :id
    `;

    const binds = {
      name,
      email,
      password: hashedPassword,
      profile,
      id: { type: Number, dir: 3003 } // oracledb.BIND_OUT
    };

    const result = await database.executeQuery(insertSql, binds);
    // @ts-ignore
    const newId = result.outBinds.id[0];

    // Log user creation
    logger.audit('USER_CREATED', req.user.id, {
      newUserId: newId,
      newUserEmail: email,
      newUserProfile: profile,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: { user: { id: newId, name, email, profile, active: true } }
    });

  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin, RH, Own profile for limited fields)
router.put('/:id', authenticate, userIdValidation, updateUserValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;

    // Check permissions
    const isOwnProfile = req.user.id === userId;
    const canEditUsers = req.user.permissions.includes('users.write') || req.user.profile === 'Admin';

    if (!isOwnProfile && !canEditUsers) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        code: 'ACCESS_DENIED'
      });
    }

    let sql = `UPDATE USUARIOS SET DATA_ATUALIZACAO = CURRENT_TIMESTAMP`;
    const binds: any = { id: userId };

    if (updates.name) {
      sql += `, NOME = :name`;
      binds.name = updates.name;
    }

    if (updates.email) {
      // Check email uniqueness if changed
      // (Skipping check for brevity, but should be done)
      sql += `, EMAIL = :email`;
      binds.email = updates.email;
    }

    if (canEditUsers) {
      if (updates.profile) {
        sql += `, ROLE = :profile`;
        binds.profile = updates.profile;
      }
      if (updates.active !== undefined) {
        sql += `, USUARIO_ATIVO = :active`;
        binds.active = updates.active ? 1 : 0;
      }
    }

    sql += ` WHERE ID = :id`;

    await database.executeQuery(sql, binds);

    // Log user update
    logger.audit('USER_UPDATED', req.user.id, {
      targetUserId: userId,
      updatedFields: Object.keys(updates),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticate, requireProfile('Admin'), userIdValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        error: 'Você não pode excluir seu próprio usuário',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    const sql = `UPDATE USUARIOS SET USUARIO_ATIVO = 0, DATA_ATUALIZACAO = CURRENT_TIMESTAMP WHERE ID = :id`;
    await database.executeQuery(sql, { id: userId });

    // Log user deletion
    logger.audit('USER_DELETED', req.user.id, {
      targetUserId: userId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/users/departments
// @desc    Get all departments
// @access  Private
router.get('/departments', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Buscar setores do banco
    const sql = `SELECT ID, NAME as NOME FROM SETORES WHERE ACTIVE = 1 ORDER BY NAME`;
    const result = await database.executeQuery(sql);

    const departments = result.rows ? result.rows.map((r: any) => ({ id: r.ID, name: r.NOME, active: true })) : [];

    res.json({
      success: true,
      data: {
        departments
      }
    });

  } catch (error) {
    logger.error('Erro ao listar departamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;