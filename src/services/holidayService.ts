export interface Holiday {
  date: string;
  name: string;
  type: 'feriado' | 'facultativo';
  level: 'nacional' | 'estadual' | 'municipal';
}

export interface HolidayCache {
  year: number;
  holidays: Holiday[];
  timestamp: number;
}

// Interface para dados da API externa (Invertexto)
export interface ExternalHolidayData {
  date: string;
  name: string;
  type: 'feriado' | 'facultativo';
  level: 'nacional' | 'estadual';
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  data?: Holiday[];
}

class HolidayService {
  private readonly BASE_URL = 'http://localhost:3001/api/holidays';
  private readonly EXTERNAL_API_URL = 'https://api.invertexto.com/v1/holidays';
  private readonly CACHE_KEY = 'holidays_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em millisegundos

  /**
   * Busca feriados para um ano específico
   */
  async getHolidaysByYear(year: number): Promise<Holiday[]> {
    try {
      // Verificar cache local primeiro
      const cached = this.getCachedHolidays(year);
      if (cached) {
        return cached;
      }

      // Buscar do backend (que faz proxy para a API externa)
      const response = await fetch(`${this.BASE_URL}/${year}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao buscar feriados');
      }

      // A resposta do backend já vem com a estrutura correta
      const holidays: Holiday[] = data.data;

      // Salvar no cache local
      this.setCachedHolidays(year, holidays);

      return holidays;
    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
      throw error; // Re-lançar o erro para que seja tratado pelo componente
    }
  }

  /**
   * Verifica se uma data é feriado
   */
  async isHoliday(date: Date): Promise<Holiday | null> {
    const year = date.getFullYear();
    const holidays = await this.getHolidaysByYear(year);
    const dateString = date.toISOString().split('T')[0];
    
    return holidays.find(holiday => holiday.date === dateString) || null;
  }

  /**
   * Busca feriados para múltiplos anos (útil para calendários que mostram meses de anos diferentes)
   */
  async getHolidaysForYears(years: number[]): Promise<Holiday[]> {
    const allHolidays: Holiday[] = [];
    
    for (const year of years) {
      const yearHolidays = await this.getHolidaysByYear(year);
      allHolidays.push(...yearHolidays);
    }
    
    return allHolidays;
  }

  /**
   * Obtém feriados do cache
   */
  private getCachedHolidays(year: number, ignoreExpiration = false): Holiday[] | null {
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}_${year}`);
      if (!cached) return null;

      const cacheData: HolidayCache = JSON.parse(cached);
      const now = Date.now();
      
      if (!ignoreExpiration && (now - cacheData.timestamp) > this.CACHE_DURATION) {
        return null;
      }

      return cacheData.holidays;
    } catch (error) {
      console.error('Erro ao ler cache de feriados:', error);
      return null;
    }
  }

  /**
   * Salva feriados no cache
   */
  private setCachedHolidays(year: number, holidays: Holiday[]): void {
    try {
      const cacheData: HolidayCache = {
        year,
        holidays,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`${this.CACHE_KEY}_${year}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar cache de feriados:', error);
    }
  }

  /**
   * Limpa cache de feriados
   */
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar cache de feriados:', error);
    }
  }

  /**
   * Força atualização do cache para um ano
   */
  async refreshHolidays(year: number): Promise<Holiday[]> {
    // Remove cache existente
    localStorage.removeItem(`${this.CACHE_KEY}_${year}`);
    
    // Busca novamente
    return this.getHolidaysByYear(year);
  }

  /**
   * Importa feriados da API externa (Invertexto) para um ano específico
   * Usa o backend como proxy para evitar problemas de CORS
   */
  async importHolidaysFromAPI(year: number): Promise<ImportResult> {
    try {
      console.log(`Importando feriados de ${year} da API externa via backend...`);
      
      // Usar o backend como proxy (que já resolve CORS e tem o token)
      const response = await fetch(`${this.BASE_URL}/${year}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const backendResponse = await response.json();
      
      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Erro ao buscar feriados do backend');
      }

      const externalData: ExternalHolidayData[] = backendResponse.data;
      
      if (!Array.isArray(externalData)) {
        throw new Error('Formato de dados inválido da API externa');
      }

      // Converter dados externos para formato interno
      const convertedHolidays: Holiday[] = externalData.map(item => ({
        date: item.date,
        name: item.name,
        type: item.type,
        level: item.level
      }));

      // Salvar dados JSON localmente
      await this.saveHolidaysToFile(year, convertedHolidays);

      // Atualizar cache local
      this.setCachedHolidays(year, convertedHolidays);

      return {
        success: true,
        imported: convertedHolidays.length,
        skipped: 0,
        errors: [],
        data: convertedHolidays
      };

    } catch (error) {
      console.error('Erro ao importar feriados da API:', error);
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
      };
    }
  }

  /**
   * Salva dados de feriados em arquivo JSON local
   */
  private async saveHolidaysToFile(year: number, holidays: Holiday[]): Promise<void> {
    try {
      const dataToSave = {
        year,
        importDate: new Date().toISOString(),
        source: 'api.invertexto.com',
        holidays
      };

      // Criar blob com dados JSON
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
        type: 'application/json'
      });

      // Criar URL para download
      const url = URL.createObjectURL(blob);
      
      // Criar elemento de download temporário
      const a = document.createElement('a');
      a.href = url;
      a.download = `feriados_${year}_importados.json`;
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpar URL
      URL.revokeObjectURL(url);

      console.log(`Arquivo feriados_${year}_importados.json salvo com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar arquivo JSON:', error);
      throw error;
    }
  }

  /**
   * Importa feriados de múltiplos anos
   */
  async importMultipleYears(years: number[]): Promise<ImportResult> {
    const results: ImportResult[] = [];
    const allHolidays: Holiday[] = [];
    const allErrors: string[] = [];

    for (const year of years) {
      const result = await this.importHolidaysFromAPI(year);
      results.push(result);
      
      if (result.success && result.data) {
        allHolidays.push(...result.data);
      }
      
      if (result.errors.length > 0) {
        allErrors.push(...result.errors.map(err => `${year}: ${err}`));
      }
    }

    const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    const hasSuccess = results.some(r => r.success);

    return {
      success: hasSuccess,
      imported: totalImported,
      skipped: totalSkipped,
      errors: allErrors,
      data: allHolidays
    };
  }
}

export const holidayService = new HolidayService();