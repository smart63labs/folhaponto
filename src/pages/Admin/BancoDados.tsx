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
import { Progress } from '@/components/ui/progress';
import { 
  Database,
  Server,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
  Users,
  FileText,
  Table,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Minus,
  MoreHorizontal,
  Copy,
  Save,
  RotateCcw,
  Zap,
  Target,
  Shield,
  AlertCircle,
  CheckCircle2,
  Timer,
  Globe,
  Building,
  Archive,
  FolderOpen,
  FileArchive,
  Terminal,
  Code,
  Layers,
  Package,
  Network,
  Link,
  Unlink,
  Power,
  PowerOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface ConexaoBanco {
  id: string;
  nome: string;
  tipo: 'postgresql' | 'mysql' | 'oracle' | 'mongodb' | 'redis';
  host: string;
  porta: number;
  database: string;
  usuario: string;
  status: 'conectado' | 'desconectado' | 'erro' | 'manutencao';
  ultimaConexao: string;
  versao: string;
  ssl: boolean;
  pool: {
    ativo: number;
    maximo: number;
    idle: number;
  };
  metricas: {
    cpu: number;
    memoria: number;
    disco: number;
    conexoes: number;
    transacoes: number;
    latencia: number;
  };
}

interface TabelaBanco {
  id: string;
  nome: string;
  schema: string;
  registros: number;
  tamanho: number;
  ultimaAtualizacao: string;
  tipo: 'tabela' | 'view' | 'procedure' | 'function';
  indices: number;
  chavesPrimarias: string[];
  chavesEstrangeiras: string[];
}

interface QueryExecucao {
  id: string;
  query: string;
  status: 'executando' | 'concluida' | 'erro' | 'cancelada';
  inicioExecucao: string;
  duracao?: number;
  registrosAfetados?: number;
  erro?: string;
  usuario: string;
  conexao: string;
}

interface EstatisticaBanco {
  titulo: string;
  valor: number | string;
  variacao?: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

const BancoDados: React.FC = () => {
  const [tabAtiva, setTabAtiva] = useState('conexoes');
  const [conexaoSelecionada, setConexaoSelecionada] = useState<ConexaoBanco | null>(null);
  const [tabelaSelecionada, setTabelaSelecionada] = useState<TabelaBanco | null>(null);
  const [dialogNovaConexao, setDialogNovaConexao] = useState(false);
  const [dialogExecutarQuery, setDialogExecutarQuery] = useState(false);
  const [queryTexto, setQueryTexto] = useState('');

  // Conexões mockadas
  const conexoes: ConexaoBanco[] = [
    {
      id: '1',
      nome: 'Banco Principal',
      tipo: 'postgresql',
      host: 'localhost',
      porta: 5432,
      database: 'folha_ponto',
      usuario: 'admin',
      status: 'conectado',
      ultimaConexao: '2024-01-15T14:30:00Z',
      versao: '15.4',
      ssl: true,
      pool: {
        ativo: 8,
        maximo: 20,
        idle: 12
      },
      metricas: {
        cpu: 25.5,
        memoria: 68.2,
        disco: 45.8,
        conexoes: 15,
        transacoes: 1250,
        latencia: 12.5
      }
    },
    {
      id: '2',
      nome: 'Cache Redis',
      tipo: 'redis',
      host: 'localhost',
      porta: 6379,
      database: '0',
      usuario: 'default',
      status: 'conectado',
      ultimaConexao: '2024-01-15T14:25:00Z',
      versao: '7.0.11',
      ssl: false,
      pool: {
        ativo: 5,
        maximo: 10,
        idle: 5
      },
      metricas: {
        cpu: 15.2,
        memoria: 32.1,
        disco: 12.3,
        conexoes: 8,
        transacoes: 5680,
        latencia: 2.1
      }
    },
    {
      id: '3',
      nome: 'Backup Database',
      tipo: 'postgresql',
      host: 'backup-server',
      porta: 5432,
      database: 'folha_ponto_backup',
      usuario: 'backup_user',
      status: 'desconectado',
      ultimaConexao: '2024-01-15T02:00:00Z',
      versao: '15.4',
      ssl: true,
      pool: {
        ativo: 0,
        maximo: 5,
        idle: 0
      },
      metricas: {
        cpu: 0,
        memoria: 0,
        disco: 78.9,
        conexoes: 0,
        transacoes: 0,
        latencia: 0
      }
    },
    {
      id: '4',
      nome: 'Analytics DB',
      tipo: 'mongodb',
      host: 'analytics-cluster',
      porta: 27017,
      database: 'analytics',
      usuario: 'analytics_user',
      status: 'erro',
      ultimaConexao: '2024-01-15T13:45:00Z',
      versao: '6.0.8',
      ssl: true,
      pool: {
        ativo: 0,
        maximo: 15,
        idle: 0
      },
      metricas: {
        cpu: 0,
        memoria: 0,
        disco: 0,
        conexoes: 0,
        transacoes: 0,
        latencia: 0
      }
    }
  ];

  // Tabelas mockadas
  const tabelas: TabelaBanco[] = [
    {
      id: '1',
      nome: 'usuarios',
      schema: 'public',
      registros: 1250,
      tamanho: 2048576, // 2MB
      ultimaAtualizacao: '2024-01-15T14:20:00Z',
      tipo: 'tabela',
      indices: 5,
      chavesPrimarias: ['id'],
      chavesEstrangeiras: ['departamento_id', 'cargo_id']
    },
    {
      id: '2',
      nome: 'pontos',
      schema: 'public',
      registros: 45680,
      tamanho: 15728640, // 15MB
      ultimaAtualizacao: '2024-01-15T14:30:00Z',
      tipo: 'tabela',
      indices: 8,
      chavesPrimarias: ['id'],
      chavesEstrangeiras: ['usuario_id']
    },
    {
      id: '3',
      nome: 'departamentos',
      schema: 'public',
      registros: 25,
      tamanho: 32768, // 32KB
      ultimaAtualizacao: '2024-01-10T10:15:00Z',
      tipo: 'tabela',
      indices: 2,
      chavesPrimarias: ['id'],
      chavesEstrangeiras: []
    },
    {
      id: '4',
      nome: 'view_relatorio_mensal',
      schema: 'public',
      registros: 0,
      tamanho: 0,
      ultimaAtualizacao: '2024-01-15T08:00:00Z',
      tipo: 'view',
      indices: 0,
      chavesPrimarias: [],
      chavesEstrangeiras: []
    },
    {
      id: '5',
      nome: 'sp_calcular_horas',
      schema: 'public',
      registros: 0,
      tamanho: 4096, // 4KB
      ultimaAtualizacao: '2024-01-12T16:30:00Z',
      tipo: 'procedure',
      indices: 0,
      chavesPrimarias: [],
      chavesEstrangeiras: []
    }
  ];

  // Queries em execução mockadas
  const queries: QueryExecucao[] = [
    {
      id: '1',
      query: 'SELECT * FROM pontos WHERE data_ponto >= \'2024-01-01\' ORDER BY data_ponto DESC',
      status: 'executando',
      inicioExecucao: '2024-01-15T14:30:00Z',
      usuario: 'admin_protocolo@sefaz.to.gov.br',
      conexao: 'Banco Principal'
    },
    {
      id: '2',
      query: 'UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = 123',
      status: 'concluida',
      inicioExecucao: '2024-01-15T14:25:00Z',
      duracao: 150,
      registrosAfetados: 1,
      usuario: 'sistema@sefaz.to.gov.br',
      conexao: 'Banco Principal'
    },
    {
      id: '3',
      query: 'SELECT COUNT(*) FROM pontos WHERE usuario_id = 456 AND data_ponto BETWEEN \'2024-01-01\' AND \'2024-01-31\'',
      status: 'erro',
      inicioExecucao: '2024-01-15T14:20:00Z',
      duracao: 5000,
      erro: 'Timeout: Query execution exceeded 5 seconds',
      usuario: 'relatorio@sefaz.to.gov.br',
      conexao: 'Banco Principal'
    }
  ];

  // Estatísticas
  const estatisticas: EstatisticaBanco[] = [
    {
      titulo: 'Conexões Ativas',
      valor: conexoes.filter(c => c.status === 'conectado').length,
      variacao: 0,
      icone: Database,
      cor: 'text-blue-600',
      descricao: 'Bancos conectados'
    },
    {
      titulo: 'Queries/min',
      valor: '1.2K',
      variacao: 15.2,
      icone: Activity,
      cor: 'text-green-600',
      descricao: 'Média últimos 5 minutos'
    },
    {
      titulo: 'Latência Média',
      valor: '8.3ms',
      variacao: -12.5,
      icone: Zap,
      cor: 'text-green-600',
      descricao: 'Tempo de resposta'
    },
    {
      titulo: 'Uso de Memória',
      valor: '68.2%',
      variacao: 5.8,
      icone: MemoryStick,
      cor: 'text-orange-600',
      descricao: 'Banco principal'
    }
  ];

  const formatarTamanho = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatarDuracao = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    return `${minutos}m ${segundos}s`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      conectado: 'bg-green-100 text-green-800',
      desconectado: 'bg-gray-100 text-gray-800',
      erro: 'bg-red-100 text-red-800',
      manutencao: 'bg-yellow-100 text-yellow-800',
      executando: 'bg-blue-100 text-blue-800',
      concluida: 'bg-green-100 text-green-800',
      cancelada: 'bg-gray-100 text-gray-800'
    };
    
    return variants[status as keyof typeof variants] || variants.desconectado;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      conectado: CheckCircle2,
      desconectado: XCircle,
      erro: AlertCircle,
      manutencao: Settings,
      executando: Play,
      concluida: CheckCircle2,
      cancelada: Square
    };
    
    return icons[status as keyof typeof icons] || XCircle;
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      postgresql: Database,
      mysql: Database,
      oracle: Database,
      mongodb: Package,
      redis: MemoryStick,
      tabela: Table,
      view: Eye,
      procedure: Code,
      function: Terminal
    };
    
    return icons[tipo as keyof typeof icons] || Database;
  };

  const handleConectar = (conexaoId: string) => {
    console.log('Conectando ao banco:', conexaoId);
    // Aqui seria implementada a lógica de conexão
  };

  const handleDesconectar = (conexaoId: string) => {
    console.log('Desconectando do banco:', conexaoId);
    // Aqui seria implementada a lógica de desconexão
  };

  const handleExecutarQuery = () => {
    console.log('Executando query:', queryTexto);
    setDialogExecutarQuery(false);
    setQueryTexto('');
    // Aqui seria implementada a lógica de execução da query
  };

  const handleCancelarQuery = (queryId: string) => {
    console.log('Cancelando query:', queryId);
    // Aqui seria implementada a lógica de cancelamento
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banco de Dados</h1>
            <p className="text-gray-600">Monitore e gerencie as conexões e operações do banco de dados</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conexões Ativas</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Bancos conectados</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Queries/min</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Média últimos 5 minutos</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Latência Média</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Tempo de resposta</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uso de Memória</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Banco principal</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <MemoryStick className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
          <TabsList>
            <TabsTrigger value="conexoes">Conexões</TabsTrigger>
            <TabsTrigger value="tabelas">Tabelas & Estrutura</TabsTrigger>
            <TabsTrigger value="queries">Queries em Execução</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          </TabsList>

          {/* Tab Conexões */}
          <TabsContent value="conexoes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Conexões de Banco de Dados</CardTitle>
                    <CardDescription>
                      Gerencie e monitore todas as conexões de banco de dados
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                    <Dialog open={dialogNovaConexao} onOpenChange={setDialogNovaConexao}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Conexão
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Criar Nova Conexão</DialogTitle>
                          <DialogDescription>
                            Configure uma nova conexão de banco de dados
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label htmlFor="nome-conexao">Nome da Conexão</Label>
                              <Input id="nome-conexao" placeholder="Ex: Banco Produção" />
                            </div>
                            <div>
                              <Label htmlFor="tipo-banco">Tipo de Banco</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                                  <SelectItem value="mysql">MySQL</SelectItem>
                                  <SelectItem value="oracle">Oracle</SelectItem>
                                  <SelectItem value="mongodb">MongoDB</SelectItem>
                                  <SelectItem value="redis">Redis</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <Label htmlFor="host">Host</Label>
                              <Input id="host" placeholder="localhost" />
                            </div>
                            <div>
                              <Label htmlFor="porta">Porta</Label>
                              <Input id="porta" type="number" placeholder="5432" />
                            </div>
                            <div>
                              <Label htmlFor="database">Database</Label>
                              <Input id="database" placeholder="nome_database" />
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label htmlFor="usuario">Usuário</Label>
                              <Input id="usuario" placeholder="usuario_db" />
                            </div>
                            <div>
                              <Label htmlFor="senha">Senha</Label>
                              <Input id="senha" type="password" placeholder="••••••••" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="ssl" />
                            <Label htmlFor="ssl">Usar SSL</Label>
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setDialogNovaConexao(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={() => setDialogNovaConexao(false)}>
                              Testar & Salvar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conexoes.map((conexao) => {
                    const StatusIcon = getStatusIcon(conexao.status);
                    const TipoIcon = getTipoIcon(conexao.tipo);
                    
                    return (
                      <Card key={conexao.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <TipoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{conexao.nome}</h3>
                                  <Badge className={getStatusBadge(conexao.status)}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {conexao.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {conexao.tipo} {conexao.versao}
                                  </Badge>
                                  {conexao.ssl && (
                                    <Badge variant="outline" className="text-xs">
                                      <Lock className="h-3 w-3 mr-1" />
                                      SSL
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Server className="h-3 w-3" />
                                      <span>{conexao.host}:{conexao.porta}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Database className="h-3 w-3" />
                                      <span>{conexao.database}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{conexao.usuario}</span>
                                    </div>
                                  </div>
                                  
                                  {conexao.status === 'conectado' && (
                                    <>
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                          <Activity className="h-3 w-3" />
                                          <span>Pool: {conexao.pool.ativo}/{conexao.pool.maximo}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Cpu className="h-3 w-3" />
                                          <span>CPU: {conexao.metricas.cpu}%</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MemoryStick className="h-3 w-3" />
                                          <span>RAM: {conexao.metricas.memoria}%</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Zap className="h-3 w-3" />
                                          <span>{conexao.metricas.latencia}ms</span>
                                        </div>
                                      </div>
                                      
                                      <div className="grid gap-2 md:grid-cols-3">
                                        <div>
                                          <div className="flex items-center justify-between text-xs mb-1">
                                            <span>CPU</span>
                                            <span>{conexao.metricas.cpu}%</span>
                                          </div>
                                          <Progress value={conexao.metricas.cpu} className="h-1" />
                                        </div>
                                        <div>
                                          <div className="flex items-center justify-between text-xs mb-1">
                                            <span>Memória</span>
                                            <span>{conexao.metricas.memoria}%</span>
                                          </div>
                                          <Progress value={conexao.metricas.memoria} className="h-1" />
                                        </div>
                                        <div>
                                          <div className="flex items-center justify-between text-xs mb-1">
                                            <span>Disco</span>
                                            <span>{conexao.metricas.disco}%</span>
                                          </div>
                                          <Progress value={conexao.metricas.disco} className="h-1" />
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      Última conexão: {format(new Date(conexao.ultimaConexao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {conexao.status === 'desconectado' && (
                                <Button variant="ghost" size="sm" onClick={() => handleConectar(conexao.id)}>
                                  <Power className="h-4 w-4" />
                                </Button>
                              )}
                              {conexao.status === 'conectado' && (
                                <Button variant="ghost" size="sm" onClick={() => handleDesconectar(conexao.id)}>
                                  <PowerOff className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => setConexaoSelecionada(conexao)}>
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Tabelas & Estrutura */}
          <TabsContent value="tabelas" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tabelas & Estrutura do Banco</CardTitle>
                    <CardDescription>
                      Visualize e gerencie a estrutura do banco de dados
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tabelas.map((tabela) => {
                    const TipoIcon = getTipoIcon(tabela.tipo);
                    
                    return (
                      <Card key={tabela.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <TipoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium font-mono">{tabela.schema}.{tabela.nome}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {tabela.tipo}
                                  </Badge>
                                </div>
                                
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    {tabela.registros > 0 && (
                                      <div className="flex items-center gap-1">
                                        <BarChart3 className="h-3 w-3" />
                                        <span>{tabela.registros.toLocaleString()} registros</span>
                                      </div>
                                    )}
                                    {tabela.tamanho > 0 && (
                                      <div className="flex items-center gap-1">
                                        <HardDrive className="h-3 w-3" />
                                        <span>{formatarTamanho(tabela.tamanho)}</span>
                                      </div>
                                    )}
                                    {tabela.indices > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        <span>{tabela.indices} índices</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {(tabela.chavesPrimarias.length > 0 || tabela.chavesEstrangeiras.length > 0) && (
                                    <div className="flex items-center gap-4">
                                      {tabela.chavesPrimarias.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Key className="h-3 w-3" />
                                          <span>PK: {tabela.chavesPrimarias.join(', ')}</span>
                                        </div>
                                      )}
                                      {tabela.chavesEstrangeiras.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Link className="h-3 w-3" />
                                          <span>FK: {tabela.chavesEstrangeiras.join(', ')}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      Atualizada: {format(new Date(tabela.ultimaAtualizacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setTabelaSelecionada(tabela)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Queries em Execução */}
          <TabsContent value="queries" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Queries em Execução</CardTitle>
                    <CardDescription>
                      Monitore e gerencie queries ativas no banco de dados
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                    <Dialog open={dialogExecutarQuery} onOpenChange={setDialogExecutarQuery}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Terminal className="mr-2 h-4 w-4" />
                          Executar Query
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Executar Query SQL</DialogTitle>
                          <DialogDescription>
                            Execute comandos SQL diretamente no banco de dados
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="conexao-query">Conexão</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a conexão" />
                              </SelectTrigger>
                              <SelectContent>
                                {conexoes.filter(c => c.status === 'conectado').length === 0 ? (
                                  <SelectItem value="none" disabled>Nenhuma conexão disponível</SelectItem>
                                ) : (
                                  conexoes
                                    .filter(c => c.status === 'conectado')
                                    .map(conexao => (
                                      <SelectItem key={conexao.id} value={conexao.id}>
                                        {conexao.nome} ({conexao.database})
                                      </SelectItem>
                                    ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="query-sql">Query SQL</Label>
                            <Textarea 
                              id="query-sql"
                              value={queryTexto}
                              onChange={(e) => setQueryTexto(e.target.value)}
                              placeholder="Digite sua query SQL aqui..."
                              rows={10}
                              className="font-mono"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setDialogExecutarQuery(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleExecutarQuery} disabled={!queryTexto.trim()}>
                              <Play className="mr-2 h-4 w-4" />
                              Executar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queries.map((query) => {
                    const StatusIcon = getStatusIcon(query.status);
                    
                    return (
                      <Card key={query.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <Terminal className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getStatusBadge(query.status)}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {query.status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {query.conexao}
                                  </span>
                                </div>
                                
                                <div className="bg-muted p-3 rounded-md mb-2">
                                  <code className="text-sm font-mono">
                                    {query.query.length > 100 
                                      ? `${query.query.substring(0, 100)}...` 
                                      : query.query
                                    }
                                  </code>
                                </div>
                                
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{query.usuario}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        Iniciada: {format(new Date(query.inicioExecucao), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                      </span>
                                    </div>
                                    {query.duracao && (
                                      <div className="flex items-center gap-1">
                                        <Timer className="h-3 w-3" />
                                        <span>Duração: {formatarDuracao(query.duracao)}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {query.registrosAfetados !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <BarChart3 className="h-3 w-3" />
                                      <span>{query.registrosAfetados} registros afetados</span>
                                    </div>
                                  )}
                                  
                                  {query.erro && (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>{query.erro}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {query.status === 'executando' && (
                                <Button variant="ghost" size="sm" onClick={() => handleCancelarQuery(query.id)}>
                                  <Square className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Performance */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monitoramento de Performance</CardTitle>
                <CardDescription>
                  Analise métricas de performance e otimização do banco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Métricas de performance serão implementadas aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Manutenção */}
          <TabsContent value="manutencao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manutenção do Banco</CardTitle>
                <CardDescription>
                  Execute tarefas de manutenção e otimização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Ferramentas de manutenção serão implementadas aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BancoDados;