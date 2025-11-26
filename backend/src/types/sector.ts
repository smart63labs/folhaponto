export interface Sector {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  managerId?: number;
  description?: string;
  // Address fields
  orgao?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  children?: Sector[];
}

export interface HierarchyNode {
  sector: Sector;
  children: HierarchyNode[];
  depth: number;
  path: number[];
}

export interface HierarchyOperation {
  type: 'move' | 'create' | 'update' | 'delete';
  sectorId: number;
  newParentId?: number;
  sector?: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>;
  changes?: Partial<Sector>;
}