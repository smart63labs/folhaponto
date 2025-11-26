import { Servidor, CreateServidorData, ServidorFilters, ServidorCSVData } from '../types/servidor';
import { Sector } from '../types/sector';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class ServidorService {
  // Buscar todos os servidores com filtros
  static async getServidores(filters?: ServidorFilters): Promise<Servidor[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}/servidores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar servidores: ${response.statusText}`);
    }

    return response.json();
  }

  // Buscar servidor por ID
  static async getServidorById(id: number): Promise<Servidor> {
    const response = await fetch(`${API_BASE_URL}/servidores/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar servidor: ${response.statusText}`);
    }

    return response.json();
  }

  // Criar novo servidor
  static async createServidor(data: CreateServidorData): Promise<Servidor> {
    const response = await fetch(`${API_BASE_URL}/servidores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar servidor: ${response.statusText}`);
    }

    return response.json();
  }

  // Atualizar servidor
  static async updateServidor(id: number, data: Partial<CreateServidorData>): Promise<Servidor> {
    const response = await fetch(`${API_BASE_URL}/servidores/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar servidor: ${response.statusText}`);
    }

    return response.json();
  }

  // Deletar servidor
  static async deleteServidor(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/servidores/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar servidor: ${response.statusText}`);
    }
  }

  // Buscar servidores por setor
  static async getServidoresBySetor(setorId: number): Promise<Servidor[]> {
    const response = await fetch(`${API_BASE_URL}/servidores/setor/${setorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar servidores do setor: ${response.statusText}`);
    }

    return response.json();
  }

  // Importar servidores do CSV
  static async importServidoresFromCSV(csvData: ServidorCSVData[]): Promise<{ success: number; errors: string[] }> {
    const response = await fetch(`${API_BASE_URL}/servidores/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ servidores: csvData }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao importar servidores: ${response.statusText}`);
    }

    return response.json();
  }

  // Buscar setores para dropdown
  static async getSetores(): Promise<Sector[]> {
    const response = await fetch(`${API_BASE_URL}/setores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar setores: ${response.statusText}`);
    }

    return response.json();
  }

  // Validar matrícula única
  static async validateMatricula(matricula: string, excludeId?: number): Promise<boolean> {
    const queryParams = new URLSearchParams({ matricula });
    if (excludeId) {
      queryParams.append('excludeId', excludeId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/servidores/validate-matricula?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao validar matrícula: ${response.statusText}`);
    }

    const result = await response.json();
    return result.isValid;
  }

  // Validar CPF único
  static async validateCPF(cpf: string, excludeId?: number): Promise<boolean> {
    const queryParams = new URLSearchParams({ cpf });
    if (excludeId) {
      queryParams.append('excludeId', excludeId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/servidores/validate-cpf?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao validar CPF: ${response.statusText}`);
    }

    const result = await response.json();
    return result.isValid;
  }

  // Relatório de servidores por setor
  static async getRelatorioServidoresPorSetor(): Promise<{ setor: string; total: number; ativos: number; inativos: number }[]> {
    const response = await fetch(`${API_BASE_URL}/servidores/relatorio/por-setor`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar relatório: ${response.statusText}`);
    }

    return response.json();
  }
}