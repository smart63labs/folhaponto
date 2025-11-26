import express, { Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import logger from '../utils/logger';
import { AuthenticatedRequest, AuditLog, PaginatedResponse } from '../types';

const router = express.Router();

// Mock audit logs data
const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    timestamp: '2024-01-20T10:30:00Z',
    userId: 3,
    userName: 'João Silva',
    userProfile: 'servidor',
    action: 'POINT_REGISTERED',
    resource: 'point',
    resourceId: null,
    details: {
      type: 'entrada',
      time: '08:00:00',
      location: 'SEFAZ-TO Sede',
      ip: '192.168.1.100'
    },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'info',
    category: 'point_management'
  },
  {
    id: 2,
    timestamp: '2024-01-20T09:15:00Z',
    userId: 1,
    userName: 'Carlos Admin',
    userProfile: 'admin',
    action: 'USER_CREATED',
    resource: 'users',
    resourceId: 6,
    details: {
      targetUserId: 6,
      targetUserName: 'Novo Funcionário',
      department: 'Tecnologia da Informação',
      profile: 'servidor'
    },
    ip: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'info',
    category: 'user_management'
  },
  {
    id: 3,
    timestamp: '2024-01-20T08:45:00Z',
    userId: 2,
    userName: 'Maria Santos',
    userProfile: 'rh',
    action: 'APPROVAL_PROCESSED',
    resource: 'approvals',
    resourceId: 1,
    details: {
      approvalId: 1,
      action: 'approved',
      requesterId: 3,
      type: 'overtime',
      comments: 'Aprovado conforme justificativa'
    },
    ip: '192.168.1.75',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'info',
    category: 'approval_management'
  },
  {
    id: 4,
    timestamp: '2024-01-19T23:30:00Z',
    userId: null,
    userName: 'Sistema',
    userProfile: 'system',
    action: 'BACKUP_COMPLETED',
    resource: 'system',
    resourceId: null,
    details: {
      backupType: 'daily',
      size: '2.5GB',
      duration: '15 minutes',
      status: 'success'
    },
    ip: 'localhost',
    userAgent: 'System/1.0',
    severity: 'info',
    category: 'system_maintenance'
  },
  {
    id: 5,
    timestamp: '2024-01-19T16:20:00Z',
    userId: 4,
    userName: 'Ana Costa',
    userProfile: 'servidor',
    action: 'LOGIN_FAILED',
    resource: 'auth',
    resourceId: null,
    details: {
      email: 'ana.costa@sefaz.to.gov.br',
      reason: 'invalid_password',
      attempts: 3
    },
    ip: '192.168.1.120',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'warning',
    category: 'authentication'
  },
  {
    id: 6,
    timestamp: '2024-01-19T14:10:00Z',
    userId: 1,
    userName: 'Carlos Admin',
    userProfile: 'admin',
    action: 'SYSTEM_CONFIG_CHANGED',
    resource: 'system',
    resourceId: null,
    details: {
      setting: 'max_overtime_hours',
      oldValue: '8',
      newValue: '10',
      reason: 'Ajuste conforme nova política'
    },
    ip: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'warning',
    category: 'system_configuration'
  },
  {
    id: 7,
    timestamp: '2024-01-19T11:45:00Z',
    userId: 5,
    userName: 'Pedro Oliveira',
    userProfile: 'servidor',
    action: 'REPORT_GENERATED',
    resource: 'reports',
    resourceId: null,
    details: {
      reportType: 'attendance',
      period: { startDate: '2024-01-01', endDate: '2024-01-19' },
      recordCount: 150
    },
    ip: '192.168.1.90',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'info',
    category: 'reporting'
  },
  {
    id: 8,
    timestamp: '2024-01-18T17:30:00Z',
    userId: null,
    userName: 'Sistema',
    userProfile: 'system',
    action: 'SECURITY_ALERT',
    resource: 'security',
    resourceId: null,
    details: {
      alertType: 'multiple_failed_logins',
      targetUser: 'ana.costa@sefaz.to.gov.br',
      attempts: 5,
      timeWindow: '30 minutes',
      action: 'account_temporarily_locked'
    },
    ip: '192.168.1.120',
    userAgent: 'System/1.0',
    severity: 'error',
    category: 'security'
  }
];

// Validation rules
const dateRangeValidation = [
  query('startDate').optional().isISO8601().withMessage('Data inicial inválida'),
  query('endDate').optional().isISO8601().withMessage('Data final inválida')
];

const auditFiltersValidation = [
  query('userId').optional().isInt().withMessage('ID do usuário inválido'),
  query('action').optional().trim().isLength({ min: 1 }).withMessage('Ação inválida'),
  query('resource').optional().trim().isLength({ min: 1 }).withMessage('Recurso inválido'),
  query('severity').optional().isIn(['info', 'warning', 'error']).withMessage('Severidade inválida'),
  query('category').optional().trim().isLength({ min: 1 }).withMessage('Categoria inválida')
];

// Helper functions
const filterAuditLogs = (logs: AuditLog[], filters: any): AuditLog[] => {
  let filtered = [...logs];

  if (filters.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate);
  }
  if (filters.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate);
  }
  if (filters.userId) {
    filtered = filtered.filter(log => log.userId === parseInt(filters.userId));
  }
  if (filters.action) {
    filtered = filtered.filter(log => log.action.toLowerCase().includes(filters.action.toLowerCase()));
  }
  if (filters.resource) {
    filtered = filtered.filter(log => log.resource === filters.resource);
  }
  if (filters.severity) {
    filtered = filtered.filter(log => log.severity === filters.severity);
  }
  if (filters.category) {
    filtered = filtered.filter(log => log.category === filters.category);
  }
  if (filters.ip) {
    filtered = filtered.filter(log => log.ip === filters.ip);
  }

  return filtered;
};

const generateAuditSummary = (logs: AuditLog[]) => {
  const summary = {
    total: logs.length,
    bySeverity: {
      info: logs.filter(l => l.severity === 'info').length,
      warning: logs.filter(l => l.severity === 'warning').length,
      error: logs.filter(l => l.severity === 'error').length
    },
    byCategory: {} as Record<string, number>,
    byAction: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
    topIPs: {} as Record<string, number>,
    timeDistribution: {} as Record<number, number>
  };

  // Count by category
  logs.forEach(log => {
    summary.byCategory[log.category] = (summary.byCategory[log.category] || 0) + 1;
  });

  // Count by action
  logs.forEach(log => {
    summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
  });

  // Count by user
  logs.forEach(log => {
    if (log.userId) {
      const key = `${log.userName} (${log.userProfile})`;
      summary.byUser[key] = (summary.byUser[key] || 0) + 1;
    }
  });

  // Count by IP
  logs.forEach(log => {
    summary.topIPs[log.ip] = (summary.topIPs[log.ip] || 0) + 1;
  });

  // Time distribution (by hour)
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    summary.timeDistribution[hour] = (summary.timeDistribution[hour] || 0) + 1;
  });

  return summary;
};

