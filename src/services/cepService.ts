// CEP Service - Integração com BrasilAPI e ViaCEP
export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export class CepService {
  private static readonly BRASIL_API_URL = 'https://brasilapi.com.br/api/cep/v1';
  private static readonly VIA_CEP_URL = 'https://viacep.com.br/ws';

  /**
   * Busca informações de CEP usando BrasilAPI como primária e ViaCEP como fallback
   */
  static async buscarCep(cep: string): Promise<CepData | null> {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '');

      // Valida formato do CEP
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve conter 8 dígitos');
      }

      // Tenta BrasilAPI primeiro
      try {
        const response = await fetch(`${this.BRASIL_API_URL}/${cepLimpo}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return this.normalizarDadosBrasilAPI(data);
        }
      } catch (error) {
        console.warn('Erro na BrasilAPI, tentando ViaCEP:', error);
      }

      // Fallback para ViaCEP
      try {
        const response = await fetch(`${this.VIA_CEP_URL}/${cepLimpo}/json/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();

          // ViaCEP retorna erro como {erro: true}
          if (data.erro) {
            throw new Error('CEP não encontrado');
          }

          return this.normalizarDadosViaCEP(data);
        }
      } catch (error) {
        console.warn('Erro na ViaCEP:', error);
      }

      throw new Error('Não foi possível consultar o CEP');

    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  }

  /**
   * Normaliza dados da BrasilAPI para o formato padrão
   */
  private static normalizarDadosBrasilAPI(data: any): CepData {
    return {
      cep: data.cep,
      logradouro: data.street || '',
      complemento: data.complement || '',
      bairro: data.neighborhood || '',
      localidade: data.city || '',
      uf: data.state || '',
      ibge: data.ibge || '',
      gia: data.gia || '',
      ddd: data.ddd || '',
      siafi: data.siafi || '',
    };
  }

  /**
   * Normaliza dados da ViaCEP para o formato padrão
   */
  private static normalizarDadosViaCEP(data: any): CepData {
    return {
      cep: data.cep,
      logradouro: data.logradouro || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
      ibge: data.ibge || '',
      gia: data.gia || '',
      ddd: data.ddd || '',
      siafi: data.siafi || '',
    };
  }

  /**
   * Formata CEP para exibição
   */
  static formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  }

  /**
   * Remove formatação do CEP
   */
  static limparCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }
}