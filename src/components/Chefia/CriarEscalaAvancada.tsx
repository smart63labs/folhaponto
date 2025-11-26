import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Draggable } from "@/components/DragDrop/Draggable";
import { Droppable } from "@/components/DragDrop/Droppable";
import { DragDropProvider } from "@/contexts/DragDropContext";
import { VisualizadorEscala } from './VisualizadorEscala';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Save,
  Eye,
  Settings,
  UserCheck,
  Timer,
  Building,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  CheckCircle,
  X,
  Zap,
  Target,
  TrendingUp,
  Award,
  Shield,
  Lightbulb,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  SortAsc,
  MoreHorizontal,
  Info
} from "lucide-react";

// Interfaces
interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  telefone?: string;
  email?: string;
  habilidades: string[];
  disponibilidade: {
    [key: string]: boolean; // dias da semana
  };
  preferencias: {
    turnoPreferido: string;
    horasMaximas: number;
    folgas: string[];
  };
  status: 'ativo' | 'inativo' | 'ferias' | 'licenca';
  avaliacaoDesempenho: number; // 1-5
}

interface Turno {
  id: string;
  nome: string;
  horaInicio: string;
  horaFim: string;
  intervalo?: {
    inicio: string;
    fim: string;
  };
  cor: string;
  capacidadeMinima: number;
  capacidadeMaxima: number;
  descricao?: string;
}

interface Local {
  id: string;
  nome: string;
  endereco: string;
  capacidade: number;
  equipamentos: string[];
  responsavel?: string;
}

interface EscalaAvancada {
  id: string;
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  tipo: 'semanal' | 'mensal' | 'personalizada';
  status: 'rascunho' | 'ativa' | 'pausada' | 'concluida';
  turnos: Turno[];
  locais: Local[];
  funcionarios: Funcionario[];
  alocacoes: {
    [data: string]: {
      [turnoId: string]: {
        [localId: string]: string[]; // IDs dos funcionários
      };
    };
  };
  regras: {
    horasMaximasPorDia: number;
    horasMaximasPorSemana: number;
    intervalosObrigatorios: boolean;
    folgas: {
      minimasPorSemana: number;
      consecutivasMaximas: number;
    };
    substituicoes: {
      automaticas: boolean;
      notificarGestor: boolean;
    };
  };
  notificacoes: {
    antecedencia: number; // dias
    lembretes: boolean;
    mudancas: boolean;
  };
}

interface CriarEscalaAvancadaProps {
  isOpen: boolean;
  onClose: () => void;
  onEscalaCriada: (escala: EscalaAvancada) => void;
  funcionariosDisponiveis?: Funcionario[];
  turnosExistentes?: Turno[];
  locaisExistentes?: Local[];
}

export const CriarEscalaAvancada: React.FC<CriarEscalaAvancadaProps> = ({
  isOpen,
  onClose,
  onEscalaCriada,
  funcionariosDisponiveis = [],
  turnosExistentes = [],
  locaisExistentes = []
}) => {
  // Estados principais
  const [escala, setEscala] = useState<Partial<EscalaAvancada>>({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    tipo: 'semanal',
    status: 'rascunho',
    turnos: [],
    locais: [],
    funcionarios: [],
    alocacoes: {},
    regras: {
      horasMaximasPorDia: 8,
      horasMaximasPorSemana: 40,
      intervalosObrigatorios: true,
      folgas: {
        minimasPorSemana: 1,
        consecutivasMaximas: 2
      },
      substituicoes: {
        automaticas: false,
        notificarGestor: true
      }
    },
    notificacoes: {
      antecedencia: 7,
      lembretes: true,
      mudancas: true
    }
  });

  const [tabAtiva, setTabAtiva] = useState('informacoes');
  const [isVisualizadorOpen, setIsVisualizadorOpen] = useState(false);
  const [filtroFuncionarios, setFiltroFuncionarios] = useState('');
  const [ordenacaoFuncionarios, setOrdenacaoFuncionarios] = useState<'nome' | 'cargo' | 'avaliacao'>('nome');
  const [progresso, setProgresso] = useState(0);
  const [validacoes, setValidacoes] = useState<string[]>([]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState<Funcionario[]>([]);
  const [turnosSelecionados, setTurnosSelecionados] = useState<Turno[]>([]);
  const [locaisSelecionados, setLocaisSelecionados] = useState<Local[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [turnoSelecionado, setTurnoSelecionado] = useState('');
  const [localSelecionado, setLocalSelecionado] = useState('');

  // Dados mock para demonstração
  const funcionariosMock: Funcionario[] = [
    {
      id: '1',
      nome: 'Maria Silva',
      cargo: 'Analista',
      departamento: 'TI',
      telefone: '(63) 99999-1111',
      email: 'maria@sefaz.to.gov.br',
      habilidades: ['JavaScript', 'React', 'Node.js'],
      disponibilidade: {
        segunda: true,
        terca: true,
        quarta: true,
        quinta: true,
        sexta: true,
        sabado: false,
        domingo: false
      },
      preferencias: {
        turnoPreferido: 'Manhã',
        horasMaximas: 8,
        folgas: ['sabado', 'domingo']
      },
      status: 'ativo',
      avaliacaoDesempenho: 5
    },
    {
      id: '2',
      nome: 'João Santos',
      cargo: 'Coordenador',
      departamento: 'Fiscal',
      telefone: '(63) 99999-2222',
      email: 'joao@sefaz.to.gov.br',
      habilidades: ['Liderança', 'Auditoria', 'Gestão'],
      disponibilidade: {
        segunda: true,
        terca: true,
        quarta: true,
        quinta: true,
        sexta: true,
        sabado: true,
        domingo: false
      },
      preferencias: {
        turnoPreferido: 'Tarde',
        horasMaximas: 10,
        folgas: ['domingo']
      },
      status: 'ativo',
      avaliacaoDesempenho: 4
    },
    {
      id: '3',
      nome: 'Ana Costa',
      cargo: 'Técnica',
      departamento: 'Arrecadação',
      telefone: '(63) 99999-3333',
      email: 'ana@sefaz.to.gov.br',
      habilidades: ['Atendimento', 'Sistemas', 'Processos'],
      disponibilidade: {
        segunda: true,
        terca: true,
        quarta: false,
        quinta: true,
        sexta: true,
        sabado: false,
        domingo: false
      },
      preferencias: {
        turnoPreferido: 'Manhã',
        horasMaximas: 6,
        folgas: ['quarta', 'sabado', 'domingo']
      },
      status: 'ativo',
      avaliacaoDesempenho: 4
    }
  ];

  const turnosMock: Turno[] = [
    {
      id: '1',
      nome: 'Manhã',
      horaInicio: '08:00',
      horaFim: '12:00',
      intervalo: { inicio: '10:00', fim: '10:15' },
      cor: '#3B82F6',
      capacidadeMinima: 2,
      capacidadeMaxima: 5,
      descricao: 'Turno matutino padrão'
    },
    {
      id: '2',
      nome: 'Tarde',
      horaInicio: '14:00',
      horaFim: '18:00',
      intervalo: { inicio: '16:00', fim: '16:15' },
      cor: '#F59E0B',
      capacidadeMinima: 2,
      capacidadeMaxima: 4,
      descricao: 'Turno vespertino padrão'
    },
    {
      id: '3',
      nome: 'Noite',
      horaInicio: '20:00',
      horaFim: '00:00',
      cor: '#6366F1',
      capacidadeMinima: 1,
      capacidadeMaxima: 3,
      descricao: 'Turno noturno'
    }
  ];

  const locaisMock: Local[] = [
    {
      id: '1',
      nome: 'Sede Principal',
      endereco: 'Palmas - TO',
      capacidade: 20,
      equipamentos: ['Computadores', 'Impressoras', 'Telefones'],
      responsavel: 'Maria Silva'
    },
    {
      id: '2',
      nome: 'Posto Fiscal Norte',
      endereco: 'Araguaína - TO',
      capacidade: 10,
      equipamentos: ['Computadores', 'Scanner'],
      responsavel: 'João Santos'
    },
    {
      id: '3',
      nome: 'Atendimento Público',
      endereco: 'Gurupi - TO',
      capacidade: 15,
      equipamentos: ['Balcões', 'Sistema de Senhas', 'Computadores'],
      responsavel: 'Ana Costa'
    }
  ];

  // Calcular progresso da escala
  const calcularProgresso = useCallback(() => {
    let pontos = 0;
    const maxPontos = 100;

    // Informações básicas (20 pontos)
    if (escala.nome) pontos += 5;
    if (escala.descricao) pontos += 5;
    if (escala.dataInicio) pontos += 5;
    if (escala.dataFim) pontos += 5;

    // Recursos (30 pontos)
    if (escala.funcionarios.length > 0) pontos += 10;
    if (escala.turnos.length > 0) pontos += 10;
    if (escala.locais.length > 0) pontos += 10;

    // Alocações (40 pontos)
    const totalAlocacoes = Object.keys(escala.alocacoes).length;
    if (totalAlocacoes > 0) pontos += Math.min(40, totalAlocacoes * 5);

    // Regras configuradas (10 pontos)
    if (escala.regras) pontos += 10;

    const progressoCalculado = Math.round((pontos / maxPontos) * 100);
    setProgresso(progressoCalculado);
    return progressoCalculado;
  }, [escala]);

  // Validar escala
  const validarEscala = useCallback(() => {
    const novasValidacoes: string[] = [];
    const novasSugestoes: string[] = [];

    // Validações obrigatórias
    if (!escala.nome) novasValidacoes.push('Nome da escala é obrigatório');
    if (!escala.dataInicio) novasValidacoes.push('Data de início é obrigatória');
    if (!escala.dataFim) novasValidacoes.push('Data de fim é obrigatória');
    if (escala.funcionarios.length === 0) novasValidacoes.push('Pelo menos um funcionário deve ser selecionado');
    if (escala.turnos.length === 0) novasValidacoes.push('Pelo menos um turno deve ser configurado');
    if (escala.locais.length === 0) novasValidacoes.push('Pelo menos um local deve ser selecionado');

    // Validações de datas
    if (escala.dataInicio && escala.dataFim) {
      const inicio = new Date(escala.dataInicio);
      const fim = new Date(escala.dataFim);
      if (inicio >= fim) {
        novasValidacoes.push('Data de fim deve ser posterior à data de início');
      }
    }

    // Sugestões de melhoria
    if (escala.funcionarios.length < 3) {
      novasSugestoes.push('Considere adicionar mais funcionários para maior flexibilidade');
    }
    if (escala.turnos.length < 2) {
      novasSugestoes.push('Múltiplos turnos oferecem melhor cobertura');
    }
    if (!escala.descricao) {
      novasSugestoes.push('Uma descrição ajuda outros gestores a entender a escala');
    }

    // Verificar alocações vazias
    const totalAlocacoes = Object.keys(escala.alocacoes).length;
    if (totalAlocacoes === 0) {
      novasSugestoes.push('Configure as alocações arrastando funcionários para os turnos');
    }

    setValidacoes(novasValidacoes);
    setSugestoes(novasSugestoes);
    
    return novasValidacoes.length === 0;
  }, [escala]);

  // Filtrar e ordenar funcionários
  const funcionariosFiltrados = () => funcionariosMock
    .filter(funcionario => 
      funcionario.nome.toLowerCase().includes(filtroFuncionarios.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(filtroFuncionarios.toLowerCase()) ||
      funcionario.departamento.toLowerCase().includes(filtroFuncionarios.toLowerCase())
    )
    .sort((a, b) => {
      switch (ordenacaoFuncionarios) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'cargo':
          return a.cargo.localeCompare(b.cargo);
        case 'departamento':
          return a.departamento.localeCompare(b.departamento);
        case 'avaliacao':
          return b.avaliacaoDesempenho - a.avaliacaoDesempenho;
        default:
          return 0;
      }
    });

  // Atualizar progresso quando escala mudar
  React.useEffect(() => {
    calcularProgresso();
    validarEscala();
  }, [escala, calcularProgresso, validarEscala]);

  // Handlers para drag and drop
  const handleDrop = useCallback((item: any, targetZone: string) => {
    const [zona, data, turno, local] = targetZone.split('-');
    
    if (zona === 'escala' && item.type === 'funcionario') {
      // Adicionar funcionário à alocação
      setEscala(prev => {
        const novasAlocacoes = { ...prev.alocacoes };
        if (!novasAlocacoes[data]) {
          novasAlocacoes[data] = {};
        }
        if (!novasAlocacoes[data][turno]) {
          novasAlocacoes[data][turno] = {};
        }
        if (!novasAlocacoes[data][turno][local]) {
          novasAlocacoes[data][turno][local] = [];
        }
        
        // Verificar se já não está alocado
        if (!novasAlocacoes[data][turno][local].includes(item.content.id)) {
          novasAlocacoes[data][turno][local].push(item.content.id);
        }
        
        return {
          ...prev,
          alocacoes: novasAlocacoes
        };
      });
    }
  }, []);

  const removerFuncionarioAlocacao = (data: string, turno: string, local: string, funcionarioId: string) => {
    setEscala(prev => {
      const novasAlocacoes = { ...prev.alocacoes };
      if (novasAlocacoes[data]?.[turno]?.[local]) {
        novasAlocacoes[data][turno][local] = novasAlocacoes[data][turno][local].filter(id => id !== funcionarioId);
      }
      return {
        ...prev,
        alocacoes: novasAlocacoes
      };
    });
  };

  const gerarDatasEscala = () => {
    if (!escala.dataInicio || !escala.dataFim) return [];
    
    const inicio = new Date(escala.dataInicio);
    const fim = new Date(escala.dataFim);
    const datas = [];
    
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      datas.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return datas;
  };

  const salvarEscala = () => {
    if (!escala.nome || !escala.dataInicio || !escala.dataFim) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const escalaCompleta: EscalaAvancada = {
      id: Date.now().toString(),
      nome: escala.nome,
      descricao: escala.descricao || '',
      dataInicio: escala.dataInicio,
      dataFim: escala.dataFim,
      tipo: escala.tipo || 'semanal',
      status: escala.status || 'rascunho',
      turnos: turnosSelecionados,
      locais: locaisSelecionados,
      funcionarios: funcionariosSelecionados,
      alocacoes: escala.alocacoes || {},
      regras: escala.regras!,
      notificacoes: escala.notificacoes!
    };

    onEscalaCriada(escalaCompleta);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Criar Nova Escala Avançada
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure uma escala completa com recursos avançados
          </DialogDescription>
        </DialogHeader>

        <DragDropProvider>
          <div className="flex-shrink-0 mb-4">
            {/* Barra de progresso compacta */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Progress value={progresso} className="w-24" />
                <span className="text-sm text-gray-600">{progresso}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                {validacoes.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {validacoes.length}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 max-w-xs">
                          <div className="text-xs font-medium">Validações pendentes:</div>
                          {validacoes.map((validacao, index) => (
                            <div key={index} className="text-xs">• {typeof validacao === 'string' ? validacao : validacao.mensagem}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {sugestoes.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          <Lightbulb className="w-3 h-3" />
                          {sugestoes.length}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 max-w-xs">
                          <div className="text-xs font-medium">Sugestões:</div>
                          {sugestoes.map((sugestao, index) => (
                            <div key={index} className="text-xs">• {typeof sugestao === 'string' ? sugestao : sugestao.mensagem}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
                <TabsTrigger value="informacoes" className="flex items-center gap-1 text-xs">
                  <Info className="w-3 h-3" />
                  <span className="hidden sm:inline">Informações</span>
                  {escala.nome && escala.dataInicio && escala.dataFim && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="recursos" className="flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3" />
                  <span className="hidden sm:inline">Recursos</span>
                  {escala.funcionarios.length > 0 && escala.turnos.length > 0 && escala.locais.length > 0 && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="escala" className="flex items-center gap-1 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span className="hidden sm:inline">Escala</span>
                  {Object.keys(escala.alocacoes).length > 0 && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="regras" className="flex items-center gap-1 text-xs">
                  <Settings className="w-3 h-3" />
                  <span className="hidden sm:inline">Regras</span>
                  {escala.regras && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-1 text-xs">
                  <Eye className="w-3 h-3" />
                  <span className="hidden sm:inline">Preview</span>
                </TabsTrigger>
              </TabsList>

            {/* Tab Informações */}
            <TabsContent value="informacoes" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome da Escala *</Label>
                      <Input
                        id="nome"
                        value={escala.nome}
                        onChange={(e) => setEscala(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Escala Janeiro 2025"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo de Escala</Label>
                      <Select value={escala.tipo} onValueChange={(value: any) => setEscala(prev => ({ ...prev, tipo: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="personalizada">Personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={escala.descricao}
                      onChange={(e) => setEscala(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva os objetivos e características desta escala..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataInicio">Data de Início *</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={escala.dataInicio}
                        onChange={(e) => setEscala(prev => ({ ...prev, dataInicio: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataFim">Data de Fim *</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={escala.dataFim}
                        onChange={(e) => setEscala(prev => ({ ...prev, dataFim: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab Recursos */}
            <TabsContent value="recursos" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-1">
                  {/* Filtros e Controles compactos */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex-1 min-w-[150px]">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                            <Input
                              placeholder="Buscar..."
                              value={filtroFuncionarios}
                              onChange={(e) => setFiltroFuncionarios(e.target.value)}
                              className="pl-8 text-sm"
                              size="sm"
                            />
                          </div>
                        </div>
                        <Select value={ordenacaoFuncionarios} onValueChange={setOrdenacaoFuncionarios}>
                          <SelectTrigger className="w-[120px] text-sm">
                            <SelectValue placeholder="Ordenar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nome">Nome</SelectItem>
                            <SelectItem value="cargo">Cargo</SelectItem>
                            <SelectItem value="departamento">Departamento</SelectItem>
                            <SelectItem value="avaliacao">Avaliação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
                {/* Funcionários */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Funcionários Disponíveis
                      </div>
                      <Badge variant="secondary">
                        {funcionariosFiltrados().length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {funcionariosFiltrados().map((funcionario) => (
                          <Draggable
                            key={funcionario.id}
                            id={funcionario.id}
                            type="funcionario"
                            content={funcionario}
                          >
                            <Card className="p-3 cursor-move hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-blue-500">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm flex items-center gap-2">
                                    {funcionario.nome}
                                    {funcionario.status === 'ativo' && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{funcionario.cargo}</div>
                                  <div className="text-xs text-gray-500">{funcionario.departamento}</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium">{funcionario.avaliacaoDesempenho}/5</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Badge 
                                    variant={funcionario.status === 'ativo' ? 'default' : 'secondary'} 
                                    className="text-xs"
                                  >
                                    {funcionario.status}
                                  </Badge>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className="text-xs">
                                          <Phone className="w-2 h-2 mr-1" />
                                          Info
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="text-xs">
                                          <div>📧 {funcionario.email}</div>
                                          <div>📞 {funcionario.telefone}</div>
                                          <div>⏰ Max: {funcionario.preferencias.horasMaximas}h</div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="text-xs text-gray-600 mb-1">Habilidades:</div>
                                <div className="flex flex-wrap gap-1">
                                  {funcionario.habilidades.slice(0, 2).map((hab, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                      {hab}
                                    </Badge>
                                  ))}
                                  {funcionario.habilidades.length > 2 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge variant="outline" className="text-xs px-1 py-0 cursor-help">
                                            +{funcionario.habilidades.length - 2}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="text-xs">
                                            {funcionario.habilidades.slice(2).join(', ')}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                  Turno preferido: {funcionario.preferencias.turnoPreferido}
                                </div>
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="text-xs">Disponível para escala</div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </Card>
                          </Draggable>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Turnos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Turnos
                      </div>
                      <Badge variant="secondary">
                        {turnosSelecionados.length}/{turnosMock.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {turnosMock.map((turno) => {
                          const isSelected = turnosSelecionados.find(t => t.id === turno.id);
                          return (
                            <Card 
                              key={turno.id} 
                              className={`p-3 transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                  : 'hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: turno.cor }}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{turno.nome}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {turno.horaInicio} - {turno.horaFim}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {turno.capacidadeMinima}-{turno.capacidadeMaxima} pessoas
                                  </div>
                                  {turno.descricao && (
                                    <div className="text-xs text-gray-400 mt-1 truncate">
                                      {turno.descricao}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => {
                                    if (isSelected) {
                                      setTurnosSelecionados(prev => prev.filter(t => t.id !== turno.id));
                                    } else {
                                      setTurnosSelecionados(prev => [...prev, turno]);
                                    }
                                  }}
                                  className="transition-all duration-200"
                                >
                                  {isSelected ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <Plus className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Locais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Locais
                      </div>
                      <Badge variant="secondary">
                        {locaisSelecionados.length}/{locaisMock.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {locaisMock.map((local) => {
                          const isSelected = locaisSelecionados.find(l => l.id === local.id);
                          return (
                            <Card 
                              key={local.id} 
                              className={`p-3 transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-green-50 border-green-200 shadow-sm' 
                                  : 'hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm flex items-center gap-2">
                                    <Building className="w-3 h-3" />
                                    {local.nome}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{local.endereco}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <Users className="w-3 h-3" />
                                    Capacidade: {local.capacidade} pessoas
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    {local.responsavel}
                                  </div>
                                  {local.equipamentos.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-600">Equipamentos:</div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {local.equipamentos.slice(0, 2).map((eq, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                            {eq}
                                          </Badge>
                                        ))}
                                        {local.equipamentos.length > 2 && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Badge variant="outline" className="text-xs px-1 py-0 cursor-help">
                                                  +{local.equipamentos.length - 2}
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <div className="text-xs">
                                                  {local.equipamentos.slice(2).join(', ')}
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => {
                                    if (isSelected) {
                                      setLocaisSelecionados(prev => prev.filter(l => l.id !== local.id));
                                    } else {
                                      setLocaisSelecionados(prev => [...prev, local]);
                                    }
                                  }}
                                  className="transition-all duration-200"
                                >
                                  {isSelected ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <Plus className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab Escala - Drag and Drop */}
            <TabsContent value="escala" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">Arraste funcionários para os turnos e locais:</div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {Object.keys(escala.alocacoes || {}).length} dias configurados
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {Object.values(escala.alocacoes || {}).reduce((total, dia) => 
                          total + Object.values(dia).reduce((diaTotal, turno) => 
                            diaTotal + Object.values(turno).reduce((turnoTotal, local) => 
                              turnoTotal + local.length, 0), 0), 0)} alocações
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Auto-alocar
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        Copiar dia
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                  {gerarDatasEscala().map((data) => {
                    const totalAlocacoesDia = Object.values(escala.alocacoes?.[data] || {}).reduce((total, turno) => 
                      total + Object.values(turno).reduce((turnoTotal, local) => turnoTotal + local.length, 0), 0);
                    
                    return (
                      <Card key={data} className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
                        
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              {new Date(data).toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={totalAlocacoesDia > 0 ? "default" : "secondary"} className="text-xs">
                                {totalAlocacoesDia} funcionários alocados
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="grid gap-4">
                            {turnosSelecionados.map((turno) => {
                              const totalAlocacoesTurno = Object.values(escala.alocacoes?.[data]?.[turno.id] || {}).reduce((total, local) => total + local.length, 0);
                              
                              return (
                                <div key={turno.id} className="border rounded-lg p-3 bg-gradient-to-r from-gray-50 to-white">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full shadow-sm"
                                        style={{ backgroundColor: turno.cor }}
                                      />
                                      <span className="font-medium">{turno.nome}</span>
                                      <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {turno.horaInicio} - {turno.horaFim}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {totalAlocacoesTurno}/{turno.capacidadeMaxima} funcionários
                                      </Badge>
                                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                        <div 
                                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                          style={{ width: `${Math.min((totalAlocacoesTurno / turno.capacidadeMaxima) * 100, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {locaisSelecionados.map((local) => {
                                      const funcionariosAlocados = escala.alocacoes?.[data]?.[turno.id]?.[local.id] || [];
                                      const capacidadeUtilizada = funcionariosAlocados.length;
                                      const capacidadeTotal = local.capacidade;
                                      const percentualOcupacao = (capacidadeUtilizada / capacidadeTotal) * 100;
                                      
                                      return (
                                        <Droppable
                                          key={`${data}-${turno.id}-${local.id}`}
                                          id={`escala-${data}-${turno.id}-${local.id}`}
                                          acceptedTypes={['funcionario']}
                                          onDrop={(item) => handleDrop(item, `escala-${data}-${turno.id}-${local.id}`)}
                                          className={`min-h-[120px] border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${
                                            capacidadeUtilizada >= capacidadeTotal 
                                              ? 'border-red-300 bg-red-50 hover:border-red-400' 
                                              : capacidadeUtilizada > 0 
                                                ? 'border-green-300 bg-green-50 hover:border-green-400'
                                                : 'border-gray-300 bg-white hover:border-blue-400'
                                          }`}
                                        >
                                          <div className="text-sm font-medium mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {local.nome}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs text-gray-500">
                                                {capacidadeUtilizada}/{capacidadeTotal}
                                              </span>
                                              <div className="w-8 bg-gray-200 rounded-full h-1">
                                                <div 
                                                  className={`h-1 rounded-full transition-all duration-300 ${
                                                    percentualOcupacao >= 100 ? 'bg-red-500' : 
                                                    percentualOcupacao >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                                                  }`}
                                                  style={{ width: `${Math.min(percentualOcupacao, 100)}%` }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-1">
                                            {funcionariosAlocados.map((funcionarioId) => {
                                              const funcionario = funcionariosMock.find(f => f.id === funcionarioId);
                                              if (!funcionario) return null;
                                              
                                              return (
                                                <div
                                                  key={funcionarioId}
                                                  className="bg-white border border-blue-200 rounded-md p-2 text-xs flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                      <UserCheck className="w-3 h-3 text-blue-600" />
                                                    </div>
                                                    <div>
                                                      <div className="font-medium text-gray-900">{funcionario.nome}</div>
                                                      <div className="text-gray-500 flex items-center gap-1">
                                                        <Building className="w-2 h-2" />
                                                        {funcionario.cargo}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <div className="flex">
                                                      {Array.from({ length: funcionario.avaliacaoDesempenho }).map((_, i) => (
                                                        <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                                                      ))}
                                                    </div>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-5 w-5 p-0 hover:bg-red-100"
                                                      onClick={() => removerFuncionarioAlocacao(data, turno.id, local.id, funcionarioId)}
                                                    >
                                                      <X className="w-3 h-3 text-red-500" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                            
                                            {funcionariosAlocados.length === 0 && (
                                              <div className="text-xs text-gray-400 text-center py-6 flex flex-col items-center gap-2">
                                                <Users className="w-6 h-6 text-gray-300" />
                                                <span>Arraste funcionários aqui</span>
                                                <span className="text-[10px]">Capacidade: {capacidadeTotal} pessoas</span>
                                              </div>
                                            )}
                                            
                                            {capacidadeUtilizada >= capacidadeTotal && (
                                              <div className="text-xs text-red-500 text-center py-1 flex items-center justify-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Capacidade máxima atingida
                                              </div>
                                            )}
                                          </div>
                                        </Droppable>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab Regras */}
            <TabsContent value="regras" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Timer className="w-5 h-5 text-blue-500" />
                      Regras de Trabalho
                    </CardTitle>
                    <CardDescription>
                      Configure os limites de horas e jornada de trabalho
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Horas Máximas por Dia
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            max="24"
                            value={escala.regras?.horasMaximasPorDia}
                            onChange={(e) => setEscala(prev => ({
                              ...prev,
                              regras: { ...prev.regras!, horasMaximasPorDia: parseInt(e.target.value) }
                            }))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">horas</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((escala.regras?.horasMaximasPorDia || 8) / 24) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Recomendado: 8 horas por dia
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Horas Máximas por Semana
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            max="168"
                            value={escala.regras?.horasMaximasPorSemana}
                            onChange={(e) => setEscala(prev => ({
                              ...prev,
                              regras: { ...prev.regras!, horasMaximasPorSemana: parseInt(e.target.value) }
                            }))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">horas</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((escala.regras?.horasMaximasPorSemana || 44) / 168) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Recomendado: 44 horas por semana
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Folgas Mínimas por Semana
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            max="7"
                            value={escala.regras?.folgas.minimasPorSemana}
                            onChange={(e) => setEscala(prev => ({
                              ...prev,
                              regras: { 
                                ...prev.regras!, 
                                folgas: { 
                                  ...prev.regras!.folgas, 
                                  minimasPorSemana: parseInt(e.target.value) 
                                }
                              }
                            }))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">dias</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  i < (escala.regras?.folgas.minimasPorSemana || 1) 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Mínimo recomendado: 1 dia de folga por semana
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Configurações Avançadas
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Timer className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">Intervalos Obrigatórios</div>
                              <div className="text-xs text-gray-500">Garantir pausas durante o turno</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="intervalos"
                              checked={escala.regras?.intervalosObrigatorios}
                              onChange={(e) => setEscala(prev => ({
                                ...prev,
                                regras: { ...prev.regras!, intervalosObrigatorios: e.target.checked }
                              }))}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">Substituições Automáticas</div>
                              <div className="text-xs text-gray-500">Alocar automaticamente em caso de ausência</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="substituicoes"
                              checked={escala.regras?.substituicoes.automaticas}
                              onChange={(e) => setEscala(prev => ({
                                ...prev,
                                regras: { 
                                  ...prev.regras!, 
                                  substituicoes: { 
                                    ...prev.regras!.substituicoes, 
                                    automaticas: e.target.checked 
                                  }
                                }
                              }))}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">Notificar Gestor</div>
                              <div className="text-xs text-gray-500">Alertar sobre mudanças na escala</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="notificar-gestor"
                              checked={escala.regras?.substituicoes.notificarGestor}
                              onChange={(e) => setEscala(prev => ({
                                ...prev,
                                regras: { 
                                  ...prev.regras!, 
                                  substituicoes: { 
                                    ...prev.regras!.substituicoes, 
                                    notificarGestor: e.target.checked 
                                  }
                                }
                              }))}
                              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500" />
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5 text-green-500" />
                      Notificações
                    </CardTitle>
                    <CardDescription>
                      Configure como e quando notificar os funcionários
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Antecedência para Notificações
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={escala.notificacoes?.antecedencia}
                            onChange={(e) => setEscala(prev => ({
                              ...prev,
                              notificacoes: { ...prev.notificacoes!, antecedencia: parseInt(e.target.value) }
                            }))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">dias</span>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">
                              {escala.notificacoes?.antecedencia || 3} dias antes
                            </div>
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((escala.notificacoes?.antecedencia || 3) / 30) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Tipos de Notificação
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Lembretes de Turno</div>
                              <div className="text-sm text-gray-500">Notificar funcionários sobre próximos turnos</div>
                              <div className="text-xs text-blue-600 mt-1">
                                {escala.notificacoes?.lembretes ? 'Ativo' : 'Inativo'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="lembretes"
                              checked={escala.notificacoes?.lembretes}
                              onChange={(e) => setEscala(prev => ({
                                ...prev,
                                notificacoes: { ...prev.notificacoes!, lembretes: e.target.checked }
                              }))}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Mudanças na Escala</div>
                              <div className="text-sm text-gray-500">Alertar sobre alterações e trocas</div>
                              <div className="text-xs text-green-600 mt-1">
                                {escala.notificacoes?.mudancas ? 'Ativo' : 'Inativo'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="mudancas"
                              checked={escala.notificacoes?.mudancas}
                              onChange={(e) => setEscala(prev => ({
                                ...prev,
                                notificacoes: { ...prev.notificacoes!, mudancas: e.target.checked }
                              }))}
                              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-800">Dica</div>
                          <div className="text-sm text-yellow-700 mt-1">
                            Recomendamos ativar ambas as notificações para manter todos informados sobre a escala e suas mudanças.
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo das Regras */}
              <Card className="bg-gradient-to-r from-gray-50 to-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Resumo das Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">
                        {escala.regras?.horasMaximasPorDia || 8}h
                      </div>
                      <div className="text-xs text-gray-500">Máx. por dia</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {escala.regras?.horasMaximasPorSemana || 44}h
                      </div>
                      <div className="text-xs text-gray-500">Máx. por semana</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">
                        {escala.regras?.folgas.minimasPorSemana || 1}
                      </div>
                      <div className="text-xs text-gray-500">Folgas/semana</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {escala.notificacoes?.antecedencia || 3}
                      </div>
                      <div className="text-xs text-gray-500">Dias antecedência</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab Preview */}
            <TabsContent value="preview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-1">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações Gerais */}
                <Card className="lg:col-span-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Eye className="w-6 h-6 text-purple-500" />
                      Resumo da Escala
                    </CardTitle>
                    <CardDescription>
                      Visualize todos os detalhes da escala antes de salvar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-blue-700">Nome da Escala</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {escala.nome || 'Não definido'}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-700">Tipo</span>
                        </div>
                        <div className="text-lg font-semibold capitalize">
                          {escala.tipo || 'Não definido'}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-purple-700">Período</span>
                        </div>
                        <div className="text-sm font-medium">
                          {escala.dataInicio && escala.dataFim 
                            ? `${new Date(escala.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(escala.dataFim).toLocaleDateString('pt-BR')}`
                            : 'Não definido'
                          }
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-orange-700">Status</span>
                        </div>
                        <Badge 
                          variant={escala.status === 'ativa' ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          {escala.status || 'Rascunho'}
                        </Badge>
                      </div>
                    </div>

                    {/* Descrição */}
                    {escala.descricao && (
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Descrição</span>
                        </div>
                        <p className="text-sm text-gray-600">{escala.descricao}</p>
                      </div>
                    )}

                    {/* Recursos Selecionados */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Funcionários</span>
                          </div>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {funcionariosSelecionados.length}
                          </Badge>
                        </div>
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {funcionariosSelecionados.length > 0 ? (
                              funcionariosSelecionados.map(f => (
                                <div key={f.id} className="text-xs text-gray-600 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  {f.nome}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400">Nenhum funcionário selecionado</div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Turnos</span>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {turnosSelecionados.length}
                          </Badge>
                        </div>
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {turnosSelecionados.length > 0 ? (
                              turnosSelecionados.map(t => (
                                <div key={t.id} className="text-xs text-gray-600 flex items-center gap-1">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: t.cor }}
                                  />
                                  {t.nome} ({t.horaInicio} - {t.horaFim})
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400">Nenhum turno selecionado</div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Locais</span>
                          </div>
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            {locaisSelecionados.length}
                          </Badge>
                        </div>
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {locaisSelecionados.length > 0 ? (
                              locaisSelecionados.map(l => (
                                <div key={l.id} className="text-xs text-gray-600 flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {l.nome}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400">Nenhum local selecionado</div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500" />
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Estatísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Total de Dias</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {escala.dataInicio && escala.dataFim 
                            ? Math.ceil((new Date(escala.dataFim).getTime() - new Date(escala.dataInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1
                            : 0
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Alocações</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {Object.values(escala.alocacoes || {}).reduce((total, turnos) => {
                            return total + Object.values(turnos).reduce((turnoTotal, locais) => {
                              return turnoTotal + Object.values(locais).reduce((localTotal, funcionarios) => {
                                return localTotal + funcionarios.length;
                              }, 0);
                            }, 0);
                          }, 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Progresso</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">
                          {Math.round(progresso)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completude da Escala</span>
                        <span>{Math.round(progresso)}%</span>
                      </div>
                      <Progress value={progresso} className="h-2" />
                    </div>

                    {/* Status de Validação - Resumo */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Status de Validação
                      </h4>
                      <div className="flex items-center gap-2">
                        {validacoes.length === 0 ? (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Todas as validações passaram</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{validacoes.length} validação(ões) pendente(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhamento das Alocações */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Detalhamento das Alocações
                  </CardTitle>
                  <CardDescription>
                    Visualização detalhada de todas as alocações por data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(escala.alocacoes || {}).length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <div className="text-gray-500 font-medium">Nenhuma alocação configurada</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Configure as alocações na aba "Escala" para visualizar aqui
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(escala.alocacoes || {}).map(([data, turnos]) => (
                        <Card key={data} className="border-l-4 border-l-indigo-500">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(data).toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {Object.entries(turnos).map(([turnoId, locais]) => {
                                const turno = turnosSelecionados.find(t => t.id === turnoId);
                                const totalFuncionarios = Object.values(locais).reduce((total, funcionarios) => total + funcionarios.length, 0);
                                
                                return (
                                  <div key={turnoId} className="border rounded-lg p-3 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-3 h-3 rounded-full" 
                                          style={{ backgroundColor: turno?.cor || '#gray' }}
                                        />
                                        <span className="font-medium">{turno?.nome}</span>
                                        <span className="text-sm text-gray-500">
                                          ({turno?.horaInicio} - {turno?.horaFim})
                                        </span>
                                      </div>
                                      <Badge variant="outline">
                                        {totalFuncionarios} funcionário(s)
                                      </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {Object.entries(locais).map(([localId, funcionarios]) => {
                                        const local = locaisSelecionados.find(l => l.id === localId);
                                        return funcionarios.length > 0 ? (
                                          <div key={localId} className="p-2 bg-white rounded border">
                                            <div className="flex items-center gap-1 mb-1">
                                              <MapPin className="w-3 h-3 text-gray-500" />
                                              <span className="text-xs font-medium">{local?.nome}</span>
                                            </div>
                                            <div className="space-y-1">
                                              {funcionarios.map(funcId => {
                                                const funcionario = funcionariosSelecionados.find(f => f.id === funcId);
                                                return (
                                                  <div key={funcId} className="flex items-center gap-1 text-xs text-gray-600">
                                                    <UserCheck className="w-3 h-3" />
                                                    {funcionario?.nome}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card className="bg-gradient-to-r from-gray-50 to-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsVisualizadorOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar Escala
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar Escala
                    </Button>
                  </div>
                </CardContent>
              </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t mt-auto">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={salvarEscala} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Escala
            </Button>
          </div>
          </div>
        </DragDropProvider>
      </DialogContent>
    </Dialog>
  );
};