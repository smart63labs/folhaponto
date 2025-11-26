import express, { Request, Response } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import logger from '../utils/logger';
import { PointRecord, PointEntry, AuthenticatedRequest } from '../types';

const router = express.Router();

// Mock point records data
const mockPointRecords: PointRecord[] = [
  {
    id: 1,
    userId: 3,
    date: '2024-01-15',
    entries: [
      { type: 'entrada', time: '08:00:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' },
      { type: 'saida_almoco', time: '12:00:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' },
      { type: 'volta_almoco', time: '13:00:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' },
      { type: 'saida', time: '17:00:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' }
    ],
    totalHours: '08:00:00',
    status: 'completo',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 2,
    userId: 3,
    date: '2024-01-16',
    entries: [
      { type: 'entrada', time: '08:15:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' },
      { type: 'saida_almoco', time: '12:00:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' },
      { type: 'volta_almoco', time: '13:00:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' },
      { type: 'saida', time: '17:15:00', location: 'SEFAZ-TO Sede', ip: '192.168.1.100' }
    ],
    totalHours: '08:00:00',
    status: 'completo',
    createdAt: '2024-01-16T08:15:00Z'
  }
];

// Validation rules
const pointEntryValidation = [
  body('type').isIn(['entrada', 'saida_almoco', 'volta_almoco', 'saida']).withMessage('Tipo de registro inválido'),
  body('location').optional().trim().isLength({ min: 1 }).withMessage('Localização inválida')
];

const dateValidation = [
  param('date').isISO8601().withMessage('Data inválida')
];

const periodValidation = [
  query('startDate').optional().isISO8601().withMessage('Data inicial inválida'),
  query('endDate').optional().isISO8601().withMessage('Data final inválida')
];

// Helper function to calculate total hours
const calculateHours = (entries: PointEntry[]): string => {
  if (entries.length < 2) return '00:00:00';
  
  let totalMinutes = 0;
  let currentEntry: PointEntry | null = null;
  
  for (const entry of entries) {
    if (entry.type === 'entrada' || entry.type === 'volta_almoco') {
      currentEntry = entry;
    } else if ((entry.type === 'saida_almoco' || entry.type === 'saida') && currentEntry) {
      const startTime = new Date(`2000-01-01T${currentEntry.time}`);
      const endTime = new Date(`2000-01-01T${entry.time}`);
      const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      totalMinutes += diffMinutes;
      currentEntry = null;
    }
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

// Helper function to get next entry type
const getNextEntryType = (entries: PointEntry[]): string => {
  if (entries.length === 0) return 'entrada';
  
  const lastEntry = entries[entries.length - 1];
  const typeOrder = ['entrada', 'saida_almoco', 'volta_almoco', 'saida'];
  const currentIndex = typeOrder.indexOf(lastEntry.type);
  
  return currentIndex < typeOrder.length - 1 ? typeOrder[currentIndex + 1] : 'entrada';
};

// @route   POST /api/point/register
// @desc    Register point entry
// @access  Private
router.post('/register', authenticate, pointEntryValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { type, location } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    const userIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Find or create today's record
    let todayRecord = mockPointRecords.find(r => r.userId === userId && r.date === today);
    
    if (!todayRecord) {
      todayRecord = {
        id: Math.max(...mockPointRecords.map(r => r.id)) + 1,
        userId,
        date: today,
        entries: [],
        totalHours: '00:00:00',
        status: 'incompleto',
        createdAt: new Date().toISOString()
      };
      mockPointRecords.push(todayRecord);
    }

    // Validate entry type sequence
    const expectedType = getNextEntryType(todayRecord.entries);
    if (type !== expectedType) {
      res.status(400).json({
        success: false,
        error: `Tipo de registro inválido. Esperado: ${expectedType}`,
        code: 'INVALID_ENTRY_TYPE',
        expectedType
      });
      return;
    }

    // Create new entry
    const newEntry: PointEntry = {
      type,
      time: currentTime,
      location: location || 'SEFAZ-TO Sede',
      ip: userIP
    };

    // Add entry to record
    todayRecord.entries.push(newEntry);
    
    // Update total hours and status
    todayRecord.totalHours = calculateHours(todayRecord.entries);
    todayRecord.status = todayRecord.entries.length === 4 ? 'completo' : 'incompleto';

    // Log point registration
    logger.audit('POINT_REGISTERED', userId, {
      entryType: type,
      time: currentTime,
      location: newEntry.location,
      ip: userIP,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Ponto registrado com sucesso',
      data: {
        entry: newEntry,
        nextEntryType: getNextEntryType(todayRecord.entries),
        totalHours: todayRecord.totalHours,
        status: todayRecord.status
      }
    });

  } catch (error) {
    logger.error('Erro ao registrar ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/point/today
// @desc    Get today's point record
// @access  Private
router.get('/today', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const todayRecord = mockPointRecords.find(r => r.userId === userId && r.date === today);

    if (!todayRecord) {
      res.json({
        success: true,
        data: {
          record: null,
          nextExpectedType: 'entrada',
          canRegister: true
        }
      });
      return;
    }

    const nextType = getNextEntryType(todayRecord.entries);

    res.json({
      success: true,
      data: {
        record: todayRecord,
        nextExpectedType: nextType,
        canRegister: nextType !== null
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar ponto de hoje:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/point/history
// @desc    Get point history
// @access  Private
router.get('/history', authenticate, periodValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    let filteredRecords: PointRecord[] = mockPointRecords.filter(r => r.userId === userId);

    // Apply date filters
    if (startDate) {
      filteredRecords = filteredRecords.filter(r => r.date >= (startDate as string));
    }
    if (endDate) {
      filteredRecords = filteredRecords.filter(r => r.date <= (endDate as string));
    }

    // Sort by date (newest first)
    filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // Calculate summary
    const totalHours = filteredRecords.reduce((total, record) => {
      const [hours, minutes] = record.totalHours.split(':').map(Number);
      return total + hours + (minutes / 60);
    }, 0);

    const completeRecords = filteredRecords.filter(r => r.status === 'completo').length;
    const incompleteRecords = filteredRecords.filter(r => r.status === 'incompleto').length;

    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: filteredRecords.length,
          pages: Math.ceil(filteredRecords.length / limitNum)
        },
        summary: {
          totalRecords: filteredRecords.length,
          completeRecords,
          incompleteRecords,
          totalHours: `${Math.floor(totalHours)}:${Math.round((totalHours % 1) * 60).toString().padStart(2, '0')}:00`
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar histórico de ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/point/date/:date
// @desc    Get point record for specific date
// @access  Private
router.get('/date/:date', authenticate, dateValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { date } = req.params;
    const userId = req.user.id;

    const record = mockPointRecords.find(r => r.userId === userId && r.date === date);

    if (!record) {
      res.status(404).json({
        success: false,
        error: 'Registro não encontrado para esta data',
        code: 'RECORD_NOT_FOUND'
      });
      return;
    }

    res.json({
      success: true,
      data: { record }
    });

  } catch (error) {
    logger.error('Erro ao buscar registro de ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/point/users/:userId/history
// @desc    Get point history for specific user (Admin/RH only)
// @access  Private (Admin, RH)
router.get('/users/:userId/history', authenticate, authorize('users.read'), periodValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { userId } = req.params;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    let filteredRecords: PointRecord[] = mockPointRecords.filter(r => r.userId === parseInt(userId));

    // Apply date filters
    if (startDate) {
      filteredRecords = filteredRecords.filter(r => r.date >= (startDate as string));
    }
    if (endDate) {
      filteredRecords = filteredRecords.filter(r => r.date <= (endDate as string));
    }

    // Sort by date (newest first)
    filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // Log access
    logger.audit('USER_POINT_HISTORY_ACCESSED', req.user.id, {
      targetUserId: userId,
      dateRange: { startDate, endDate },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: filteredRecords.length,
          pages: Math.ceil(filteredRecords.length / limitNum)
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar histórico de ponto do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// @route   GET /api/point/status
// @desc    Get current point status
// @access  Private
router.get('/status', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    const todayRecord = mockPointRecords.find(r => r.userId === userId && r.date === today);
    const nextType = todayRecord ? getNextEntryType(todayRecord.entries) : 'entrada';

    // Calculate current work session if applicable
    let currentSession: string | null = null;
    if (todayRecord && todayRecord.entries.length > 0) {
      const lastEntry = todayRecord.entries[todayRecord.entries.length - 1];
      if (lastEntry.type === 'entrada' || lastEntry.type === 'volta_almoco') {
        const startTime = new Date(`2000-01-01T${lastEntry.time}`);
        const currentTimeObj = new Date(`2000-01-01T${currentTime}`);
        const diffMinutes = (currentTimeObj.getTime() - startTime.getTime()) / (1000 * 60);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = Math.floor(diffMinutes % 60);
        currentSession = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      }
    }

    res.json({
      success: true,
      data: {
        currentTime,
        todayRecord,
        nextExpectedType: nextType,
        canRegister: nextType !== null,
        currentSession,
        isWorking: currentSession !== null
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar status do ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;