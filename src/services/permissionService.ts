import { Sector } from './sectorService';
import { sectorService } from './sectorService';

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  ultimoAcesso: string;
  role: 'servidor' | 'chefia' | 'rh' | 'admin';
  matricula?: string;
  telefone?: string;
  dataAdmissao?: string;
  jornada?: string;
  observacoes?: string;
  setorId?: string; // Novo campo para associar usuário ao setor
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: 'escalas' | 'aprovacoes' | 'usuarios' | 'relatorios' | 'configuracoes';
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'manage';
}

export interface ApprovalRequest {
  id: string;
  tipo: 'banco_horas' | 'ajuste_ponto' | 'justificativa' | 'abono' | 'escala';
  solicitante: string;
  solicitanteId: string;
  departamento: string;
  setorId?: string;
  dataInicio: string;
  motivo: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  dataSolicitacao: string;
  aprovador?: string;
  observacoes?: string;
  documentos?: string[];
}

class PermissionService {
  private permissions: Permission[] = [
    // Permissões de Escalas
    { id: '1', name: 'escalas.create', description: 'Criar escalas', module: 'escalas', action: 'create' },
    { id: '2', name: 'escalas.read', description: 'Visualizar escalas', module: 'escalas', action: 'read' },
    { id: '3', name: 'escalas.update', description: 'Editar escalas', module: 'escalas', action: 'update' },
    { id: '4', name: 'escalas.delete', description: 'Excluir escalas', module: 'escalas', action: 'delete' },
    { id: '5', name: 'escalas.approve', description: 'Aprovar escalas', module: 'escalas', action: 'approve' },
    
    // Permissões de Aprovações
    { id: '6', name: 'aprovacoes.read', description: 'Visualizar aprovações', module: 'aprovacoes', action: 'read' },
    { id: '7', name: 'aprovacoes.approve', description: 'Aprovar solicitações', module: 'aprovacoes', action: 'approve' },
    
    // Permissões de Usuários
    { id: '8', name: 'usuarios.read', description: 'Visualizar usuários', module: 'usuarios', action: 'read' },
    { id: '9', name: 'usuarios.manage', description: 'Gerenciar usuários', module: 'usuarios', action: 'manage' },
    
    // Permissões de Relatórios
    { id: '10', name: 'relatorios.read', description: 'Visualizar relatórios', module: 'relatorios', action: 'read' },
    { id: '11', name: 'relatorios.create', description: 'Gerar relatórios', module: 'relatorios', action: 'create' },
    
    // Permissões de Configurações
    { id: '12', name: 'configuracoes.manage', description: 'Gerenciar configurações', module: 'configuracoes', action: 'manage' }
  ];

  /**
   * Verifica se um usuário tem permissão para uma ação específica
   */
  hasPermission(user: User, permissionName: string): boolean {
    // Admin tem todas as permissões
    if (user.role === 'admin') {
      return true;
    }

    // RH tem permissões amplas
    if (user.role === 'rh') {
      const rhPermissions = [
        'usuarios.read', 'usuarios.manage', 'aprovacoes.read', 'aprovacoes.approve',
        'relatorios.read', 'relatorios.create', 'escalas.read', 'escalas.create',
        'escalas.update', 'escalas.approve'
      ];
      return rhPermissions.includes(permissionName);
    }

    // Chefia tem permissões limitadas ao seu setor e subordinados
    if (user.role === 'chefia') {
      const chefiaPermissions = [
        'escalas.read', 'escalas.create', 'escalas.update', 'escalas.approve',
        'aprovacoes.read', 'aprovacoes.approve', 'relatorios.read', 'relatorios.create'
      ];
      return chefiaPermissions.includes(permissionName);
    }

    // Servidor tem permissões básicas
    if (user.role === 'servidor') {
      const servidorPermissions = ['escalas.read', 'aprovacoes.read'];
      return servidorPermissions.includes(permissionName);
    }

    return false;
  }

  /**
   * Verifica se um usuário pode aprovar uma solicitação baseado na hierarquia
   */
  canApproveRequest(approver: User, request: ApprovalRequest): boolean {
    // Admin pode aprovar tudo
    if (approver.role === 'admin') {
      return true;
    }

    // RH pode aprovar tudo
    if (approver.role === 'rh') {
      return true;
    }

    // Chefia só pode aprovar de subordinados
    if (approver.role === 'chefia') {
      return this.canManageUser(approver, request.solicitanteId);
    }

    return false;
  }

