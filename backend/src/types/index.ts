// User types
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  profile: 'admin' | 'rh' | 'servidor';
  department: string;
  position: string;
  registration: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  profilePicture?: string;
  sectorId?: number;
  sectorName?: string;
  workSchedule: {
    monday: { start: string; end: string; } | null;
    tuesday: { start: string; end: string; } | null;
    wednesday: { start: string; end: string; } | null;
    thursday: { start: string; end: string; } | null;
    friday: { start: string; end: string; } | null;
    saturday: { start: string; end: string; } | null;
    sunday: { start: string; end: string; } | null;
  };
  permissions: string[];
}

// Point registration types
export interface PointRecord {
  id: number;
  userId: number;
  date: string;
  entries: PointEntry[];
  totalWorkedHours: string;
  expectedHours: string;
  overtime: string;
  status: 'complete' | 'incomplete' | 'pending_approval';
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointEntry {
  id: number;
  type: 'entrada' | 'saida' | 'saida_almoco' | 'volta_almoco';
  time: string;
  location?: string;
  ip?: string;
  device?: string;
  photo?: string;
  observations?: string;
  createdAt: Date;
}

// Approval types
export interface Approval {
  id: number;
  requesterId: number;
  requesterName?: string;
  requesterDepartment?: string;
  requesterSectorId?: number;
  requesterSectorName?: string;
  approverId?: number;
  approverName?: string;
  type: 'overtime' | 'absence' | 'vacation' | 'time_adjustment' | 'schedule_change';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  title: string;
  description: string;
  requestData: any;
  data?: any; // Para compatibilidade com o código existente
  startDate: string;
  endDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  comments?: string;
  attachments?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  approvedAt?: Date | string;
  rejectedAt?: Date | string;
  deadline?: string;
  processedBy?: number;
  processedByName?: string;
}

export interface WorkflowTemplate {
  id: number;
  name: string;
  type: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: number;
  order: number;
  name: string;
  description: string;
  approverRole: string;
  isRequired: boolean;
  timeLimit?: number; // in hours
}

// Department types
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  managerId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Audit types
export interface AuditLog {
  id: number;
  timestamp: string;
  userId?: number;
  userName: string;
  userProfile: string;
  action: string;
  resource: string;
  resourceId?: number;
  details: any;
  ip: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error';
  category: string;
}

// Report types
export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  userId?: number;
  departmentId?: number;
  status?: string;
  type?: string;
}

export interface AttendanceReport {
  userId: number;
  userName: string;
  department: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeHours: string;
  totalWorkedHours: string;
  expectedHours: string;
  efficiency: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  data: {
    items: T[];
    pagination: {
      current: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  id: number;
  email: string;
  profile: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Request types with user
export interface AuthenticatedRequest extends Request {
  user: Omit<User, 'password'>;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// System configuration types
export interface SystemConfig {
  maxOvertimeHours: number;
  workingDaysPerWeek: number;
  hoursPerWorkingDay: number;
  lunchBreakMinutes: number;
  maxLateMinutes: number;
  allowWeekendWork: boolean;
  requirePhotoForPoint: boolean;
  allowRemoteWork: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  passwordExpirationDays: number;
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  todayPresent: number;
  todayAbsent: number;
  pendingApprovals: number;
  overtimeHours: string;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastBackup: string;
}

// Hours bank types
export interface HoursBank {
  userId: number;
  currentBalance: string; // in HH:MM format
  monthlyBalance: string;
  yearlyBalance: string;
  lastUpdated: Date;
  transactions: HoursBankTransaction[];
}

export interface HoursBankTransaction {
  id: number;
  userId: number;
  date: string;
  type: 'credit' | 'debit';
  hours: string;
  description: string;
  reference?: string; // reference to point record, approval, etc.
  createdAt: Date;
}

// Export utility types
export type UserProfile = User['profile'];
export type ApprovalStatus = Approval['status'];
export type ApprovalType = Approval['type'];
export type PointEntryType = PointEntry['type'];
export type AuditSeverity = AuditLog['severity'];
export type SystemHealth = DashboardStats['systemHealth'];

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Database connection types (for future Oracle integration)
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connectionLimit: number;
  acquireTimeoutMillis: number;
  timeout: number;
  ssl?: boolean;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
}

// Middleware types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// Email types (for future implementation)
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Cache types
export interface CacheConfig {
  ttl: number; // time to live in seconds
  max: number; // maximum number of items
}

// Backup types
export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  type: 'full' | 'incremental';
  status: 'completed' | 'failed' | 'in_progress';
}