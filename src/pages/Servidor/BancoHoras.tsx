import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getBadgeConfig } from '@/config/badgeConfig';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Plus, 
  History, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MovimentoBancoHoras {
  id: string;
  data: string;
  tipo: 'acumulo' | 'uso' | 'ajuste' | 'vencimento';
  horas: number;
  descricao: string;
  status: 'aprovado' | 'pendente' | 'rejeitado';
  aprovadoPor?: string;
  dataAprovacao?: string;
  observacoes?: string;
  solicitadoEm: string;
}

interface SolicitacaoBancoHoras {
  id: string;
  data: string;
  tipo: 'uso';
  horasSolicitadas: number;
  motivo: string;
  justificativa: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataResposta?: string;
  aprovadoPor?: string;
  observacoes?: string;
}

interface SaldoBancoHoras {
  saldoAtual: number;
  saldoDisponivel: number;
  horasVencendo: number;
  dataVencimento?: string;
  limiteMensal: number;
  limiteAnual: number;
}

const BancoHoras: React.FC = () => {
  const [activeTab, setActiveTab] = useState('saldo');
  const [showSolicitacao, setShowSolicitacao] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para nova solicitação
  const [dataSolicitacao, setDataSolicitacao] = useState('');
  const [horasSolicitadas, setHorasSolicitadas] = useState('');
  const [motivoSolicitacao, setMotivoSolicitacao] = useState('');
  const [justificativaSolicitacao, setJustificativaSolicitacao] = useState('');

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    periodo: 'todos',
    tipo: 'todos',
    status: 'todos',
    dataInicio: '',
    dataFim: ''
  });

  // Mock data
  const saldoBancoHoras: SaldoBancoHoras = {
    saldoAtual: 24.5,
    saldoDisponivel: 20.0,
    horasVencendo: 4.5,
    dataVencimento: '2025-03-15',
    limiteMensal: 40,
    limiteAnual: 120
  };

  const movimentacoes: MovimentoBancoHoras[] = [
    {
      id: '1',
      data: '2025-01-20',
      tipo: 'acumulo',
      horas: 2.5,
      descricao: 'Horas extras - Projeto Sistema X',
      status: 'aprovado',
      aprovadoPor: 'Maria Silva (Chefia)',
      dataAprovacao: '2025-01-21',
      solicitadoEm: '2025-01-20'
    },
    {
      id: '2',
      data: '2025-01-18',
      tipo: 'uso',
      horas: -4.0,
      descricao: 'Compensação de horas - Consulta médica',
      status: 'aprovado',
      aprovadoPor: 'Maria Silva (Chefia)',
      dataAprovacao: '2025-01-19',
      solicitadoEm: '2025-01-17'
    },
    {
      id: '3',
      data: '2025-01-15',
      tipo: 'acumulo',
      horas: 3.0,
      descricao: 'Trabalho em feriado - Manutenção sistema',
      status: 'aprovado',
      aprovadoPor: 'João Santos (RH)',
      dataAprovacao: '2025-01-16',
      solicitadoEm: '2025-01-15'
    },
    {
      id: '4',
      data: '2025-01-10',
      tipo: 'uso',
      horas: -2.0,
      descricao: 'Saída antecipada - Assunto pessoal',
      status: 'pendente',
      solicitadoEm: '2025-01-10'
    },
    {
      id: '5',
      data: '2024-12-20',
      tipo: 'vencimento',
      horas: -8.0,
      descricao: 'Vencimento de horas não utilizadas',
      status: 'aprovado',
      aprovadoPor: 'Sistema',
      dataAprovacao: '2024-12-20',
      solicitadoEm: '2024-12-20'
    }
  ];

  const solicitacoes: SolicitacaoBancoHoras[] = [
    {
      id: '1',
      data: '2025-01-25',
      tipo: 'uso',
      horasSolicitadas: 4.0,
      motivo: 'consulta_medica',
      justificativa: 'Consulta médica especializada agendada para 25/01',
      status: 'pendente'
    },
    {
      id: '2',
      data: '2025-01-18',
      tipo: 'uso',
      horasSolicitadas: 4.0,
      motivo: 'consulta_medica',
      justificativa: 'Consulta médica de rotina',
      status: 'aprovado',
      dataResposta: '2025-01-19',
      aprovadoPor: 'Maria Silva'
    }
  ];

  // Estatísticas calculadas
  const stats = useMemo(() => {
    return {
      total: movimentacoes.length,
      pendentes: movimentacoes.filter(m => m.status === 'pendente').length,
      aprovadas: movimentacoes.filter(m => m.status === 'aprovado').length,
      rejeitadas: movimentacoes.filter(m => m.status === 'rejeitado').length,
    };
  }, [movimentacoes]);

  // Filtros para movimentações
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((mov) => {
      // Filtro por termo de busca
      if (searchTerm && !mov.descricao.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por tipo
      if (tipoFilter !== 'todos' && mov.tipo !== tipoFilter) return false;
      
      // Filtro por status
      if (statusFilter !== 'todos' && mov.status !== statusFilter) return false;
      
      // Filtro por período
      if (filtros.periodo === 'mes_atual') {
        const hoje = new Date();
        const inicioMes = startOfMonth(hoje);
        const fimMes = endOfMonth(hoje);
        const dataMov = parseISO(mov.data);
        if (dataMov < inicioMes || dataMov > fimMes) return false;
      }
      
      if (filtros.dataInicio && mov.data < filtros.dataInicio) return false;
      if (filtros.dataFim && mov.data > filtros.dataFim) return false;
      
      return true;
    });
  }, [movimentacoes, filtros, searchTerm, tipoFilter, statusFilter]);

  const handleSolicitacao = () => {
    // Aqui seria feita a requisição para o backend
    console.log('Nova solicitação:', {
      data: dataSolicitacao,
      horas: horasSolicitadas,
      motivo: motivoSolicitacao,
      justificativa: justificativaSolicitacao
    });
    
    // Limpar formulário
    setDataSolicitacao('');
    setHorasSolicitadas('');
    setMotivoSolicitacao('');
    setJustificativaSolicitacao('');
    setShowSolicitacao(false);
  };

  const getStatusBadge = (status: string) => {
    const config = getBadgeConfig(status, 'approval');
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.bgColor} ${config.textColor} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      acumulo: <TrendingUp className="w-4 h-4 text-green-600" />,
      uso: <TrendingDown className="w-4 h-4 text-blue-600" />,
      ajuste: <Clock className="w-4 h-4 text-orange-600" />,
      vencimento: <AlertTriangle className="w-4 h-4 text-red-600" />
    };
    
    return icons[tipo as keyof typeof icons];
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      acumulo: 'Acúmulo',
      uso: 'Uso',
      ajuste: 'Ajuste',
      vencimento: 'Vencimento'
    };
    
    return labels[tipo as keyof typeof labels];
  };

  const getMotivoLabel = (motivo: string) => {
    const labels = {
      consulta_medica: 'Consulta Médica',
      assunto_pessoal: 'Assunto Pessoal',
      compromisso_familiar: 'Compromisso Familiar',
      viagem: 'Viagem',
      outro: 'Outro'
    };
    
    return labels[motivo as keyof typeof labels] || motivo;
  };

  return (
    <DashboardLayout userRole="servidor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Banco de Horas
            </h1>
            <p className="text-gray-600 mt-2">Gerencie seu saldo de horas e solicite compensações</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSolicitacao} onOpenChange={setShowSolicitacao}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Solicitação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Solicitação de Uso</DialogTitle>
                  <DialogDescription>
                    Solicite o uso de horas do seu banco de horas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={dataSolicitacao}
                      onChange={(e) => setDataSolicitacao(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="horas">Horas Solicitadas *</Label>
                    <Input
                      id="horas"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max={saldoBancoHoras.saldoDisponivel}
                      value={horasSolicitadas}
                      onChange={(e) => setHorasSolicitadas(e.target.value)}
                      placeholder="Ex: 4.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Disponível: {saldoBancoHoras.saldoDisponivel}h
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="motivo">Motivo *</Label>
                    <Select value={motivoSolicitacao} onValueChange={setMotivoSolicitacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta_medica">Consulta Médica</SelectItem>
                        <SelectItem value="assunto_pessoal">Assunto Pessoal</SelectItem>
                        <SelectItem value="compromisso_familiar">Compromisso Familiar</SelectItem>
                        <SelectItem value="viagem">Viagem</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="justificativa">Justificativa *</Label>
                    <Textarea
                      id="justificativa"
                      placeholder="Descreva detalhadamente o motivo da solicitação..."
                      value={justificativaSolicitacao}
                      onChange={(e) => setJustificativaSolicitacao(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSolicitacao}
                      disabled={!dataSolicitacao || !horasSolicitadas || !motivoSolicitacao || !justificativaSolicitacao}
                      className="flex-1"
                    >
                      Enviar Solicitação
                    </Button>
                    <Button variant="outline" onClick={() => setShowSolicitacao(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                  <p className="text-3xl font-bold text-green-600">
                    +{saldoBancoHoras.saldoAtual.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Acumulado</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponível para Uso</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {saldoBancoHoras.saldoDisponivel.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Para compensação</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vencendo em Breve</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {saldoBancoHoras.horasVencendo.toFixed(1)}h
                  </p>
                  {saldoBancoHoras.dataVencimento && (
                    <p className="text-xs text-gray-500 mt-1">
                      até {format(parseISO(saldoBancoHoras.dataVencimento), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Limite Mensal</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {saldoBancoHoras.limiteMensal}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Usado: {((saldoBancoHoras.saldoAtual / saldoBancoHoras.limiteMensal) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Calendar className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de horas vencendo */}
        {saldoBancoHoras.horasVencendo > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Atenção: {saldoBancoHoras.horasVencendo}h vencerão em breve
                  </p>
                  <p className="text-sm text-orange-700">
                    Solicite o uso dessas horas até {saldoBancoHoras.dataVencimento && format(parseISO(saldoBancoHoras.dataVencimento), 'dd/MM/yyyy')} para não perdê-las.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-auto border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={() => setShowSolicitacao(true)}
                >
                  Solicitar Uso
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex flex-1 items-center gap-4">
            {/* Input de busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="acumulo">Acúmulo</SelectItem>
                  <SelectItem value="uso">Uso</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                  <SelectItem value="vencimento">Vencimento</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>
          
          {/* Botões de visualização */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Grid
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label>Período</Label>
                  <Select value={filtros.periodo} onValueChange={(value) => setFiltros({...filtros, periodo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="mes_atual">Mês Atual</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {filtros.periodo === 'personalizado' && (
                  <>
                    <div>
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={filtros.dataInicio}
                        onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={filtros.dataFim}
                        onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="saldo" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Saldo e Extrato
            </TabsTrigger>
            <TabsTrigger value="solicitacoes" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Solicitações
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saldo" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Extrato de Movimentações
                    </CardTitle>
                    <CardDescription>
                      Histórico detalhado das suas movimentações de banco de horas
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {viewMode === 'grid' ? (
                  // Visualização em tabela (como OccurrenceGridView)
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Data</th>
                          <th className="text-left p-3 font-medium">Tipo</th>
                          <th className="text-left p-3 font-medium">Descrição</th>
                          <th className="text-left p-3 font-medium">Horas</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Aprovado Por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimentacoesFiltradas.map((movimento) => (
                          <tr key={movimento.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="text-sm">
                                {format(parseISO(movimento.data), 'dd/MM/yyyy')}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getTipoIcon(movimento.tipo)}
                                <span className="text-sm font-medium">{getTipoLabel(movimento.tipo)}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm max-w-xs truncate" title={movimento.descricao}>
                                {movimento.descricao}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`text-sm font-bold ${movimento.horas > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {movimento.horas > 0 ? '+' : ''}{movimento.horas.toFixed(1)}h
                              </span>
                            </td>
                            <td className="p-3">
                              {getStatusBadge(movimento.status)}
                            </td>
                            <td className="p-3">
                              {movimento.aprovadoPor && (
                                <div className="text-sm text-gray-600">
                                  {movimento.aprovadoPor}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Visualização em cards (como OccurrenceListView)
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {movimentacoesFiltradas.map((movimento) => (
                      <Card key={movimento.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">
                              {getTipoLabel(movimento.tipo)}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {getTipoIcon(movimento.tipo)}
                              {getStatusBadge(movimento.status)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {format(parseISO(movimento.data), 'dd/MM/yyyy')}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Descrição:</div>
                                <div className="text-sm text-gray-600 line-clamp-2">
                                  {movimento.descricao}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className={`text-lg font-bold ${movimento.horas > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {movimento.horas > 0 ? '+' : ''}{movimento.horas.toFixed(1)}h
                              </span>
                            </div>
                            
                            {movimento.aprovadoPor && (
                              <div className="text-xs text-gray-500">
                                Aprovado por {movimento.aprovadoPor}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {movimentacoesFiltradas.length === 0 && (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma movimentação encontrada</p>
                    <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solicitacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Solicitações de Uso</CardTitle>
                    <CardDescription>
                      Gerencie suas solicitações de uso do banco de horas
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="px-3 py-1.5 h-auto"
                      >
                        <Grid3X3 className="w-4 h-4 mr-1" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="px-3 py-1.5 h-auto"
                      >
                        <List className="w-4 h-4 mr-1" />
                        Lista
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  // Visualização em Grid (Tabela)
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Horas</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Motivo</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Justificativa</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitacoes.map((solicitacao) => (
                          <tr key={solicitacao.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">
                                  {format(parseISO(solicitacao.data), 'dd/MM/yyyy')}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">
                                  {solicitacao.horasSolicitadas}h
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">
                                {getMotivoLabel(solicitacao.motivo)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(solicitacao.status)}
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {solicitacao.justificativa}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Detalhes
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {solicitacoes.length === 0 && (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma solicitação encontrada</p>
                        <p className="text-sm text-gray-400">Clique em "Nova Solicitação" para começar</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Visualização em Lista (Cards)
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {solicitacoes.map((solicitacao) => (
                      <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-600">
                                {solicitacao.horasSolicitadas}h
                              </span>
                            </div>
                            {getStatusBadge(solicitacao.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(solicitacao.data), 'dd/MM/yyyy')}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Motivo:</div>
                                <div className="text-sm text-gray-600">
                                  {getMotivoLabel(solicitacao.motivo)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Justificativa:</div>
                                <div className="text-sm text-gray-600 line-clamp-3">
                                  {solicitacao.justificativa}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {solicitacao.status === 'aprovado' && solicitacao.aprovadoPor && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Aprovado por {solicitacao.aprovadoPor} em {solicitacao.dataResposta && format(parseISO(solicitacao.dataResposta), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          )}
                          
                          <div className="pt-2">
                            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {solicitacoes.length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma solicitação encontrada</p>
                        <p className="text-sm text-gray-400">Clique em "Nova Solicitação" para começar</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Histórico de Movimentações</CardTitle>
                    <CardDescription>
                      Visualize todo o histórico de movimentações do seu banco de horas
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="px-3 py-1.5 h-auto"
                      >
                        <Grid3X3 className="w-4 h-4 mr-1" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="px-3 py-1.5 h-auto"
                      >
                        <List className="w-4 h-4 mr-1" />
                        Lista
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  // Visualização em Grid (Tabela)
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Horas</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimentacoesFiltradas.map((movimento) => (
                          <tr key={movimento.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium">
                                  {format(parseISO(movimento.data), 'dd/MM/yyyy')}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {getTipoIcon(movimento.tipo)}
                                <span className="text-sm font-medium">
                                  {getTipoLabel(movimento.tipo)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-sm font-bold ${movimento.horas > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {movimento.horas > 0 ? '+' : ''}{movimento.horas.toFixed(1)}h
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {movimento.descricao}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(movimento.status)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Detalhes
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {movimentacoesFiltradas.length === 0 && (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma movimentação encontrada</p>
                        <p className="text-sm text-gray-400">As movimentações aparecerão aqui conforme forem registradas</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Visualização em Lista (Cards)
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {movimentacoesFiltradas.map((movimento) => (
                      <Card key={movimento.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTipoIcon(movimento.tipo)}
                              <span className="font-medium">{getTipoLabel(movimento.tipo)}</span>
                            </div>
                            {getStatusBadge(movimento.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(movimento.data), 'dd/MM/yyyy')}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Descrição:</div>
                                <div className="text-sm text-gray-600 line-clamp-3">
                                  {movimento.descricao}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Horas:</div>
                                <div className={`text-sm font-bold ${movimento.horas > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {movimento.horas > 0 ? '+' : ''}{movimento.horas.toFixed(1)}h
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {movimento.observacoes && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                <strong>Observações:</strong> {movimento.observacoes}
                              </p>
                            </div>
                          )}
                          
                          {movimento.aprovadoPor && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                Aprovado por {movimento.aprovadoPor} em {movimento.dataAprovacao && format(parseISO(movimento.dataAprovacao), 'dd/MM/yyyy')}
                              </p>
                            </div>
                          )}
                          
                          <div className="pt-2">
                            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {movimentacoesFiltradas.length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma movimentação encontrada</p>
                        <p className="text-sm text-gray-400">As movimentações aparecerão aqui conforme forem registradas</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BancoHoras;