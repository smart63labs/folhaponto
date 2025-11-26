import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  Clock,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Database,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

// Interfaces
interface RelatorioTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'frequencia' | 'rh' | 'financeiro' | 'operacional' | 'auditoria';
  tipo: 'tabular' | 'grafico' | 'dashboard' | 'exportacao';
  icone: React.ComponentType<any>;
  parametros: string[];
  ultimaExecucao?: string;
  frequencia: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual' | 'sob_demanda';
  status: 'ativo' | 'inativo' | 'manutencao';
}

interface EstatisticaRelatorio {
  titulo: string;
  valor: number | string;
  variacao?: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

const RelatoriosAdmin: React.FC = () => {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [buscaFiltro, setBuscaFiltro] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<RelatorioTemplate | null>(null);
  const [parametrosRelatorio, setParametrosRelatorio] = useState<Record<string, any>>({});

  // Templates de relatórios
  const templatesRelatorios: RelatorioTemplate[] = [
    {
      id: '1',
      nome: 'Relatório de Frequência Geral',
      descricao: 'Relatório completo de frequência de todos os funcionários',
      categoria: 'frequencia',
      tipo: 'tabular',
      icone: Clock,
      parametros: ['periodo', 'setor', 'funcionario'],
      ultimaExecucao: '2024-01-15T10:30:00',
      frequencia: 'mensal',
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'Dashboard de RH',
      descricao: 'Painel executivo com métricas de recursos humanos',
      categoria: 'rh',
      tipo: 'dashboard',
      icone: Users,
      parametros: ['periodo', 'metricas'],
      ultimaExecucao: '2024-01-14T15:20:00',
      frequencia: 'diario',
      status: 'ativo'
    },
    {
      id: '3',
      nome: 'Análise de Horas Extras',
      descricao: 'Relatório detalhado de horas extras por departamento',
      categoria: 'financeiro',
      tipo: 'grafico',
      icone: TrendingUp,
      parametros: ['periodo', 'departamento', 'tipo_calculo'],
      ultimaExecucao: '2024-01-13T09:15:00',
      frequencia: 'semanal',
      status: 'ativo'
    },
    {
      id: '4',
      nome: 'Relatório de Auditoria',
      descricao: 'Log completo de ações e alterações no sistema',
      categoria: 'auditoria',
      tipo: 'tabular',
      icone: AlertTriangle,
      parametros: ['periodo', 'usuario', 'acao', 'modulo'],
      ultimaExecucao: '2024-01-12T14:45:00',
      frequencia: 'diario',
      status: 'ativo'
    },
    {
      id: '5',
      nome: 'Exportação de Dados Completa',
      descricao: 'Exportação completa de dados para backup ou migração',
      categoria: 'operacional',
      tipo: 'exportacao',
      icone: Database,
      parametros: ['tabelas', 'formato', 'compressao'],
      ultimaExecucao: '2024-01-10T08:00:00',
      frequencia: 'mensal',
      status: 'ativo'
    },
    {
      id: '6',
      nome: 'Relatório de Performance',
      descricao: 'Métricas de performance e produtividade dos funcionários',
      categoria: 'operacional',
      tipo: 'dashboard',
      icone: Target,
      parametros: ['periodo', 'departamento', 'metricas'],
      frequencia: 'trimestral',
      status: 'inativo'
    },
    {
      id: '7',
      nome: 'Análise de Absenteísmo',
      descricao: 'Relatório de faltas e ausências por período',
      categoria: 'rh',
      tipo: 'grafico',
      icone: XCircle,
      parametros: ['periodo', 'departamento', 'tipo_ausencia'],
      ultimaExecucao: '2024-01-11T11:30:00',
      frequencia: 'mensal',
      status: 'ativo'
    },
    {
      id: '8',
      nome: 'Relatório Financeiro Consolidado',
      descricao: 'Consolidação de custos com pessoal e benefícios',
      categoria: 'financeiro',
      tipo: 'tabular',
      icone: BarChart3,
      parametros: ['periodo', 'centro_custo', 'tipo_custo'],
      ultimaExecucao: '2024-01-09T16:20:00',
      frequencia: 'mensal',
      status: 'ativo'
    }
  ];

  // Estatísticas
  const estatisticas: EstatisticaRelatorio[] = [
    {
      titulo: 'Relatórios Ativos',
      valor: templatesRelatorios.filter(r => r.status === 'ativo').length,
      variacao: 5.2,
      icone: Activity,
      cor: 'text-green-600',
      descricao: 'Templates em execução'
    },
    {
      titulo: 'Execuções Hoje',
      valor: 12,
      variacao: 8.1,
      icone: Zap,
      cor: 'text-blue-600',
      descricao: 'Relatórios executados'
    },
    {
      titulo: 'Dados Processados',
      valor: '2.4 GB',
      icone: Database,
      cor: 'text-purple-600',
      descricao: 'Volume processado hoje'
    },
    {
      titulo: 'Tempo Médio',
      valor: '3.2 min',
      variacao: -12.5,
      icone: Clock,
      cor: 'text-orange-600',
      descricao: 'Tempo de processamento'
    }
  ];

  // Filtros
  const relatoriosFiltrados = useMemo(() => {
    return templatesRelatorios.filter(relatorio => {
      const matchCategoria = categoriaFiltro === 'todos' || relatorio.categoria === categoriaFiltro;
      const matchTipo = tipoFiltro === 'todos' || relatorio.tipo === tipoFiltro;
      const matchStatus = statusFiltro === 'todos' || relatorio.status === statusFiltro;
      const matchBusca = relatorio.nome.toLowerCase().includes(buscaFiltro.toLowerCase()) ||
                        relatorio.descricao.toLowerCase().includes(buscaFiltro.toLowerCase());
      
      return matchCategoria && matchTipo && matchStatus && matchBusca;
    });
  }, [categoriaFiltro, tipoFiltro, statusFiltro, buscaFiltro]);

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      manutencao: 'bg-yellow-100 text-yellow-800'
    };
    
