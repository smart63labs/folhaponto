import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Download, 
  Filter,
  Search,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface LogAuditoria {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  modulo: string;
  detalhes: string;
  ip: string;
  userAgent: string;
  status: 'sucesso' | 'erro' | 'alerta';
  nivel: 'baixo' | 'medio' | 'alto' | 'critico';
  dadosAnteriores?: any;
  dadosNovos?: any;
}

const LogsAuditoria: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduloFilter, setModuloFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [nivelFilter, setNivelFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Mock data - em produção viria da API
  const [logs] = useState<LogAuditoria[]>([
    {
      id: '1',
      timestamp: '2024-01-15T14:30:25Z',
      usuario: 'admin_protocolo@sefaz.to.gov.br',
      acao: 'LOGIN_SUCESSO',
      modulo: 'Autenticação',
      detalhes: 'Login realizado com sucesso',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'sucesso',
      nivel: 'baixo'
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:10Z',
      usuario: 'maria.silva@sefaz.to.gov.br',
      acao: 'APROVACAO_FREQUENCIA',
      modulo: 'Frequência',
      detalhes: 'Aprovação de frequência do servidor João Santos - Janeiro/2024',
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'sucesso',
      nivel: 'medio',
      dadosAnteriores: { status: 'pendente' },
      dadosNovos: { status: 'aprovado', aprovadoPor: 'maria.silva@sefaz.to.gov.br' }
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:45Z',
      usuario: 'joao.santos@sefaz.to.gov.br',
      acao: 'TENTATIVA_LOGIN_FALHOU',
      modulo: 'Autenticação',
      detalhes: 'Tentativa de login com senha incorreta',
      ip: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'erro',
      nivel: 'medio'
    },
    {
      id: '4',
      timestamp: '2024-01-15T14:15:30Z',
      usuario: 'admin_protocolo@sefaz.to.gov.br',
      acao: 'CRIACAO_USUARIO',
      modulo: 'Gestão de Usuários',
      detalhes: 'Criação de novo usuário: ana.costa@sefaz.to.gov.br',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'sucesso',
      nivel: 'alto',
      dadosNovos: { 
        email: 'ana.costa@sefaz.to.gov.br', 
        role: 'servidor', 
        setor: 'Recursos Humanos' 
      }
    },
    {
      id: '5',
      timestamp: '2024-01-15T14:10:15Z',
      usuario: 'sistema',
      acao: 'BACKUP_AUTOMATICO',
      modulo: 'Sistema',
      detalhes: 'Backup automático dos dados realizado com sucesso',
      ip: 'localhost',
      userAgent: 'Sistema Interno',
      status: 'sucesso',
      nivel: 'baixo'
    },
    {
      id: '6',
      timestamp: '2024-01-15T14:05:00Z',
      usuario: 'carlos.oliveira@sefaz.to.gov.br',
      acao: 'ACESSO_NAO_AUTORIZADO',
      modulo: 'Relatórios',
      detalhes: 'Tentativa de acesso a relatório sem permissão',
      ip: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'erro',
      nivel: 'critico'
    },
    {
      id: '7',
      timestamp: '2024-01-15T14:00:45Z',
      usuario: 'ana.costa@sefaz.to.gov.br',
      acao: 'ALTERACAO_JORNADA',
      modulo: 'Jornadas',
      detalhes: 'Alteração na jornada de trabalho - Jornada Flexível',
      ip: '192.168.1.120',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'sucesso',
      nivel: 'medio',
      dadosAnteriores: { horaInicio: '08:00', horaFim: '17:00' },
      dadosNovos: { horaInicio: '07:30', horaFim: '16:30' }
    },
    {
      id: '8',
      timestamp: '2024-01-15T13:55:30Z',
      usuario: 'sistema',
      acao: 'ERRO_SISTEMA',
      modulo: 'Sistema',
      detalhes: 'Erro na conexão com o banco de dados - Timeout',
      ip: 'localhost',
      userAgent: 'Sistema Interno',
      status: 'erro',
      nivel: 'alto'
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sucesso: { label: 'Sucesso', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      erro: { label: 'Erro', color: 'bg-red-100 text-red-800', icon: XCircle },
      alerta: { label: 'Alerta', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getNivelBadge = (nivel: string) => {
    const nivelConfig = {
      baixo: 'bg-blue-100 text-blue-800',
      medio: 'bg-yellow-100 text-yellow-800',
      alto: 'bg-orange-100 text-orange-800',
      critico: 'bg-red-100 text-red-800'
    };
    
    const nivelLabels = {
      baixo: 'Baixo',
      medio: 'Médio',
      alto: 'Alto',
      critico: 'Crítico'
    };
    
    return (
      <Badge className={nivelConfig[nivel as keyof typeof nivelConfig]}>
        {nivelLabels[nivel as keyof typeof nivelLabels]}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.detalhes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModulo = moduloFilter === 'todos' || log.modulo === moduloFilter;
    const matchesStatus = statusFilter === 'todos' || log.status === statusFilter;
    const matchesNivel = nivelFilter === 'todos' || log.nivel === nivelFilter;
    
    let matchesData = true;
    if (dataInicio && dataFim) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(dataInicio);
      const endDate = new Date(dataFim);
      matchesData = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesSearch && matchesModulo && matchesStatus && matchesNivel && matchesData;
  });

  const handleViewDetails = (log: LogAuditoria) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const handleExportLogs = () => {
    console.log('Exportar logs filtrados');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getModuloStats = () => {
    const stats = logs.reduce((acc, log) => {
      acc[log.modulo] = (acc[log.modulo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  const getStatusStats = () => {
    return {
      sucesso: logs.filter(l => l.status === 'sucesso').length,
      erro: logs.filter(l => l.status === 'erro').length,
      alerta: logs.filter(l => l.status === 'alerta').length
    };
  };

  const statusStats = getStatusStats();

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
            <p className="text-gray-600">Monitore atividades e eventos do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
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
                  <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                  <p className="text-3xl font-bold text-blue-600">{logs.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Registros auditados</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sucessos</p>
                  <p className="text-3xl font-bold text-green-600">{statusStats.sucesso}</p>
                  <p className="text-xs text-gray-500 mt-1">Operações bem-sucedidas</p>
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
                  <p className="text-sm font-medium text-gray-600">Erros</p>
                  <p className="text-3xl font-bold text-red-600">{statusStats.erro}</p>
                  <p className="text-xs text-gray-500 mt-1">Falhas registradas</p>
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
                  <p className="text-sm font-medium text-gray-600">Críticos</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {logs.filter(l => l.nivel === 'critico').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Eventos críticos</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por usuário, ação ou detalhes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={moduloFilter} onValueChange={setModuloFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Módulos</SelectItem>
                  <SelectItem value="Autenticação">Autenticação</SelectItem>
                  <SelectItem value="Frequência">Frequência</SelectItem>
                  <SelectItem value="Gestão de Usuários">Gestão de Usuários</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                  <SelectItem value="Relatórios">Relatórios</SelectItem>
                  <SelectItem value="Jornadas">Jornadas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="sucesso">Sucesso</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                  <SelectItem value="alerta">Alerta</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={nivelFilter} onValueChange={setNivelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Níveis</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  placeholder="Data início"
                />
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  placeholder="Data fim"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Auditoria</CardTitle>
            <CardDescription>
              {filteredLogs.length} registro(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{log.usuario}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{log.acao}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {log.detalhes}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.modulo}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{getNivelBadge(log.nivel)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{log.ip}</span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(log)}
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
              <DialogDescription>
                Informações completas sobre o evento registrado
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Timestamp</Label>
                    <p className="text-sm">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Usuário</Label>
                    <p className="text-sm">{selectedLog.usuario}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ação</Label>
                    <p className="text-sm">{selectedLog.acao}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Módulo</Label>
                    <p className="text-sm">{selectedLog.modulo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nível</Label>
                    <div className="mt-1">{getNivelBadge(selectedLog.nivel)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">IP</Label>
                    <p className="text-sm font-mono">{selectedLog.ip}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Detalhes</Label>
                  <p className="text-sm mt-1">{selectedLog.detalhes}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">User Agent</Label>
                  <p className="text-xs text-gray-500 break-all">{selectedLog.userAgent}</p>
                </div>
                
                {selectedLog.dadosAnteriores && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Dados Anteriores</Label>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(selectedLog.dadosAnteriores, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.dadosNovos && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Dados Novos</Label>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(selectedLog.dadosNovos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LogsAuditoria;