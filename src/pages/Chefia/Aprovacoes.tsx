import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Eye,
  MessageSquare,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Solicitacao {
  id: string;
  tipo: 'ajuste_ponto' | 'justificativa_falta' | 'justificativa_atraso' | 'banco_horas';
  funcionario: {
    nome: string;
    matricula: string;
    setor: string;
  };
  data: Date;
  dataOcorrencia: Date;
  descricao: string;
  justificativa: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  prioridade: 'baixa' | 'media' | 'alta';
  anexos?: string[];
  criadoEm: Date;
  prazoLimite: Date;
}

const Aprovacoes: React.FC = () => {
  const { user } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState<string>('pendente');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [comentarioAprovacao, setComentarioAprovacao] = useState('');
  
  // Estados para o modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Dados mockados de solicitações
  const solicitacoes: Solicitacao[] = useMemo(() => [
    {
      id: '1',
      tipo: 'ajuste_ponto',
      funcionario: {
        nome: 'Maria Silva Santos',
        matricula: '12345',
        setor: 'Tributação'
      },
      data: new Date(),
      dataOcorrencia: new Date(2024, 0, 15),
      descricao: 'Esqueci de registrar saída para almoço',
      justificativa: 'Estava em reunião externa e esqueci de registrar a saída para o almoço. Saí às 12:00 e retornei às 13:00.',
      status: 'pendente',
      prioridade: 'media',
      criadoEm: new Date(2024, 0, 16, 9, 30),
      prazoLimite: new Date(2024, 0, 18, 17, 0)
    },
    {
      id: '2',
      tipo: 'justificativa_falta',
      funcionario: {
        nome: 'João Carlos Oliveira',
        matricula: '67890',
        setor: 'Arrecadação'
      },
      data: new Date(),
      dataOcorrencia: new Date(2024, 0, 14),
      descricao: 'Consulta médica de emergência',
      justificativa: 'Precisei me ausentar para consulta médica de emergência. Anexo atestado médico.',
      status: 'pendente',
      prioridade: 'alta',
      anexos: ['atestado_medico.pdf'],
      criadoEm: new Date(2024, 0, 15, 8, 15),
      prazoLimite: new Date(2024, 0, 17, 17, 0)
    },
    {
      id: '3',
      tipo: 'justificativa_atraso',
      funcionario: {
        nome: 'Ana Paula Costa',
        matricula: '11111',
        setor: 'Fiscalização'
      },
      data: new Date(),
      dataOcorrencia: new Date(2024, 0, 16),
      descricao: 'Atraso por problema no transporte público',
      justificativa: 'Houve greve dos ônibus e precisei buscar transporte alternativo, chegando 30 minutos atrasada.',
      status: 'pendente',
      prioridade: 'baixa',
      criadoEm: new Date(2024, 0, 16, 8, 45),
      prazoLimite: new Date(2024, 0, 18, 17, 0)
    },
    {
      id: '4',
      tipo: 'banco_horas',
      funcionario: {
        nome: 'Carlos Eduardo Lima',
        matricula: '22222',
        setor: 'TI'
      },
      data: new Date(),
      dataOcorrencia: new Date(2024, 0, 12),
      descricao: 'Solicitação de compensação de horas extras',
      justificativa: 'Trabalhei 4 horas extras no projeto de modernização do sistema. Solicito compensação.',
      status: 'aprovado',
      prioridade: 'media',
      criadoEm: new Date(2024, 0, 13, 10, 0),
      prazoLimite: new Date(2024, 0, 15, 17, 0)
    }
  ], []);

  // Filtrar solicitações
  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter(solicitacao => {
      const matchStatus = filtroStatus === 'todos' || solicitacao.status === filtroStatus;
      const matchTipo = filtroTipo === 'todos' || solicitacao.tipo === filtroTipo;
      const matchBusca = busca === '' || 
        solicitacao.funcionario.nome.toLowerCase().includes(busca.toLowerCase()) ||
        solicitacao.funcionario.matricula.includes(busca) ||
        solicitacao.descricao.toLowerCase().includes(busca.toLowerCase());
      
      return matchStatus && matchTipo && matchBusca;
    });
  }, [solicitacoes, filtroStatus, filtroTipo, busca]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const pendentes = solicitacoes.filter(s => s.status === 'pendente').length;
    const aprovadas = solicitacoes.filter(s => s.status === 'aprovado').length;
    const rejeitadas = solicitacoes.filter(s => s.status === 'rejeitado').length;
    const vencendoHoje = solicitacoes.filter(s => 
      s.status === 'pendente' && 
      format(s.prazoLimite, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length;

    return { pendentes, aprovadas, rejeitadas, vencendoHoje };
  }, [solicitacoes]);

  const handleAprovar = (solicitacao: Solicitacao) => {
    setModalTitle("Solicitação Aprovada");
    setModalMessage(`Solicitação de ${solicitacao.funcionario.nome} foi aprovada com sucesso.`);
    setModalType('success');
    setModalOpen(true);
    setSolicitacaoSelecionada(null);
    setComentarioAprovacao('');
  };

  const handleRejeitar = (solicitacao: Solicitacao) => {
    setModalTitle("Solicitação Rejeitada");
    setModalMessage(`Solicitação de ${solicitacao.funcionario.nome} foi rejeitada.`);
    setModalType('error');
    setModalOpen(true);
    setSolicitacaoSelecionada(null);
    setComentarioAprovacao('');
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      'ajuste_ponto': 'Ajuste de Ponto',
      'justificativa_falta': 'Justificativa de Falta',
      'justificativa_atraso': 'Justificativa de Atraso',
      'banco_horas': 'Banco de Horas'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getPrioridadeColor = (prioridade: string) => {
    const cores = {
      'baixa': 'bg-green-100 text-green-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-red-100 text-red-800'
    };
    return cores[prioridade as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const cores = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aprovado': 'bg-green-100 text-green-800',
      'rejeitado': 'bg-red-100 text-red-800'
    };
    return cores[status as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aprovações</h1>
            <p className="text-gray-600">Gerencie solicitações da sua equipe</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando decisão</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.aprovadas}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações aceitas</p>
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
                  <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                  <p className="text-3xl font-bold text-red-600">{estatisticas.rejeitadas}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações negadas</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vencendo Hoje</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas.vencendoHoje}</p>
                  <p className="text-xs text-gray-500 mt-1">Prazo expirando</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, matrícula ou descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="ajuste_ponto">Ajuste de Ponto</SelectItem>
                  <SelectItem value="justificativa_falta">Justificativa de Falta</SelectItem>
                  <SelectItem value="justificativa_atraso">Justificativa de Atraso</SelectItem>
                  <SelectItem value="banco_horas">Banco de Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Solicitações */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitações ({solicitacoesFiltradas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {solicitacoesFiltradas.map((solicitacao) => (
                <div key={solicitacao.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPrioridadeColor(solicitacao.prioridade)}>
                          {solicitacao.prioridade.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(solicitacao.status)}>
                          {solicitacao.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {getTipoLabel(solicitacao.tipo)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{solicitacao.funcionario.nome}</span>
                            <span>({solicitacao.funcionario.matricula})</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>{solicitacao.funcionario.setor}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Ocorrência: {format(solicitacao.dataOcorrencia, 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>Prazo: {format(solicitacao.prazoLimite, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{solicitacao.descricao}</p>
                        <p className="text-gray-600 mt-1">{solicitacao.justificativa}</p>
                      </div>
                      
                      {solicitacao.anexos && solicitacao.anexos.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <FileText className="w-4 h-4" />
                          <span>{solicitacao.anexos.length} anexo(s)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSolicitacaoSelecionada(solicitacao)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Solicitação</DialogTitle>
                            <DialogDescription>
                              Analise e tome uma decisão sobre esta solicitação
                            </DialogDescription>
                          </DialogHeader>
                          
                          {solicitacaoSelecionada && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Funcionário</Label>
                                  <p className="text-sm">{solicitacaoSelecionada.funcionario.nome}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Matrícula</Label>
                                  <p className="text-sm">{solicitacaoSelecionada.funcionario.matricula}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Setor</Label>
                                  <p className="text-sm">{solicitacaoSelecionada.funcionario.setor}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Tipo</Label>
                                  <p className="text-sm">{getTipoLabel(solicitacaoSelecionada.tipo)}</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Descrição</Label>
                                <p className="text-sm mt-1">{solicitacaoSelecionada.descricao}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Justificativa</Label>
                                <p className="text-sm mt-1">{solicitacaoSelecionada.justificativa}</p>
                              </div>
                              
                              {solicitacaoSelecionada.status === 'pendente' && (
                                <div>
                                  <Label htmlFor="comentario" className="text-sm font-medium">
                                    Comentário da Aprovação (opcional)
                                  </Label>
                                  <Textarea
                                    id="comentario"
                                    placeholder="Adicione um comentário sobre sua decisão..."
                                    value={comentarioAprovacao}
                                    onChange={(e) => setComentarioAprovacao(e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {solicitacaoSelecionada?.status === 'pendente' && (
                            <DialogFooter className="gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => handleRejeitar(solicitacaoSelecionada)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeitar
                              </Button>
                              <Button 
                                onClick={() => handleAprovar(solicitacaoSelecionada)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprovar
                              </Button>
                            </DialogFooter>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {solicitacao.status === 'pendente' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejeitar(solicitacao)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAprovar(solicitacao)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {solicitacoesFiltradas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma solicitação encontrada com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

export default Aprovacoes;