import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  FileText, 
  Database,
  Calendar,
  Users,
  Clock,
  Filter,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FileJson
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface ExportTemplate {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'frequencia' | 'usuarios' | 'jornadas' | 'relatorios' | 'auditoria';
  formato: 'xlsx' | 'csv' | 'json' | 'pdf';
  campos: string[];
  filtros: any;
  agendamento?: {
    ativo: boolean;
    frequencia: 'diario' | 'semanal' | 'mensal';
    horario: string;
    proximaExecucao: string;
  };
  ultimaExecucao?: string;
  status: 'ativo' | 'inativo';
  criadoPor: string;
  dataCriacao: string;
}

interface ExportJob {
  id: string;
  template: string;
  status: 'executando' | 'concluido' | 'erro' | 'agendado';
  progresso: number;
  dataInicio: string;
  dataFim?: string;
  arquivo?: string;
  tamanho?: string;
  erro?: string;
}

const ExportarDados: React.FC = () => {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    nome: '',
    descricao: '',
    tipo: 'frequencia',
    formato: 'xlsx',
    campos: [] as string[],
    agendamento: {
      ativo: false,
      frequencia: 'mensal',
      horario: '08:00'
    }
  });

  // Mock data - em produção viria da API
  const [templates] = useState<ExportTemplate[]>([
    {
      id: '1',
      nome: 'Relatório Mensal de Frequência',
      descricao: 'Exportação completa das frequências mensais de todos os servidores',
      tipo: 'frequencia',
      formato: 'xlsx',
      campos: ['nome', 'matricula', 'departamento', 'horasTrabalhas', 'faltas', 'atrasos'],
      filtros: { periodo: 'mensal', departamento: 'todos' },
      agendamento: {
        ativo: true,
        frequencia: 'mensal',
        horario: '08:00',
        proximaExecucao: '2024-02-01T08:00:00Z'
      },
      ultimaExecucao: '2024-01-01T08:00:00Z',
      status: 'ativo',
      criadoPor: 'admin_protocolo@sefaz.to.gov.br',
      dataCriacao: '2024-01-01'
    },
    {
      id: '2',
      nome: 'Lista de Usuários Ativos',
      descricao: 'Exportação de todos os usuários ativos do sistema',
      tipo: 'usuarios',
      formato: 'csv',
      campos: ['nome', 'email', 'role', 'departamento', 'dataUltimoLogin'],
      filtros: { status: 'ativo' },
      ultimaExecucao: '2024-01-15T14:30:00Z',
      status: 'ativo',
      criadoPor: 'maria.silva@sefaz.to.gov.br',
      dataCriacao: '2024-01-05'
    },
    {
      id: '3',
      nome: 'Configurações de Jornadas',
      descricao: 'Backup das configurações de jornadas de trabalho',
      tipo: 'jornadas',
      formato: 'json',
      campos: ['nome', 'tipo', 'horaInicio', 'horaFim', 'intervalos', 'servidoresVinculados'],
      filtros: { status: 'ativa' },
      agendamento: {
        ativo: true,
        frequencia: 'semanal',
        horario: '02:00',
        proximaExecucao: '2024-01-22T02:00:00Z'
      },
      ultimaExecucao: '2024-01-15T02:00:00Z',
      status: 'ativo',
      criadoPor: 'joao.santos@sefaz.to.gov.br',
      dataCriacao: '2024-01-03'
    }
  ]);

  const [jobs] = useState<ExportJob[]>([
    {
      id: '1',
      template: 'Relatório Mensal de Frequência',
      status: 'concluido',
      progresso: 100,
      dataInicio: '2024-01-15T08:00:00Z',
      dataFim: '2024-01-15T08:05:30Z',
      arquivo: 'relatorio_frequencia_janeiro_2024.xlsx',
      tamanho: '2.5 MB'
    },
    {
      id: '2',
      template: 'Lista de Usuários Ativos',
      status: 'executando',
      progresso: 65,
      dataInicio: '2024-01-15T14:30:00Z'
    },
    {
      id: '3',
      template: 'Configurações de Jornadas',
      status: 'agendado',
      progresso: 0,
      dataInicio: '2024-01-22T02:00:00Z'
    },
    {
      id: '4',
      template: 'Relatório Mensal de Frequência',
      status: 'erro',
      progresso: 45,
      dataInicio: '2024-01-14T08:00:00Z',
      dataFim: '2024-01-14T08:02:15Z',
      erro: 'Erro na conexão com o banco de dados'
    }
  ]);

  const getTipoIcon = (tipo: string) => {
    const icons = {
      frequencia: Clock,
      usuarios: Users,
      jornadas: Calendar,
      relatorios: FileText,
      auditoria: Database
    };
    return icons[tipo as keyof typeof icons] || FileText;
  };

  const getFormatoIcon = (formato: string) => {
    const icons = {
      xlsx: FileSpreadsheet,
      csv: FileSpreadsheet,
      json: FileJson,
      pdf: FileText
    };
    return icons[formato as keyof typeof icons] || FileText;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getJobStatusBadge = (status: string) => {
    const statusConfig = {
      executando: { label: 'Executando', color: 'bg-blue-100 text-blue-800', icon: Play },
      concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      erro: { label: 'Erro', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      agendado: { label: 'Agendado', color: 'bg-yellow-100 text-yellow-800', icon: Calendar }
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

  const handleCreateTemplate = () => {
    console.log('Criar template:', newTemplate);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      nome: '',
      descricao: '',
      tipo: 'frequencia',
      formato: 'xlsx',
      campos: [],
      agendamento: {
        ativo: false,
        frequencia: 'mensal',
        horario: '08:00'
      }
    });
  };

  const handleExecuteTemplate = (templateId: string) => {
    console.log('Executar template:', templateId);
  };

  const handleDownloadFile = (arquivo: string) => {
    console.log('Download arquivo:', arquivo);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  const camposDisponiveis = {
    frequencia: ['nome', 'matricula', 'departamento', 'horasTrabalhas', 'faltas', 'atrasos', 'horasExtras'],
    usuarios: ['nome', 'email', 'role', 'departamento', 'dataUltimoLogin', 'status', 'dataCriacao'],
    jornadas: ['nome', 'tipo', 'horaInicio', 'horaFim', 'intervalos', 'servidoresVinculados', 'cargaHoraria'],
    relatorios: ['titulo', 'tipo', 'dataCriacao', 'criadoPor', 'tamanho', 'downloads'],
    auditoria: ['timestamp', 'usuario', 'acao', 'modulo', 'ip', 'status', 'detalhes']
  };

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exportar Dados</h1>
            <p className="text-gray-600">Gerencie exportações e relatórios de dados do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Template de Exportação</DialogTitle>
                  <DialogDescription>
                    Configure um novo template para exportação automática de dados.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={newTemplate.nome}
                      onChange={(e) => setNewTemplate({...newTemplate, nome: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="descricao" className="text-right">
                      Descrição
                    </Label>
                    <Textarea
                      id="descricao"
                      value={newTemplate.descricao}
                      onChange={(e) => setNewTemplate({...newTemplate, descricao: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tipo" className="text-right">
                      Tipo de Dados
                    </Label>
                    <Select value={newTemplate.tipo} onValueChange={(value) => setNewTemplate({...newTemplate, tipo: value as any})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frequencia">Frequência</SelectItem>
                        <SelectItem value="usuarios">Usuários</SelectItem>
                        <SelectItem value="jornadas">Jornadas</SelectItem>
                        <SelectItem value="relatorios">Relatórios</SelectItem>
                        <SelectItem value="auditoria">Auditoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formato" className="text-right">
                      Formato
                    </Label>
                    <Select value={newTemplate.formato} onValueChange={(value) => setNewTemplate({...newTemplate, formato: value as any})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                        <SelectItem value="json">JSON (.json)</SelectItem>
                        <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">Campos</Label>
                    <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto">
                      {camposDisponiveis[newTemplate.tipo as keyof typeof camposDisponiveis]?.map((campo) => (
                        <div key={campo} className="flex items-center space-x-2">
                          <Checkbox
                            id={campo}
                            checked={newTemplate.campos.includes(campo)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewTemplate({
                                  ...newTemplate,
                                  campos: [...newTemplate.campos, campo]
                                });
                              } else {
                                setNewTemplate({
                                  ...newTemplate,
                                  campos: newTemplate.campos.filter(c => c !== campo)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={campo} className="text-sm">
                            {campo}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Agendamento</Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newTemplate.agendamento.ativo}
                          onCheckedChange={(checked) => 
                            setNewTemplate({
                              ...newTemplate,
                              agendamento: { ...newTemplate.agendamento, ativo: checked }
                            })
                          }
                        />
                        <Label>Ativar agendamento automático</Label>
                      </div>
                      {newTemplate.agendamento.ativo && (
                        <div className="flex gap-2">
                          <Select 
                            value={newTemplate.agendamento.frequencia} 
                            onValueChange={(value) => 
                              setNewTemplate({
                                ...newTemplate,
                                agendamento: { ...newTemplate.agendamento, frequencia: value as any }
                              })
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diario">Diário</SelectItem>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="mensal">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="time"
                            value={newTemplate.agendamento.horario}
                            onChange={(e) => 
                              setNewTemplate({
                                ...newTemplate,
                                agendamento: { ...newTemplate.agendamento, horario: e.target.value }
                              })
                            }
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateTemplate}>
                    Criar Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Templates Ativos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {templates.filter(t => t.status === 'ativo').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Templates configurados</p>
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
                  <p className="text-sm font-medium text-gray-600">Execuções Hoje</p>
                  <p className="text-3xl font-bold text-green-600">
                    {jobs.filter(j => new Date(j.dataInicio).toDateString() === new Date().toDateString()).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Exportações realizadas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Play className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Execução</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {jobs.filter(j => j.status === 'executando').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Processos ativos</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Database className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Agendados</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {jobs.filter(j => j.status === 'agendado').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Execução automática</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Templates de Exportação</CardTitle>
            <CardDescription>
              Gerencie seus templates de exportação de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Última Execução</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => {
                  const TipoIcon = getTipoIcon(template.tipo);
                  const FormatoIcon = getFormatoIcon(template.formato);
                  
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.nome}</div>
                          <div className="text-sm text-gray-500">{template.descricao}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TipoIcon className="w-4 h-4" />
                          <span className="capitalize">{template.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FormatoIcon className="w-4 h-4" />
                          <span className="uppercase">{template.formato}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {template.agendamento ? (
                          <div className="text-sm">
                            <div className="font-medium capitalize">
                              {template.agendamento.frequencia}
                            </div>
                            <div className="text-gray-500">
                              {template.agendamento.horario}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Manual</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {template.ultimaExecucao ? (
                          <div className="text-sm">
                            {formatDateTime(template.ultimaExecucao)}
                          </div>
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(template.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleExecuteTemplate(template.id)}
                            title="Executar agora"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Configurar">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Execuções</CardTitle>
            <CardDescription>
              Acompanhe o status das exportações recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.template}</div>
                    </TableCell>
                    <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${job.progresso}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{job.progresso}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(job.dataInicio)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.dataFim ? (
                        <div className="text-sm">
                          {Math.round((new Date(job.dataFim).getTime() - new Date(job.dataInicio).getTime()) / 1000)}s
                        </div>
                      ) : job.status === 'executando' ? (
                        <div className="text-sm text-blue-600">Em andamento</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.arquivo ? (
                        <div className="text-sm">
                          <div className="font-medium">{job.arquivo}</div>
                          <div className="text-gray-500">{job.tamanho}</div>
                        </div>
                      ) : job.erro ? (
                        <div className="text-sm text-red-600">{job.erro}</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {job.arquivo && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadFile(job.arquivo!)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'executando' && (
                          <Button variant="ghost" size="sm" title="Pausar">
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExportarDados;