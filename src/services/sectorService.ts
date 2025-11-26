import { Sector, HierarchyOperation, HierarchyNode } from '../types/sector';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class SectorService {
  // Obter todos os setores
  static async getAllSectors(): Promise<Sector[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/setores`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar setores: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mapear dados do banco para o formato esperado pelo frontend
      return data.map((item: any) => ({
        id: item.id || item.ID,
        name: item.nome_setor || item.NOME_SETOR || item.name,
        code: item.codigo_setor || item.CODIGO_SETOR || item.code,
        parentId: item.parent_id || item.PARENT_ID,
        level: 0, // Será calculado pela hierarquia
        managerId: item.manager_id || item.MANAGER_ID,
        description: item.descricao || item.description,
        orgao: item.orgao || item.ORGAO,
        logradouro: item.logradouro || item.LOGRADOURO,
        numero: item.numero || item.NUMERO,
        complemento: item.complemento || item.COMPLEMENTO,
        bairro: item.bairro || item.BAIRRO,
        cidade: item.cidade || item.CIDADE,
        estado: item.estado || item.ESTADO,
        cep: item.cep || item.CEP,
        telefone: item.telefone || item.TELEFONE,
        email: item.email || item.EMAIL,
        latitude: item.latitude || item.LATITUDE,
        longitude: item.longitude || item.LONGITUDE,
        active: item.ativo === true || item.ativo === 1 || item.ativo === '1' || item.active === true,
        createdAt: item.created_at || item.CREATED_AT,
        updatedAt: item.updated_at || item.UPDATED_AT
      }));
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      throw error;
    }
  }

  // Obter setor por ID
  static async getSectorById(id: number): Promise<Sector | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/setores/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erro ao buscar setor: ${response.statusText}`);
      }
      
      const item = await response.json();
      
      return {
        id: item.id || item.ID,
        name: item.nome_setor || item.NOME_SETOR || item.name,
        code: item.codigo_setor || item.CODIGO_SETOR || item.code,
        parentId: item.parent_id || item.PARENT_ID,
        level: 0,
        managerId: item.manager_id || item.MANAGER_ID,
        description: item.descricao || item.description,
        orgao: item.orgao || item.ORGAO,
        logradouro: item.logradouro || item.LOGRADOURO,
        numero: item.numero || item.NUMERO,
        complemento: item.complemento || item.COMPLEMENTO,
        bairro: item.bairro || item.BAIRRO,
        cidade: item.cidade || item.CIDADE,
        estado: item.estado || item.ESTADO,
        cep: item.cep || item.CEP,
        telefone: item.telefone || item.TELEFONE,
        email: item.email || item.EMAIL,
        latitude: item.latitude || item.LATITUDE,
        longitude: item.longitude || item.LONGITUDE,
        active: item.ativo === 1 || item.ativo === '1' || item.active === true,
        createdAt: item.created_at || item.CREATED_AT,
        updatedAt: item.updated_at || item.UPDATED_AT
      };
    } catch (error) {
      console.error('Erro ao buscar setor:', error);
      throw error;
    }
  }

  // Criar novo setor
  static async createSector(sectorData: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sector> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/setores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: sectorData.name,
          codigo: sectorData.code,
          descricao: sectorData.description,
          orgao: sectorData.orgao,
          logradouro: sectorData.logradouro,
          numero: sectorData.numero,
          complemento: sectorData.complemento,
          bairro: sectorData.bairro,
          cidade: sectorData.cidade,
          estado: sectorData.estado,
          cep: sectorData.cep,
          telefone: sectorData.telefone,
          email: sectorData.email,
          ativo: sectorData.active
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar setor: ${response.statusText}`);
      }

      const result = await response.json();
      const newSector = result.data || result;

      return {
        id: newSector.id || newSector.ID,
        name: newSector.nome || newSector.name,
        code: newSector.codigo || newSector.code,
        parentId: newSector.parent_id || newSector.PARENT_ID,
        level: 0,
        managerId: newSector.manager_id || newSector.MANAGER_ID,
        description: newSector.descricao || newSector.description,
        orgao: newSector.orgao || newSector.ORGAO,
        logradouro: newSector.logradouro || newSector.LOGRADOURO,
        numero: newSector.numero || newSector.NUMERO,
        complemento: newSector.complemento || newSector.COMPLEMENTO,
        bairro: newSector.bairro || newSector.BAIRRO,
        cidade: newSector.cidade || newSector.CIDADE,
        estado: newSector.estado || newSector.ESTADO,
        cep: newSector.cep || newSector.CEP,
        telefone: newSector.telefone || newSector.TELEFONE,
        email: newSector.email || newSector.EMAIL,
        latitude: newSector.latitude || newSector.LATITUDE,
        longitude: newSector.longitude || newSector.LONGITUDE,
        active: newSector.ativo === 1 || newSector.ativo === '1' || newSector.active === true,
        createdAt: newSector.created_at || newSector.CREATED_AT,
        updatedAt: newSector.updated_at || newSector.UPDATED_AT
      };
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      throw error;
    }
  }

  // Atualizar setor
  static async updateSector(id: number, changes: Partial<Sector>): Promise<Sector> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: changes.name,
          codigo: changes.code,
          descricao: changes.description,
          orgao: changes.orgao,
          logradouro: changes.logradouro,
          numero: changes.numero,
          complemento: changes.complemento,
          bairro: changes.bairro,
          cidade: changes.cidade,
          estado: changes.estado,
          cep: changes.cep,
          telefone: changes.telefone,
          email: changes.email,
          ativo: changes.active
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar setor: ${response.statusText}`);
      }

      const result = await response.json();
      const updatedSector = result.data || result;

      return {
        id: updatedSector.id || updatedSector.ID,
        name: updatedSector.nome || updatedSector.name,
        code: updatedSector.codigo || updatedSector.code,
        parentId: updatedSector.parent_id || updatedSector.PARENT_ID,
        level: 0,
        managerId: updatedSector.manager_id || updatedSector.MANAGER_ID,
        description: updatedSector.descricao || updatedSector.description,
        orgao: updatedSector.orgao || updatedSector.ORGAO,
        logradouro: updatedSector.logradouro || updatedSector.LOGRADOURO,
        numero: updatedSector.numero || updatedSector.NUMERO,
        complemento: updatedSector.complemento || updatedSector.COMPLEMENTO,
        bairro: updatedSector.bairro || updatedSector.BAIRRO,
        cidade: updatedSector.cidade || updatedSector.CIDADE,
        estado: updatedSector.estado || updatedSector.ESTADO,
        cep: updatedSector.cep || updatedSector.CEP,
        telefone: updatedSector.telefone || updatedSector.TELEFONE,
        email: updatedSector.email || updatedSector.EMAIL,
        latitude: updatedSector.latitude || updatedSector.LATITUDE,
        longitude: updatedSector.longitude || updatedSector.LONGITUDE,
        active: updatedSector.ativo === 1 || updatedSector.ativo === '1' || updatedSector.active === true,
        createdAt: updatedSector.created_at || updatedSector.CREATED_AT,
        updatedAt: updatedSector.updated_at || updatedSector.UPDATED_AT
      };
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      throw error;
    }
  }

  // Excluir setor
  static async deleteSector(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/setores/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir setor: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      throw error;
    }
  }

  // Aplicar operações em lote (para drag and drop)
  static async applyHierarchyOperations(operations: HierarchyOperation[]): Promise<Sector[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    for (const operation of operations) {
      switch (operation.type) {
        case 'move':
          await this.updateSector(operation.sectorId, { 
            parentId: operation.newParentId 
          });
          break;
        
        case 'create':
          await this.createSector(operation.sector);
          break;
        
        case 'update':
          await this.updateSector(operation.sectorId, operation.changes);
          break;
        
        case 'delete':
          await this.deleteSector(operation.sectorId);
          break;
      }
    }

    return this.getAllSectors();
  }

  // Construir hierarquia
  static buildHierarchy(sectors: Sector[]): HierarchyNode[] {
    const buildNode = (sector: Sector, depth = 0): HierarchyNode => {
      const children = sectors
        .filter(s => s.parentId === sector.id)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map(child => buildNode(child, depth + 1));

      return {
        sector: {
          ...sector,
          children: children.map(child => child.sector)
        },
        children,
        depth,
        path: this.getSectorPath(sector.id, sectors)
      };
    };

    return sectors
      .filter(sector => !sector.parentId)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map(sector => buildNode(sector));
  }

  // Obter caminho do setor (da raiz até o setor)
  static getSectorPath(sectorId: string, sectors: Sector[]): string[] {
    const path: string[] = [];
    let currentId: string | undefined = sectorId;

    while (currentId) {
      const sector = sectors.find(s => s.id === currentId);
      if (sector) {
        path.unshift(currentId);
        currentId = sector.parentId;
      } else {
        break;
      }
    }

    return path;
  }

  // Validar hierarquia
  static validateHierarchy(sectors: Sector[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar ciclos
    const checkCycle = (sectorId: string, visited = new Set<string>()): boolean => {
      if (visited.has(sectorId)) return true;
      
      visited.add(sectorId);
      const sector = sectors.find(s => s.id === sectorId);
      
      if (sector?.parentId) {
        return checkCycle(sector.parentId, visited);
      }
      
      return false;
    };

    sectors.forEach(sector => {
      if (sector.parentId && checkCycle(sector.id)) {
        errors.push(`Ciclo detectado na hierarquia do setor: ${sector.name}`);
      }
    });

    // Verificar setores órfãos
    sectors.forEach(sector => {
      if (sector.parentId && !sectors.find(s => s.id === sector.parentId)) {
        errors.push(`Setor pai não encontrado para: ${sector.name}`);
      }
    });

    // Verificar códigos duplicados
    const codes = new Map<string, string[]>();
    sectors.forEach(sector => {
      const code = sector.code.toLowerCase();
      if (!codes.has(code)) {
        codes.set(code, []);
      }
      codes.get(code)!.push(sector.name);
    });

    codes.forEach((names, code) => {
      if (names.length > 1) {
        errors.push(`Código duplicado '${code.toUpperCase()}' usado por: ${names.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Obter setores por nível hierárquico
  static getSectorsByLevel(sectors: Sector[], level: number): Sector[] {
    return sectors.filter(sector => sector.level === level);
  }

  // Obter descendentes de um setor
  static getSectorDescendants(sectorId: string, sectors: Sector[]): Sector[] {
    const descendants: Sector[] = [];
    const children = sectors.filter(s => s.parentId === sectorId);
    
    children.forEach(child => {
      descendants.push(child);
      descendants.push(...this.getSectorDescendants(child.id, sectors));
    });

    return descendants;
  }

  // Obter ancestrais de um setor
  static getSectorAncestors(sectorId: string, sectors: Sector[]): Sector[] {
    const ancestors: Sector[] = [];
    let currentId: string | undefined = sectorId;

    while (currentId) {
      const sector = sectors.find(s => s.id === currentId);
      if (sector?.parentId) {
        const parent = sectors.find(s => s.id === sector.parentId);
        if (parent) {
          ancestors.unshift(parent);
          currentId = parent.id;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return ancestors;
  }

  // Verificar se um setor é descendente de outro
  static isDescendant(ancestorId: string, descendantId: string, sectors: Sector[]): boolean {
    const descendants = this.getSectorDescendants(ancestorId, sectors);
    return descendants.some(d => d.id === descendantId);
  }
}