    return variants[status as keyof typeof variants] || variants.ativo;
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      tabular: 'bg-blue-100 text-blue-800',
      grafico: 'bg-purple-100 text-purple-800',
      dashboard: 'bg-green-100 text-green-800',
      exportacao: 'bg-orange-100 text-orange-800'
    };
    
    return variants[tipo as keyof typeof variants] || variants.tabular;
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      frequencia: 'Frequência',
      rh: 'Recursos Humanos',
      financeiro: 'Financeiro',
      operacional: 'Operacional',
      auditoria: 'Auditoria'
    };
    
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const getFrequenciaLabel = (frequencia: string) => {
    const labels = {
      diario: 'Diário',
      semanal: 'Semanal',
      mensal: 'Mensal',
      trimestral: 'Trimestral',
      anual: 'Anual',
      sob_demanda: 'Sob Demanda'
    };
    
    return labels[frequencia as keyof typeof labels] || frequencia;
  };

  const handleExecutarRelatorio = (relatorioId: string) => {
    // Aqui seria implementada a lógica de execução do relatório
    console.log(`Executando relatório ${relatorioId} com parâmetros:`, parametrosRelatorio);
    setRelatorioSelecionado(null);
    setParametrosRelatorio({});
  };

  const handleExportarRelatorio = (relatorioId: string, formato: 'pdf' | 'excel' | 'csv') => {
    // Aqui seria implementada a lógica de exportação
    console.log(`Exportando relatório ${relatorioId} em formato ${formato}`);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios Administrativos</h1>
            <p className="text-gray-600">Gerencie e execute relatórios completos do sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Relatórios Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Templates em execução</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Execuções Hoje</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Relatórios executados</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dados Processados</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Volume processado hoje</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Database className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Tempo de processamento</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="agendados">Agendados</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab Templates */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Templates de Relatórios</CardTitle>
                    <CardDescription>
                      Gerencie e execute templates de relatórios disponíveis
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                    <Button size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Novo Template
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="busca-relatorio">Buscar relatório</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="busca-relatorio"
                        placeholder="Nome ou descrição do relatório..."
                        value={buscaFiltro}
                        onChange={(e) => setBuscaFiltro(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-40">
                    <Label htmlFor="filtro-categoria">Categoria</Label>
                    <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="frequencia">Frequência</SelectItem>
                        <SelectItem value="rh">RH</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="operacional">Operacional</SelectItem>
                        <SelectItem value="auditoria">Auditoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-32">
                    <Label htmlFor="filtro-tipo">Tipo</Label>
                    <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="tabular">Tabular</SelectItem>
                        <SelectItem value="grafico">Gráfico</SelectItem>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="exportacao">Exportação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-32">
                    <Label htmlFor="filtro-status">Status</Label>
                    <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Grid de templates */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {relatoriosFiltrados.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <template.icone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <CardTitle className="text-base">{template.nome}</CardTitle>
                            </div>
                          </div>
                          <Badge className={getStatusBadge(template.status)}>
                            {template.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {template.descricao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {getCategoriaLabel(template.categoria)}
                            </Badge>
                            <Badge className={getTipoBadge(template.tipo)}>
                              {template.tipo}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-3 w-3" />
                              <span>Frequência: {getFrequenciaLabel(template.frequencia)}</span>
                            </div>
                            {template.ultimaExecucao && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Última execução: {format(new Date(template.ultimaExecucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => setRelatorioSelecionado(template)}
                              disabled={template.status !== 'ativo'}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Executar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportarRelatorio(template.id, 'excel')}
                              disabled={template.status !== 'ativo'}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Agendados */}
          <TabsContent value="agendados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Agendados</CardTitle>
                <CardDescription>
                  Visualize e gerencie relatórios com execução automática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Relatórios agendados serão implementados aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Execuções</CardTitle>
                <CardDescription>
                  Visualize o histórico completo de execuções de relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Histórico de execuções será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Relatórios</CardTitle>
                <CardDescription>
                  Configure parâmetros globais para geração de relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Configurações de relatórios serão implementadas aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para execução de relatório */}
        {relatorioSelecionado && (
          <Dialog open={!!relatorioSelecionado} onOpenChange={() => setRelatorioSelecionado(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Executar Relatório</DialogTitle>
                <DialogDescription>
                  Configure os parâmetros para execução do relatório: {relatorioSelecionado.nome}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getCategoriaLabel(relatorioSelecionado.categoria)}
                  </Badge>
                  <Badge className={getTipoBadge(relatorioSelecionado.tipo)}>
                    {relatorioSelecionado.tipo}
                  </Badge>
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <p className="text-sm text-muted-foreground">{relatorioSelecionado.descricao}</p>
                </div>
                
                {/* Parâmetros do relatório */}
                <div className="space-y-4">
                  <Label>Parâmetros do Relatório</Label>
                  
                  {relatorioSelecionado.parametros.includes('periodo') && (
                    <div>
                      <Label htmlFor="periodo">Período</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dataInicio">Data Início</Label>
                          <Input
                            type="date"
                            value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setDateRange({
                              ...dateRange,
                              from: e.target.value ? new Date(e.target.value) : undefined
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dataFim">Data Fim</Label>
                          <Input
                            type="date"
                            value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setDateRange({
                              ...dateRange,
                              to: e.target.value ? new Date(e.target.value) : undefined
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {relatorioSelecionado.parametros.includes('departamento') && (
                    <div>
                      <Label htmlFor="departamento">Departamento</Label>
                      <Select onValueChange={(value) => setParametrosRelatorio({...parametrosRelatorio, departamento: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Departamentos</SelectItem>
                          <SelectItem value="rh">Recursos Humanos</SelectItem>
                          <SelectItem value="fiscalizacao">Fiscalização</SelectItem>
                          <SelectItem value="arrecadacao">Arrecadação</SelectItem>
                          <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {relatorioSelecionado.parametros.includes('setor') && (
                    <div>
                      <Label htmlFor="setor">Setor</Label>
                      <Select onValueChange={(value) => setParametrosRelatorio({...parametrosRelatorio, setor: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Setores</SelectItem>
                          <SelectItem value="rh">Recursos Humanos</SelectItem>
                          <SelectItem value="fiscalizacao">Fiscalização</SelectItem>
                          <SelectItem value="arrecadacao">Arrecadação</SelectItem>
                          <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {relatorioSelecionado.parametros.includes('formato') && (
                    <div>
                      <Label htmlFor="formato">Formato de Saída</Label>
                      <Select onValueChange={(value) => setParametrosRelatorio({...parametrosRelatorio, formato: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => handleExecutarRelatorio(relatorioSelecionado.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Executar Relatório
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportarRelatorio(relatorioSelecionado.id, 'excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportarRelatorio(relatorioSelecionado.id, 'pdf')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RelatoriosAdmin;