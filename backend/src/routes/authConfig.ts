import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import oracledb from 'oracledb';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Validation rules
const authConfigValidation = [
  body('tipo_auth')
    .isIn(['MOCK', 'LDAP', 'GMAIL'])
    .withMessage('Tipo de autenticação inválido'),
  body('ativo')
    .isBoolean()
    .withMessage('Status ativo deve ser boolean'),
  body('configuracao')
    .isObject()
    .withMessage('Configuração deve ser um objeto JSON válido')
];

// @route   GET /api/auth-config
// @desc    Get all authentication configurations
// @access  Private (Admin only)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user has admin permissions
    if (req.user?.profile !== 'ADMIN' && !req.user?.permissions.includes('GERENCIAR_USUARIOS')) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem acessar configurações de autenticação.'
      });
    }

    const connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT id, tipo_auth, ativo, configuracao, data_criacao, data_atualizacao
       FROM configuracoes_autenticacao
       ORDER BY tipo_auth`
    );

    await connection.close();

    const configs = result.rows?.map((row: any) => ({
      id: row[0],
      tipo_auth: row[1],
      ativo: row[2] === 1,
      configuracao: JSON.parse(row[3] || '{}'),
      data_criacao: row[4],
      data_atualizacao: row[5]
    })) || [];

    res.json({
      success: true,
      data: configs
    });

  } catch (error) {
    logger.error('Error fetching auth configurations:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   PUT /api/auth-config/:id
// @desc    Update authentication configuration
// @access  Private (Admin only)
router.put('/:id', authenticate, authConfigValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check if user has admin permissions
    if (req.user?.profile !== 'ADMIN' && !req.user?.permissions.includes('GERENCIAR_USUARIOS')) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem modificar configurações de autenticação.'
      });
    }

    const { id } = req.params;
    const { tipo_auth, ativo, configuracao } = req.body;

    const connection = await oracledb.getConnection();

    // Validate configuration based on auth type
    const validationResult = validateAuthConfig(tipo_auth, configuracao);
    if (!validationResult.valid) {
      await connection.close();
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    // Update configuration
    const result = await connection.execute(
      `UPDATE configuracoes_autenticacao 
       SET tipo_auth = :tipo_auth, 
           ativo = :ativo, 
           configuracao = :configuracao,
           data_atualizacao = CURRENT_TIMESTAMP,
           usuario_atualizacao = :usuario_id
       WHERE id = :id`,
      {
        tipo_auth,
        ativo: ativo ? 1 : 0,
        configuracao: JSON.stringify(configuracao),
        usuario_id: req.user!.id,
        id: parseInt(id)
      }
    );

    await connection.commit();
    await connection.close();

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada'
      });
    }

    logger.audit('AUTH_CONFIG_UPDATED', req.user!.id, {
      configId: id,
      tipo_auth,
      ativo,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Configuração de autenticação atualizada com sucesso'
    });

  } catch (error) {
    logger.error('Error updating auth configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/auth-config/toggle/:tipo
// @desc    Toggle authentication provider on/off
// @access  Private (Admin only)
router.post('/toggle/:tipo', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user has admin permissions
    if (req.user?.profile !== 'ADMIN' && !req.user?.permissions.includes('GERENCIAR_USUARIOS')) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem modificar configurações de autenticação.'
      });
    }

    const { tipo } = req.params;
    const tipoUpper = tipo.toUpperCase();

    if (!['MOCK', 'LDAP', 'GMAIL'].includes(tipoUpper)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de autenticação inválido'
      });
    }

    const connection = await oracledb.getConnection();

    // Get current status
    const currentResult = await connection.execute(
      `SELECT ativo FROM configuracoes_autenticacao WHERE tipo_auth = :tipo`,
      { tipo: tipoUpper }
    );

    if (!currentResult.rows || currentResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada'
      });
    }

    const currentStatus = currentResult.rows[0][0] as number;
    const newStatus = currentStatus === 1 ? 0 : 1;

    // Update status
    await connection.execute(
      `UPDATE configuracoes_autenticacao 
       SET ativo = :ativo, 
           data_atualizacao = CURRENT_TIMESTAMP,
           usuario_atualizacao = :usuario_id
       WHERE tipo_auth = :tipo`,
      {
        ativo: newStatus,
        usuario_id: req.user!.id,
        tipo: tipoUpper
      }
    );

    await connection.commit();
    await connection.close();

    logger.audit('AUTH_PROVIDER_TOGGLED', req.user!.id, {
      tipo_auth: tipoUpper,
      previousStatus: currentStatus === 1,
      newStatus: newStatus === 1,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `Provedor ${tipoUpper} ${newStatus === 1 ? 'habilitado' : 'desabilitado'} com sucesso`,
      data: {
        tipo_auth: tipoUpper,
        ativo: newStatus === 1
      }
    });

  } catch (error) {
    logger.error('Error toggling auth provider:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/auth-config/providers
// @desc    Get enabled authentication providers
// @access  Public
router.get('/providers', async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT tipo_auth, ativo 
       FROM configuracoes_autenticacao 
       WHERE ativo = 1
       ORDER BY tipo_auth`
    );

    await connection.close();

    const enabledProviders = result.rows?.map((row: any) => ({
      tipo_auth: row[0],
      ativo: row[1] === 1
    })) || [];

    res.json({
      success: true,
      data: enabledProviders
    });

  } catch (error) {
    logger.error('Error fetching enabled providers:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Helper function to validate auth configuration
function validateAuthConfig(tipo_auth: string, configuracao: any): { valid: boolean; error?: string } {
  switch (tipo_auth) {
    case 'MOCK':
      return { valid: true };
    
    case 'LDAP':
      const requiredLdapFields = ['server', 'port', 'baseDN', 'userDN'];
      for (const field of requiredLdapFields) {
        if (!configuracao[field]) {
          return { valid: false, error: `Campo obrigatório para LDAP: ${field}` };
        }
      }
      return { valid: true };
    
    case 'GMAIL':
      const requiredGmailFields = ['clientId', 'clientSecret', 'redirectUri'];
      for (const field of requiredGmailFields) {
        if (!configuracao[field]) {
          return { valid: false, error: `Campo obrigatório para Gmail: ${field}` };
        }
      }
      return { valid: true };
    
    default:
      return { valid: false, error: 'Tipo de autenticação não suportado' };
  }
}

export default router;