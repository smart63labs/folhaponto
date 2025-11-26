import express, { Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import logger from '../utils/logger';
import { AuthenticatedRequest, User, Department, PointRecord, PointEntry } from '../types';

const router = express.Router();

// Mock data for reports
const mockUsers: User[] = [
  { id: 1, name: 'Carlos Admin', department: 'Administração', profile: 'admin', email: 'carlos@sefaz.to.gov.br', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Maria Santos', department: 'Recursos Humanos', profile: 'rh', email: 'maria@sefaz.to.gov.br', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'João Silva', department: 'Tecnologia da Informação', profile: 'servidor', email: 'joao@sefaz.to.gov.br', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'Ana Costa', department: 'Recursos Humanos', profile: 'servidor', email: 'ana@sefaz.to.gov.br', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 5, name: 'Pedro Oliveira', department: 'Financeiro', profile: 'servidor', email: 'pedro@sefaz.to.gov.br', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
];

const mockDepartments: Department[] = [
  { id: 1, name: 'Administração', manager: 'Carlos Admin', employees: 1 },
  { id: 2, name: 'Recursos Humanos', manager: 'Maria Santos', employees: 2 },
  { id: 3, name: 'Tecnologia da Informação', manager: 'João Silva', employees: 1 },
  { id: 4, name: 'Financeiro', manager: 'Pedro Oliveira', employees: 1 }
];

// Generate mock point data
const generateMockPointData = (startDate: string, endDate: string, userId: number | null = null) => {
  const data: any[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const users = userId ? [mockUsers.find(u => u.id === userId)] : mockUsers.filter(u => u.profile === 'servidor');
    
    users.forEach(user => {
      if (!user) return;
      
      // Random chance of having a record (90%)
      if (Math.random() < 0.9) {
        const baseEntry = new Date(`${dateStr}T08:00:00`);
        const entryVariation = Math.floor(Math.random() * 30) - 15; // -15 to +15 minutes
        const lunchVariation = Math.floor(Math.random() * 20) - 10; // -10 to +10 minutes
        const exitVariation = Math.floor(Math.random() * 60) - 30; // -30 to +30 minutes
        
        const entries = [
          {
            type: 'entrada',
            time: new Date(baseEntry.getTime() + entryVariation * 60000).toTimeString().split(' ')[0],
            location: 'SEFAZ-TO Sede'
          },
          {
            type: 'saida_almoco',
            time: new Date(`${dateStr}T12:00:00`).getTime() + lunchVariation * 60000,
            location: 'SEFAZ-TO Sede'
          },
          {
            type: 'volta_almoco',
            time: new Date(`${dateStr}T13:00:00`).getTime() + lunchVariation * 60000,
            location: 'SEFAZ-TO Sede'
          },
          {
            type: 'saida',
            time: new Date(`${dateStr}T17:00:00`).getTime() + exitVariation * 60000,
            location: 'SEFAZ-TO Sede'
          }
        ].map(entry => ({
          ...entry,
          time: typeof entry.time === 'number' ? 
            new Date(entry.time).toTimeString().split(' ')[0] : 
            entry.time
        }));
        
        // Calculate total hours
        const entryTime = new Date(`${dateStr}T${entries[0].time}`);
        const lunchStart = new Date(`${dateStr}T${entries[1].time}`);
        const lunchEnd = new Date(`${dateStr}T${entries[2].time}`);
        const exitTime = new Date(`${dateStr}T${entries[3].time}`);
        
        const morningHours = (lunchStart.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
        const afternoonHours = (exitTime.getTime() - lunchEnd.getTime()) / (1000 * 60 * 60);
        const totalHours = morningHours + afternoonHours;
        
        const hours = Math.floor(totalHours);
        const minutes = Math.floor((totalHours % 1) * 60);
        
        data.push({
          id: data.length + 1,
          userId: user.id,
          userName: user.name,
          userDepartment: user.department,
          date: dateStr,
          entries,
          totalHours: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
          status: entries.length === 4 ? 'completo' : 'incompleto',
          overtime: totalHours > 8 ? `${Math.floor(totalHours - 8)}:${Math.floor(((totalHours - 8) % 1) * 60).toString().padStart(2, '0')}:00` : '00:00:00'
        });
      }
    });
  }
  
  return data;
};

// Validation rules
const dateRangeValidation = [
  query('startDate').isISO8601().withMessage('Data inicial inválida'),
  query('endDate').isISO8601().withMessage('Data final inválida')
];

const reportTypeValidation = [
  query('type').optional().isIn(['summary', 'detailed', 'overtime', 'absences']).withMessage('Tipo de relatório inválido')
];

// @route   GET /api/reports/attendance
// @desc    Generate attendance report
// @access  Private (RH, Admin)
router.get('/attendance', authenticate, authorize('reports.read'), dateRangeValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { startDate, endDate, userId, departmentId, type = 'summary' } = req.query;

    // Validate date range
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 90) {
      res.status(400).json({
        success: false,
        error: 'Período máximo de 90 dias',
        code: 'PERIOD_TOO_LONG'
      });
      return;
    }

    // Generate mock data
    const pointData = generateMockPointData(startDate as string, endDate as string, userId ? parseInt(userId as string) : null);

    // Filter by department if specified
    let filteredData = pointData;
    if (departmentId) {
      const department = mockDepartments.find(d => d.id === parseInt(departmentId as string));
      if (department) {
        filteredData = pointData.filter(p => p.userDepartment === department.name);
      }
    }

    // Generate report based on type
    let reportData: any = {};

    if (type === 'summary') {
      // Summary report
      const userSummaries: Record<number, any> = {};
      
      filteredData.forEach(record => {
        if (!userSummaries[record.userId]) {
          userSummaries[record.userId] = {
            userId: record.userId,
            userName: record.userName,
            department: record.userDepartment,
            totalDays: 0,
            completeDays: 0,
            incompleteDays: 0,
            totalHours: 0,
            overtimeHours: 0,
            averageEntry: [] as string[],
            averageExit: [] as string[]
          };
        }
        
        const summary = userSummaries[record.userId];
        summary.totalDays++;
        
        if (record.status === 'completo') {
          summary.completeDays++;
        } else {
          summary.incompleteDays++;
        }
        
        // Parse total hours
        const [hours, minutes] = record.totalHours.split(':').map(Number);
        summary.totalHours += hours + (minutes / 60);
        
        // Parse overtime
        const [otHours, otMinutes] = record.overtime.split(':').map(Number);
        summary.overtimeHours += otHours + (otMinutes / 60);
        
        // Track entry and exit times for averages
        if (record.entries.length > 0) {
          summary.averageEntry.push(record.entries[0].time);
        }
        if (record.entries.length > 3) {
          summary.averageExit.push(record.entries[3].time);
        }
      });
      
      // Calculate averages
      Object.values(userSummaries).forEach((summary: any) => {
        summary.averageHours = summary.totalDays > 0 ? summary.totalHours / summary.totalDays : 0;
        summary.totalHoursFormatted = `${Math.floor(summary.totalHours)}:${Math.floor((summary.totalHours % 1) * 60).toString().padStart(2, '0')}:00`;
        summary.overtimeHoursFormatted = `${Math.floor(summary.overtimeHours)}:${Math.floor((summary.overtimeHours % 1) * 60).toString().padStart(2, '0')}:00`;
      });
      
      reportData = {
        type: 'summary',
        period: { startDate, endDate },
        users: Object.values(userSummaries),
        totals: {
          totalUsers: Object.keys(userSummaries).length,
          totalRecords: filteredData.length,
          completeRecords: filteredData.filter(r => r.status === 'completo').length,
          incompleteRecords: filteredData.filter(r => r.status === 'incompleto').length
        }
      };
      
    } else if (type === 'detailed') {
      // Detailed report
      reportData = {
        type: 'detailed',
        period: { startDate, endDate },
        records: filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
      
    } else if (type === 'overtime') {
      // Overtime report
      const overtimeRecords = filteredData.filter(r => {
        const [hours] = r.overtime.split(':').map(Number);
        return hours > 0;
      });
      
      reportData = {
        type: 'overtime',
        period: { startDate, endDate },
        records: overtimeRecords,
        summary: {
          totalOvertimeRecords: overtimeRecords.length,
          totalOvertimeHours: overtimeRecords.reduce((total: number, record: any) => {
            const [hours, minutes] = record.overtime.split(':').map(Number);
            return total + hours + (minutes / 60);
          }, 0)
        }
      };
      
    } else if (type === 'absences') {
      // Absences report
      const workingDays = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
          workingDays.push(d.toISOString().split('T')[0]);
        }
      }
      
      const absences = [];
      const userIds = userId ? [parseInt(userId)] : mockUsers.filter(u => u.profile === 'servidor').map(u => u.id);
      
      userIds.forEach(uId => {
        const user = mockUsers.find(u => u.id === uId);
        if (!user) return;
        
        workingDays.forEach(date => {
          const hasRecord = filteredData.some(r => r.userId === uId && r.date === date);
          if (!hasRecord) {
            absences.push({
              userId: uId,
              userName: user.name,
              department: user.department,
              date,
              type: 'absence'
            });
          }
        });
      });
      
      reportData = {
        type: 'absences',
        period: { startDate, endDate },
        absences,
        summary: {
          totalAbsences: absences.length,
          totalWorkingDays: workingDays.length,
          absenceRate: workingDays.length > 0 ? (absences.length / (workingDays.length * userIds.length)) * 100 : 0
        }
      };
    }

    // Log report generation
    logger.audit('REPORT_GENERATED', req.user!.id, {
      reportType: 'attendance',
      subType: type,
      period: { startDate, endDate },
      userId: userId || null,
      departmentId: departmentId || null,
      recordCount: filteredData.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    logger.error('Erro ao gerar relatório de frequência:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/reports/hours-bank
// @desc    Generate hours bank report
// @access  Private (RH, Admin)
router.get('/hours-bank', authenticate, authorize('reports.read'), dateRangeValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { startDate, endDate, userId, departmentId } = req.query;

    // Generate mock data
    const pointData = generateMockPointData(startDate as string, endDate as string, userId ? parseInt(userId as string) : null);

    // Calculate hours bank for each user
    const hoursBank: Record<number, any> = {};
    
    pointData.forEach(record => {
      if (!hoursBank[record.userId]) {
        hoursBank[record.userId] = {
          userId: record.userId,
          userName: record.userName,
          department: record.userDepartment,
          totalWorkedHours: 0,
          expectedHours: 0,
          overtimeHours: 0,
          balance: 0,
          records: []
        };
      }
      
      const userBank = hoursBank[record.userId];
      
      // Parse hours
      const [totalHours, totalMinutes] = record.totalHours.split(':').map(Number);
      const workedHours = totalHours + (totalMinutes / 60);
      
      const [otHours, otMinutes] = record.overtime.split(':').map(Number);
      const overtime = otHours + (otMinutes / 60);
      
      userBank.totalWorkedHours += workedHours;
      userBank.expectedHours += 8; // 8 hours per day
      userBank.overtimeHours += overtime;
      
      userBank.records.push({
        date: record.date,
        workedHours: record.totalHours,
        expectedHours: '08:00:00',
        overtime: record.overtime,
        balance: workedHours - 8
      });
    });
    
    // Calculate final balances
    Object.values(hoursBank).forEach(userBank => {
      userBank.balance = userBank.totalWorkedHours - userBank.expectedHours;
      userBank.totalWorkedHoursFormatted = `${Math.floor(userBank.totalWorkedHours)}:${Math.floor((userBank.totalWorkedHours % 1) * 60).toString().padStart(2, '0')}:00`;
      userBank.expectedHoursFormatted = `${Math.floor(userBank.expectedHours)}:${Math.floor((userBank.expectedHours % 1) * 60).toString().padStart(2, '0')}:00`;
      userBank.balanceFormatted = `${userBank.balance >= 0 ? '+' : ''}${Math.floor(Math.abs(userBank.balance))}:${Math.floor((Math.abs(userBank.balance) % 1) * 60).toString().padStart(2, '0')}:00`;
    });

    // Filter by department if specified
    let filteredBank = Object.values(hoursBank);
    if (departmentId) {
      const department = mockDepartments.find(d => d.id === parseInt(departmentId as string));
      if (department) {
        filteredBank = filteredBank.filter(b => b.department === department.name);
      }
    }

    const reportData = {
      type: 'hours_bank',
      period: { startDate, endDate },
      users: filteredBank,
      summary: {
        totalUsers: filteredBank.length,
        positiveBalance: filteredBank.filter(b => b.balance > 0).length,
        negativeBalance: filteredBank.filter(b => b.balance < 0).length,
        totalOvertime: filteredBank.reduce((total, b) => total + b.overtimeHours, 0)
      }
    };

    // Log report generation
    logger.audit('REPORT_GENERATED', req.user!.id, {
      reportType: 'hours_bank',
      period: { startDate, endDate },
      userId: userId || null,
      departmentId: departmentId || null,
      userCount: filteredBank.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    logger.error('Erro ao gerar relatório de banco de horas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/reports/approvals
// @desc    Generate approvals report
// @access  Private (RH, Admin)
router.get('/approvals', authenticate, authorize('reports.read'), dateRangeValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { startDate, endDate, status, type } = req.query;

    // Mock approvals data for the period
    const mockApprovals = [
      {
        id: 1,
        type: 'overtime',
        title: 'Solicitação de Hora Extra',
        requesterId: 3,
        requesterName: 'João Silva',
        department: 'Tecnologia da Informação',
        status: 'approved',
        priority: 'medium',
        createdAt: '2024-01-15T10:30:00Z',
        approvedAt: '2024-01-16T09:15:00Z',
        processingTime: 22.75 // hours
      },
      {
        id: 2,
        type: 'vacation',
        title: 'Solicitação de Férias',
        requesterId: 4,
        requesterName: 'Ana Costa',
        department: 'Recursos Humanos',
        status: 'approved',
        priority: 'high',
        createdAt: '2024-01-10T14:20:00Z',
        approvedAt: '2024-01-12T11:30:00Z',
        processingTime: 45.17 // hours
      },
      {
        id: 3,
        type: 'time_adjustment',
        title: 'Ajuste de Ponto',
        requesterId: 5,
        requesterName: 'Pedro Oliveira',
        department: 'Financeiro',
        status: 'rejected',
        priority: 'low',
        createdAt: '2024-01-18T16:45:00Z',
        rejectedAt: '2024-01-19T08:30:00Z',
        processingTime: 15.75 // hours
      }
    ];

    // Filter by date range
    let filteredApprovals = mockApprovals.filter(approval => {
      const createdDate = new Date(approval.createdAt).toISOString().split('T')[0];
      return createdDate >= startDate && createdDate <= endDate;
    });

    // Apply additional filters
    if (status) {
      filteredApprovals = filteredApprovals.filter(a => a.status === status);
    }
    if (type) {
      filteredApprovals = filteredApprovals.filter(a => a.type === type);
    }

    // Generate statistics
    const stats = {
      total: filteredApprovals.length,
      byStatus: {
        pending: filteredApprovals.filter(a => a.status === 'pending').length,
        approved: filteredApprovals.filter(a => a.status === 'approved').length,
        rejected: filteredApprovals.filter(a => a.status === 'rejected').length
      },
      byType: {
        overtime: filteredApprovals.filter(a => a.type === 'overtime').length,
        vacation: filteredApprovals.filter(a => a.type === 'vacation').length,
        time_adjustment: filteredApprovals.filter(a => a.type === 'time_adjustment').length,
        leave: filteredApprovals.filter(a => a.type === 'leave').length
      },
      byPriority: {
        urgent: filteredApprovals.filter(a => a.priority === 'urgent').length,
        high: filteredApprovals.filter(a => a.priority === 'high').length,
        medium: filteredApprovals.filter(a => a.priority === 'medium').length,
        low: filteredApprovals.filter(a => a.priority === 'low').length
      },
      averageProcessingTime: filteredApprovals.length > 0 ? 
        filteredApprovals.reduce((sum, a) => sum + (a.processingTime || 0), 0) / filteredApprovals.length : 0
    };

    const reportData = {
      type: 'approvals',
      period: { startDate, endDate },
      approvals: filteredApprovals,
      statistics: stats
    };

    // Log report generation
    logger.audit('REPORT_GENERATED', req.user!.id, {
      reportType: 'approvals',
      period: { startDate, endDate },
      filters: { status, type },
      recordCount: filteredApprovals.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    logger.error('Erro ao gerar relatório de aprovações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/reports/dashboard
// @desc    Get reports dashboard data
// @access  Private (RH, Admin)
router.get('/dashboard', authenticate, authorize('reports.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Generate data for current and last month
    const currentMonthData = generateMockPointData(
      thisMonth.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
    
    const lastMonthData = generateMockPointData(
      lastMonth.toISOString().split('T')[0],
      lastMonthEnd.toISOString().split('T')[0]
    );

    // Calculate metrics
    const dashboard = {
      currentMonth: {
        totalRecords: currentMonthData.length,
        completeRecords: currentMonthData.filter(r => r.status === 'completo').length,
        incompleteRecords: currentMonthData.filter(r => r.status === 'incompleto').length,
        totalHours: currentMonthData.reduce((total, record) => {
          const [hours, minutes] = record.totalHours.split(':').map(Number);
          return total + hours + (minutes / 60);
        }, 0),
        overtimeHours: currentMonthData.reduce((total, record) => {
          const [hours, minutes] = record.overtime.split(':').map(Number);
          return total + hours + (minutes / 60);
        }, 0)
      },
      lastMonth: {
        totalRecords: lastMonthData.length,
        completeRecords: lastMonthData.filter(r => r.status === 'completo').length,
        incompleteRecords: lastMonthData.filter(r => r.status === 'incompleto').length,
        totalHours: lastMonthData.reduce((total, record) => {
          const [hours, minutes] = record.totalHours.split(':').map(Number);
          return total + hours + (minutes / 60);
        }, 0),
        overtimeHours: lastMonthData.reduce((total, record) => {
          const [hours, minutes] = record.overtime.split(':').map(Number);
          return total + hours + (minutes / 60);
        }, 0)
      },
      trends: {},
      topUsers: {},
      departments: mockDepartments.map(dept => ({
        name: dept.name,
        employees: dept.employees,
        records: currentMonthData.filter(r => r.userDepartment === dept.name).length
      }))
    };

    // Calculate trends
    dashboard.trends = {
      records: dashboard.currentMonth.totalRecords - dashboard.lastMonth.totalRecords,
      completeness: ((dashboard.currentMonth.completeRecords / Math.max(dashboard.currentMonth.totalRecords, 1)) * 100) - 
                   ((dashboard.lastMonth.completeRecords / Math.max(dashboard.lastMonth.totalRecords, 1)) * 100),
      overtime: dashboard.currentMonth.overtimeHours - dashboard.lastMonth.overtimeHours
    };

    // Top users by hours worked
    const userHours = {};
    currentMonthData.forEach(record => {
      if (!userHours[record.userId]) {
        userHours[record.userId] = {
          name: record.userName,
          department: record.userDepartment,
          totalHours: 0
        };
      }
      const [hours, minutes] = record.totalHours.split(':').map(Number);
      userHours[record.userId].totalHours += hours + (minutes / 60);
    });

    dashboard.topUsers = Object.values(userHours)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5)
      .map(user => ({
        ...user,
        totalHoursFormatted: `${Math.floor(user.totalHours)}:${Math.floor((user.totalHours % 1) * 60).toString().padStart(2, '0')}:00`
      }));

    res.json({
      success: true,
      data: { dashboard }
    });

  } catch (error) {
    logger.error('Erro ao buscar dashboard de relatórios:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/reports/export
// @desc    Export report data
// @access  Private (RH, Admin)
router.get('/export', authenticate, authorize('reports.read'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { reportType, format = 'json', ...params } = req.query;

    if (!reportType) {
      res.status(400).json({
        success: false,
        error: 'Tipo de relatório é obrigatório',
        code: 'MISSING_REPORT_TYPE'
      });
      return;
    }

    // This would typically generate and return file data
    // For now, we'll return a mock response
    const exportData = {
      reportType,
      format,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user!.name,
      parameters: params,
      downloadUrl: `/api/reports/download/${reportType}-${Date.now()}.${format}`
    };

    // Log export
    logger.audit('REPORT_EXPORTED', req.user!.id, {
      reportType,
      format,
      parameters: params,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Relatório exportado com sucesso',
      data: exportData
    });

  } catch (error) {
    logger.error('Erro ao exportar relatório:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;