import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  Wifi,
  WifiOff,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { FrequencyFilters } from '@/components/FrequencyFilters';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { isSameDay, format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { filterRegistros } from '@/utils/frequencyFilters';
import { exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { holidayService, Holiday } from '@/services/holidayService';

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

const MinhaFrequencia: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, getOfflineData, getPendingSyncCount } = useOfflineStorage();
  const [mesAtual, setMesAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<'mensal' | 'semanal' | 'quinzenal'>('mensal');
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  
  // Estados para feriados
  const [feriados, setFeriados] = useState<Holiday[]>([]);
  const [carregandoFeriados, setCarregandoFeriados] = useState(false);
  
  // Estados para o modal de detalhes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  const [filters, setFilters] = useState({
    periodo: 'mensal' as 'mensal' | 'semanal' | 'quinzenal' | 'personalizado',
    status: 'todos' as 'todos' | 'presente' | 'falta' | 'atraso' | 'feriado',
    dataInicio: undefined as Date | undefined,
    dataFim: undefined as Date | undefined,
  });

  // Buscar feriados quando o mês mudar
  useEffect(() => {
    const buscarFeriados = async () => {
      setCarregandoFeriados(true);
      try {
        const ano = mesAtual.getFullYear();
        const feriadosAno = await holidayService.getHolidaysByYear(ano);
        setFeriados(feriadosAno);
      } catch (error) {
        console.error('Erro ao buscar feriados:', error);
      } finally {
        setCarregandoFeriados(false);
      }
    };

    buscarFeriados();
  }, [mesAtual]);

  // Atualizar contador de sincronização pendente
  useEffect(() => {
    const updatePendingCount = () => {
      setPendingSyncCount(getPendingSyncCount());
    };
    
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000); // Atualiza a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [getPendingSyncCount]);

  // Dados mockados de frequência
  const registrosPonto: RegistroPonto[] = useMemo(() => {
    const registros: RegistroPonto[] = [];
    const inicioMes = startOfMonth(mesAtual);
    const fimMes = endOfMonth(mesAtual);
    const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

    diasMes.forEach((dia, index) => {
      const diaSemana = dia.getDay();
      const dataString = dia.toISOString().split('T')[0];
      
      // Verificar se é feriado real da API
      const feriado = feriados.find(f => f.date === dataString);
      if (feriado) {
        registros.push({
          id: `${index}`,
          data: dia,
          status: 'feriado',
          horasTrabalhadas: 0,
          observacoes: `${feriado.name} (${feriado.type === 'feriado' ? 'Feriado' : 'Facultativo'} ${feriado.level})`
        });
        return;
      }
      
      // Fim de semana
      if (diaSemana === 0 || diaSemana === 6) {
        registros.push({
          id: `${index}`,
          data: dia,
          status: 'fim_semana',
          horasTrabalhadas: 0
        });
        return;
      }

      // Simular registros variados para dias úteis
      const rand = Math.random();
      if (rand < 0.05) {
        // 5% de faltas
        registros.push({
          id: `${index}`,
          data: dia,
          status: 'falta',
          horasTrabalhadas: 0,
          observacoes: 'Falta não justificada'
        });
      } else if (rand < 0.15) {
        // 10% de atrasos
        registros.push({
          id: `${index}`,
          data: dia,
          entrada1: '08:30',
          saida1: '12:00',
          entrada2: '14:00',
          saida2: '18:00',
          status: 'atraso',
          horasTrabalhadas: 7.5,
          observacoes: 'Atraso de 30 minutos'
        });
      } else {
        // Dias normais
        registros.push({
          id: `${index}`,
          data: dia,
          entrada1: '08:00',
          saida1: '12:00',
          entrada2: '14:00',
          saida2: '18:00',
          status: 'presente',
          horasTrabalhadas: 8
        });
      }
    });

    return registros;
  }, [mesAtual, feriados]);

  // Calcular estatísticas do mês
  const estatisticas: EstatisticasMes = useMemo(() => {
    const stats = registrosPonto.reduce((acc, registro) => {
      switch (registro.status) {
        case 'presente':
          acc.diasTrabalhados++;
          acc.horasTrabalhadasTotal += registro.horasTrabalhadas;
          break;
        case 'atraso':
          acc.diasTrabalhados++;
          acc.diasAtraso++;
          acc.horasTrabalhadasTotal += registro.horasTrabalhadas;
          break;
        case 'falta':
          acc.diasFalta++;
          acc.horasDevidasTotal += 8; // Assumindo 8h por dia
          break;
      }
      return acc;
    }, {
      diasTrabalhados: 0,
      diasFalta: 0,
      diasAtraso: 0,
      horasTrabalhadasTotal: 0,
      horasDevidasTotal: 0,
      saldoHoras: 0
    });

    // Calcular saldo de horas (simplificado)
    const horasEsperadas = stats.diasTrabalhados * 8;
    stats.saldoHoras = stats.horasTrabalhadasTotal - horasEsperadas;

    return stats;
  }, [registrosPonto]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'presente': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'atraso': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'falta': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'feriado': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'fim_semana': return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'presente': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'atraso': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'falta': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'feriado': return <CalendarIcon className="w-4 h-4 text-purple-600" />;
      case 'fim_semana': return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'presente': return 'Presente';
      case 'atraso': return 'Atraso';
      case 'falta': return 'Falta';
      case 'feriado': return 'Feriado';
      case 'fim_semana': return 'Fim de Semana';
      default: return 'N/A';
    }
  };

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    if (direcao === 'anterior') {
      setMesAtual(subMonths(mesAtual, 1));
    } else {
      setMesAtual(addMonths(mesAtual, 1));
    }
    setDiaSelecionado(null);
  };

  const exportarEspelho = (formato: 'pdf' | 'excel' | 'csv') => {
    const registrosFiltrados = filterRegistros(registrosPonto, filters);
    const periodo = format(mesAtual, 'MMMM yyyy', { locale: ptBR });
    
    switch (formato) {
      case 'pdf':
        exportToPDF(registrosFiltrados, estatisticas, periodo);
        break;
      case 'excel':
        exportToExcel(registrosFiltrados, estatisticas, periodo);
        break;
      case 'csv':
        exportToCSV(registrosFiltrados, estatisticas, periodo);
        break;
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      periodo: 'mensal',
      status: 'todos',
      dataInicio: undefined,
      dataFim: undefined,
    });
  };

  // Função para gerar o calendário com alinhamento correto
  const gerarCalendario = useMemo(() => {
    const inicioMes = startOfMonth(mesAtual);
    const fimMes = endOfMonth(mesAtual);
    
    // Pegar o primeiro dia da semana do mês (domingo = 0)
    const primeiroDiaSemana = getDay(inicioMes);
    
    // Criar array com células vazias para alinhar o calendário
    const celulasVazias = Array(primeiroDiaSemana).fill(null);
    
    // Pegar todos os dias do mês
    const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });
    
    return [...celulasVazias, ...diasMes];
  }, [mesAtual]);

  // Função para abrir modal com detalhes do dia
  const abrirModalDetalhes = (dia: Date) => {
    const registro = registrosPonto.find(r => isSameDay(r.data, dia));
    
    if (!registro) {
      setModalTitle("Sem registros");
      setModalMessage(`Não há registros para o dia ${format(dia, 'dd/MM/yyyy', { locale: ptBR })}.`);
      setModalType('info');
    } else {
      const statusLabels = {
        presente: 'Presente',
        falta: 'Falta',
        atraso: 'Atraso',
        feriado: 'Feriado',
        fim_semana: 'Fim de Semana'
      };
      
      let detalhes = `Data: ${format(dia, 'dd/MM/yyyy', { locale: ptBR })}\n`;
      detalhes += `Status: ${statusLabels[registro.status]}\n`;
      
      if (registro.entrada1) {
        detalhes += `\nRegistros de Ponto:\n`;
        detalhes += `• Entrada 1: ${registro.entrada1}\n`;
        if (registro.saida1) detalhes += `• Saída 1: ${registro.saida1}\n`;
        if (registro.entrada2) detalhes += `• Entrada 2: ${registro.entrada2}\n`;
        if (registro.saida2) detalhes += `• Saída 2: ${registro.saida2}\n`;
        detalhes += `\nHoras Trabalhadas: ${registro.horasTrabalhadas}h`;
      }
      
      if (registro.observacoes) {
        detalhes += `\n\nObservações: ${registro.observacoes}`;
      }
      
      setModalTitle(`Detalhes do Dia - ${format(dia, 'dd/MM/yyyy', { locale: ptBR })}`);
      setModalMessage(detalhes);
      setModalType(registro.status === 'presente' ? 'success' : 
                   registro.status === 'falta' ? 'error' : 
                   registro.status === 'atraso' ? 'warning' : 'info');
    }
    
    setModalOpen(true);
  };

  // Aplicar filtros aos registros
  const registrosFiltrados = useMemo(() => {
    return filterRegistros(registrosPonto, filters);
  }, [registrosPonto, filters]);

  const registroSelecionado = diaSelecionado 
    ? registrosPonto.find(r => isSameDay(r.data, diaSelecionado))
    : null;

  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Minha Frequência
          </h1>
          <p className="text-gray-600 mt-2">Visualize seu histórico de frequência e registros de ponto</p>
        </div>
        
        {/* Indicador de Status Online/Offline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Offline</span>
              </>
            )}
          </div>
          
          {pendingSyncCount > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              {pendingSyncCount} pendente(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Filtros e Exportação */}
      <FrequencyFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onExport={exportarEspelho}
      />

      {/* Estatísticas do Mês - Layout melhorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dias Trabalhados</p>
                <p className="text-3xl font-bold text-green-600">{estatisticas.diasTrabalhados}</p>
                <p className="text-xs text-gray-500 mt-1">Este mês</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faltas</p>
                <p className="text-3xl font-bold text-red-600">{estatisticas.diasFalta}</p>
                <p className="text-xs text-gray-500 mt-1">Este mês</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasos</p>
                <p className="text-3xl font-bold text-yellow-600">{estatisticas.diasAtraso}</p>
                <p className="text-xs text-gray-500 mt-1">Este mês</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo de Horas</p>
                <p className={`text-3xl font-bold ${estatisticas.saldoHoras >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {estatisticas.saldoHoras >= 0 ? '+' : ''}{estatisticas.saldoHoras}h
                </p>
                <p className="text-xs text-gray-500 mt-1">Acumulado</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário - Layout melhorado */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navegarMes('anterior')} className="hover:bg-blue-50">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-800">
                {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navegarMes('proximo')} className="hover:bg-blue-50">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Select value={visualizacao} onValueChange={(value: any) => setVisualizacao(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Calendário */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {/* Cabeçalho dos dias da semana */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} className="p-3 text-center text-sm font-bold text-gray-700 bg-gray-100 rounded-lg">
                {dia}
              </div>
            ))}
            
            {/* Células do calendário */}
            {gerarCalendario.map((dia, index) => {
              if (!dia) {
                // Célula vazia para alinhamento
                return <div key={`empty-${index}`} className="p-3"></div>;
              }
              
              const registro = registrosPonto.find(r => isSameDay(r.data, dia));
              const isSelected = diaSelecionado && isSameDay(dia, diaSelecionado);
              const isToday = isSameDay(dia, new Date());
              
              return (
                <button
                  key={dia.toISOString()}
                  onClick={() => abrirModalDetalhes(dia)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${isToday ? 'ring-2 ring-purple-400' : ''}
                    ${registro ? getStatusColor(registro.status) : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                  `}
                >
                  <div className={`text-sm font-bold ${isToday ? 'text-purple-700' : ''}`}>
                    {dia.getDate()}
                  </div>
                  {registro && (
                    <div className="flex justify-center mt-1">
                      {getStatusIcon(registro.status)}
                    </div>
                  )}
                  {isToday && (
                    <div className="text-xs text-purple-600 font-medium mt-1">Hoje</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda melhorada */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-200">
            {[
              { status: 'presente', label: 'Presente', color: 'text-green-600' },
              { status: 'atraso', label: 'Atraso', color: 'text-yellow-600' },
              { status: 'falta', label: 'Falta', color: 'text-red-600' },
              { status: 'feriado', label: 'Feriado', color: 'text-purple-600' },
              { status: 'fim_semana', label: 'Fim de Semana', color: 'text-gray-600' }
            ].map(({ status, label, color }) => (
              <div key={status} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6">
                  {getStatusIcon(status)}
                </div>
                <span className={`text-sm font-medium ${color}`}>{label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Dica:</strong> Clique em qualquer dia do calendário para ver os detalhes dos registros de ponto.
              {carregandoFeriados && <span className="ml-2">Carregando feriados...</span>}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        showConfirmButton={false}
      />
      </div>
    </DashboardLayout>
  );
};

export default MinhaFrequencia;