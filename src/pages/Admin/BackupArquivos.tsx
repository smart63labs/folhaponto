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
  HardDrive,
  Download,
  Upload,
  Archive,
  RefreshCw,
  Calendar,
  Clock,
  FileText,
  Folder,
  Database,
  Settings,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  Eye,
  CloudDownload,
  CloudUpload,
  Server,
  Shield,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Building,
  FileArchive,
  FolderOpen,
  Save,
  RotateCcw,
  Timer,
  Cpu,
  MemoryStick,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Calendar as CalendarIcon,
  Target,
  Layers,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface BackupJob {
  id: string;
  nome: string;
  tipo: 'completo' | 'incremental' | 'diferencial';
  status: 'agendado' | 'executando' | 'concluido' | 'erro' | 'pausado';
  ultimaExecucao?: string;
  proximaExecucao: string;
  tamanho?: number;
  duracao?: number;
  progresso?: number;
  destino: string;
  origem: string[];
  frequencia: 'diario' | 'semanal' | 'mensal' | 'manual';
  retencao: number; // dias
  compressao: boolean;
  criptografia: boolean;
  prioridade: 'baixa' | 'normal' | 'alta';
}

interface ArquivoBackup {
  id: string;
  nome: string;
  tamanho: number;
  dataCreacao: string;
  tipo: 'completo' | 'incremental' | 'diferencial';
  status: 'disponivel' | 'corrompido' | 'arquivado' | 'removido';
  localizacao: string;
  checksum: string;
  compressao: number; // percentual
  jobId: string;
  jobNome: string;
}

