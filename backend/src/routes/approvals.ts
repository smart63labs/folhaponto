import express, { Request, Response } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import logger from '../utils/logger';
import { Approval, WorkflowTemplate, AuthenticatedRequest, PaginatedResponse, ApiResponse } from '../types';
import { approvalHierarchyService } from '../services/approvalService';
import { SectorService } from '../services/sectorService';

const router = express.Router();

// Mock approvals data
const mockApprovals: Approval[] = [
  {
    id: 1,
    type: 'overtime',
    title: 'Solicitação de Hora Extra',
    description: 'Hora extra para finalizar relatório mensal',
    requesterId: 3,
    requesterName: 'João Silva',
    requesterDepartment: 'Tecnologia da Informação',
    requesterSectorId: 3,
    requesterSectorName: 'Diretoria de Tecnologia da Informação',
    approverId: 2,
    approverName: 'Maria Santos',
    status: 'pending',
    priority: 'medium',
    data: {
      date: '2024-01-20',
      startTime: '18:00',
      endTime: '22:00',
      hours: 4,
      justification: 'Necessário finalizar relatório mensal antes do prazo'
    },
    createdAt: '2024-01-18T10:30:00Z',
    updatedAt: '2024-01-18T10:30:00Z',
    deadline: '2024-01-19T23:59:59Z'
  },
  {
    id: 2,
    type: 'vacation',
    title: 'Solicitação de Férias',
    description: 'Férias de 15 dias',
    requesterId: 4,
    requesterName: 'Ana Costa',
    requesterDepartment: 'Recursos Humanos',
    requesterSectorId: 4,
    requesterSectorName: 'Diretoria de Gestão de Pessoas',
    approverId: 1,
    approverName: 'Carlos Admin',
    status: 'approved',
    priority: 'high',
    data: {
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      days: 15,
      type: 'annual',
      justification: 'Férias anuais programadas'
    },
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    approvedAt: '2024-01-16T09:15:00Z',
    deadline: '2024-01-25T23:59:59Z',
    comments: 'Aprovado. Boas férias!'
  },
  {
    id: 3,
    type: 'time_adjustment',
    title: 'Ajuste de Ponto',
    description: 'Correção de horário de entrada',
    requesterId: 5,
    requesterName: 'Pedro Oliveira',
    requesterDepartment: 'Financeiro',
    requesterSectorId: 5,
    requesterSectorName: 'Diretoria Administrativa e Financeira',
    approverId: 2,
    approverName: 'Maria Santos',
    status: 'rejected',
    priority: 'low',
    data: {
      date: '2024-01-17',
      originalTime: '08:30',
      requestedTime: '08:00',
      type: 'entrada',
      justification: 'Esqueci de bater o ponto na entrada'
    },
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-18T08:30:00Z',
    rejectedAt: '2024-01-18T08:30:00Z',
    deadline: '2024-01-20T23:59:59Z',
    comments: 'Não há justificativa suficiente para o ajuste solicitado.'
  }
];

// Mock workflow templates
const mockWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 1,
    type: 'overtime',
    name: 'Aprovação de Hora Extra',
    description: 'Fluxo para aprovação de horas extras',
    steps: [
      { order: 1, role: 'supervisor', required: true, timeout: 24 },
      { order: 2, role: 'rh', required: false, timeout: 48 }
    ],
    autoApprove: false,
    maxHours: 8
  },
  {
    id: 2,
    type: 'vacation',
    name: 'Aprovação de Férias',
    description: 'Fluxo para aprovação de férias',
    steps: [
      { order: 1, role: 'supervisor', required: true, timeout: 72 },
      { order: 2, role: 'rh', required: true, timeout: 48 }
    ],
    autoApprove: false,
    minDaysAdvance: 30
  },
  {
    id: 3,
    type: 'time_adjustment',
    name: 'Ajuste de Ponto',
    description: 'Fluxo para correção de registros de ponto',
    steps: [
      { order: 1, role: 'supervisor', required: true, timeout: 48 }
    ],
    autoApprove: true,
    maxDaysBack: 7
  }
];

// Validation rules
const createApprovalValidation = [
  body('type').isIn(['overtime', 'vacation', 'time_adjustment', 'leave']).withMessage('Tipo de solicitação inválido'),
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Título deve ter entre 5 e 100 caracteres'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('data').isObject().withMessage('Dados da solicitação são obrigatórios'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioridade inválida')
];

const approvalActionValidation = [
  body('action').isIn(['approve', 'reject', 'request_changes']).withMessage('Ação inválida'),
  body('comments').optional().trim().isLength({ max: 1000 }).withMessage('Comentários devem ter no máximo 1000 caracteres')
];

// Helper functions
const getApprovalById = (id: number): Approval | undefined => {
  return mockApprovals.find(approval => approval.id === id);
};

const canUserApprove = async (approval: Approval, userId: number, userProfile: string, userSectorId?: number): Promise<boolean> => {
  // Check if user is the approver
  if (approval.approverId === userId) return true;
  
  // Check if user has admin or RH permissions
  if (userProfile === 'admin' || userProfile === 'rh') return true;
  
  // Use hierarchy service to check approval permissions
  if (userSectorId && approval.requesterSectorId) {
    try {
      return await approvalHierarchyService.canApproveRequest(userId, approval.requesterSectorId);
    } catch (error) {
      logger.error('Erro ao verificar permissão de aprovação:', error);
    }
  }
  
  // Fallback to original logic
  if (userProfile === 'supervisor' && approval.type !== 'vacation') return true;
  
  return false;
};

const calculateDeadline = (type: string, hours: number = 48): string => {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline.toISOString();
};

// @route   POST /api/approvals
// @desc    Create new approval request
// @access  Private
router.post('/', authenticate, createApprovalValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { type, title, description, data, priority = 'medium' } = req.body;
    const userId: number = req.user.id;

    // Find workflow template
    const template: WorkflowTemplate | undefined = mockWorkflowTemplates.find(t => t.type === type);
    if (!template) {
      res.status(400).json({
        success: false,
        error: 'Tipo de solicitação não suportado',
        code: 'UNSUPPORTED_TYPE'
      });
      return;
    }

    // Validate specific data based on type
    let validationError: string | null = null;
    switch (type) {
      case 'overtime':
        if (!data.date || !data.startTime || !data.endTime || !data.hours) {
          validationError = 'Dados de hora extra incompletos';
        }
        if (data.hours > template.maxHours) {
          validationError = `Máximo de ${template.maxHours} horas extras permitidas`;
        }
        break;
      case 'vacation':
        if (!data.startDate || !data.endDate || !data.days) {
          validationError = 'Dados de férias incompletos';
        }
        const requestDate = new Date();
        const vacationStart = new Date(data.startDate);
        const daysAdvance = (vacationStart.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysAdvance < template.minDaysAdvance) {
          validationError = `Férias devem ser solicitadas com ${template.minDaysAdvance} dias de antecedência`;
        }
        break;
      case 'time_adjustment':
        if (!data.date || !data.originalTime || !data.requestedTime || !data.type) {
          validationError = 'Dados de ajuste de ponto incompletos';
        }
        const adjustmentDate = new Date(data.date);
        const today = new Date();
        const daysBack = (today.getTime() - adjustmentDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysBack > template.maxDaysBack) {
          validationError = `Ajustes só podem ser solicitados até ${template.maxDaysBack} dias após a data`;
        }
        break;
    }

    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError,
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    // Determine approver using hierarchy service
    let approverId: number | null = null;
    let approverName: string | null = null;
    
    if (req.user.profile === 'servidor' && req.user.sectorId) {
      try {
        const possibleApprovers = await approvalHierarchyService.getPossibleApprovers(req.user.sectorId);
        if (possibleApprovers.length > 0) {
          // Use the first available approver (could be enhanced with more logic)
          approverId = possibleApprovers[0].id;
          approverName = possibleApprovers[0].name;
        }
      } catch (error) {
        logger.error('Erro ao determinar aprovador:', error);
        // Fallback to mock supervisor
        approverId = 2;
        approverName = 'Maria Santos';
      }
    }

    // Create approval
    const newApproval: Approval = {
      id: Math.max(...mockApprovals.map(a => a.id), 0) + 1,
      type,
      title,
      description: description || '',
      requesterId: userId,
      requesterName: req.user.name,
      requesterDepartment: req.user.department,
      requesterSectorId: req.user.sectorId,
      requesterSectorName: req.user.sectorName,
      approverId,
      approverName,
      status: 'pending',
      priority,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: calculateDeadline(type, template.steps[0].timeout)
    };

    mockApprovals.push(newApproval);

    // Log creation
    logger.audit('APPROVAL_CREATED', userId, {
      approvalId: newApproval.id,
      type,
      title,
      priority,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Solicitação criada com sucesso',
      data: { approval: newApproval }
    });

  } catch (error) {
    logger.error('Erro ao criar solicitação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/approvals
// @desc    Get approvals (filtered by user role)
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, type, priority, page = 1, limit = 10 } = req.query;
    const userId: number = req.user.id;
    const userProfile: string = req.user.profile;

    let filteredApprovals: Approval[] = [...mockApprovals];

    // Filter based on user role and sector hierarchy
    if (userProfile === 'servidor') {
      // Users can only see their own requests
      filteredApprovals = filteredApprovals.filter(approval => approval.requesterId === userId);
    } else if (userProfile === 'supervisor') {
      // Supervisors can see requests they need to approve or from their sector hierarchy
      filteredApprovals = filteredApprovals.filter(async approval => {
        if (approval.approverId === userId) return true;
        
        // Check if user can approve based on sector hierarchy
        if (req.user.sectorId && approval.requesterSectorId) {
          try {
            return await approvalHierarchyService.canApproveRequest(userId, approval.requesterSectorId);
          } catch (error) {
            logger.error('Erro ao verificar hierarquia:', error);
            // Fallback to department check
            return approval.requesterDepartment === req.user.department;
          }
        }
        
        return approval.requesterDepartment === req.user.department;
      });
      
      // Since we're using async filter, we need to resolve all promises
      const filterResults = await Promise.all(
        [...mockApprovals].map(async approval => {
          if (approval.approverId === userId) return true;
          
          if (req.user.sectorId && approval.requesterSectorId) {
            try {
              return await approvalHierarchyService.canApproveRequest(userId, approval.requesterSectorId);
            } catch (error) {
              logger.error('Erro ao verificar hierarquia:', error);
              return approval.requesterDepartment === req.user.department;
            }
          }
          
          return approval.requesterDepartment === req.user.department;
        })
      );
      
      filteredApprovals = mockApprovals.filter((_, index) => filterResults[index]);
    }
    // Admin and RH can see all approvals

    // Apply filters
    if (status) {
      filteredApprovals = filteredApprovals.filter(approval => approval.status === status);
    }
    if (type) {
      filteredApprovals = filteredApprovals.filter(approval => approval.type === type);
    }
    if (priority) {
      filteredApprovals = filteredApprovals.filter(approval => approval.priority === priority);
    }

    // Pagination
    const pageNum: number = parseInt(page as string) || 1;
    const limitNum: number = parseInt(limit as string) || 10;
    const startIndex: number = (pageNum - 1) * limitNum;
    const endIndex: number = startIndex + limitNum;

    const paginatedApprovals: Approval[] = filteredApprovals.slice(startIndex, endIndex);

    // Log access
    logger.audit('APPROVALS_ACCESSED', userId, {
      filters: { status, type, priority },
      page: pageNum,
      limit: limitNum,
      totalResults: filteredApprovals.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const response: PaginatedResponse<Approval> = {
      success: true,
      data: paginatedApprovals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredApprovals.length,
        pages: Math.ceil(filteredApprovals.length / limitNum)
      }
    };

    res.json(response);

  } catch (error) {
    logger.error('Erro ao buscar solicitações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/approvals/:id
// @desc    Get specific approval
// @access  Private
router.get('/:id', authenticate, param('id').isInt().withMessage('ID inválido'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { id } = req.params;
    const userId: number = req.user.id;
    const userProfile: string = req.user.profile;

    const approval: Approval | undefined = getApprovalById(parseInt(id));
    if (!approval) {
      res.status(404).json({
        success: false,
        error: 'Solicitação não encontrada',
        code: 'APPROVAL_NOT_FOUND'
      });
      return;
    }

    // Check if user can view this approval
    const canView: boolean = userProfile === 'admin' || 
                   approval.requesterId === userId || 
                   approval.approverId === userId ||
                   (userProfile === 'rh' && ['vacation', 'leave'].includes(approval.type));

    if (!canView) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado',
        code: 'ACCESS_DENIED'
      });
      return;
    }

    res.json({
      success: true,
      data: { approval }
    });

  } catch (error) {
    logger.error('Erro ao buscar solicitação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   PUT /api/approvals/:id/action
// @desc    Approve, reject or request changes
// @access  Private (Approvers only)
router.put('/:id/action', authenticate, 
  param('id').isInt().withMessage('ID inválido'),
  approvalActionValidation,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      const { id } = req.params;
      const { action, comments } = req.body;
      const userId: number = req.user.id;
      const userProfile: string = req.user.profile;

      const approval: Approval | undefined = getApprovalById(parseInt(id));
      if (!approval) {
        res.status(404).json({
          success: false,
          error: 'Solicitação não encontrada',
          code: 'APPROVAL_NOT_FOUND'
        });
        return;
      }

      // Check if user can approve
      const canApprove = await canUserApprove(approval, userId, userProfile, req.user.sectorId);
      if (!canApprove) {
        res.status(403).json({
          success: false,
          error: 'Você não tem permissão para aprovar esta solicitação',
          code: 'APPROVAL_DENIED'
        });
        return;
      }

      // Check if approval is still pending
      if (approval.status !== 'pending') {
        res.status(400).json({
          success: false,
          error: 'Esta solicitação já foi processada',
          code: 'ALREADY_PROCESSED'
        });
        return;
      }

      // Update approval
      approval.status = action === 'approve' ? 'approved' : 
                       action === 'reject' ? 'rejected' : 'changes_requested';
      approval.updatedAt = new Date().toISOString();
      approval.comments = comments || '';
      approval.processedBy = userId;
      approval.processedByName = req.user.name;

      if (action === 'approve') {
        approval.approvedAt = new Date().toISOString();
      } else if (action === 'reject') {
        approval.rejectedAt = new Date().toISOString();
      }

      // Log action
      logger.audit('APPROVAL_PROCESSED', userId, {
        approvalId: approval.id,
        action,
        requesterId: approval.requesterId,
        type: approval.type,
        comments: comments || '',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `Solicitação ${action === 'approve' ? 'aprovada' : action === 'reject' ? 'rejeitada' : 'retornada para alterações'} com sucesso`,
        data: { approval }
      });

    } catch (error) {
      logger.error('Erro ao processar solicitação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// @route   DELETE /api/approvals/:id
// @desc    Cancel approval request (only by requester)
// @access  Private
router.delete('/:id', authenticate, param('id').isInt().withMessage('ID inválido'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { id } = req.params;
    const userId: number = req.user.id;

    const approval: Approval | undefined = getApprovalById(parseInt(id));
    if (!approval) {
      res.status(404).json({
        success: false,
        error: 'Solicitação não encontrada',
        code: 'APPROVAL_NOT_FOUND'
      });
      return;
    }

    // Only requester or admin can cancel
    if (approval.requesterId !== userId && req.user.profile !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Você só pode cancelar suas próprias solicitações',
        code: 'ACCESS_DENIED'
      });
      return;
    }

    // Can only cancel pending requests
    if (approval.status !== 'pending') {
      res.status(400).json({
        success: false,
        error: 'Só é possível cancelar solicitações pendentes',
        code: 'CANNOT_CANCEL'
      });
      return;
    }

    // Update status to cancelled
    approval.status = 'cancelled';
    approval.updatedAt = new Date().toISOString();
    approval.cancelledAt = new Date().toISOString();

    // Log cancellation
    logger.audit('APPROVAL_CANCELLED', userId, {
      approvalId: approval.id,
      type: approval.type,
      title: approval.title,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Solicitação cancelada com sucesso',
      data: { approval }
    });

  } catch (error) {
    logger.error('Erro ao cancelar solicitação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/approvals/templates
// @desc    Get workflow templates
// @access  Private
router.get('/templates', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: { templates: mockWorkflowTemplates }
    });
  } catch (error) {
    logger.error('Erro ao buscar templates:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/approvals/dashboard
// @desc    Get approval dashboard data
// @access  Private (Managers only)
router.get('/dashboard', authenticate, authorize('approvals.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId: number = req.user.id;
    const userProfile: string = req.user.profile;

    // Filter approvals based on user role
    let relevantApprovals: Approval[] = [...mockApprovals];
    
    if (userProfile === 'supervisor') {
      relevantApprovals = relevantApprovals.filter(approval => 
        approval.approverId === userId || 
        approval.requesterDepartment === req.user.department
      );
    } else if (userProfile === 'rh') {
      relevantApprovals = relevantApprovals.filter(approval => 
        ['vacation', 'leave'].includes(approval.type) || approval.approverId === userId
      );
    }
    // Admin sees all

    // Calculate statistics
    const stats = {
      total: relevantApprovals.length,
      pending: relevantApprovals.filter(a => a.status === 'pending').length,
      approved: relevantApprovals.filter(a => a.status === 'approved').length,
      rejected: relevantApprovals.filter(a => a.status === 'rejected').length,
      overdue: relevantApprovals.filter(a => 
        a.status === 'pending' && new Date(a.deadline) < new Date()
      ).length,
      byType: {
        overtime: relevantApprovals.filter(a => a.type === 'overtime').length,
        vacation: relevantApprovals.filter(a => a.type === 'vacation').length,
        time_adjustment: relevantApprovals.filter(a => a.type === 'time_adjustment').length,
        leave: relevantApprovals.filter(a => a.type === 'leave').length
      },
      byPriority: {
        urgent: relevantApprovals.filter(a => a.priority === 'urgent').length,
        high: relevantApprovals.filter(a => a.priority === 'high').length,
        medium: relevantApprovals.filter(a => a.priority === 'medium').length,
        low: relevantApprovals.filter(a => a.priority === 'low').length
      }
    };

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity: Approval[] = relevantApprovals
      .filter(a => new Date(a.updatedAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    // Pending approvals requiring attention
    const pendingApprovals: Approval[] = relevantApprovals
      .filter(a => a.status === 'pending' && a.approverId === userId)
      .sort((a, b) => {
        // Sort by priority and deadline
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        stats,
        recentActivity,
        pendingApprovals
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;