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
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Building,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  ClipboardList,
  Zap,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface Solicitacao {
  id: string;
  tipo: 'ferias' | 'licenca' | 'abono' | 'ajuste_ponto' | 'banco_horas' | 'outros';
  solicitante: string;
  setor: string;
  setorId?: string;
  setorHierarquia?: string;
  dataInicio: string;
  dataFim?: string;
  motivo: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'em_analise';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  dataSolicitacao: string;
  aprovador?: string;
  aprovadorDesignado?: string;
  observacoes?: string;
  documentos?: string[];
  podeAprovar?: boolean;
}

interface Estatistica {
  titulo: string;
  valor: number;
  variacao: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

const AprovacoesGerais: React.FC = () => {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todos');
  const [filtroSolicitante, setFiltroSolicitante] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [observacaoAprovacao, setObservacaoAprovacao] = useState('');

  // Dados mockados
  const solicitacoes: Solicitacao[] = [
    {
      id: '1',
      tipo: 'ferias',
      solicitante: 'João Silva Santos',
      setor: 'Fiscalização',
      setorId: 'setor-fiscalizacao',
      setorHierarquia: 'SEFAZ > Fiscalização',
      dataInicio: '2024-02-15',
      dataFim: '2024-02-29',
      motivo: 'Férias regulamentares - período de descanso',
      status: 'pendente',
      prioridade: 'media',
      dataSolicitacao: '2024-01-15T10:30:00',
      documentos: ['atestado_medico.pdf'],
      aprovadorDesignado: 'Maria Supervisora',
      podeAprovar: true
    },
    {
      id: '2',
      tipo: 'ajuste_ponto',
      solicitante: 'Maria Oliveira Costa',
      setor: 'Recursos Humanos',
      setorId: 'setor-rh',
      setorHierarquia: 'SEFAZ > Recursos Humanos',
      dataInicio: '2024-01-10',
      motivo: 'Esquecimento de registrar ponto na saída',
      status: 'em_analise',
      prioridade: 'baixa',
      dataSolicitacao: '2024-01-11T14:20:00',
      aprovadorDesignado: 'Pedro Diretor',
      podeAprovar: false
    },
    {
      id: '3',
      tipo: 'licenca',
      solicitante: 'Carlos Eduardo Lima',
      setor: 'Tecnologia da Informação',
      setorId: 'setor-tecnologia',
      setorHierarquia: 'SEFAZ > Tecnologia da Informação',
      dataInicio: '2024-01-20',
      dataFim: '2024-01-25',
      motivo: 'Licença médica - procedimento cirúrgico',
      status: 'aprovada',
      prioridade: 'alta',
      dataSolicitacao: '2024-01-05T09:15:00',
      aprovador: 'Admin Sistema',
      aprovadorDesignado: 'Ana Coordenadora',
      observacoes: 'Aprovado conforme documentação médica apresentada',
      documentos: ['atestado_medico.pdf', 'laudo_cirurgia.pdf'],
      podeAprovar: true
    },
    {
      id: '4',
      tipo: 'banco_horas',
      solicitante: 'Ana Paula Ferreira',
      setor: 'Arrecadação',
      setorId: 'setor-arrecadacao',
      setorHierarquia: 'SEFAZ > Arrecadação',
      dataInicio: '2024-01-12',
      motivo: 'Compensação de horas extras trabalhadas em dezembro',
      status: 'rejeitada',
      prioridade: 'baixa',
      dataSolicitacao: '2024-01-08T16:45:00',
      aprovador: 'Admin Sistema',
      aprovadorDesignado: 'Carlos Gerente',
      observacoes: 'Documentação insuficiente para comprovação das horas extras',
      podeAprovar: true
    },
    {
      id: '5',
      tipo: 'abono',
      solicitante: 'Roberto Silva Mendes',
      setor: 'Fiscalização',
      setorId: 'setor-fiscalizacao',
      setorHierarquia: 'SEFAZ > Fiscalização',
      dataInicio: '2024-01-18',
      motivo: 'Consulta médica de emergência',
      status: 'pendente',
      prioridade: 'urgente',
      dataSolicitacao: '2024-01-18T08:30:00',
      documentos: ['atestado_consulta.pdf'],
      aprovadorDesignado: 'Maria Supervisora',
      podeAprovar: true
    }
  ];

  // Estatísticas
  const estatisticas: Estatistica[] = [
    {
      titulo: 'Total de Solicitações',
      valor: solicitacoes.length,
      variacao: 12.5,
      icone: ClipboardList,
      cor: 'text-blue-600',
      descricao: 'Solicitações no sistema'
    },
    {
      titulo: 'Pendentes',
      valor: solicitacoes.filter(s => s.status === 'pendente').length,
      variacao: -8.2,
      icone: Clock,
      cor: 'text-orange-600',
      descricao: 'Aguardando aprovação'
    },
    {
      titulo: 'Aprovadas',
      valor: solicitacoes.filter(s => s.status === 'aprovada').length,
      variacao: 15.3,
      icone: CheckCircle,
      cor: 'text-green-600',
      descricao: 'Aprovadas este mês'
    },
    {
      titulo: 'Urgentes',
      valor: solicitacoes.filter(s => s.prioridade === 'urgente').length,
      variacao: 25.0,
      icone: Zap,
      cor: 'text-red-600',
      descricao: 'Requer atenção imediata'
    }
  ];

  // Filtros
  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter(solicitacao => {
      const matchTipo = filtroTipo === 'todos' || solicitacao.tipo === filtroTipo;
      const matchStatus = filtroStatus === 'todos' || solicitacao.status === filtroStatus;
      const matchPrioridade = filtroPrioridade === 'todos' || solicitacao.prioridade === filtroPrioridade;
      const matchSolicitante = solicitacao.solicitante.toLowerCase().includes(filtroSolicitante.toLowerCase());
      
      return matchTipo && matchStatus && matchPrioridade && matchSolicitante;
    });
  }, [filtroTipo, filtroStatus, filtroPrioridade, filtroSolicitante, solicitacoes]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovada: 'bg-green-100 text-green-800',
      rejeitada: 'bg-red-100 text-red-800',
      em_analise: 'bg-blue-100 text-blue-800'
    };
    
    return variants[status as keyof typeof variants] || variants.pendente;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      baixa: 'bg-gray-100 text-gray-800',
      media: 'bg-blue-100 text-blue-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800'
    };
    
    return variants[prioridade as keyof typeof variants] || variants.baixa;
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      ferias: 'Férias',
      licenca: 'Licença',
      abono: 'Abono',
      ajuste_ponto: 'Ajuste de Ponto',
      banco_horas: 'Banco de Horas',
      outros: 'Outros'
    };
    
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const handleAprovacao = (solicitacaoId: string, acao: 'aprovar' | 'rejeitar') => {
    // Aqui seria implementada a lógica de aprovação/rejeição
    console.log(`${acao} solicitação ${solicitacaoId} com observação: ${observacaoAprovacao}`);
    setSolicitacaoSelecionada(null);
    setObservacaoAprovacao('');
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aprovações Gerais</h1>
            <p className="text-gray-600">Gerencie todas as solicitações e aprovações do sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações no sistema</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ClipboardList className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando aprovação</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Aprovadas este mês</p>
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
                  <p className="text-sm font-medium text-gray-600">Urgentes</p>
                  <p className="text-3xl font-bold text-red-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Requer atenção imediata</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="solicitacoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab Solicitações */}
          <TabsContent value="solicitacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Solicitações Pendentes</CardTitle>
                    <CardDescription>
                      Gerencie todas as solicitações que requerem aprovação
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="filtro-solicitante">Buscar solicitante</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="filtro-solicitante"
                        placeholder="Nome do solicitante..."
                        value={filtroSolicitante}
                        onChange={(e) => setFiltroSolicitante(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-40">
                    <Label htmlFor="filtro-tipo">Tipo</Label>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ferias">Férias</SelectItem>
                        <SelectItem value="licenca">Licença</SelectItem>
                        <SelectItem value="abono">Abono</SelectItem>
                        <SelectItem value="ajuste_ponto">Ajuste de Ponto</SelectItem>
                        <SelectItem value="banco_horas">Banco de Horas</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-32">
                    <Label htmlFor="filtro-status">Status</Label>
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aprovada">Aprovada</SelectItem>
                        <SelectItem value="rejeitada">Rejeitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-32">
                    <Label htmlFor="filtro-prioridade">Prioridade</Label>
                    <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lista de solicitações */}
                <div className="space-y-4">
                  {solicitacoesFiltradas.map((solicitacao) => (
                    <Card key={solicitacao.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {getTipoLabel(solicitacao.tipo)}
                              </Badge>
                              <Badge className={getStatusBadge(solicitacao.status)}>
                                {solicitacao.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPrioridadeBadge(solicitacao.prioridade)}>
                                {solicitacao.prioridade}
                              </Badge>
                            </div>
                            
                            <div className="grid gap-2 md:grid-cols-2">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{solicitacao.solicitante}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{solicitacao.setor}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {format(new Date(solicitacao.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                                  {solicitacao.dataFim && ` - ${format(new Date(solicitacao.dataFim), 'dd/MM/yyyy', { locale: ptBR })}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {format(new Date(solicitacao.dataSolicitacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              <strong>Motivo:</strong> {solicitacao.motivo}
                            </div>
                            
                            {solicitacao.documentos && solicitacao.documentos.length > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{solicitacao.documentos.length} documento(s) anexado(s)</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSolicitacaoSelecionada(solicitacao)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {solicitacao.status === 'pendente' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleAprovacao(solicitacao.id, 'aprovar')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleAprovacao(solicitacao.id, 'rejeitar')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Aprovações</CardTitle>
                <CardDescription>
                  Visualize o histórico completo de aprovações e rejeições
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4" />
                  <p>Histórico de aprovações será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Aprovações</CardTitle>
                <CardDescription>
                  Gere relatórios detalhados sobre aprovações e solicitações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Relatórios de aprovações serão implementados aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Aprovação</CardTitle>
                <CardDescription>
                  Configure regras e parâmetros para aprovações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Configurações de aprovação serão implementadas aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para detalhes da solicitação */}
        {solicitacaoSelecionada && (
          <Dialog open={!!solicitacaoSelecionada} onOpenChange={() => setSolicitacaoSelecionada(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes da Solicitação</DialogTitle>
                <DialogDescription>
                  Informações completas da solicitação selecionada
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getTipoLabel(solicitacaoSelecionada.tipo)}
                  </Badge>
                  <Badge className={getStatusBadge(solicitacaoSelecionada.status)}>
                    {solicitacaoSelecionada.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPrioridadeBadge(solicitacaoSelecionada.prioridade)}>
                    {solicitacaoSelecionada.prioridade}
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Solicitante</Label>
                    <p className="text-sm">{solicitacaoSelecionada.solicitante}</p>
                  </div>
                  <div>
                    <Label>Setor</Label>
                    <p className="text-sm">{solicitacaoSelecionada.setor}</p>
                  </div>
                  <div>
                    <Label>Data de Início</Label>
                    <p className="text-sm">
                      {format(new Date(solicitacaoSelecionada.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  {solicitacaoSelecionada.dataFim && (
                    <div>
                      <Label>Data de Fim</Label>
                      <p className="text-sm">
                        {format(new Date(solicitacaoSelecionada.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Motivo</Label>
                  <p className="text-sm">{solicitacaoSelecionada.motivo}</p>
                </div>
                
                {solicitacaoSelecionada.observacoes && (
                  <div>
                    <Label>Observações do Aprovador</Label>
                    <p className="text-sm">{solicitacaoSelecionada.observacoes}</p>
                  </div>
                )}
                
                {solicitacaoSelecionada.status === 'pendente' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="observacao">Observações da Aprovação</Label>
                      <Textarea
                        id="observacao"
                        placeholder="Adicione observações sobre a aprovação/rejeição..."
                        value={observacaoAprovacao}
                        onChange={(e) => setObservacaoAprovacao(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAprovacao(solicitacaoSelecionada.id, 'aprovar')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleAprovacao(solicitacaoSelecionada.id, 'rejeitar')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AprovacoesGerais;