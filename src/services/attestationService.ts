import { User } from '@/types';

export interface AttestationRequest {
  id: string;
  userId: string;
  userName: string;
  userSetor: string;
  period: {
    startDate: string;
    endDate: string;
  };
  attendanceRecords: AttendanceRecord[];
  status: 'pending' | 'approved_immediate' | 'approved_mediate' | 'rejected' | 'completed';
  immediateSuperiorsApproval?: ApprovalRecord[];
  mediateSuperiorsApproval?: ApprovalRecord[];
  createdAt: string;
  completedAt?: string;
  observations?: string;
}

export interface AttendanceRecord {
  date: string;
  checkIn?: string;
  checkOut?: string;
  workMode: 'presencial' | 'home_office' | 'hibrido';
  totalHours: number;
  isFlexible: boolean;
  isManualEntry: boolean;
  uploadedDocument?: string;
  observations?: string;
}

export interface ApprovalRecord {
  superiorId: string;
  superiorName: string;
  superiorRole: string;
  approvedAt: string;
  status: 'approved' | 'rejected';
  observations?: string;
}

export interface HierarchyLevel {
  level: number;
  name: string;
  description: string;
}

export class AttestationService {
  private static instance: AttestationService;
  
  public static getInstance(): AttestationService {
    if (!AttestationService.instance) {
      AttestationService.instance = new AttestationService();
    }
    return AttestationService.instance;
  }

  // Níveis hierárquicos definidos
  private hierarchyLevels: HierarchyLevel[] = [
    { level: 1, name: 'Chefia Imediata', description: 'Supervisor direto do setor' },
    { level: 2, name: 'Chefia Mediata', description: 'Gerência ou coordenação superior' }
  ];

  /**
   * Cria uma solicitação de atesto automático
   */
  async createAttestationRequest(
    userId: string, 
    period: { startDate: string; endDate: string }
  ): Promise<AttestationRequest> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const attendanceRecords = await this.getAttendanceRecords(userId, period);
    
    const request: AttestationRequest = {
      id: this.generateId(),
      userId,
      userName: user.name,
      userSetor: user.setor || '',
      period,
      attendanceRecords,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Iniciar processo de aprovação automática
    await this.processApprovalWorkflow(request);
    
    return request;
  }

  /**
   * Processa o fluxo de aprovação hierárquica
   */
  private async processApprovalWorkflow(request: AttestationRequest): Promise<void> {
    try {
      // 1. Buscar chefias imediatas
      const immediateSuperiors = await this.getImmediateSuperiors(request.userId);
      
      if (immediateSuperiors.length > 0) {
        // Solicitar aprovação das chefias imediatas
        request.immediateSuperiorsApproval = await this.requestApprovals(
          request, 
          immediateSuperiors, 
          1
        );
        
        // Verificar se todas as chefias imediatas aprovaram
        const allImmediateApproved = request.immediateSuperiorsApproval.every(
          approval => approval.status === 'approved'
        );
        
        if (allImmediateApproved) {
          request.status = 'approved_immediate';
          
          // 2. Buscar chefias mediatas
          const mediateSuperiors = await this.getMediateSuperiors(request.userId);
          
          if (mediateSuperiors.length > 0) {
            request.mediateSuperiorsApproval = await this.requestApprovals(
              request, 
              mediateSuperiors, 
              2
            );
            
            // Verificar se todas as chefias mediatas aprovaram
            const allMediateApproved = request.mediateSuperiorsApproval.every(
              approval => approval.status === 'approved'
            );
            
            if (allMediateApproved) {
              request.status = 'approved_mediate';
              await this.completeAttestation(request);
            }
          } else {
            // Não há chefias mediatas, completar com aprovação imediata
            await this.completeAttestation(request);
          }
        } else {
          request.status = 'rejected';
        }
      } else {
        // Usuário sem hierarquia superior (ex: diretor), aprovar automaticamente
        await this.completeAttestation(request);
      }
      
      await this.saveAttestationRequest(request);
    } catch (error) {
      console.error('Erro no processo de aprovação:', error);
      request.status = 'rejected';
      request.observations = 'Erro no processo de aprovação automática';
      await this.saveAttestationRequest(request);
    }
  }

  /**
   * Solicita aprovações de uma lista de superiores
   */
  private async requestApprovals(
    request: AttestationRequest, 
    superiors: User[], 
    level: number
  ): Promise<ApprovalRecord[]> {
    const approvals: ApprovalRecord[] = [];
    
    for (const superior of superiors) {
      try {
        // Para chefias com horários flexíveis, aprovação automática
        if (superior.isFlexibleSchedule) {
          approvals.push({
            superiorId: superior.id,
            superiorName: superior.name,
            superiorRole: superior.role,
            approvedAt: new Date().toISOString(),
            status: 'approved',
            observations: 'Aprovação automática - Chefia com horário flexível'
          });
        } else {
          // Enviar notificação para aprovação manual
          await this.sendApprovalNotification(request, superior, level);
          
          // Por enquanto, simular aprovação automática
          // Em produção, aguardar resposta do superior
          approvals.push({
            superiorId: superior.id,
            superiorName: superior.name,
            superiorRole: superior.role,
            approvedAt: new Date().toISOString(),
            status: 'approved',
            observations: 'Aprovação automática do sistema'
          });
        }
      } catch (error) {
        console.error(`Erro ao processar aprovação de ${superior.name}:`, error);
        approvals.push({
          superiorId: superior.id,
          superiorName: superior.name,
          superiorRole: superior.role,
          approvedAt: new Date().toISOString(),
          status: 'rejected',
          observations: 'Erro no processo de aprovação'
        });
      }
    }
    
    return approvals;
  }

