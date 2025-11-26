import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Building
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { getBadgeConfig } from "@/config/badgeConfig";

interface Aprovacao {
  id: string;
  tipo: 'justificativa' | 'frequencia' | 'ferias' | 'licenca' | 'horas_extras';
  solicitante: string;
  matricula: string;
  setor: string;
  setorId?: string;
  setorHierarquia?: string;
  datasolicitacao: string;
  periodo: string;
  motivo: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  anexos?: string[];
  aprovadorDesignado?: string;
  podeAprovar?: boolean;
}

const AprovacoesGerais: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('pendente');
  const [activeTab, setActiveTab] = useState('pendentes');
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar aprovações da API
  useEffect(() => {
    const fetchAprovacoes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/approvals', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAprovacoes(data.approvals || []);
        } else {
          console.error('Erro ao carregar aprovações:', response.statusText);
          // Fallback para dados mock em caso de erro
          setAprovacoes(getMockAprovacoes());
        }
      } catch (error) {
        console.error('Erro ao carregar aprovações:', error);
        // Fallback para dados mock em caso de erro
        setAprovacoes(getMockAprovacoes());
      } finally {
        setLoading(false);
      }
    };

    fetchAprovacoes();
  }, []);

  // Dados mock com informações de setor
  const getMockAprovacoes = (): Aprovacao[] => [
    {
      id: '1',
      tipo: 'justificativa',
      solicitante: 'João Silva Santos',
      matricula: '123456',
      setor: 'Fiscalização',
      setorId: 'setor-fiscalizacao',
      setorHierarquia: 'SEFAZ > Fiscalização',
      datasolicitacao: '2024-01-15',
      periodo: '14/01/2024 - 08:00 às 12:00',
      motivo: 'Consulta médica de emergência',
      status: 'pendente',
      anexos: ['atestado_medico.pdf'],
      aprovadorDesignado: 'Maria Supervisora',
      podeAprovar: true
    },
    {
      id: '2',
      tipo: 'ferias',
      solicitante: 'Maria Oliveira Costa',
      matricula: '123457',
      setor: 'Arrecadação',
      setorId: 'setor-arrecadacao',
      setorHierarquia: 'SEFAZ > Arrecadação',
      datasolicitacao: '2024-01-14',
      periodo: '01/02/2024 a 15/02/2024',
      motivo: 'Férias regulamentares',
      status: 'pendente',
      aprovadorDesignado: 'Carlos Gerente',
      podeAprovar: false
    },
    {
      id: '3',
      tipo: 'horas_extras',
      solicitante: 'Carlos Eduardo Lima',
      matricula: '123458',
      setor: 'Tecnologia',
      setorId: 'setor-tecnologia',
      setorHierarquia: 'SEFAZ > Tecnologia da Informação',
      datasolicitacao: '2024-01-13',
      periodo: '12/01/2024 - 18:00 às 22:00',
      motivo: 'Manutenção emergencial do sistema',
      status: 'aprovado',
      observacoes: 'Aprovado pela urgência da situação',
      aprovadorDesignado: 'Ana Coordenadora',
      podeAprovar: true
    },
    {
      id: '4',
      tipo: 'licenca',
      solicitante: 'Ana Paula Ferreira',
      matricula: '123459',
      setor: 'Recursos Humanos',
      setorId: 'setor-rh',
      setorHierarquia: 'SEFAZ > Recursos Humanos',
      datasolicitacao: '2024-01-12',
      periodo: '20/01/2024 a 25/01/2024',
      motivo: 'Licença para tratamento de saúde',
      status: 'rejeitado',
      observacoes: 'Documentação insuficiente',
      aprovadorDesignado: 'Pedro Diretor',
      podeAprovar: true
    },
    {
      id: '5',
      tipo: 'frequencia',
      solicitante: 'Pedro Santos Lima',
      matricula: '123460',
      setor: 'Auditoria',
      setorId: 'setor-auditoria',
      setorHierarquia: 'SEFAZ > Auditoria Interna',
      datasolicitacao: '2024-01-16',
      periodo: 'Janeiro/2024',
      motivo: 'Correção de frequência - trabalho externo',
      status: 'pendente',
      anexos: ['relatorio_atividades.pdf', 'comprovante_deslocamento.pdf'],
      aprovadorDesignado: 'Lucia Auditora Chefe',
      podeAprovar: false
    }
  ];

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      justificativa: 'Justificativa',
      frequencia: 'Frequência',
      ferias: 'Férias',
      licenca: 'Licença',
      horas_extras: 'Horas Extras'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
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

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      justificativa: 'bg-blue-100 text-blue-800',
      frequencia: 'bg-purple-100 text-purple-800',
      ferias: 'bg-green-100 text-green-800',
      licenca: 'bg-orange-100 text-orange-800',
      horas_extras: 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <Badge className={tipoConfig[tipo as keyof typeof tipoConfig]}>
        {getTipoLabel(tipo)}
      </Badge>
    );
  };

  const filteredAprovacoes = aprovacoes.filter(aprovacao => {
    const matchesSearch = aprovacao.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aprovacao.matricula.includes(searchTerm) ||
                         aprovacao.setor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || aprovacao.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || aprovacao.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const pendentesCount = aprovacoes.filter(a => a.status === 'pendente').length;
  const aprovadosCount = aprovacoes.filter(a => a.status === 'aprovado').length;
  const rejeitadosCount = aprovacoes.filter(a => a.status === 'rejeitado').length;

  const handleAprovar = async (id: string) => {
    try {
      const response = await fetch(`/api/approvals/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'approve',
          comments: 'Aprovado via sistema de hierarquia'
        })
      });

      if (response.ok) {
        // Atualizar a lista de aprovações
        setAprovacoes(prev => prev.map(aprovacao => 
          aprovacao.id === id 
            ? { ...aprovacao, status: 'aprovado' as const }
            : aprovacao
        ));
        console.log('Aprovação realizada com sucesso');
      } else {
        console.error('Erro ao aprovar:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
    }
  };

  const handleRejeitar = async (id: string) => {
    try {
      const response = await fetch(`/api/approvals/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reject',
          comments: 'Rejeitado via sistema de hierarquia'
        })
      });

      if (response.ok) {
        // Atualizar a lista de aprovações
        setAprovacoes(prev => prev.map(aprovacao => 
          aprovacao.id === id 
            ? { ...aprovacao, status: 'rejeitado' as const }
            : aprovacao
        ));
        console.log('Rejeição realizada com sucesso');
      } else {
        console.error('Erro ao rejeitar:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
    }
  };

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aprovações Gerais</h1>
            <p className="text-gray-600">Gerencie todas as solicitações de aprovação</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                  <p className="text-3xl font-bold text-blue-600">{aprovacoes.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações registradas</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendentesCount}</p>
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
                  <p className="text-3xl font-bold text-green-600">{aprovadosCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações validadas</p>
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
                  <p className="text-3xl font-bold text-red-600">{rejeitadosCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Não atendem critérios</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pendentes">
              Pendentes ({pendentesCount})
            </TabsTrigger>
            <TabsTrigger value="aprovadas">
              Aprovadas ({aprovadosCount})
            </TabsTrigger>
            <TabsTrigger value="rejeitadas">
              Rejeitadas ({rejeitadosCount})
            </TabsTrigger>
            <TabsTrigger value="todas">
              Todas ({aprovacoes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar por nome, matrícula ou setor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="justificativa">Justificativa</SelectItem>
                      <SelectItem value="frequencia">Frequência</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                      <SelectItem value="licenca">Licença</SelectItem>
                      <SelectItem value="horas_extras">Horas Extras</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {activeTab === 'todas' && (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Aprovações Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Solicitações</CardTitle>
                <CardDescription>
                  {filteredAprovacoes.length} solicitação(ões) encontrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Data Solicitação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAprovacoes.map((aprovacao) => (
                      <TableRow key={aprovacao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{aprovacao.solicitante}</div>
                            <div className="text-sm text-gray-500">
                              {aprovacao.matricula} - {aprovacao.setor}
                            </div>
                            {aprovacao.setorHierarquia && (
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {aprovacao.setorHierarquia}
                              </div>
                            )}
                            {aprovacao.aprovadorDesignado && (
                              <div className="text-xs text-blue-600">
                                Aprovador: {aprovacao.aprovadorDesignado}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getTipoBadge(aprovacao.tipo)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {aprovacao.periodo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(aprovacao.datasolicitacao).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(aprovacao.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {aprovacao.status === 'pendente' && aprovacao.podeAprovar && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleAprovar(aprovacao.id)}
                                  title="Aprovar solicitação"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleRejeitar(aprovacao.id)}
                                  title="Rejeitar solicitação"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {aprovacao.status === 'pendente' && !aprovacao.podeAprovar && (
                              <Badge variant="outline" className="text-xs">
                                Aguardando aprovador designado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AprovacoesGerais;