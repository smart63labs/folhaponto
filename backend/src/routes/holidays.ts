import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

// Interface para o feriado da API externa
interface ExternalHoliday {
  date: string;
  name: string;
  type: string;
  level: string;
}

// Cache simples em memória para os feriados
interface HolidayCache {
  [year: string]: {
    data: ExternalHoliday[];
    timestamp: number;
  };
}

const holidayCache: HolidayCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em millisegundos

/**
 * GET /api/holidays/:year
 * Busca feriados para um ano específico
 */
router.get('/:year', async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    const currentYear = new Date().getFullYear();
    
    // Validação do ano
    if (!year || isNaN(Number(year))) {
      return res.status(400).json({
        success: false,
        error: 'Ano inválido',
        message: 'O ano deve ser um número válido'
      });
    }

    const yearNumber = Number(year);
    if (yearNumber < 2020 || yearNumber > currentYear + 5) {
      return res.status(400).json({
        success: false,
        error: 'Ano fora do intervalo permitido',
        message: 'O ano deve estar entre 2020 e ' + (currentYear + 5)
      });
    }

    // Verificar cache
    const cached = holidayCache[year];
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      logger.info(`Feriados para ${year} retornados do cache`);
      return res.json({
        success: true,
        data: cached.data,
        cached: true,
        year: yearNumber
      });
    }

    // Buscar da API externa
    const apiToken = process.env.HOLIDAYS_API_TOKEN || '22159|gZ8FaBHcR27cXe9n8vBhrboiMRT4cx2B';
    const apiUrl = `https://api.invertexto.com/v1/holidays/${year}?token=${apiToken}`;

    logger.info(`Buscando feriados da API externa para o ano ${year}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SEFAZ-TO-Sistema-Ponto/2.0.0'
      }
    });

    if (!response.ok) {
      logger.error(`Erro na API externa: ${response.status} - ${response.statusText}`);
      return res.status(502).json({
        success: false,
        error: 'Erro na API de feriados',
        message: 'Não foi possível buscar os feriados no momento'
      });
    }

    const holidays: ExternalHoliday[] = await response.json();

    // Validar resposta
    if (!Array.isArray(holidays)) {
      logger.error('Resposta da API externa não é um array');
      return res.status(502).json({
        success: false,
        error: 'Formato de resposta inválido',
        message: 'A API de feriados retornou dados em formato inválido'
      });
    }

    // Armazenar no cache
    holidayCache[year] = {
      data: holidays,
      timestamp: Date.now()
    };

    logger.info(`${holidays.length} feriados encontrados para o ano ${year}`);

    res.json({
      success: true,
      data: holidays,
      cached: false,
      year: yearNumber,
      count: holidays.length
    });

  } catch (error) {
    logger.error('Erro ao buscar feriados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao processar solicitação de feriados'
    });
  }
});

/**
 * GET /api/holidays/check/:date
 * Verifica se uma data específica é feriado
 */
router.get('/check/:date', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    // Validar formato da data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de data inválido',
        message: 'A data deve estar no formato YYYY-MM-DD'
      });
    }

    const year = date.substring(0, 4);
    
    // Verificar cache primeiro
    let holidays: ExternalHoliday[] = [];
    const cached = holidayCache[year];
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      holidays = cached.data;
    } else {
      // Buscar da API se não estiver em cache
      const apiToken = process.env.HOLIDAYS_API_TOKEN || '22159|gZ8FaBHcR27cXe9n8vBhrboiMRT4cx2B';
      const apiUrl = `https://api.invertexto.com/v1/holidays/${year}?token=${apiToken}`;

      const response = await fetch(apiUrl);
      if (response.ok) {
        holidays = await response.json();
        holidayCache[year] = {
          data: holidays,
          timestamp: Date.now()
        };
      }
    }

    // Procurar a data específica
    const holiday = holidays.find(h => h.date === date);
    
    res.json({
      success: true,
      isHoliday: !!holiday,
      holiday: holiday || null,
      date
    });

  } catch (error) {
    logger.error('Erro ao verificar feriado:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar se a data é feriado'
    });
  }
});

/**
 * DELETE /api/holidays/cache/:year
 * Limpa o cache de feriados para um ano específico
 */
router.delete('/cache/:year', (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    
    if (holidayCache[year]) {
      delete holidayCache[year];
      logger.info(`Cache de feriados limpo para o ano ${year}`);
      res.json({
        success: true,
        message: `Cache limpo para o ano ${year}`
      });
    } else {
      res.json({
        success: true,
        message: `Nenhum cache encontrado para o ano ${year}`
      });
    }
  } catch (error) {
    logger.error('Erro ao limpar cache:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao limpar cache de feriados'
    });
  }
});

export default router;