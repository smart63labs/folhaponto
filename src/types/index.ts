export type UserRole = 'servidor' | 'chefia' | 'rh' | 'admin' | 'estagiario';

export type AttendanceStatus = 'presente' | 'falta' | 'atraso' | 'justificado' | 'pendente';

export type WorkMode = 'presencial' | 'home_office' | 'hibrido';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string; // Será substituído por setor
  setor?: string; // Novo campo para substituir department
  supervisor?: string;
  sectorId?: string; // ID do setor ao qual o usuário pertence
  isManager?: boolean; // Se é chefe do setor
  isFlexibleSchedule?: boolean; // Para chefias com horário flexível
  workMode?: WorkMode; // Modo de trabalho (presencial, home-office, híbrido)
  internshipEndDate?: string; // Data de fim do estágio (para estagiários)
  internshipHours?: number; // Horas diárias do estagiário
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  totalHours?: number;
  justification?: string;
}

export interface DashboardStats {
  horasTrabalhadasMes: number;
  horasEsperadas: number;
  diasPresentes: number;
  diasAusentes: number;
  saldoBancoHoras: number;
}

export interface CalendarDay {
  date: number;
  status?: AttendanceStatus;
  hours?: string;
  isToday?: boolean;
  isWeekend?: boolean;
}
