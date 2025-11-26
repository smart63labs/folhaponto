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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Monitor,
  Database,
  FileText,
  Eye,
  Settings,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Globe,
  Smartphone,
  Laptop,
  Server,
  HardDrive,
  Wifi,
  MapPin,
  UserCheck,
  UserX,
  Key,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface LogEntry {
  id: string;
  timestamp: string;
  nivel: 'info' | 'warning' | 'error' | 'success' | 'debug';
  categoria: 'autenticacao' | 'sistema' | 'usuario' | 'database' | 'api' | 'seguranca';
  acao: string;
  usuario?: string;
  ip: string;
  userAgent: string;
  detalhes: string;
  recurso?: string;
  statusCode?: number;
  duracao?: number;
  dispositivo: 'desktop' | 'mobile' | 'tablet' | 'api';
}

interface EstatisticaAuditoria {
  titulo: string;
  valor: number | string;
  variacao?: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

interface FiltroAuditoria {
  dataInicio: string;
  dataFim: string;
  nivel: string;
  categoria: string;
  usuario: string;
  acao: string;
  ip: string;
}

const AuditoriaLogs: React.FC = () => {
  const [tabAtiva, setTabAtiva] = useState('logs');
  const [filtros, setFiltros] = useState<FiltroAuditoria>({
    dataInicio: '',
    dataFim: '',
    nivel: 'todos',
    categoria: 'todos',
    usuario: '',
    acao: '',
    ip: ''
  });
  const [logSelecionado, setLogSelecionado] = useState<LogEntry | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(20);

  // Logs mockados
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15T14:30:25.123Z',
      nivel: 'info',
      categoria: 'autenticacao',
      acao: 'Login realizado',
      usuario: 'admin_protocolo@sefaz.to.gov.br',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      detalhes: 'Usuário admin realizou login com sucesso',
      dispositivo: 'desktop',
      statusCode: 200,
      duracao: 1250
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:10.456Z',
      nivel: 'warning',
      categoria: 'seguranca',
      acao: 'Tentativa de login falhada',
      usuario: 'usuario.teste@sefaz.to.gov.br',
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      detalhes: 'Senha incorreta fornecida para o usuário usuario.teste@sefaz.to.gov.br',
      dispositivo: 'mobile',
      statusCode: 401,
      duracao: 850
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:45.789Z',
      nivel: 'success',
      categoria: 'usuario',
      acao: 'Usuário criado',
      usuario: 'admin_protocolo@sefaz.to.gov.br',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      detalhes: 'Novo usuário criado: joao.silva@sefaz.to.gov.br',
      recurso: 'users/create',
      dispositivo: 'desktop',
      statusCode: 201,
      duracao: 2100
    },
    {
      id: '4',
      timestamp: '2024-01-15T14:15:30.012Z',
      nivel: 'error',
      categoria: 'database',
      acao: 'Erro de conexão',
      ip: '192.168.1.50',
      userAgent: 'Sistema Interno',
      detalhes: 'Falha na conexão com o banco de dados principal - timeout após 30s',
      dispositivo: 'api',
      statusCode: 500,
      duracao: 30000
    },
    {
      id: '5',
      timestamp: '2024-01-15T14:10:15.345Z',
      nivel: 'info',
      categoria: 'sistema',
      acao: 'Backup automático',
      ip: '127.0.0.1',
      userAgent: 'Sistema Interno',
      detalhes: 'Backup automático do banco de dados executado com sucesso',
      dispositivo: 'api',
      statusCode: 200,
      duracao: 45000
    },
    {
      id: '6',
      timestamp: '2024-01-15T14:05:00.678Z',
      nivel: 'warning',
      categoria: 'api',
      acao: 'Rate limit atingido',
      usuario: 'sistema.externo@api.gov.br',
      ip: '203.0.113.45',
      userAgent: 'API Client v2.1',
      detalhes: 'Cliente API atingiu limite de 1000 requisições por hora',
      recurso: 'api/v1/funcionarios',
      dispositivo: 'api',
      statusCode: 429,
      duracao: 150
    },
    {
      id: '7',
      timestamp: '2024-01-15T14:00:45.901Z',
      nivel: 'info',
      categoria: 'usuario',
      acao: 'Perfil atualizado',
      usuario: 'maria.santos@sefaz.to.gov.br',
      ip: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      detalhes: 'Usuário atualizou informações do perfil',
      recurso: 'users/profile',
      dispositivo: 'desktop',
      statusCode: 200,
      duracao: 750
    },
    {
      id: '8',
      timestamp: '2024-01-15T13:55:30.234Z',
      nivel: 'error',
      categoria: 'seguranca',
      acao: 'Acesso negado',
      usuario: 'usuario.suspeito@external.com',
      ip: '198.51.100.25',
      userAgent: 'curl/7.68.0',
      detalhes: 'Tentativa de acesso a recurso protegido sem autorização adequada',
      recurso: 'admin/configuracoes',
      dispositivo: 'api',
      statusCode: 403,
      duracao: 50
    },
    {
      id: '9',
      timestamp: '2024-01-15T13:50:15.567Z',
      nivel: 'info',
      categoria: 'autenticacao',
      acao: 'Logout realizado',
      usuario: 'carlos.oliveira@sefaz.to.gov.br',
      ip: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      detalhes: 'Usuário realizou logout do sistema',
      dispositivo: 'desktop',
      statusCode: 200,
      duracao: 200
    },
    {
      id: '10',
      timestamp: '2024-01-15T13:45:00.890Z',
      nivel: 'debug',
      categoria: 'sistema',
      acao: 'Cache limpo',
      ip: '127.0.0.1',
      userAgent: 'Sistema Interno',
      detalhes: 'Cache do sistema foi limpo automaticamente - 2.5GB liberados',
      dispositivo: 'api',
      statusCode: 200,
      duracao: 5000
    }
  ];

  // Estatísticas
  const estatisticas: EstatisticaAuditoria[] = [
    {
      titulo: 'Total de Logs',
      valor: logs.length,
      variacao: 15.2,
      icone: Activity,
      cor: 'text-blue-600',
      descricao: 'Logs registrados hoje'
    },
    {
      titulo: 'Eventos Críticos',
      valor: logs.filter(l => l.nivel === 'error').length,
      variacao: -8.5,
      icone: AlertTriangle,
      cor: 'text-red-600',
      descricao: 'Erros nas últimas 24h'
    },
    {
      titulo: 'Logins Únicos',
      valor: new Set(logs.filter(l => l.categoria === 'autenticacao' && l.acao.includes('Login')).map(l => l.usuario)).size,
      variacao: 12.3,
      icone: UserCheck,
      cor: 'text-green-600',
      descricao: 'Usuários ativos hoje'
    },
    {
      titulo: 'Tentativas Bloqueadas',
      valor: logs.filter(l => l.nivel === 'warning' && l.categoria === 'seguranca').length,
      variacao: -25.0,
      icone: Shield,
      cor: 'text-orange-600',
      descricao: 'Tentativas de acesso negadas'
    }
  ];

  // Filtros aplicados
  const logsFiltrados = useMemo(() => {
    return logs.filter(log => {
      const matchNivel = filtros.nivel === 'todos' || log.nivel === filtros.nivel;
      const matchCategoria = filtros.categoria === 'todos' || log.categoria === filtros.categoria;
      const matchUsuario = !filtros.usuario || (log.usuario && log.usuario.toLowerCase().includes(filtros.usuario.toLowerCase()));
      const matchAcao = !filtros.acao || log.acao.toLowerCase().includes(filtros.acao.toLowerCase());
      const matchIp = !filtros.ip || log.ip.includes(filtros.ip);
      
      // Filtro de data (simplificado para o exemplo)
      let matchData = true;
      if (filtros.dataInicio || filtros.dataFim) {
        const logDate = new Date(log.timestamp);
        if (filtros.dataInicio) {
          matchData = matchData && logDate >= new Date(filtros.dataInicio);
        }
        if (filtros.dataFim) {
          matchData = matchData && logDate <= new Date(filtros.dataFim + 'T23:59:59');
        }
      }
      
      return matchNivel && matchCategoria && matchUsuario && matchAcao && matchIp && matchData;
    });
  }, [filtros]);

  // Paginação
  const totalPaginas = Math.ceil(logsFiltrados.length / itensPorPagina);
  const logsExibidos = logsFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const getNivelBadge = (nivel: string) => {
    const variants = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      debug: 'bg-gray-100 text-gray-800'
    };
    
    return variants[nivel as keyof typeof variants] || variants.info;
  };

  const getNivelIcon = (nivel: string) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
      debug: Settings
    };
    
    return icons[nivel as keyof typeof icons] || Info;
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons = {
      autenticacao: LogIn,
      sistema: Settings,
      usuario: User,
      database: Database,
      api: Globe,
      seguranca: Shield
    };
    
    return icons[categoria as keyof typeof icons] || Activity;
  };

  const getDispositivoIcon = (dispositivo: string) => {
    const icons = {
      desktop: Monitor,
      mobile: Smartphone,
      tablet: Smartphone,
      api: Server
    };
    
    return icons[dispositivo as keyof typeof icons] || Monitor;
  };

  const handleFiltroChange = (campo: keyof FiltroAuditoria, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPaginaAtual(1); // Reset para primeira página ao filtrar
  };

  const handleLimparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      nivel: 'todos',
      categoria: 'todos',
      usuario: '',
      acao: '',
      ip: ''
    });
    setPaginaAtual(1);
  };

  const handleExportarLogs = () => {
    // Aqui seria implementada a lógica de exportação
    console.log('Exportando logs filtrados:', logsFiltrados);
  };

  const formatarDuracao = (duracao?: number) => {
    if (!duracao) return '-';
    if (duracao < 1000) return `${duracao}ms`;
    return `${(duracao / 1000).toFixed(1)}s`;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auditoria & Logs</h1>
            <p className="text-gray-600">Monitore atividades do sistema e analise logs de auditoria</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Logs registrados hoje</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eventos Críticos</p>
                  <p className="text-3xl font-bold text-red-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Erros nas últimas 24h</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Logins Únicos</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Usuários ativos hoje</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tentativas Bloqueadas</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Tentativas de acesso negadas</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
            <TabsTrigger value="auditoria">Trilha de Auditoria</TabsTrigger>
            <TabsTrigger value="seguranca">Eventos de Segurança</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Tab Logs do Sistema */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Logs do Sistema</CardTitle>
                    <CardDescription>
                      Visualize e filtre todos os logs de atividade do sistema
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleLimparFiltros}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Limpar Filtros
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportarLogs}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mb-6">
                  <div>
                    <Label htmlFor="data-inicio">Data Início</Label>
                    <Input
                      id="data-inicio"
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-fim">Data Fim</Label>
                    <Input
                      id="data-fim"
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="filtro-nivel">Nível</Label>
                    <Select value={filtros.nivel} onValueChange={(value) => handleFiltroChange('nivel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filtro-categoria">Categoria</Label>
                    <Select value={filtros.categoria} onValueChange={(value) => handleFiltroChange('categoria', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="autenticacao">Autenticação</SelectItem>
                        <SelectItem value="sistema">Sistema</SelectItem>
                        <SelectItem value="usuario">Usuário</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="seguranca">Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filtro-usuario">Usuário</Label>
                    <Input
                      id="filtro-usuario"
                      placeholder="Email do usuário"
                      value={filtros.usuario}
                      onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="filtro-ip">IP</Label>
                    <Input
                      id="filtro-ip"
                      placeholder="Endereço IP"
                      value={filtros.ip}
                      onChange={(e) => handleFiltroChange('ip', e.target.value)}
                    />
                  </div>
                </div>

                {/* Resultados */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Mostrando {logsExibidos.length} de {logsFiltrados.length} logs
                    </span>
                    <span>
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                  </div>

                  {/* Lista de logs */}
                  <div className="space-y-2">
                    {logsExibidos.map((log) => {
                      const NivelIcon = getNivelIcon(log.nivel);
                      const CategoriaIcon = getCategoriaIcon(log.categoria);
                      const DispositivoIcon = getDispositivoIcon(log.dispositivo);
                      
                      return (
                        <Card key={log.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setLogSelecionado(log)}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <NivelIcon className={`h-4 w-4 ${log.nivel === 'error' ? 'text-red-500' : log.nivel === 'warning' ? 'text-yellow-500' : log.nivel === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
                                <CategoriaIcon className="h-4 w-4 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{log.acao}</span>
                                    <Badge className={getNivelBadge(log.nivel)}>
                                      {log.nivel}
                                    </Badge>
                                    {log.statusCode && (
                                      <Badge variant="outline" className="text-xs">
                                        {log.statusCode}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {log.detalhes}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                      </span>
                                    </div>
                                    {log.usuario && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{log.usuario}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Globe className="h-3 w-3" />
                                      <span>{log.ip}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DispositivoIcon className="h-3 w-3" />
                                      <span>{log.dispositivo}</span>
                                    </div>
                                    {log.duracao && (
                                      <div className="flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        <span>{formatarDuracao(log.duracao)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Paginação */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                        disabled={paginaAtual === 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {paginaAtual} de {totalPaginas}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                        disabled={paginaAtual === totalPaginas}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Trilha de Auditoria */}
          <TabsContent value="auditoria" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trilha de Auditoria</CardTitle>
                <CardDescription>
                  Acompanhe todas as ações realizadas pelos usuários no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Trilha de auditoria detalhada será implementada aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Eventos de Segurança */}
          <TabsContent value="seguranca" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos de Segurança</CardTitle>
                <CardDescription>
                  Monitore eventos relacionados à segurança do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <p>Monitoramento de segurança será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Auditoria</CardTitle>
                <CardDescription>
                  Gere relatórios personalizados de auditoria e logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Gerador de relatórios será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para detalhes do log */}
        {logSelecionado && (
          <Dialog open={!!logSelecionado} onOpenChange={() => setLogSelecionado(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Log</DialogTitle>
                <DialogDescription>
                  Informações completas sobre o evento registrado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getNivelBadge(logSelecionado.nivel)}>
                    {logSelecionado.nivel}
                  </Badge>
                  <Badge variant="outline">
                    {logSelecionado.categoria}
                  </Badge>
                  {logSelecionado.statusCode && (
                    <Badge variant="outline">
                      HTTP {logSelecionado.statusCode}
                    </Badge>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Timestamp</Label>
                    <p className="text-sm font-mono">
                      {format(new Date(logSelecionado.timestamp), 'dd/MM/yyyy HH:mm:ss.SSS', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <Label>Ação</Label>
                    <p className="text-sm">{logSelecionado.acao}</p>
                  </div>
                  {logSelecionado.usuario && (
                    <div>
                      <Label>Usuário</Label>
                      <p className="text-sm">{logSelecionado.usuario}</p>
                    </div>
                  )}
                  <div>
                    <Label>Endereço IP</Label>
                    <p className="text-sm font-mono">{logSelecionado.ip}</p>
                  </div>
                  <div>
                    <Label>Dispositivo</Label>
                    <p className="text-sm">{logSelecionado.dispositivo}</p>
                  </div>
                  {logSelecionado.duracao && (
                    <div>
                      <Label>Duração</Label>
                      <p className="text-sm">{formatarDuracao(logSelecionado.duracao)}</p>
                    </div>
                  )}
                  {logSelecionado.recurso && (
                    <div className="md:col-span-2">
                      <Label>Recurso</Label>
                      <p className="text-sm font-mono">{logSelecionado.recurso}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Detalhes</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {logSelecionado.detalhes}
                  </p>
                </div>
                
                <div>
                  <Label>User Agent</Label>
                  <p className="text-xs font-mono bg-muted p-3 rounded-md break-all">
                    {logSelecionado.userAgent}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Log
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Contexto
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

export default AuditoriaLogs;