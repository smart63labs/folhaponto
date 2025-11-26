import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileCheck, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  Calendar,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { AttestationRequest, attestationService } from '@/services/attestationService';

export const AttestationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetor, setFilterSetor] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedRequest, setSelectedRequest] = useState<AttestationRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para diferentes tipos de solicitações
  const [pendingRequests, setPendingRequests] = useState<AttestationRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<AttestationRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<AttestationRequest[]>([]);

  // Mock data - em produção, buscar do backend
  useEffect(() => {
    loadAttestationData();
  }, []);

  const loadAttestationData = async () => {
    setIsLoading(true);
    try {
      // Simular dados de exemplo
      const mockPending: AttestationRequest[] = [
        {
          id: 'att_001',
          userId: 'user_001',
          userName: 'João Silva',
          userSetor: 'Tecnologia da Informação',
          period: {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          },
          attendanceRecords: [
            {
              date: '2024-01-15',
              checkIn: '08:00',
              checkOut: '17:00',
              workMode: 'presencial',
              totalHours: 8,
              isFlexible: false,
              isManualEntry: false
            }
          ],
          status: 'pending',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'att_002',
          userId: 'user_002',
          userName: 'Maria Santos',
          userSetor: 'Recursos Humanos',
          period: {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          },
          attendanceRecords: [
            {
              date: '2024-01-15',
              checkIn: '09:00',
              checkOut: '18:00',
              workMode: 'home_office',
              totalHours: 8,
              isFlexible: true,
              isManualEntry: false
            }
          ],
          status: 'approved_immediate',
          immediateSuperiorsApproval: [
            {
              superiorId: 'sup_001',
              superiorName: 'Carlos Oliveira',
              superiorRole: 'chefia',
              approvedAt: '2024-01-15T14:00:00Z',
              status: 'approved',
              observations: 'Aprovado - Horários em conformidade'
            }
          ],
          createdAt: '2024-01-15T09:00:00Z'
        }
      ];

      const mockCompleted: AttestationRequest[] = [
        {
          id: 'att_003',
          userId: 'user_003',
          userName: 'Ana Costa',
          userSetor: 'Desenvolvimento',
          period: {
            startDate: '2023-12-01',
            endDate: '2023-12-31'
          },
          attendanceRecords: [],
          status: 'completed',
          immediateSuperiorsApproval: [
            {
              superiorId: 'sup_002',
              superiorName: 'Pedro Almeida',
              superiorRole: 'chefia',
              approvedAt: '2024-01-02T10:00:00Z',
              status: 'approved'
            }
          ],
          mediateSuperiorsApproval: [
            {
              superiorId: 'sup_003',
              superiorName: 'Lucia Ferreira',
              superiorRole: 'chefia',
              approvedAt: '2024-01-03T11:00:00Z',
              status: 'approved'
            }
          ],
          createdAt: '2024-01-01T08:00:00Z',
          completedAt: '2024-01-03T11:30:00Z'
        }
      ];

      setPendingRequests(mockPending);
      setCompletedRequests(mockCompleted);
      setRejectedRequests([]);
    } catch (error) {
      console.error('Erro ao carregar dados de atesto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'approved_immediate':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Aprovado - Imediato</Badge>;
      case 'approved_mediate':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Aprovado - Mediato</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getWorkModeBadge = (workMode: string) => {
    switch (workMode) {
      case 'presencial':
        return <Badge variant="outline">Presencial</Badge>;
      case 'home_office':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Home Office</Badge>;
      case 'hibrido':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Híbrido</Badge>;
      default:
        return <Badge variant="outline">Não definido</Badge>;
    }
  };

  const filterRequests = (requests: AttestationRequest[]) => {
    return requests.filter(request => {
      const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.userSetor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSetor = filterSetor === 'todos' || request.userSetor === filterSetor;
      const matchesStatus = filterStatus === 'todos' || request.status === filterStatus;
      return matchesSearch && matchesSetor && matchesStatus;
    });
  };

  const handleViewDetails = (request: AttestationRequest) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const handleCreateAttestation = async () => {
    setIsLoading(true);
    try {
      // Implementar criação de nova solicitação de atesto
      await attestationService.createAttestationRequest('current_user_id', {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
      await loadAttestationData();
    } catch (error) {
      console.error('Erro ao criar solicitação de atesto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const AttestationTable: React.FC<{ requests: AttestationRequest[] }> = ({ requests }) => (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-medium">Usuário</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Setor</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Período</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Criado em</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filterRequests(requests).map((request) => (
            <tr key={request.id} className="border-b">
              <td className="h-12 px-4 align-middle">
                <div>
                  <div className="font-medium">{request.userName}</div>
                  <div className="text-sm text-muted-foreground">{request.userId}</div>
                </div>
              </td>
              <td className="h-12 px-4 align-middle">{request.userSetor}</td>
              <td className="h-12 px-4 align-middle">
                <div className="text-sm">
                  <div>{new Date(request.period.startDate).toLocaleDateString('pt-BR')}</div>
                  <div className="text-muted-foreground">
                    até {new Date(request.period.endDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </td>
              <td className="h-12 px-4 align-middle">
                {getStatusBadge(request.status)}
              </td>
              <td className="h-12 px-4 align-middle">
                <span className="text-sm">
                  {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </td>
              <td className="h-12 px-4 align-middle">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  {request.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const setores = ['Tecnologia da Informação', 'Recursos Humanos', 'Desenvolvimento', 'Suporte Técnico'];

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Atesto Automático</h2>
          <p className="text-muted-foreground">
            Gerenciamento de attestos com hierarquia de aprovação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadAttestationData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleCreateAttestation} disabled={isLoading}>
            <FileCheck className="h-4 w-4 mr-2" />
            Novo Atesto
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Digite o nome do usuário ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="filter-setor">Setor</Label>
          <Select value={filterSetor} onValueChange={setFilterSetor}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os setores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os setores</SelectItem>
              {setores.map(setor => (
                <SelectItem key={setor} value={setor}>
                  {setor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-status">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved_immediate">Aprovado - Imediato</SelectItem>
              <SelectItem value="approved_mediate">Aprovado - Mediato</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs para diferentes status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Concluídos ({completedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejeitados ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Solicitações Pendentes
              </CardTitle>
              <CardDescription>
                Attestos aguardando aprovação das chefias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttestationTable requests={pendingRequests} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Attestos Concluídos
              </CardTitle>
              <CardDescription>
                Attestos aprovados e finalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttestationTable requests={completedRequests} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Attestos Rejeitados
              </CardTitle>
              <CardDescription>
                Attestos que foram rejeitados pelas chefias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttestationTable requests={rejectedRequests} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de detalhes */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Atesto</DialogTitle>
            <DialogDescription>
              Informações completas sobre a solicitação de atesto
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Usuário</Label>
                  <div className="font-medium">{selectedRequest.userName}</div>
                </div>
                <div>
                  <Label>Setor</Label>
                  <div>{selectedRequest.userSetor}</div>
                </div>
                <div>
                  <Label>Período</Label>
                  <div>
                    {new Date(selectedRequest.period.startDate).toLocaleDateString('pt-BR')} - 
                    {new Date(selectedRequest.period.endDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              {/* Aprovações */}
              {selectedRequest.immediateSuperiorsApproval && (
                <div>
                  <Label className="text-base font-semibold">Aprovações - Chefias Imediatas</Label>
                  <div className="mt-2 space-y-2">
                    {selectedRequest.immediateSuperiorsApproval.map((approval, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{approval.superiorName}</div>
                            <div className="text-sm text-muted-foreground">{approval.superiorRole}</div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(approval.status)}
                            <div className="text-sm text-muted-foreground">
                              {new Date(approval.approvedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        {approval.observations && (
                          <div className="mt-2 text-sm">{approval.observations}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.mediateSuperiorsApproval && (
                <div>
                  <Label className="text-base font-semibold">Aprovações - Chefias Mediatas</Label>
                  <div className="mt-2 space-y-2">
                    {selectedRequest.mediateSuperiorsApproval.map((approval, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{approval.superiorName}</div>
                            <div className="text-sm text-muted-foreground">{approval.superiorRole}</div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(approval.status)}
                            <div className="text-sm text-muted-foreground">
                              {new Date(approval.approvedAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        {approval.observations && (
                          <div className="mt-2 text-sm">{approval.observations}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registros de frequência */}
              <div>
                <Label className="text-base font-semibold">Registros de Frequência</Label>
                <div className="mt-2 rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium">Data</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Entrada</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Saída</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Modo</th>
                        <th className="h-10 px-4 text-left align-middle font-medium">Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.attendanceRecords.map((record, index) => (
                        <tr key={index} className="border-b">
                          <td className="h-10 px-4 align-middle">
                            {new Date(record.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="h-10 px-4 align-middle">{record.checkIn || '-'}</td>
                          <td className="h-10 px-4 align-middle">{record.checkOut || '-'}</td>
                          <td className="h-10 px-4 align-middle">
                            {getWorkModeBadge(record.workMode)}
                          </td>
                          <td className="h-10 px-4 align-middle">{record.totalHours}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Estatísticas resumidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concluídos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Attestos finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Aprovação
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedRequests.length > 0 ? 
                Math.round((completedRequests.length / (completedRequests.length + rejectedRequests.length)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Attestos aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5</div>
            <p className="text-xs text-muted-foreground">
              Dias para aprovação
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};