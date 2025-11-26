import { User, Approval } from '../types';
import { SectorService } from './sectorService';

export interface ApprovalHierarchyService {
  /**
   * Determina o aprovador baseado na hierarquia de setores
   */
  determineApprover(requester: User, approvalType: string): Promise<User | null>;

  /**
   * Verifica se um usuário pode aprovar uma solicitação baseado na hierarquia
   */
  canApproveRequest(approver: User, approval: Approval): Promise<boolean>;

  /**
   * Obtém todos os aprovadores possíveis para uma solicitação
   */
  getPossibleApprovers(requester: User, approvalType: string): Promise<User[]>;

  /**
   * Verifica se o aprovador está na hierarquia correta
   */
  isValidApprover(approver: User, requester: User): Promise<boolean>;
}

class ApprovalHierarchyServiceImpl implements ApprovalHierarchyService {
  
  async determineApprover(requester: User, approvalType: string): Promise<User | null> {
    // Admin e RH não precisam de aprovação
    if (requester.profile === 'admin' || requester.profile === 'rh') {
      return null;
    }

    // Se o usuário não tem setor definido, usar aprovação por departamento (fallback)
    if (!requester.sectorId) {
      return this.getApproverByDepartment(requester.department);
    }

    // Buscar supervisor do setor
    const sectorSupervisor = await this.getSectorSupervisor(requester.sectorId);
    if (sectorSupervisor) {
      return sectorSupervisor;
    }

    // Se não encontrou supervisor do setor, buscar na hierarquia superior
    const parentSectorSupervisor = await this.getParentSectorSupervisor(requester.sectorId);
    if (parentSectorSupervisor) {
      return parentSectorSupervisor;
    }

    // Fallback para RH
    return this.getRHApprover();
  }

  async canApproveRequest(approver: User, approval: Approval): Promise<boolean> {
    // Admin pode aprovar tudo
    if (approver.profile === 'admin') {
      return true;
    }

    // RH pode aprovar tudo
    if (approver.profile === 'rh') {
      return true;
    }

    // Verificar se é o aprovador designado
    if (approval.approverId === approver.id) {
      return true;
    }

    // Se o solicitante não tem setor, usar verificação por departamento
    if (!approval.requesterSectorId) {
      return approver.department === approval.requesterDepartment && 
             approver.profile === 'supervisor';
    }

    // Verificar hierarquia de setores
    return this.isValidApprover(approver, { sectorId: approval.requesterSectorId } as User);
  }

