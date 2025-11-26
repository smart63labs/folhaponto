import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RegistroPonto {
  id: string;
  data: Date;
  entrada1?: string;
  saida1?: string;
  entrada2?: string;
  saida2?: string;
  horasTrabalhadas: number;
  status: 'presente' | 'falta' | 'atraso' | 'feriado' | 'fim_semana';
  observacoes?: string;
}

interface EstatisticasMes {
  diasTrabalhados: number;
  diasFalta: number;
  diasAtraso: number;
  horasTrabalhadasTotal: number;
  horasDevidasTotal: number;
  saldoHoras: number;
}

export const exportToPDF = (registros: RegistroPonto[], estatisticas: EstatisticasMes, periodo: string) => {
  // Simulação de exportação para PDF
  const content = generateReportContent(registros, estatisticas, periodo);
  
  // Em uma implementação real, usaríamos uma biblioteca como jsPDF
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `frequencia_${format(new Date(), 'yyyy-MM-dd')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (registros: RegistroPonto[], estatisticas: EstatisticasMes, periodo: string) => {
  // Simulação de exportação para Excel
  const csvContent = generateCSVContent(registros, estatisticas);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `frequencia_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (registros: RegistroPonto[], estatisticas: EstatisticasMes, periodo: string) => {
  const csvContent = generateCSVContent(registros, estatisticas);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `frequencia_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateReportContent = (registros: RegistroPonto[], estatisticas: EstatisticasMes, periodo: string): string => {
  let content = `RELATÓRIO DE FREQUÊNCIA - ${periodo.toUpperCase()}\n`;
  content += `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}\n\n`;
  
  content += `RESUMO DO PERÍODO:\n`;
  content += `- Dias Trabalhados: ${estatisticas.diasTrabalhados}\n`;
  content += `- Dias de Falta: ${estatisticas.diasFalta}\n`;
  content += `- Dias de Atraso: ${estatisticas.diasAtraso}\n`;
  content += `- Horas Trabalhadas: ${estatisticas.horasTrabalhadasTotal.toFixed(2)}h\n`;
  content += `- Saldo de Horas: ${estatisticas.saldoHoras >= 0 ? '+' : ''}${estatisticas.saldoHoras.toFixed(2)}h\n\n`;
  
  content += `DETALHAMENTO DIÁRIO:\n`;
  content += `Data\t\tEntrada 1\tSaída 1\t\tEntrada 2\tSaída 2\t\tHoras\tStatus\t\tObservações\n`;
  content += `${'='.repeat(120)}\n`;
  
  registros.forEach(registro => {
    const dataFormatada = format(registro.data, 'dd/MM/yyyy', { locale: ptBR });
    const statusFormatado = getStatusLabel(registro.status);
    
    content += `${dataFormatada}\t${registro.entrada1 || '--:--'}\t\t${registro.saida1 || '--:--'}\t\t`;
    content += `${registro.entrada2 || '--:--'}\t\t${registro.saida2 || '--:--'}\t\t`;
    content += `${registro.horasTrabalhadas.toFixed(2)}h\t${statusFormatado}\t\t${registro.observacoes || ''}\n`;
  });
  
  return content;
};

const generateCSVContent = (registros: RegistroPonto[], estatisticas: EstatisticasMes): string => {
  let csvContent = 'Data,Entrada 1,Saída 1,Entrada 2,Saída 2,Horas Trabalhadas,Status,Observações\n';
  
  registros.forEach(registro => {
    const dataFormatada = format(registro.data, 'dd/MM/yyyy', { locale: ptBR });
    const statusFormatado = getStatusLabel(registro.status);
    
    csvContent += `"${dataFormatada}","${registro.entrada1 || ''}","${registro.saida1 || ''}",`;
    csvContent += `"${registro.entrada2 || ''}","${registro.saida2 || ''}","${registro.horasTrabalhadas.toFixed(2)}",`;
    csvContent += `"${statusFormatado}","${registro.observacoes || ''}"\n`;
  });
  
  // Adicionar resumo no final
  csvContent += '\n"RESUMO DO PERÍODO:"\n';
  csvContent += `"Dias Trabalhados","${estatisticas.diasTrabalhados}"\n`;
  csvContent += `"Dias de Falta","${estatisticas.diasFalta}"\n`;
  csvContent += `"Dias de Atraso","${estatisticas.diasAtraso}"\n`;
  csvContent += `"Horas Trabalhadas","${estatisticas.horasTrabalhadasTotal.toFixed(2)}"\n`;
  csvContent += `"Saldo de Horas","${estatisticas.saldoHoras.toFixed(2)}"\n`;
  
  return csvContent;
};

const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'presente': 'Presente',
    'falta': 'Falta',
    'atraso': 'Atraso',
    'feriado': 'Feriado',
    'fim_semana': 'Fim de Semana'
  };
  
  return statusLabels[status] || status;
};

export const filterRegistros = (
  registros: RegistroPonto[],
  filters: {
    periodo: 'mensal' | 'semanal' | 'quinzenal' | 'personalizado';
    status: 'todos' | 'presente' | 'falta' | 'atraso' | 'feriado';
    dataInicio?: Date;
    dataFim?: Date;
  }
): RegistroPonto[] => {
  let filteredRegistros = [...registros];
  
  // Filtrar por status
  if (filters.status !== 'todos') {
    filteredRegistros = filteredRegistros.filter(registro => registro.status === filters.status);
  }
  
  // Filtrar por período personalizado
  if (filters.periodo === 'personalizado' && filters.dataInicio && filters.dataFim) {
    filteredRegistros = filteredRegistros.filter(registro => {
      const dataRegistro = registro.data;
      return dataRegistro >= filters.dataInicio! && dataRegistro <= filters.dataFim!;
    });
  }
  
  return filteredRegistros;
};