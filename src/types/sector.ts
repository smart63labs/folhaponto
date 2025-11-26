export interface Sector {
  id: number; // Alterado para number para compatibilidade com banco
  name: string;
  code: string;
  parentId?: number; // ID do setor pai para hierarquia
  level: number; // Nível hierárquico (0 = raiz, 1 = primeiro nível, etc.)
  managerId?: number; // ID do usuário que é chefe deste setor
  description?: string;
  active: boolean;
  // Novos campos de endereço e contato
  orgao?: string; // Órgão
  logradouro?: string; // Endereço
  numero?: string; // Número
  complemento?: string; // Complemento
  bairro?: string; // Bairro
  cidade?: string; // Cidade
  estado?: string; // Estado
  cep?: string; // CEP
  telefone?: string; // Telefone
  email?: string; // Email
  latitude?: number; // Latitude
  longitude?: number; // Longitude
  createdAt: string;
  updatedAt: string;
  // Campos calculados (não persistidos)
  children?: Sector[];
  employees?: number[]; // IDs dos funcionários (alterado para number)
  employeeCount?: number;
  managerName?: string;
}

export interface HierarchyNode {
  sector: Sector;
  children: HierarchyNode[];
  parent?: HierarchyNode;
  depth: number;
  path: string[]; // Array de IDs do caminho da raiz até este nó
}

export interface SectorPermissions {
  canCreateSchedules: boolean;
  canApproveSchedules: boolean;
  canManageSubordinates: boolean;
  canViewReports: boolean;
}

export interface HierarchyValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DragDropSectorItem {
  id: number; // Alterado para number
  type: 'sector';
  sector: Sector;
  sourceParentId?: number; // Alterado para number
  targetParentId?: number; // Alterado para number
}

// Tipos para operações de hierarquia
export type HierarchyOperation = 
  | { type: 'move'; sectorId: number; newParentId?: number } // Alterado para number
  | { type: 'create'; sector: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'update'; sectorId: number; changes: Partial<Sector> } // Alterado para number
  | { type: 'delete'; sectorId: number }; // Alterado para number

export interface HierarchyState {
  sectors: Sector[];
  hierarchy: HierarchyNode[];
  selectedSector?: Sector;
  draggedSector?: Sector;
  isLoading: boolean;
  error?: string;
}