  async getPossibleApprovers(requester: User, approvalType: string): Promise<User[]> {
    const approvers: User[] = [];

    // Sempre incluir admin e RH
    const adminUsers = await this.getUsersByProfile('admin');
    const rhUsers = await this.getUsersByProfile('rh');
    
    approvers.push(...adminUsers, ...rhUsers);

    // Se tem setor, buscar supervisores na hierarquia
    if (requester.sectorId) {
      const sectorSupervisors = await this.getSectorHierarchySupervisors(requester.sectorId);
      approvers.push(...sectorSupervisors);
    } else {
      // Fallback para supervisores do departamento
      const departmentSupervisors = await this.getDepartmentSupervisors(requester.department);
      approvers.push(...departmentSupervisors);
    }

    // Remover duplicatas
    return approvers.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );
  }

  async isValidApprover(approver: User, requester: User): Promise<boolean> {
    // Admin e RH sempre podem aprovar
    if (approver.profile === 'admin' || approver.profile === 'rh') {
      return true;
    }

    // Verificar se o aprovador é supervisor
    if (approver.profile !== 'supervisor') {
      return false;
    }

    // Se não tem setor, verificar por departamento
    if (!requester.sectorId || !approver.sectorId) {
      return approver.department === requester.department;
    }

    // Verificar se o aprovador está na hierarquia superior do setor do solicitante
    return this.isApproverInSectorHierarchy(approver.sectorId, requester.sectorId);
  }

  // Métodos auxiliares privados
  private async getSectorSupervisor(sectorId: number): Promise<User | null> {
    // Mock implementation - em produção, buscar no banco de dados
    const mockUsers: User[] = [
      {
        id: 2,
        name: 'Maria Santos',
        email: 'maria.santos@sefaz.to.gov.br',
        profile: 'supervisor',
        department: 'Tecnologia da Informação',
        position: 'Supervisora de TI',
        registration: '12345',
        isActive: true,
        sectorId: 1,
        sectorName: 'Diretoria de TI',
        createdAt: new Date(),
        updatedAt: new Date(),
        workSchedule: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: null,
          sunday: null
        },
        permissions: ['approvals.manage']
      }
    ];

    return mockUsers.find(user => 
      user.sectorId === sectorId && 
      user.profile === 'supervisor' && 
      user.isActive
    ) || null;
  }

  private async getParentSectorSupervisor(sectorId: number): Promise<User | null> {
    // Buscar setor pai e seu supervisor
    const sector = SectorService.getSectorById(sectorId);
    if (!sector || !sector.parentId) {
      return null;
    }

    return this.getSectorSupervisor(sector.parentId);
  }

  private async getRHApprover(): Promise<User | null> {
    const rhUsers = await this.getUsersByProfile('rh');
    return rhUsers.length > 0 ? rhUsers[0] : null;
  }

  private async getApproverByDepartment(department: string): Promise<User | null> {
    // Mock implementation
    const mockUsers: User[] = [
      {
        id: 2,
        name: 'Maria Santos',
        email: 'maria.santos@sefaz.to.gov.br',
        profile: 'supervisor',
        department: 'Tecnologia da Informação',
        position: 'Supervisora de TI',
        registration: '12345',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        workSchedule: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: null,
          sunday: null
        },
        permissions: ['approvals.manage']
      }
    ];

    return mockUsers.find(user => 
      user.department === department && 
      user.profile === 'supervisor' && 
      user.isActive
    ) || null;
  }

  private async getUsersByProfile(profile: string): Promise<User[]> {
    // Mock implementation
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Carlos Admin',
        email: 'admin_protocolo@sefaz.to.gov.br',
        profile: 'admin',
        department: 'Administração',
        position: 'Administrador do Sistema',
        registration: '00001',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        workSchedule: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: null,
          sunday: null
        },
        permissions: ['*']
      }
    ];

    return mockUsers.filter(user => user.profile === profile && user.isActive);
  }

  private async getSectorHierarchySupervisors(sectorId: number): Promise<User[]> {
    const supervisors: User[] = [];
    
    // Buscar supervisor do setor atual
    const currentSupervisor = await this.getSectorSupervisor(sectorId);
    if (currentSupervisor) {
      supervisors.push(currentSupervisor);
    }

    // Buscar supervisores dos setores pais
    const sector = SectorService.getSectorById(sectorId);
    if (sector && sector.parentId) {
      const parentSupervisors = await this.getSectorHierarchySupervisors(sector.parentId);
      supervisors.push(...parentSupervisors);
    }

    return supervisors;
  }

  private async getDepartmentSupervisors(department: string): Promise<User[]> {
    // Mock implementation
    return [];
  }

  private async isApproverInSectorHierarchy(approverSectorId: number, requesterSectorId: number): Promise<boolean> {
    // Se for o mesmo setor, verificar se o aprovador é supervisor
    if (approverSectorId === requesterSectorId) {
      return true;
    }

    // Verificar se o setor do aprovador é pai do setor do solicitante
    const requesterSector = SectorService.getSectorById(requesterSectorId);
    if (!requesterSector || !requesterSector.parentId) {
      return false;
    }

    // Recursivamente verificar a hierarquia
    return this.isApproverInSectorHierarchy(approverSectorId, requesterSector.parentId);
  }
}

export const approvalHierarchyService = new ApprovalHierarchyServiceImpl();