interface EstatisticaBackup {
  titulo: string;
  valor: number | string;
  variacao?: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

const BackupArquivos: React.FC = () => {
  const [tabAtiva, setTabAtiva] = useState('jobs');
  const [jobSelecionado, setJobSelecionado] = useState<BackupJob | null>(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<ArquivoBackup | null>(null);
  const [dialogNovoJob, setDialogNovoJob] = useState(false);
  const [dialogRestaurar, setDialogRestaurar] = useState(false);

  // Jobs de backup mockados
  const jobs: BackupJob[] = [
    {
      id: '1',
      nome: 'Backup Completo Sistema',
      tipo: 'completo',
      status: 'concluido',
      ultimaExecucao: '2024-01-15T02:00:00Z',
      proximaExecucao: '2024-01-16T02:00:00Z',
      tamanho: 15728640000, // 15GB
      duracao: 3600000, // 1 hora
      destino: '/backups/sistema/',
      origem: ['/var/www/', '/etc/', '/home/'],
      frequencia: 'diario',
      retencao: 30,
      compressao: true,
      criptografia: true,
      prioridade: 'alta'
    },
    {
      id: '2',
      nome: 'Backup Banco de Dados',
      tipo: 'completo',
      status: 'executando',
      ultimaExecucao: '2024-01-14T03:00:00Z',
      proximaExecucao: '2024-01-15T03:00:00Z',
      tamanho: 5368709120, // 5GB
      duracao: 1800000, // 30 min
      progresso: 65,
      destino: '/backups/database/',
      origem: ['/var/lib/postgresql/', '/var/lib/mysql/'],
      frequencia: 'diario',
      retencao: 60,
      compressao: true,
      criptografia: true,
      prioridade: 'alta'
    },
    {
      id: '3',
      nome: 'Backup Incremental Documentos',
      tipo: 'incremental',
      status: 'agendado',
      proximaExecucao: '2024-01-15T18:00:00Z',
      destino: '/backups/documentos/',
      origem: ['/uploads/', '/documents/'],
      frequencia: 'diario',
      retencao: 15,
      compressao: true,
      criptografia: false,
      prioridade: 'normal'
    },
    {
      id: '4',
      nome: 'Backup Logs Sistema',
      tipo: 'diferencial',
      status: 'erro',
      ultimaExecucao: '2024-01-14T23:00:00Z',
      proximaExecucao: '2024-01-15T23:00:00Z',
      destino: '/backups/logs/',
      origem: ['/var/log/'],
      frequencia: 'diario',
      retencao: 7,
      compressao: true,
      criptografia: false,
      prioridade: 'baixa'
    },
    {
      id: '5',
      nome: 'Backup Semanal Completo',
      tipo: 'completo',
      status: 'pausado',
      ultimaExecucao: '2024-01-08T01:00:00Z',
      proximaExecucao: '2024-01-15T01:00:00Z',
      tamanho: 25769803776, // 24GB
      duracao: 7200000, // 2 horas
      destino: '/backups/semanal/',
      origem: ['/'],
      frequencia: 'semanal',
      retencao: 90,
      compressao: true,
      criptografia: true,
      prioridade: 'normal'
    }
  ];

  // Arquivos de backup mockados
  const arquivos: ArquivoBackup[] = [
    {
      id: '1',
      nome: 'sistema_completo_20240115_020000.tar.gz',
      tamanho: 15728640000,
      dataCreacao: '2024-01-15T02:00:00Z',
      tipo: 'completo',
      status: 'disponivel',
      localizacao: '/backups/sistema/',
      checksum: 'sha256:a1b2c3d4e5f6...',
      compressao: 65,
      jobId: '1',
      jobNome: 'Backup Completo Sistema'
    },
    {
      id: '2',
      nome: 'database_20240115_030000.sql.gz',
      tamanho: 5368709120,
      dataCreacao: '2024-01-15T03:00:00Z',
      tipo: 'completo',
      status: 'disponivel',
      localizacao: '/backups/database/',
      checksum: 'sha256:f6e5d4c3b2a1...',
      compressao: 80,
      jobId: '2',
      jobNome: 'Backup Banco de Dados'
    },
    {
      id: '3',
      nome: 'documentos_inc_20240114_180000.tar.gz',
      tamanho: 1073741824,
      dataCreacao: '2024-01-14T18:00:00Z',
      tipo: 'incremental',
      status: 'disponivel',
      localizacao: '/backups/documentos/',
      checksum: 'sha256:b2c3d4e5f6a1...',
      compressao: 70,
      jobId: '3',
      jobNome: 'Backup Incremental Documentos'
    },
    {
      id: '4',
      nome: 'logs_diff_20240113_230000.tar.gz',
      tamanho: 536870912,
      dataCreacao: '2024-01-13T23:00:00Z',
      tipo: 'diferencial',
      status: 'corrompido',
      localizacao: '/backups/logs/',
      checksum: 'sha256:c3d4e5f6a1b2...',
      compressao: 85,
      jobId: '4',
      jobNome: 'Backup Logs Sistema'
    },
    {
      id: '5',
      nome: 'semanal_completo_20240108_010000.tar.gz',
      tamanho: 25769803776,
      dataCreacao: '2024-01-08T01:00:00Z',
      tipo: 'completo',
      status: 'arquivado',
      localizacao: '/backups/semanal/',
      checksum: 'sha256:d4e5f6a1b2c3...',
      compressao: 60,
      jobId: '5',
      jobNome: 'Backup Semanal Completo'
    }
  ];

  // Estatísticas
  const estatisticas: EstatisticaBackup[] = [
    {
      titulo: 'Jobs Ativos',
      valor: jobs.filter(j => j.status !== 'pausado').length,
      variacao: 0,
      icone: Activity,
      cor: 'text-blue-600',
      descricao: 'Jobs de backup configurados'
    },
    {
      titulo: 'Espaço Utilizado',
      valor: '47.2 GB',
      variacao: 12.5,
      icone: HardDrive,
      cor: 'text-green-600',
      descricao: 'Total de backups armazenados'
    },
    {
      titulo: 'Taxa de Sucesso',
      valor: '94.2%',
      variacao: 2.1,
      icone: CheckCircle,
      cor: 'text-green-600',
      descricao: 'Últimos 30 dias'
    },
    {
      titulo: 'Próximo Backup',
      valor: '2h 15m',
      icone: Clock,
      cor: 'text-orange-600',
      descricao: 'Backup Completo Sistema'
    }
  ];

  const formatarTamanho = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatarDuracao = (ms: number) => {
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      agendado: 'bg-blue-100 text-blue-800',
      executando: 'bg-yellow-100 text-yellow-800',
      concluido: 'bg-green-100 text-green-800',
      erro: 'bg-red-100 text-red-800',
      pausado: 'bg-gray-100 text-gray-800',
      disponivel: 'bg-green-100 text-green-800',
      corrompido: 'bg-red-100 text-red-800',
      arquivado: 'bg-blue-100 text-blue-800',
      removido: 'bg-gray-100 text-gray-800'
    };
    
    return variants[status as keyof typeof variants] || variants.agendado;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      agendado: Clock3,
      executando: Play,
      concluido: CheckCircle2,
      erro: AlertCircle,
      pausado: Pause,
      disponivel: CheckCircle2,
      corrompido: AlertCircle,
      arquivado: Archive,
      removido: Trash2
    };
    
    return icons[status as keyof typeof icons] || Clock3;
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      completo: Package,
      incremental: Layers,
      diferencial: Target
    };
    
