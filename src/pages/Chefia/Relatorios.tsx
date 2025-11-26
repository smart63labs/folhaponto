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
  CheckCircle,
  UserCheck,
  ClipboardList,
  Target,
  Award
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/contexts/AuthContext';

interface RelatorioTemplate {
  id: string;
  nome: string;
  categoria: 'equipe' | 'aprovacoes' | 'frequencia' | 'desempenho' | 'gestao';
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
  const { user } = useAuth();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [mesReferencia, setMesReferencia] = useState(new Date());
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<RelatorioTemplate | null>(null);
  const [parametrosRelatorio, setParametrosRelatorio] = useState<Record<string, any>>({});

  const templatesRelatorios: RelatorioTemplate[] = [
    {
      id: 'equipe-frequencia',
      nome: 'Frequência da Equipe',
      categoria: 'equipe',
      descricao: 'Relatório detalhado da frequência de todos os membros da equipe',
      icone: Users,
      cor: 'bg-blue-500',
      status: 'disponivel',
      parametros: ['periodo', 'servidor', 'tipo_ocorrencia'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'aprovacoes-pendentes',
      nome: 'Aprovações Pendentes',
      categoria: 'aprovacoes',
      descricao: 'Lista de todas as solicitações pendentes de aprovação',
      icone: ClipboardList,
      cor: 'bg-orange-500',
      status: 'disponivel',
      parametros: ['tipo_solicitacao', 'prioridade'],
      formatos: ['pdf', 'excel']
    },
    {
      id: 'desempenho-equipe',
      nome: 'Desempenho da Equipe',
      categoria: 'desempenho',
      descricao: 'Análise de desempenho e produtividade da equipe',
      icone: TrendingUp,
      cor: 'bg-green-500',
      status: 'disponivel',
      parametros: ['periodo', 'metricas'],
      formatos: ['pdf', 'excel']
    },
    {
      id: 'banco-horas-equipe',
      nome: 'Banco de Horas da Equipe',
      categoria: 'gestao',
      descricao: 'Saldo e movimentação do banco de horas de cada membro',
      icone: Clock,
      cor: 'bg-purple-500',
      status: 'disponivel',
      parametros: ['periodo', 'servidor'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'ocorrencias-equipe',
      nome: 'Ocorrências da Equipe',
      categoria: 'gestao',
      descricao: 'Relatório de ocorrências, faltas e justificativas da equipe',
      icone: AlertTriangle,
      cor: 'bg-red-500',
      status: 'disponivel',
      parametros: ['periodo', 'tipo_ocorrencia', 'status'],
      formatos: ['pdf', 'excel']
    },
    {
      id: 'escalas-trabalho',
      nome: 'Escalas de Trabalho',
      categoria: 'gestao',
      descricao: 'Relatório das escalas de trabalho programadas e realizadas',
      icone: Calendar,
      cor: 'bg-indigo-500',
      status: 'disponivel',
      parametros: ['periodo', 'tipo_escala'],
      formatos: ['pdf', 'excel']
    },
    {
      id: 'aprovacoes-historico',
      nome: 'Histórico de Aprovações',
      categoria: 'aprovacoes',
      descricao: 'Histórico completo de aprovações realizadas',
      icone: CheckCircle,
      cor: 'bg-teal-500',
      status: 'disponivel',
      parametros: ['periodo', 'tipo_aprovacao'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'metas-equipe',
      nome: 'Metas e Objetivos',
      categoria: 'desempenho',
      descricao: 'Acompanhamento de metas e objetivos da equipe',
      icone: Target,
      cor: 'bg-cyan-500',
      status: 'em_desenvolvimento',
      parametros: ['periodo', 'tipo_meta'],
      formatos: ['pdf', 'excel']
    }
  ];

  const relatoriosAgendados: RelatorioAgendado[] = [
    {
      id: '1',
      template: 'equipe-frequencia',
      nome: 'Frequência Mensal da Equipe',
      frequencia: 'mensal',
      proximaExecucao: '2024-02-01',
      status: 'ativo',
      ultimaExecucao: '2024-01-01',
      destinatarios: ['chefia@sefaz.to.gov.br', 'rh@sefaz.to.gov.br']
    },
    {
      id: '2',
      template: 'aprovacoes-pendentes',
      nome: 'Aprovações Pendentes Semanal',
      frequencia: 'semanal',
      proximaExecucao: '2024-01-22',
      status: 'ativo',
      ultimaExecucao: '2024-01-15',
      destinatarios: ['chefia@sefaz.to.gov.br']
    }
  ];

  const relatoriosFiltrados = useMemo(() => {
    return templatesRelatorios.filter(relatorio => {
      const matchCategoria = filtroCategoria === 'todos' || relatorio.categoria === filtroCategoria;
      const matchStatus = filtroStatus === 'todos' || relatorio.status === filtroStatus;
      const matchBusca = relatorio.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                        relatorio.descricao.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchCategoria && matchStatus && matchBusca;
    });
  }, [filtroCategoria, filtroStatus, termoBusca]);

  const estatisticas = {
    totalRelatorios: templatesRelatorios.length,
    relatoriosDisponiveis: templatesRelatorios.filter(r => r.status === 'disponivel').length,
    relatoriosAgendados: relatoriosAgendados.length,
    aprovacoesPendentes: 12, // Simulado
    membrosEquipe: 8 // Simulado
  };

  const handleGerarRelatorio = async (template: RelatorioTemplate, formato: string) => {
    try {
      // Simular dados do relatório baseado no template
      const registros: any[] = []; // Aqui viriam os dados reais do backend
      const estatisticas = {
        diasTrabalhados: 20,
        diasFalta: 1,
        diasAtraso: 2,
        horasTrabalhadasTotal: 160,
        horasDevidasTotal: 168,
        saldoHoras: -8
      };
      const periodo = format(mesReferencia, 'MMMM yyyy', { locale: ptBR });

      switch (formato) {
        case 'pdf':
          exportToPDF(registros, estatisticas, periodo);
          break;
        case 'excel':
          exportToExcel(registros, estatisticas, periodo);
          break;
        case 'csv':
          exportToCSV(registros, estatisticas, periodo);
          break;
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      equipe: 'Equipe',
      aprovacoes: 'Aprovações',
      frequencia: 'Frequência',
      desempenho: 'Desempenho',
      gestao: 'Gestão'
    };
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      disponivel: { label: 'Disponível', variant: 'default' as const },
      em_desenvolvimento: { label: 'Em Desenvolvimento', variant: 'secondary' as const },
      agendado: { label: 'Agendado', variant: 'outline' as const }
    };
    const config = configs[status as keyof typeof configs] || configs.disponivel;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios de Chefia</h1>
            <p className="text-muted-foreground">
              Relatórios gerenciais para acompanhamento da equipe e processos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.totalRelatorios}</p>
                  <p className="text-xs text-gray-500 mt-1">Templates disponíveis</p>
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
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.relatoriosDisponiveis}</p>
                  <p className="text-xs text-gray-500 mt-1">Prontos para uso</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Agendados</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.relatoriosAgendados}</p>
                  <p className="text-xs text-gray-500 mt-1">Execução automática</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovações Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas.aprovacoesPendentes}</p>
                  <p className="text-xs text-gray-500 mt-1">Requer atenção</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <ClipboardList className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Membros da Equipe</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas.membrosEquipe}</p>
                  <p className="text-xs text-gray-500 mt-1">Equipe supervisionada</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="busca">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busca"
                    placeholder="Nome ou descrição..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="equipe">Equipe</SelectItem>
                    <SelectItem value="aprovacoes">Aprovações</SelectItem>
                    <SelectItem value="frequencia">Frequência</SelectItem>
                    <SelectItem value="desempenho">Desempenho</SelectItem>
                    <SelectItem value="gestao">Gestão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mes">Mês de Referência</Label>
                <Input
                  id="mes"
                  type="month"
                  value={format(mesReferencia, 'yyyy-MM')}
                  onChange={(e) => setMesReferencia(new Date(e.target.value + '-01'))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates de Relatórios</TabsTrigger>
            <TabsTrigger value="agendados">Relatórios Agendados</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatoriosFiltrados.map((template) => {
                const IconeComponent = template.icone;
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${template.cor} text-white`}>
                          <IconeComponent className="h-5 w-5" />
                        </div>
                        {getStatusBadge(template.status)}
                      </div>
                      <CardTitle className="text-lg">{template.nome}</CardTitle>
                      <CardDescription>{template.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Badge variant="outline" className="mr-2">
                            {getCategoriaLabel(template.categoria)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {template.formatos.map((formato) => (
                            <Button
                              key={formato}
                              size="sm"
                              variant="outline"
                              onClick={() => handleGerarRelatorio(template, formato)}
                              disabled={template.status !== 'disponivel'}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {formato.toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="agendados" className="space-y-4">
            <div className="space-y-4">
              {relatoriosAgendados.map((agendado) => (
                <Card key={agendado.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agendado.nome}</CardTitle>
                      <Badge variant={agendado.status === 'ativo' ? 'default' : 'secondary'}>
                        {agendado.status === 'ativo' ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Frequência: {agendado.frequencia} | 
                      Próxima execução: {format(new Date(agendado.proximaExecucao), 'dd/MM/yyyy', { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {agendado.ultimaExecucao && (
                          <span>Última execução: {format(new Date(agendado.ultimaExecucao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;