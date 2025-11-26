import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Settings
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
import { AttestationManager } from '@/components/Admin/AttestationManager';

const Atestos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // Mock data - em produção viria da API
  const [atestos] = useState([
    {
      id: '1',
      servidor: 'João Silva Santos',
      matricula: '123456',
      tipo: 'Médico',
      periodo: '14/01/2024 - 08:00 às 12:00',
      status: 'aprovado',
      dataSolicitacao: '2024-01-13',
      anexos: ['atestado_medico.pdf']
    },
    {
      id: '2',
      servidor: 'Maria Oliveira Costa',
      matricula: '123457',
      tipo: 'Dentista',
      periodo: '15/01/2024 - 14:00 às 16:00',
      status: 'pendente',
      dataSolicitacao: '2024-01-14',
      anexos: ['comprovante_consulta.pdf']
    },
    {
      id: '3',
      servidor: 'Carlos Eduardo Lima',
      matricula: '123458',
      tipo: 'Psicológico',
      periodo: '16/01/2024 - 09:00 às 11:00',
      status: 'rejeitado',
      dataSolicitacao: '2024-01-15',
      anexos: []
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      'Médico': 'bg-blue-100 text-blue-800',
      'Dentista': 'bg-green-100 text-green-800',
      'Psicológico': 'bg-purple-100 text-purple-800',
      'Outro': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.Outro}>
        {tipo}
      </Badge>
    );
  };

  const filteredAtestos = atestos.filter(atestado => {
    const matchesSearch = atestado.servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atestado.matricula.includes(searchTerm) ||
                         atestado.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || atestado.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || atestado.tipo === tipoFilter;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  const stats = {
    total: atestos.length,
    aprovados: atestos.filter(a => a.status === 'aprovado').length,
    pendentes: atestos.filter(a => a.status === 'pendente').length,
    rejeitados: atestos.filter(a => a.status === 'rejeitado').length
  };

  return (
    <DashboardLayout userRole="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Atestos</h1>
            <p className="text-gray-600">Gerencie atestados de frequência com aprovação hierárquica</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Atestos</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações registradas</p>
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
                  <p className="text-sm font-medium text-gray-600">Aprovados</p>
                  <p className="text-3xl font-bold text-green-600">{stats.aprovados}</p>
                  <p className="text-xs text-gray-500 mt-1">Atestos validados</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando análise</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejeitados</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejeitados}</p>
                  <p className="text-xs text-gray-500 mt-1">Documentação insuficiente</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    placeholder="Buscar por servidor, matrícula ou tipo..."
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
                  <SelectItem value="Médico">Médico</SelectItem>
                  <SelectItem value="Dentista">Dentista</SelectItem>
                  <SelectItem value="Psicológico">Psicológico</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Atestos Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Atestos</CardTitle>
            <CardDescription>
              {filteredAtestos.length} atesto(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servidor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Data Solicitação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Anexos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAtestos.map((atestado) => (
                  <TableRow key={atestado.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{atestado.servidor}</div>
                        <div className="text-sm text-gray-500">{atestado.matricula}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(atestado.tipo)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{atestado.periodo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(atestado.dataSolicitacao).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(atestado.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{atestado.anexos.length} arquivo(s)</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attestation Manager Component */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema de Atestos</CardTitle>
            <CardDescription>
              Gerencie regras e configurações para atestados automáticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttestationManager />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Atestos;