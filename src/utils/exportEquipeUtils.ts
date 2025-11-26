import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface MembroEquipe {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  dataAdmissao: string;
  status: 'ativo' | 'inativo' | 'licenca';
  horasTrabalhadasMes?: number;
  diasTrabalhados?: number;
  atrasos?: number;
  ausencias?: number;
}

export interface EstatisticasEquipe {
  totalMembros: number;
  membrosAtivos: number;
  membrosInativos: number;
  horasTotaisMes: number;
  mediaHorasPorMembro: number;
  totalAtrasos: number;
  totalAusencias: number;
}

export const exportEquipeToCSV = (membros: MembroEquipe[], estatisticas: EstatisticasEquipe) => {
  let csvContent = 'Nome,Email,Cargo,Setor,Data Admissão,Status,Horas Trabalhadas (Mês),Dias Trabalhados,Atrasos,Ausências\n';
  
  membros.forEach(membro => {
    const dataAdmissaoFormatada = format(new Date(membro.dataAdmissao), 'dd/MM/yyyy', { locale: ptBR });
    const statusFormatado = getStatusLabel(membro.status);
    
    csvContent += `"${membro.nome}","${membro.email}","${membro.cargo}","${membro.setor}",`;
    csvContent += `"${dataAdmissaoFormatada}","${statusFormatado}","${membro.horasTrabalhadasMes || 0}",`;
    csvContent += `"${membro.diasTrabalhados || 0}","${membro.atrasos || 0}","${membro.ausencias || 0}"\n`;
  });
  
  // Adicionar resumo estatístico
  csvContent += '\n"RESUMO DA EQUIPE:"\n';
  csvContent += `"Total de Membros","${estatisticas.totalMembros}"\n`;
  csvContent += `"Membros Ativos","${estatisticas.membrosAtivos}"\n`;
  csvContent += `"Membros Inativos","${estatisticas.membrosInativos}"\n`;
  csvContent += `"Total de Horas (Mês)","${estatisticas.horasTotaisMes.toFixed(2)}"\n`;
  csvContent += `"Média de Horas por Membro","${estatisticas.mediaHorasPorMembro.toFixed(2)}"\n`;
  csvContent += `"Total de Atrasos","${estatisticas.totalAtrasos}"\n`;
  csvContent += `"Total de Ausências","${estatisticas.totalAusencias}"\n`;
  
  return csvContent;
};

export const exportEquipeToExcel = (membros: MembroEquipe[], estatisticas: EstatisticasEquipe) => {
  const csvContent = exportEquipeToCSV(membros, estatisticas);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `equipe_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportEquipeToPDF = (membros: MembroEquipe[], estatisticas: EstatisticasEquipe) => {
  const content = generateEquipeReportContent(membros, estatisticas);
  
  // Em uma implementação real, usaríamos uma biblioteca como jsPDF
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio_equipe_${format(new Date(), 'yyyy-MM-dd')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportEquipeToJSON = (membros: MembroEquipe[], estatisticas: EstatisticasEquipe) => {
  const data = {
    dataExportacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: ptBR }),
    estatisticas,
    membros: membros.map(membro => ({
      ...membro,
      dataAdmissaoFormatada: format(new Date(membro.dataAdmissao), 'dd/MM/yyyy', { locale: ptBR }),
      statusFormatado: getStatusLabel(membro.status)
    }))
  };
  
  const jsonContent = JSON.stringify(data, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dados_equipe_${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'ativo':
      return 'Ativo';
    case 'inativo':
      return 'Inativo';
    case 'licenca':
      return 'Em Licença';
    default:
      return 'Desconhecido';
  }
};

const generateEquipeReportContent = (membros: MembroEquipe[], estatisticas: EstatisticasEquipe): string => {
  const dataAtual = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  
  let content = `RELATÓRIO DA EQUIPE\n`;
  content += `Data de Geração: ${dataAtual}\n`;
  content += `=====================================\n\n`;
  
  // Estatísticas gerais
  content += `ESTATÍSTICAS GERAIS:\n`;
  content += `- Total de Membros: ${estatisticas.totalMembros}\n`;
  content += `- Membros Ativos: ${estatisticas.membrosAtivos}\n`;
  content += `- Membros Inativos: ${estatisticas.membrosInativos}\n`;
  content += `- Total de Horas (Mês): ${estatisticas.horasTotaisMes.toFixed(2)}h\n`;
  content += `- Média de Horas por Membro: ${estatisticas.mediaHorasPorMembro.toFixed(2)}h\n`;
  content += `- Total de Atrasos: ${estatisticas.totalAtrasos}\n`;
  content += `- Total de Ausências: ${estatisticas.totalAusencias}\n\n`;
  
  // Lista de membros
  content += `MEMBROS DA EQUIPE:\n`;
  content += `=====================================\n`;
  
  membros.forEach((membro, index) => {
    const dataAdmissao = format(new Date(membro.dataAdmissao), 'dd/MM/yyyy', { locale: ptBR });
    const statusFormatado = getStatusLabel(membro.status);
    
    content += `${index + 1}. ${membro.nome}\n`;
    content += `   Email: ${membro.email}\n`;
    content += `   Cargo: ${membro.cargo}\n`;
    content += `   Setor: ${membro.setor}\n`;
    content += `   Data de Admissão: ${dataAdmissao}\n`;
    content += `   Status: ${statusFormatado}\n`;
    content += `   Horas Trabalhadas (Mês): ${membro.horasTrabalhadasMes || 0}h\n`;
    content += `   Dias Trabalhados: ${membro.diasTrabalhados || 0}\n`;
    content += `   Atrasos: ${membro.atrasos || 0}\n`;
    content += `   Ausências: ${membro.ausencias || 0}\n`;
    content += `\n`;
  });
  
  return content;
};

export const calcularEstatisticasEquipe = (membros: MembroEquipe[]): EstatisticasEquipe => {
  const membrosAtivos = membros.filter(m => m.status === 'ativo');
  const membrosInativos = membros.filter(m => m.status !== 'ativo');
  
  const horasTotaisMes = membros.reduce((total, membro) => total + (membro.horasTrabalhadasMes || 0), 0);
  const totalAtrasos = membros.reduce((total, membro) => total + (membro.atrasos || 0), 0);
  const totalAusencias = membros.reduce((total, membro) => total + (membro.ausencias || 0), 0);
  
  return {
    totalMembros: membros.length,
    membrosAtivos: membrosAtivos.length,
    membrosInativos: membrosInativos.length,
    horasTotaisMes,
    mediaHorasPorMembro: membros.length > 0 ? horasTotaisMes / membros.length : 0,
    totalAtrasos,
    totalAusencias
  };
};