  /**
   * Completa o processo de atesto
   */
  private async completeAttestation(request: AttestationRequest): Promise<void> {
    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    
    // Gerar documento de atesto
    await this.generateAttestationDocument(request);
    
    // Notificar usuário sobre conclusão
    await this.notifyAttestationCompletion(request);
  }

  /**
   * Busca chefias imediatas do usuário
   */
  private async getImmediateSuperiors(userId: string): Promise<User[]> {
    const user = await this.getUserById(userId);
    if (!user || !user.setor) return [];
    
    // Buscar chefias do mesmo setor
    const sectorSuperiors = await this.getUsersBySetor(user.setor);
    return sectorSuperiors.filter(u => 
      u.role === 'chefia' && 
      u.id !== userId &&
      this.isImmediateSuperior(u, user)
    );
  }

  /**
   * Busca chefias mediatas do usuário
   */
  private async getMediateSuperiors(userId: string): Promise<User[]> {
    const user = await this.getUserById(userId);
    if (!user || !user.setor) return [];
    
    // Buscar chefias de setores superiores na hierarquia
    const superiorSectors = await this.getSuperiorSectors(user.setor);
    const mediateSuperiors: User[] = [];
    
    for (const sector of superiorSectors) {
      const sectorUsers = await this.getUsersBySetor(sector);
      const superiors = sectorUsers.filter(u => 
        u.role === 'chefia' && 
        this.isMediateSuperior(u, user)
      );
      mediateSuperiors.push(...superiors);
    }
    
    return mediateSuperiors;
  }

  /**
   * Verifica se um usuário é chefia imediata de outro
   */
  private isImmediateSuperior(superior: User, subordinate: User): boolean {
    // Lógica para determinar se é chefia imediata
    // Por exemplo: mesmo setor e nível hierárquico superior
    return superior.setor === subordinate.setor && 
           superior.role === 'chefia';
  }

  /**
   * Verifica se um usuário é chefia mediata de outro
   */
  private isMediateSuperior(superior: User, subordinate: User): boolean {
    // Lógica para determinar se é chefia mediata
    // Por exemplo: setor superior na hierarquia
    return superior.role === 'chefia' && 
           superior.setor !== subordinate.setor;
  }

  /**
   * Busca registros de frequência do usuário no período
   */
  private async getAttendanceRecords(
    userId: string, 
    period: { startDate: string; endDate: string }
  ): Promise<AttendanceRecord[]> {
    // Implementar busca no banco de dados
    // Por enquanto, retornar dados mock
    return [
      {
        date: period.startDate,
        checkIn: '08:00',
        checkOut: '17:00',
        workMode: 'presencial',
        totalHours: 8,
        isFlexible: false,
        isManualEntry: false
      }
    ];
  }

  /**
   * Envia notificação para superior aprovar
   */
  private async sendApprovalNotification(
    request: AttestationRequest, 
    superior: User, 
    level: number
  ): Promise<void> {
    // Implementar envio de notificação (email, sistema, etc.)
    console.log(`Notificação enviada para ${superior.name} - Nível ${level}`);
  }

  /**
   * Gera documento de atesto
   */
  private async generateAttestationDocument(request: AttestationRequest): Promise<void> {
    // Implementar geração de documento PDF/Word
    console.log(`Documento de atesto gerado para ${request.userName}`);
  }

  /**
   * Notifica usuário sobre conclusão do atesto
   */
  private async notifyAttestationCompletion(request: AttestationRequest): Promise<void> {
    // Implementar notificação ao usuário
    console.log(`Atesto concluído para ${request.userName}`);
  }

  /**
   * Métodos auxiliares para busca de dados
   */
  private async getUserById(userId: string): Promise<User | null> {
    // Implementar busca no banco de dados
    return null;
  }

  private async getUsersBySetor(setor: string): Promise<User[]> {
    // Implementar busca no banco de dados
    return [];
  }

  private async getSuperiorSectors(setor: string): Promise<string[]> {
    // Implementar lógica de hierarquia de setores
    return [];
  }

  private async saveAttestationRequest(request: AttestationRequest): Promise<void> {
    // Implementar salvamento no banco de dados
    console.log(`Solicitação de atesto salva: ${request.id}`);
  }

  private generateId(): string {
    return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Métodos públicos para gerenciamento de attestos
   */
  
  /**
   * Lista solicitações de atesto pendentes para um superior
   */
  async getPendingAttestationsForSuperior(superiorId: string): Promise<AttestationRequest[]> {
    // Implementar busca de attestos pendentes
    return [];
  }

  /**
   * Aprova ou rejeita uma solicitação de atesto
   */
  async processApproval(
    requestId: string, 
    superiorId: string, 
    status: 'approved' | 'rejected', 
    observations?: string
  ): Promise<void> {
    // Implementar processamento de aprovação
    console.log(`Aprovação processada: ${requestId} - ${status}`);
  }

  /**
   * Busca histórico de attestos de um usuário
   */
  async getAttestationHistory(userId: string): Promise<AttestationRequest[]> {
    // Implementar busca de histórico
    return [];
  }

  /**
   * Gera relatório de attestos por período
   */
  async generateAttestationReport(
    startDate: string, 
    endDate: string, 
    setor?: string
  ): Promise<any> {
    // Implementar geração de relatório
    return {};
  }
}

export const attestationService = AttestationService.getInstance();