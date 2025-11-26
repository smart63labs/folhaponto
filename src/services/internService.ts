import { User } from '@/types';

export interface InternScheduleRule {
  id: string;
  userId: string;
  maxDailyHours: number;
  maxWeeklyHours: number;
  allowedDays: string[]; // ['monday', 'tuesday', etc.]
  startTime: string;
  endTime: string;
  internshipStartDate: Date;
  internshipEndDate: Date;
  supervisorId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternAttendanceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  maxHoursReached?: boolean;
  outsideAllowedTime?: boolean;
  invalidDay?: boolean;
}

export class InternService {
  private static instance: InternService;

  public static getInstance(): InternService {
    if (!InternService.instance) {
      InternService.instance = new InternService();
    }
    return InternService.instance;
  }

  /**
   * Valida se um estagiário pode fazer check-in/check-out
   */
  async validateInternAttendance(
    userId: string, 
    checkInTime: Date, 
    checkOutTime?: Date
  ): Promise<InternAttendanceValidation> {
    const rule = await this.getInternScheduleRule(userId);
    
    if (!rule) {
      return {
        isValid: false,
        errors: ['Regra de horário não encontrada para este estagiário'],
        warnings: []
      };
    }

    const validation: InternAttendanceValidation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validar dia da semana
    const dayOfWeek = this.getDayOfWeek(checkInTime);
    if (!rule.allowedDays.includes(dayOfWeek)) {
      validation.isValid = false;
      validation.invalidDay = true;
      validation.errors.push(`Estagiário não pode trabalhar às ${this.getDayName(dayOfWeek)}`);
    }

    // Validar horário permitido
    const checkInHour = checkInTime.getHours() + checkInTime.getMinutes() / 60;
    const startHour = this.parseTimeToHours(rule.startTime);
    const endHour = this.parseTimeToHours(rule.endTime);

    if (checkInHour < startHour || checkInHour > endHour) {
      validation.isValid = false;
      validation.outsideAllowedTime = true;
      validation.errors.push(`Horário de entrada fora do permitido (${rule.startTime} - ${rule.endTime})`);
    }

    // Validar horas diárias se check-out fornecido
    if (checkOutTime) {
      const dailyHours = this.calculateHours(checkInTime, checkOutTime);
      if (dailyHours > rule.maxDailyHours) {
        validation.isValid = false;
        validation.maxHoursReached = true;
        validation.errors.push(`Limite diário de ${rule.maxDailyHours}h excedido (${dailyHours.toFixed(2)}h)`);
      }
    }

    // Validar horas semanais
    const weeklyHours = await this.getWeeklyHours(userId, checkInTime);
    const proposedHours = checkOutTime ? this.calculateHours(checkInTime, checkOutTime) : 0;
    
    if (weeklyHours + proposedHours > rule.maxWeeklyHours) {
      validation.isValid = false;
      validation.maxHoursReached = true;
      validation.errors.push(`Limite semanal de ${rule.maxWeeklyHours}h seria excedido`);
    }

    // Avisos para limites próximos
    if (weeklyHours + proposedHours > rule.maxWeeklyHours * 0.9) {
      validation.warnings.push('Próximo ao limite semanal de horas');
    }

    return validation;
  }

  /**
   * Obtém a regra de horário para um estagiário
   */
  async getInternScheduleRule(userId: string): Promise<InternScheduleRule | null> {
    // Simulação - em produção, buscar do banco de dados
    const mockRules: InternScheduleRule[] = [
      {
        id: '1',
        userId: userId,
        maxDailyHours: 6,
        maxWeeklyHours: 30,
        allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '08:00',
        endTime: '17:00',
        internshipStartDate: new Date('2024-01-01'),
        internshipEndDate: new Date('2024-12-31'),
        supervisorId: 'supervisor-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return mockRules.find(rule => rule.userId === userId && rule.isActive) || null;
  }

  /**
   * Cria ou atualiza regra de horário para estagiário
   */
  async saveInternScheduleRule(rule: Partial<InternScheduleRule>): Promise<InternScheduleRule> {
    // Simulação - em produção, salvar no banco de dados
    const newRule: InternScheduleRule = {
      id: rule.id || Date.now().toString(),
      userId: rule.userId!,
      maxDailyHours: rule.maxDailyHours || 6,
      maxWeeklyHours: rule.maxWeeklyHours || 30,
      allowedDays: rule.allowedDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: rule.startTime || '08:00',
      endTime: rule.endTime || '17:00',
      internshipStartDate: rule.internshipStartDate || new Date(),
      internshipEndDate: rule.internshipEndDate || new Date(),
      supervisorId: rule.supervisorId!,
      isActive: rule.isActive !== undefined ? rule.isActive : true,
      createdAt: rule.createdAt || new Date(),
      updatedAt: new Date()
    };

    return newRule;
  }

  /**
   * Obtém horas trabalhadas na semana atual
   */
  async getWeeklyHours(userId: string, referenceDate: Date): Promise<number> {
    // Simulação - em produção, calcular do banco de dados
    // Buscar registros de ponto da semana atual e somar as horas
    return 20; // Exemplo: 20 horas já trabalhadas na semana
  }

  /**
   * Obtém todos os estagiários ativos
   */
  async getActiveInterns(): Promise<User[]> {
    // Simulação - em produção, buscar do banco de dados
    const mockInterns: User[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@estagio.gov.br',
        role: 'estagiario',
        setor: 'Tecnologia da Informação',
        isFlexibleSchedule: false,
        workMode: 'presencial',
        internshipEndDate: new Date('2024-12-31'),
        internshipHours: 30
      }
    ];

    return mockInterns;
  }

  /**
   * Verifica se um usuário é estagiário
   */
  isIntern(user: User): boolean {
    return user.role === 'estagiario';
  }

  /**
   * Calcula horas entre dois horários
   */
  private calculateHours(startTime: Date, endTime: Date): number {
    const diffMs = endTime.getTime() - startTime.getTime();
    return diffMs / (1000 * 60 * 60); // Converter para horas
  }

  /**
   * Converte string de horário para horas decimais
   */
  private parseTimeToHours(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  }

  /**
   * Obtém dia da semana em inglês
   */
  private getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Obtém nome do dia em português
   */
  private getDayName(dayOfWeek: string): string {
    const dayNames: { [key: string]: string } = {
      'sunday': 'Domingo',
      'monday': 'Segunda-feira',
      'tuesday': 'Terça-feira',
      'wednesday': 'Quarta-feira',
      'thursday': 'Quinta-feira',
      'friday': 'Sexta-feira',
      'saturday': 'Sábado'
    };
    return dayNames[dayOfWeek] || dayOfWeek;
  }
}

export const internService = InternService.getInstance();