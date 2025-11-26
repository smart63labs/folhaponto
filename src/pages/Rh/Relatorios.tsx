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
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp,
  Filter,
  Search,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportUtils';

interface RelatorioTemplate {
  id: string;
  nome: string;
  categoria: 'frequencia' | 'banco_horas' | 'ocorrencias' | 'equipe' | 'auditoria';
  descricao: string;
  icone: React.ComponentType<any>;
  cor: string;
  status: 'disponivel' | 'em_desenvolvimento' | 'agendado';
  parametros: string[];
  formatos: ('pdf' | 'excel' | 'csv')[];
}

interface RelatorioAgendado {
  id: string;
  template: string;
  nome: string;
  frequencia: 'diario' | 'semanal' | 'mensal' | 'trimestral';
  proximaExecucao: string;
  status: 'ativo' | 'pausado' | 'erro';
  ultimaExecucao?: string;
  destinatarios: string[];
}

const Relatorios: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [showFiltros, setShowFiltros] = useState(false);
  const [showGerarRelatorio, setShowGerarRelatorio] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState<RelatorioTemplate | null>(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    categoria: 'todos',
    status: 'todos',
    busca: ''
  });

  // Estados para geração de relatório
  const [parametrosRelatorio, setParametrosRelatorio] = useState({
    periodo: 'mes_atual',
    dataInicio: '',
    dataFim: '',
    formato: 'pdf' as 'pdf' | 'excel' | 'csv',
    incluirDetalhes: true,
    incluirGraficos: true
  });

  // Templates de relatórios disponíveis
  const templatesRelatorios: RelatorioTemplate[] = [
    {
      id: 'espelho-ponto-individual',
      nome: 'Espelho de Ponto Individual',
      categoria: 'frequencia',
      descricao: 'Relatório detalhado da frequência de um servidor específico',
      icone: FileText,
      cor: 'text-blue-600',
      status: 'disponivel',
      parametros: ['periodo', 'servidor', 'incluir_observacoes'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'consolidado-equipe',
      nome: 'Relatório Consolidado da Equipe',
      categoria: 'equipe',
      descricao: 'Visão geral da frequência de toda a equipe ou setor',
      icone: Users,
      cor: 'text-green-600',
      status: 'disponivel',
      parametros: ['periodo', 'setor', 'incluir_estatisticas'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'banco-horas-detalhado',
      nome: 'Extrato de Banco de Horas',
      categoria: 'banco_horas',
      descricao: 'Relatório detalhado das movimentações do banco de horas',
      icone: Clock,
      cor: 'text-purple-600',
      status: 'disponivel',
      parametros: ['periodo', 'servidor', 'tipo_movimentacao'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'ausencias-justificativas',
      nome: 'Relatório de Ausências',
      categoria: 'frequencia',
      descricao: 'Análise de faltas, atrasos e justificativas apresentadas',
      icone: AlertTriangle,
      cor: 'text-orange-600',
      status: 'disponivel',
      parametros: ['periodo', 'tipo_ausencia', 'status_justificativa'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'horas-extras',
      nome: 'Relatório de Horas Extras',
      categoria: 'frequencia',
      descricao: 'Controle e análise de horas extras trabalhadas',
      icone: TrendingUp,
      cor: 'text-indigo-600',
      status: 'disponivel',
      parametros: ['periodo', 'setor', 'limite_horas'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'ocorrencias-gestao',
      nome: 'Gestão de Ocorrências',
      categoria: 'ocorrencias',
      descricao: 'Relatório de solicitações de ajustes e justificativas',
      icone: Activity,
      cor: 'text-cyan-600',
      status: 'disponivel',
      parametros: ['periodo', 'tipo_ocorrencia', 'status_aprovacao'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'auditoria-sistema',
      nome: 'Auditoria do Sistema',
      categoria: 'auditoria',
      descricao: 'Log de atividades e alterações no sistema',
      icone: Eye,
      cor: 'text-gray-600',
      status: 'disponivel',
      parametros: ['periodo', 'usuario', 'tipo_acao'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'dashboard-executivo',
      nome: 'Dashboard Executivo',
      categoria: 'equipe',
      descricao: 'Indicadores gerenciais e métricas de produtividade',
      icone: BarChart3,
      cor: 'text-emerald-600',
      status: 'em_desenvolvimento',
      parametros: ['periodo', 'nivel_detalhamento'],
      formatos: ['pdf', 'excel']
    }
  ];

  // Relatórios agendados (mock data)
  const relatoriosAgendados: RelatorioAgendado[] = [
    {
      id: '1',
      template: 'consolidado-equipe',
      nome: 'Relatório Mensal da Equipe',
      frequencia: 'mensal',
      proximaExecucao: '2025-02-01',
      status: 'ativo',
      ultimaExecucao: '2025-01-01',
      destinatarios: ['chefia@sefaz.to.gov.br', 'rh@sefaz.to.gov.br']
    },
    {
      id: '2',
      template: 'banco-horas-detalhado',
      nome: 'Extrato Semanal Banco de Horas',
      frequencia: 'semanal',
      proximaExecucao: '2025-01-27',
      status: 'ativo',
      ultimaExecucao: '2025-01-20',
      destinatarios: ['rh@sefaz.to.gov.br']
    }
  ];

  // Estatísticas
  const estatisticas = {
    totalTemplates: templatesRelatorios.length,
    templatesDisponiveis: templatesRelatorios.filter(t => t.status === 'disponivel').length,
    relatoriosGeradosHoje: 12,
    relatoriosAgendados: relatoriosAgendados.length
  };

  // Filtrar templates
  const templatesFiltrados = useMemo(() => {
    return templatesRelatorios.filter(template => {
      if (filtros.categoria !== 'todos' && template.categoria !== filtros.categoria) return false;
      if (filtros.status !== 'todos' && template.status !== filtros.status) return false;
      if (filtros.busca && !template.nome.toLowerCase().includes(filtros.busca.toLowerCase()) &&
          !template.descricao.toLowerCase().includes(filtros.busca.toLowerCase())) return false;
      return true;
    });
  }, [templatesRelatorios, filtros]);

  const handleGerarRelatorio = () => {
    if (!templateSelecionado) return;

    // Aqui seria feita a requisição para o backend
    console.log('Gerando relatório:', {
      template: templateSelecionado.id,
      parametros: parametrosRelatorio
    });

    // Simulação de geração baseada no template
    const mockData = {
      registros: [],
      estatisticas: {
        diasTrabalhados: 20,
        diasFalta: 1,
        diasAtraso: 2,
        horasTrabalhadasTotal: 160,
        horasDevidasTotal: 168,
        saldoHoras: -8
      }
    };

    const periodo = parametrosRelatorio.periodo === 'mes_atual' 
      ? format(new Date(), 'MMMM yyyy', { locale: ptBR })
      : `${parametrosRelatorio.dataInicio} a ${parametrosRelatorio.dataFim}`;

    switch (parametrosRelatorio.formato) {
      case 'pdf':
        exportToPDF(mockData.registros, mockData.estatisticas, periodo);
        break;
      case 'excel':
        exportToExcel(mockData.registros, mockData.estatisticas, periodo);
        break;
      case 'csv':
        exportToCSV(mockData.registros, mockData.estatisticas, periodo);
        break;
    }

    setShowGerarRelatorio(false);
    setTemplateSelecionado(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      disponivel: 'bg-green-100 text-green-800',
      em_desenvolvimento: 'bg-yellow-100 text-yellow-800',
      agendado: 'bg-blue-100 text-blue-800',
      ativo: 'bg-green-100 text-green-800',
      pausado: 'bg-gray-100 text-gray-800',
      erro: 'bg-red-100 text-red-800'
    };

    const icons = {
      disponivel: <CheckCircle className="w-3 h-3" />,
      em_desenvolvimento: <Settings className="w-3 h-3" />,
      agendado: <Calendar className="w-3 h-3" />,
      ativo: <CheckCircle className="w-3 h-3" />,
      pausado: <Clock className="w-3 h-3" />,
      erro: <AlertTriangle className="w-3 h-3" />
    };

    const labels = {
      disponivel: 'Disponível',
      em_desenvolvimento: 'Em Desenvolvimento',
      agendado: 'Agendado',
      ativo: 'Ativo',
      pausado: 'Pausado',
      erro: 'Erro'
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      frequencia: 'Frequência',
      banco_horas: 'Banco de Horas',
      ocorrencias: 'Ocorrências',
      equipe: 'Equipe',
      auditoria: 'Auditoria'
    };
    
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const getFrequenciaLabel = (frequencia: string) => {
    const labels = {
      diario: 'Diário',
      semanal: 'Semanal',
      mensal: 'Mensal',
      trimestral: 'Trimestral'
    };
    
    return labels[frequencia as keyof typeof labels] || frequencia;
  };

  return (
    <DashboardLayout userRole="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Gere e gerencie relatórios do sistema de controle de ponto</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Histórico
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Templates Disponíveis</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.templatesDisponiveis}</p>
                  <p className="text-xs text-gray-500 mt-1">Relatórios prontos</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gerados Hoje</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.relatoriosGeradosHoje}</p>
                  <p className="text-xs text-gray-500 mt-1">Relatórios exportados</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Agendados</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas.relatoriosAgendados}</p>
                  <p className="text-xs text-gray-500 mt-1">Execução automática</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-3xl font-bold text-gray-600">{estatisticas.totalTemplates}</p>
                  <p className="text-xs text-gray-500 mt-1">Templates cadastrados</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="agendados" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Agendados
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Templates de Relatórios</CardTitle>
                    <CardDescription>
                      Selecione um template para gerar relatórios personalizados
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFiltros(!showFiltros)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showFiltros && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <Label>Buscar</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Nome ou descrição..."
                              value={filtros.busca}
                              onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Categoria</Label>
                          <Select value={filtros.categoria} onValueChange={(value) => setFiltros({...filtros, categoria: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todos">Todas</SelectItem>
                              <SelectItem value="frequencia">Frequência</SelectItem>
                              <SelectItem value="banco_horas">Banco de Horas</SelectItem>
                              <SelectItem value="ocorrencias">Ocorrências</SelectItem>
                              <SelectItem value="equipe">Equipe</SelectItem>
                              <SelectItem value="auditoria">Auditoria</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Status</Label>
                          <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todos">Todos</SelectItem>
                              <SelectItem value="disponivel">Disponível</SelectItem>
                              <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-end">
                          <Button 
                            variant="outline" 
                            onClick={() => setFiltros({categoria: 'todos', status: 'todos', busca: ''})}
                            className="w-full"
                          >
                            Limpar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templatesFiltrados.map((template) => {
                    const IconComponent = template.icone;
                    return (
                      <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <IconComponent className={`w-6 h-6 ${template.cor}`} />
                              <div>
                                <h3 className="font-medium text-sm">{template.nome}</h3>
                                <p className="text-xs text-gray-500">{getCategoriaLabel(template.categoria)}</p>
                              </div>
                            </div>
                            {getStatusBadge(template.status)}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{template.descricao}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {template.formatos.map((formato) => (
                                <Badge key={formato} variant="outline" className="text-xs">
                                  {formato.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button
                              size="sm"
                              disabled={template.status !== 'disponivel'}
                              onClick={() => {
                                setTemplateSelecionado(template);
                                setShowGerarRelatorio(true);
                              }}
                            >
                              Gerar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agendados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Agendados</CardTitle>
                <CardDescription>
                  Gerencie relatórios com execução automática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatoriosAgendados.map((relatorio) => (
                    <div key={relatorio.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{relatorio.nome}</h3>
                            {getStatusBadge(relatorio.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {getFrequenciaLabel(relatorio.frequencia)} • 
                            Próxima execução: {format(new Date(relatorio.proximaExecucao), 'dd/MM/yyyy')}
                          </p>
                          {relatorio.ultimaExecucao && (
                            <p className="text-xs text-gray-500">
                              Última execução: {format(new Date(relatorio.ultimaExecucao), 'dd/MM/yyyy')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Destinatários: {relatorio.destinatarios.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Relatórios</CardTitle>
                <CardDescription>
                  Visualize relatórios gerados anteriormente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Histórico de relatórios será implementado em breve</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para Gerar Relatório */}
        <Dialog open={showGerarRelatorio} onOpenChange={setShowGerarRelatorio}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Relatório</DialogTitle>
              <DialogDescription>
                Configure os parâmetros para gerar o relatório "{templateSelecionado?.nome}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="periodo">Período *</Label>
                <Select value={parametrosRelatorio.periodo} onValueChange={(value) => setParametrosRelatorio({...parametrosRelatorio, periodo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes_atual">Mês Atual</SelectItem>
                    <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                    <SelectItem value="trimestre_atual">Trimestre Atual</SelectItem>
                    <SelectItem value="ano_atual">Ano Atual</SelectItem>
                    <SelectItem value="personalizado">Período Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {parametrosRelatorio.periodo === 'personalizado' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={parametrosRelatorio.dataInicio}
                      onChange={(e) => setParametrosRelatorio({...parametrosRelatorio, dataInicio: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data Fim</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={parametrosRelatorio.dataFim}
                      onChange={(e) => setParametrosRelatorio({...parametrosRelatorio, dataFim: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="formato">Formato *</Label>
                <Select value={parametrosRelatorio.formato} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setParametrosRelatorio({...parametrosRelatorio, formato: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateSelecionado?.formatos.map((formato) => (
                      <SelectItem key={formato} value={formato}>
                        {formato.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluirDetalhes"
                    checked={parametrosRelatorio.incluirDetalhes}
                    onChange={(e) => setParametrosRelatorio({...parametrosRelatorio, incluirDetalhes: e.target.checked})}
                  />
                  <Label htmlFor="incluirDetalhes">Incluir detalhes completos</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="incluirGraficos"
                    checked={parametrosRelatorio.incluirGraficos}
                    onChange={(e) => setParametrosRelatorio({...parametrosRelatorio, incluirGraficos: e.target.checked})}
                  />
                  <Label htmlFor="incluirGraficos">Incluir gráficos e estatísticas</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGerarRelatorio} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </Button>
                <Button variant="outline" onClick={() => setShowGerarRelatorio(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;