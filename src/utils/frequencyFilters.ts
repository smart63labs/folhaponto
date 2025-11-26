import { RegistroPonto } from '@/types';
import { isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface FrequencyFilters {
  periodo: 'mensal' | 'semanal' | 'quinzenal' | 'personalizado';
  status: 'todos' | 'presente' | 'falta' | 'atraso' | 'feriado';
  dataInicio?: Date;
  dataFim?: Date;
}

export const filterRegistros = (registros: RegistroPonto[], filters: FrequencyFilters): RegistroPonto[] => {
  return registros.filter(registro => {
    // Filtro por status
    if (filters.status !== 'todos') {
      if (filters.status !== registro.status) {
        return false;
      }
    }

    // Filtro por período
    const hoje = new Date();
    let dataInicio: Date;
    let dataFim: Date;

    switch (filters.periodo) {
      case 'semanal':
        dataInicio = startOfWeek(hoje, { weekStartsOn: 1 }); // Segunda-feira
        dataFim = endOfWeek(hoje, { weekStartsOn: 1 }); // Domingo
        break;
      case 'quinzenal':
        // Primeira ou segunda quinzena do mês
        const inicioMes = startOfMonth(hoje);
        const fimMes = endOfMonth(hoje);
        const diaAtual = hoje.getDate();
        
        if (diaAtual <= 15) {
          dataInicio = inicioMes;
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 15);
        } else {
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 16);
          dataFim = fimMes;
        }
        break;
      case 'personalizado':
        if (!filters.dataInicio || !filters.dataFim) {
          return true; // Se não há datas definidas, não filtra
        }
        dataInicio = filters.dataInicio;
        dataFim = filters.dataFim;
        break;
      case 'mensal':
      default:
        dataInicio = startOfMonth(hoje);
        dataFim = endOfMonth(hoje);
        break;
    }

    // Verificar se o registro está dentro do período
    return isWithinInterval(registro.data, { start: dataInicio, end: dataFim });
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'presente':
      return 'bg-green-100 text-green-800';
    case 'falta':
      return 'bg-red-100 text-red-800';
    case 'atraso':
      return 'bg-yellow-100 text-yellow-800';
    case 'feriado':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'presente':
      return 'Presente';
    case 'falta':
      return 'Falta';
    case 'atraso':
      return 'Atraso';
    case 'feriado':
      return 'Feriado';
    default:
      return 'Desconhecido';
  }
};