// @route   GET /api/audit/logs
// @desc    Get audit logs with filtering
// @access  Private (Admin only)
router.get('/logs', authenticate, authorize('audit.read'), dateRangeValidation, auditFiltersValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
      return;
    }

    const { page = 1, limit = 50, ...filters } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Apply filters
    const filteredLogs: AuditLog[] = filterAuditLogs(mockAuditLogs, filters);

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    // Generate summary
    const summary = generateAuditSummary(filteredLogs);

    // Log audit access
    logger.audit('AUDIT_LOGS_ACCESSED', req.user!.id, {
      filters,
      resultCount: filteredLogs.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: filteredLogs.length,
          pages: Math.ceil(filteredLogs.length / limitNum)
        },
        summary,
        filters: filters
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar logs de auditoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/audit/logs/:id
// @desc    Get specific audit log
// @access  Private (Admin only)
router.get('/logs/:id', authenticate, authorize('audit.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const log = mockAuditLogs.find(l => l.id === parseInt(id));
    if (!log) {
      res.status(404).json({
        success: false,
        error: 'Log de auditoria não encontrado',
        code: 'LOG_NOT_FOUND'
      });
      return;
    }

    // Log access to specific audit log
    logger.audit('AUDIT_LOG_VIEWED', req.user!.id, {
      logId: parseInt(id),
      targetAction: log.action,
      targetUser: log.userName,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: { log }
    });

  } catch (error) {
    logger.error('Erro ao buscar log de auditoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/audit/dashboard
// @desc    Get audit dashboard data
// @access  Private (Admin only)
router.get('/dashboard', authenticate, authorize('audit.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter logs by time periods
    const todayLogs = mockAuditLogs.filter(log => new Date(log.timestamp) >= today);
    const yesterdayLogs = mockAuditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= yesterday && logDate < today;
    });
    const weekLogs = mockAuditLogs.filter(log => new Date(log.timestamp) >= thisWeek);
    const monthLogs = mockAuditLogs.filter(log => new Date(log.timestamp) >= thisMonth);

    // Security alerts (errors and warnings)
    const securityAlerts = mockAuditLogs.filter(log => 
      log.severity === 'error' || 
      (log.severity === 'warning' && log.category === 'security')
    ).slice(0, 10);

    // Recent critical activities
    const criticalActivities = mockAuditLogs.filter(log =>
      ['USER_CREATED', 'USER_DELETED', 'SYSTEM_CONFIG_CHANGED', 'BACKUP_COMPLETED', 'SECURITY_ALERT'].includes(log.action)
    ).slice(0, 10);

    // Top users by activity
    const userActivity = {};
    weekLogs.forEach(log => {
      if (log.userId && log.userName) {
        const key = log.userName;
        userActivity[key] = (userActivity[key] || 0) + 1;
      }
    });

    const topUsers = Object.entries(userActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Activity by hour (last 24 hours)
    const hourlyActivity = {};
    for (let i = 0; i < 24; i++) {
      hourlyActivity[i] = 0;
    }
    
    todayLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyActivity[hour]++;
    });

    const dashboard = {
      overview: {
        today: {
          total: todayLogs.length,
          errors: todayLogs.filter(l => l.severity === 'error').length,
          warnings: todayLogs.filter(l => l.severity === 'warning').length
        },
        yesterday: {
          total: yesterdayLogs.length,
          errors: yesterdayLogs.filter(l => l.severity === 'error').length,
          warnings: yesterdayLogs.filter(l => l.severity === 'warning').length
        },
        thisWeek: {
          total: weekLogs.length,
          errors: weekLogs.filter(l => l.severity === 'error').length,
          warnings: weekLogs.filter(l => l.severity === 'warning').length
        },
        thisMonth: {
          total: monthLogs.length,
          errors: monthLogs.filter(l => l.severity === 'error').length,
          warnings: monthLogs.filter(l => l.severity === 'warning').length
        }
      },
      trends: {
        dailyChange: todayLogs.length - yesterdayLogs.length,
        errorTrend: todayLogs.filter(l => l.severity === 'error').length - 
                   yesterdayLogs.filter(l => l.severity === 'error').length
      },
      securityAlerts,
      criticalActivities,
      topUsers,
      hourlyActivity: Object.entries(hourlyActivity).map(([hour, count]) => ({
        hour: parseInt(hour),
        count
      })),
      categoryDistribution: generateAuditSummary(weekLogs).byCategory
    };

    res.json({
      success: true,
      data: { dashboard }
    });

  } catch (error) {
    logger.error('Erro ao buscar dashboard de auditoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/audit/security-alerts
// @desc    Get security alerts
// @access  Private (Admin only)
router.get('/security-alerts', authenticate, authorize('audit.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { severity, resolved, page = 1, limit = 20 } = req.query;

    // Filter security-related logs
    let securityLogs = mockAuditLogs.filter(log => 
      log.category === 'security' || 
      log.category === 'authentication' ||
      log.severity === 'error' ||
      ['LOGIN_FAILED', 'SECURITY_ALERT', 'UNAUTHORIZED_ACCESS'].includes(log.action)
    );

    // Apply filters
    if (severity) {
      securityLogs = securityLogs.filter(log => log.severity === severity);
    }

    // Sort by severity and timestamp
    const severityOrder = { error: 3, warning: 2, info: 1 };
    securityLogs.sort((a, b) => {
      if (severityOrder[b.severity] !== severityOrder[a.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedAlerts = securityLogs.slice(startIndex, endIndex);

    // Generate summary
    const alertSummary = {
      total: securityLogs.length,
      critical: securityLogs.filter(l => l.severity === 'error').length,
      warnings: securityLogs.filter(l => l.severity === 'warning').length,
      recent: securityLogs.filter(l => {
        const logDate = new Date(l.timestamp);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return logDate >= oneDayAgo;
      }).length
    };

    res.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: securityLogs.length,
          pages: Math.ceil(securityLogs.length / limitNum)
        },
        summary: alertSummary
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar alertas de segurança:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/audit/user-activity/:userId
// @desc    Get user activity logs
// @access  Private (Admin, RH, or own user)
router.get('/user-activity/:userId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    const requestingUserId = req.user!.id;
    const requestingUserProfile = req.user!.profile;

    // Check permissions
    const canViewActivity = requestingUserProfile === 'admin' || 
                           requestingUserProfile === 'rh' || 
                           requestingUserId === parseInt(userId);

    if (!canViewActivity) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado',
        code: 'ACCESS_DENIED'
      });
      return;
    }

    // Filter logs for specific user
    let userLogs = mockAuditLogs.filter(log => log.userId === parseInt(userId));

    // Apply date filters
    if (startDate) {
      userLogs = userLogs.filter(log => log.timestamp >= startDate);
    }
    if (endDate) {
      userLogs = userLogs.filter(log => log.timestamp <= endDate);
    }

    // Sort by timestamp (newest first)
    userLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedLogs = userLogs.slice(startIndex, endIndex);

    // Generate user activity summary
    const activitySummary = {
      totalActions: userLogs.length,
      byCategory: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      lastActivity: userLogs.length > 0 ? userLogs[0].timestamp : null,
      mostActiveHour: null as string | null
    };

    // Count by category and action
    userLogs.forEach(log => {
      activitySummary.byCategory[log.category] = (activitySummary.byCategory[log.category] || 0) + 1;
      activitySummary.byAction[log.action] = (activitySummary.byAction[log.action] || 0) + 1;
    });

    // Find most active hour
    const hourCounts: Record<number, number> = {};
    userLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    if (Object.keys(hourCounts).length > 0) {
      activitySummary.mostActiveHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
    }

    // Log access to user activity
    logger.audit('USER_ACTIVITY_ACCESSED', requestingUserId, {
      targetUserId: parseInt(userId),
      dateRange: { startDate, endDate },
      resultCount: userLogs.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: userLogs.length,
          pages: Math.ceil(userLogs.length / limitNum)
        },
        summary: activitySummary,
        user: {
          id: parseInt(userId),
          name: userLogs.length > 0 ? userLogs[0].userName : 'Usuário não encontrado'
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar atividade do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/audit/export
// @desc    Export audit logs
// @access  Private (Admin only)
router.get('/export', authenticate, authorize('audit.read'), dateRangeValidation, auditFiltersValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
      return;
    }

    const { format = 'json', ...filters } = req.query;

    // Apply filters
    const filteredLogs = filterAuditLogs(mockAuditLogs, filters);

    // This would typically generate and return file data
    // For now, we'll return a mock response
    const exportData = {
      format,
      totalRecords: filteredLogs.length,
      filters,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user!.name,
      downloadUrl: `/api/audit/download/audit-logs-${Date.now()}.${format}`
    };

    // Log export
    logger.audit('AUDIT_LOGS_EXPORTED', req.user!.id, {
      format,
      filters,
      recordCount: filteredLogs.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Logs de auditoria exportados com sucesso',
      data: exportData
    });

  } catch (error) {
    logger.error('Erro ao exportar logs de auditoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.post('/irregularities', async (req: Request, res: Response) => {
  try {
    const { userId, setorId, latitude, longitude, action, reason, distance, radius } = req.body || {};
    const newId = mockAuditLogs.length > 0 ? Math.max(...mockAuditLogs.map(l => l.id)) + 1 : 1;
    mockAuditLogs.push({
      id: newId,
      timestamp: new Date().toISOString(),
      userId: userId || null,
      userName: 'Desconhecido',
      userProfile: 'servidor',
      action: 'ZONE_IRREGULARITY',
      resource: 'zone_validation',
      resourceId: null,
      details: { setorId, latitude, longitude, action, reason, distance, radius },
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
      severity: 'warning',
      category: 'security'
    });
    logger.security('ZONE_IRREGULARITY', { userId, setorId, latitude, longitude, action, reason, distance, radius });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});
export default router;