  /**
   * Verifica se um usuário pode gerenciar outro usuário baseado na hierarquia
   */
  canManageUser(manager: User, targetUserId: string): boolean {
    // Admin pode gerenciar todos
    if (manager.role === 'admin') {
      return true;
    }

    // RH pode gerenciar todos
    if (manager.role === 'rh') {
      return true;
    }

    // Chefia só pode gerenciar subordinados do mesmo setor ou setores filhos
    if (manager.role === 'chefia' && manager.setorId) {
      const targetUser = this.getUserById(targetUserId);
      if (!targetUser || !targetUser.setorId) {
        return false;
      }

      // Verifica se o usuário alvo está no mesmo setor ou em um setor subordinado
      return this.isUserInSubordinateSector(manager.setorId, targetUser.setorId);
    }

    return false;
  }

  /**
   * Verifica se um setor é subordinado a outro na hierarquia
   */
  private isUserInSubordinateSector(managerSectorId: string, targetSectorId: string): boolean {
    // Se for o mesmo setor, pode gerenciar
    if (managerSectorId === targetSectorId) {
      return true;
    }

    // Verifica se o setor alvo é descendente do setor do gerente
    const descendants = sectorService.getSectorDescendants(managerSectorId);
    return descendants.some(sector => sector.id === targetSectorId);
  }

  /**
   * Obtém os setores que um usuário pode gerenciar
   */
  getManagedSectors(user: User): Sector[] {
    // Admin e RH podem gerenciar todos os setores
    if (user.role === 'admin' || user.role === 'rh') {
      return sectorService.getAllSectors();
    }

    // Chefia pode gerenciar seu setor e subordinados
    if (user.role === 'chefia' && user.setorId) {
      const userSector = sectorService.getSectorById(user.setorId);
      if (userSector) {
        const descendants = sectorService.getSectorDescendants(user.setorId);
        return [userSector, ...descendants];
      }
    }

    return [];
  }

  /**
   * Obtém os usuários que um gerente pode aprovar solicitações
   */
  getApprovableUsers(approver: User): User[] {
    const managedSectors = this.getManagedSectors(approver);
    const allUsers = this.getAllUsers();

    return allUsers.filter(user => {
      if (!user.setorId) return false;
      return managedSectors.some(sector => sector.id === user.setorId);
    });
  }

  /**
   * Obtém solicitações pendentes que um usuário pode aprovar
   */
  getPendingApprovalsForUser(approver: User, requests: ApprovalRequest[]): ApprovalRequest[] {
    return requests.filter(request => 
      request.status === 'pendente' && this.canApproveRequest(approver, request)
    );
  }

  /**
   * Verifica se um usuário pode criar escalas para um setor específico
   */
  canCreateScaleForSector(user: User, sectorId: string): boolean {
    if (!this.hasPermission(user, 'escalas.create')) {
      return false;
    }

    const managedSectors = this.getManagedSectors(user);
    return managedSectors.some(sector => sector.id === sectorId);
  }

  /**
   * Obtém as permissões de um usuário baseado em seu role
   */
  getUserPermissions(user: User): Permission[] {
    return this.permissions.filter(permission => 
      this.hasPermission(user, permission.name)
    );
  }

  // Mock methods - em produção, estes dados viriam do backend
  private getUserById(userId: string): User | undefined {
    // Mock implementation - substituir por chamada real ao backend
    const mockUsers: User[] = [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao@sefaz.to.gov.br',
        cargo: 'Analista',
        departamento: 'Protocolo',
        status: 'ativo',
        ultimoAcesso: '2024-01-15T10:30:00',
        role: 'servidor',
        setorId: 'setor-protocolo-1'
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria@sefaz.to.gov.br',
        cargo: 'Coordenadora',
        departamento: 'Protocolo',
        status: 'ativo',
        ultimoAcesso: '2024-01-15T09:15:00',
        role: 'chefia',
        setorId: 'setor-protocolo-coordenacao'
      }
    ];

    return mockUsers.find(user => user.id === userId);
  }

  private getAllUsers(): User[] {
    // Mock implementation - substituir por chamada real ao backend
    return [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao@sefaz.to.gov.br',
        cargo: 'Analista',
        departamento: 'Protocolo',
        status: 'ativo',
        ultimoAcesso: '2024-01-15T10:30:00',
        role: 'servidor',
        setorId: 'setor-protocolo-1'
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria@sefaz.to.gov.br',
        cargo: 'Coordenadora',
        departamento: 'Protocolo',
        status: 'ativo',
        ultimoAcesso: '2024-01-15T09:15:00',
        role: 'chefia',
        setorId: 'setor-protocolo-coordenacao'
      }
    ];
  }
}

export const permissionService = new PermissionService();
export default permissionService;