    return icons[tipo as keyof typeof icons] || Package;
  };

  const handleExecutarJob = (jobId: string) => {
    console.log('Executando job:', jobId);
    // Aqui seria implementada a lógica de execução
  };

  const handlePausarJob = (jobId: string) => {
    console.log('Pausando job:', jobId);
    // Aqui seria implementada a lógica de pausa
  };

  const handleRestaurarArquivo = (arquivoId: string) => {
    console.log('Restaurando arquivo:', arquivoId);
    setDialogRestaurar(true);
  };

  const handleDownloadArquivo = (arquivoId: string) => {
    console.log('Fazendo download do arquivo:', arquivoId);
    // Aqui seria implementada a lógica de download
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backup & Arquivos</h1>
            <p className="text-gray-600">Gerencie backups automáticos e restaure arquivos do sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jobs Ativos</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Jobs de backup configurados</p>
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
                  <p className="text-sm font-medium text-gray-600">Espaço Utilizado</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Total de backups armazenados</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <HardDrive className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximo Backup</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Backup Completo Sistema</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Jobs de Backup</TabsTrigger>
            <TabsTrigger value="arquivos">Arquivos de Backup</TabsTrigger>
            <TabsTrigger value="restauracao">Restauração</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab Jobs de Backup */}
          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Jobs de Backup</CardTitle>
                    <CardDescription>
                      Gerencie e monitore todos os jobs de backup configurados
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                    <Dialog open={dialogNovoJob} onOpenChange={setDialogNovoJob}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Archive className="mr-2 h-4 w-4" />
                          Novo Job
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Criar Novo Job de Backup</DialogTitle>
                          <DialogDescription>
                            Configure um novo job de backup automático
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label htmlFor="nome-job">Nome do Job</Label>
                              <Input id="nome-job" placeholder="Ex: Backup Diário Sistema" />
                            </div>
                            <div>
                              <Label htmlFor="tipo-backup">Tipo de Backup</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="completo">Completo</SelectItem>
                                  <SelectItem value="incremental">Incremental</SelectItem>
                                  <SelectItem value="diferencial">Diferencial</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="origem">Diretórios de Origem</Label>
                            <Textarea 
                              id="origem" 
                              placeholder="Digite os caminhos separados por linha&#10;Ex:&#10;/var/www/&#10;/etc/&#10;/home/"
                              rows={4}
                            />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label htmlFor="destino">Destino</Label>
                              <Input id="destino" placeholder="/backups/novo-job/" />
                            </div>
                            <div>
                              <Label htmlFor="frequencia">Frequência</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a frequência" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="diario">Diário</SelectItem>
                                  <SelectItem value="semanal">Semanal</SelectItem>
                                  <SelectItem value="mensal">Mensal</SelectItem>
                                  <SelectItem value="manual">Manual</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <Label htmlFor="retencao">Retenção (dias)</Label>
                              <Input id="retencao" type="number" placeholder="30" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="compressao" />
                              <Label htmlFor="compressao">Compressão</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="criptografia" />
                              <Label htmlFor="criptografia">Criptografia</Label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setDialogNovoJob(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={() => setDialogNovoJob(false)}>
                              Criar Job
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
                  {jobs.map((job) => {
                    const StatusIcon = getStatusIcon(job.status);
                    const TipoIcon = getTipoIcon(job.tipo);
                    
                    return (
                      <Card key={job.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <TipoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium">{job.nome}</h3>
                                  <Badge className={getStatusBadge(job.status)}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {job.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {job.tipo}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {job.frequencia}
                                  </Badge>
                                </div>
                                
                                {job.status === 'executando' && job.progresso && (
                                  <div className="mb-2">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span>Progresso</span>
                                      <span>{job.progresso}%</span>
                                    </div>
                                    <Progress value={job.progresso} className="h-2" />
                                  </div>
                                )}
                                
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <FolderOpen className="h-3 w-3" />
                                      <span>{job.origem.length} diretório(s)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <HardDrive className="h-3 w-3" />
                                      <span>{job.destino}</span>
                                    </div>
                                    {job.tamanho && (
                                      <div className="flex items-center gap-1">
                                        <Archive className="h-3 w-3" />
                                        <span>{formatarTamanho(job.tamanho)}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {job.ultimaExecucao && (
                                      <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>
                                          Último: {format(new Date(job.ultimaExecucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      <span>
                                        Próximo: {format(new Date(job.proximaExecucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                      </span>
                                    </div>
                                    {job.duracao && (
                                      <div className="flex items-center gap-1">
                                        <Timer className="h-3 w-3" />
                                        <span>{formatarDuracao(job.duracao)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {job.status === 'agendado' && (
                                <Button variant="ghost" size="sm" onClick={() => handleExecutarJob(job.id)}>
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              {job.status === 'executando' && (
                                <Button variant="ghost" size="sm" onClick={() => handlePausarJob(job.id)}>
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}
                              {job.status === 'pausado' && (
                                <Button variant="ghost" size="sm" onClick={() => handleExecutarJob(job.id)}>
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => setJobSelecionado(job)}>
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

          {/* Tab Arquivos de Backup */}
          <TabsContent value="arquivos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Arquivos de Backup</CardTitle>
                    <CardDescription>
                      Visualize e gerencie todos os arquivos de backup armazenados
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {arquivos.map((arquivo) => {
                    const StatusIcon = getStatusIcon(arquivo.status);
                    const TipoIcon = getTipoIcon(arquivo.tipo);
                    
                    return (
                      <Card key={arquivo.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <FileArchive className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium font-mono text-sm">{arquivo.nome}</h3>
                                  <Badge className={getStatusBadge(arquivo.status)}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {arquivo.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <TipoIcon className="h-3 w-3 mr-1" />
                                    {arquivo.tipo}
                                  </Badge>
                                </div>
                                
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Archive className="h-3 w-3" />
                                      <span>{formatarTamanho(arquivo.tamanho)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      <span>
                                        {format(new Date(arquivo.dataCreacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      <span>Compressão: {arquivo.compressao}%</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <FolderOpen className="h-3 w-3" />
                                      <span>{arquivo.localizacao}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Settings className="h-3 w-3" />
                                      <span>{arquivo.jobNome}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    <span className="font-mono text-xs">{arquivo.checksum}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {arquivo.status === 'disponivel' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleRestaurarArquivo(arquivo.id)}>
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDownloadArquivo(arquivo.id)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => setArquivoSelecionado(arquivo)}>
                                <Eye className="h-4 w-4" />
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

          {/* Tab Restauração */}
          <TabsContent value="restauracao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Restauração de Arquivos</CardTitle>
                <CardDescription>
                  Restaure arquivos e diretórios a partir dos backups disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <RotateCcw className="h-12 w-12 mx-auto mb-4" />
                  <p>Interface de restauração será implementada aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Backup</CardTitle>
                <CardDescription>
                  Configure parâmetros globais do sistema de backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Configurações de backup serão implementadas aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para restauração */}
        <Dialog open={dialogRestaurar} onOpenChange={setDialogRestaurar}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Restaurar Arquivo</DialogTitle>
              <DialogDescription>
                Configure os parâmetros de restauração do backup selecionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="destino-restauracao">Destino da Restauração</Label>
                <Input id="destino-restauracao" placeholder="/caminho/para/restauracao/" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="sobrescrever" />
                <Label htmlFor="sobrescrever">Sobrescrever arquivos existentes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="preservar-permissoes" />
                <Label htmlFor="preservar-permissoes">Preservar permissões originais</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogRestaurar(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setDialogRestaurar(false)}>
                  Iniciar Restauração
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BackupArquivos;