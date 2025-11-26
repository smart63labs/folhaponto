import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Phone,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Download,
  Print,
  Share2,
  Filter,
  Search,
  Grid3X3,
  List,
  CalendarDays
} from "lucide-react";

// Interfaces (reutilizando do CriarEscalaAvancada)
interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  telefone?: string;
  email?: string;
  habilidades: string[];
  status: 'ativo' | 'inativo' | 'ferias' | 'licenca';
  avaliacaoDesempenho: number;
}

interface Turno {
  id: string;
  nome: string;
  horaInicio: string;
  horaFim: string;
  cor: string;
  capacidadeMinima: number;
  capacidadeMaxima: number;
}

interface Local {
  id: string;
  nome: string;
  endereco: string;
  capacidade: number;
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
        [localId: string]: string[];
      };
    };
  };
}

interface VisualizadorEscalaProps {
  isOpen: boolean;
  onClose: () => void;
  escala: EscalaAvancada;
  onEdit?: () => void;
}

export const VisualizadorEscala: React.FC<VisualizadorEscalaProps> = ({
  isOpen,
  onClose,
  escala,
  onEdit
}) => {
  const [visualizacao, setVisualizacao] = useState<'calendario' | 'grade' | 'lista'>('calendario');
  const [semanaAtual, setSemanaAtual] = useState(0);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string | null>(null);

  // Gerar datas da escala
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

  // Agrupar datas por semana
  const agruparPorSemana = (datas: string[]) => {
    const semanas = [];
    for (let i = 0; i < datas.length; i += 7) {
      semanas.push(datas.slice(i, i + 7));
    }
    return semanas;
  };

  const datas = gerarDatasEscala();
  const semanas = agruparPorSemana(datas);
  const semanaAtualDatas = semanas[semanaAtual] || [];

  // Obter funcionário por ID
  const getFuncionario = (id: string) => {
    return escala.funcionarios.find(f => f.id === id);
  };

  // Obter turno por ID
  const getTurno = (id: string) => {
    return escala.turnos.find(t => t.id === id);
  };

  // Obter local por ID
  const getLocal = (id: string) => {
    return escala.locais.find(l => l.id === id);
  };

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    let totalAlocacoes = 0;
    let funcionariosAtivos = new Set();
    
    Object.values(escala.alocacoes).forEach(turnos => {
      Object.values(turnos).forEach(locais => {
        Object.values(locais).forEach(funcionarios => {
          totalAlocacoes += funcionarios.length;
          funcionarios.forEach(f => funcionariosAtivos.add(f));
        });
      });
    });

    return {
      totalAlocacoes,
      funcionariosAtivos: funcionariosAtivos.size,
      diasConfigurados: Object.keys(escala.alocacoes).length,
      cobertura: Math.round((Object.keys(escala.alocacoes).length / datas.length) * 100)
    };
  };

  const estatisticas = calcularEstatisticas();

  // Renderizar visualização em calendário
  const renderCalendario = () => (
    <div className="space-y-4">
      {/* Navegação de semana */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSemanaAtual(Math.max(0, semanaAtual - 1))}
          disabled={semanaAtual === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Semana Anterior
        </Button>
        
        <div className="text-center">
          <div className="font-medium">
            Semana {semanaAtual + 1} de {semanas.length}
          </div>
          {semanaAtualDatas.length > 0 && (
            <div className="text-sm text-gray-500">
              {new Date(semanaAtualDatas[0]).toLocaleDateString('pt-BR')} - {' '}
              {new Date(semanaAtualDatas[semanaAtualDatas.length - 1]).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSemanaAtual(Math.min(semanas.length - 1, semanaAtual + 1))}
          disabled={semanaAtual >= semanas.length - 1}
        >
          Próxima Semana
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
          <div key={dia} className="text-center font-medium text-sm text-gray-500 p-2">
            {dia}
          </div>
        ))}
        
        {semanaAtualDatas.map((data, index) => {
          const alocacoesDia = escala.alocacoes[data] || {};
          const temAlocacoes = Object.keys(alocacoesDia).length > 0;
          
          return (
            <Card key={data} className={`min-h-[120px] ${temAlocacoes ? 'border-blue-200 bg-blue-50' : ''}`}>
              <CardHeader className="p-2">
                <div className="text-sm font-medium">
                  {new Date(data).getDate()}
                </div>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="space-y-1">
                  {Object.entries(alocacoesDia).map(([turnoId, locais]) => {
                    const turno = getTurno(turnoId);
                    const totalFuncionarios = Object.values(locais).flat().length;
                    
                    return (
                      <div
                        key={turnoId}
                        className="text-xs p-1 rounded"
                        style={{ backgroundColor: turno?.cor + '20', borderLeft: `3px solid ${turno?.cor}` }}
                      >
                        <div className="font-medium">{turno?.nome}</div>
                        <div className="text-gray-600">{totalFuncionarios} pessoas</div>
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
  );

  // Renderizar visualização em grade
  const renderGrade = () => (
    <div className="space-y-4">
      {datas.map(data => {
        const alocacoesDia = escala.alocacoes[data] || {};
        
        return (
          <Card key={data}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {new Date(data).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {escala.turnos.map(turno => {
                  const alocacoesTurno = alocacoesDia[turno.id] || {};
                  
                  return (
                    <div key={turno.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: turno.cor }}
                        />
                        <span className="font-medium">{turno.nome}</span>
                        <span className="text-sm text-gray-500">
                          {turno.horaInicio} - {turno.horaFim}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {escala.locais.map(local => {
                          const funcionariosLocal = alocacoesTurno[local.id] || [];
                          
                          return (
                            <div key={local.id} className="border rounded p-2">
                              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {local.nome}
                              </div>
                              
                              <div className="space-y-1">
                                {funcionariosLocal.map(funcionarioId => {
                                  const funcionario = getFuncionario(funcionarioId);
                                  if (!funcionario) return null;
                                  
                                  return (
                                    <div
                                      key={funcionarioId}
                                      className="bg-white border rounded p-2 text-xs cursor-pointer hover:bg-gray-50"
                                      onClick={() => setFuncionarioSelecionado(funcionarioId)}
                                    >
                                      <div className="font-medium">{funcionario.nome}</div>
                                      <div className="text-gray-500">{funcionario.cargo}</div>
                                    </div>
                                  );
                                })}
                                
                                {funcionariosLocal.length === 0 && (
                                  <div className="text-xs text-gray-400 text-center py-2">
                                    Nenhum funcionário alocado
                                  </div>
                                )}
                              </div>
                            </div>
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
  );

  // Renderizar visualização em lista
  const renderLista = () => {
    const alocacoesList: Array<{
      data: string;
      turno: Turno;
      local: Local;
      funcionarios: Funcionario[];
    }> = [];

    Object.entries(escala.alocacoes).forEach(([data, turnos]) => {
      Object.entries(turnos).forEach(([turnoId, locais]) => {
        Object.entries(locais).forEach(([localId, funcionarioIds]) => {
          const turno = getTurno(turnoId);
          const local = getLocal(localId);
          const funcionarios = funcionarioIds.map(id => getFuncionario(id)).filter(Boolean) as Funcionario[];
          
          if (turno && local) {
            alocacoesList.push({ data, turno, local, funcionarios });
          }
        });
      });
    });

    return (
      <div className="space-y-2">
        {alocacoesList.map((alocacao, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="font-medium">
                    {new Date(alocacao.data).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-gray-500">
                    {new Date(alocacao.data).toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: alocacao.turno.cor }}
                  />
                  <span className="text-sm font-medium">{alocacao.turno.nome}</span>
                  <span className="text-xs text-gray-500">
                    {alocacao.turno.horaInicio} - {alocacao.turno.horaFim}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  {alocacao.local.nome}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {alocacao.funcionarios.length} funcionário(s)
                </Badge>
                <div className="text-xs text-gray-500">
                  {alocacao.funcionarios.map(f => f.nome).join(', ')}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {escala.nome}
          </DialogTitle>
          <DialogDescription>
            {escala.descricao} • {escala.tipo} • {escala.status}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={visualizacao} onValueChange={(value: any) => setVisualizacao(value)} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="calendario" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="grade" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Grade
              </TabsTrigger>
              <TabsTrigger value="lista" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Print className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="p-3">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.totalAlocacoes}</div>
              <div className="text-sm text-gray-500">Total de Alocações</div>
            </Card>
            <Card className="p-3">
              <div className="text-2xl font-bold text-green-600">{estatisticas.funcionariosAtivos}</div>
              <div className="text-sm text-gray-500">Funcionários Ativos</div>
            </Card>
            <Card className="p-3">
              <div className="text-2xl font-bold text-purple-600">{estatisticas.diasConfigurados}</div>
              <div className="text-sm text-gray-500">Dias Configurados</div>
            </Card>
            <Card className="p-3">
              <div className="text-2xl font-bold text-orange-600">{estatisticas.cobertura}%</div>
              <div className="text-sm text-gray-500">Cobertura</div>
            </Card>
          </div>

          <ScrollArea className="h-[500px]">
            <TabsContent value="calendario" className="mt-0">
              {renderCalendario()}
            </TabsContent>

            <TabsContent value="grade" className="mt-0">
              {renderGrade()}
            </TabsContent>

            <TabsContent value="lista" className="mt-0">
              {renderLista()}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Modal de detalhes do funcionário */}
        {funcionarioSelecionado && (
          <Dialog open={!!funcionarioSelecionado} onOpenChange={() => setFuncionarioSelecionado(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes do Funcionário</DialogTitle>
              </DialogHeader>
              {(() => {
                const funcionario = getFuncionario(funcionarioSelecionado);
                if (!funcionario) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-lg">{funcionario.nome}</div>
                        <div className="text-gray-500">{funcionario.cargo}</div>
                        <div className="text-sm text-gray-500">{funcionario.departamento}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Contato</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {funcionario.telefone || 'Não informado'}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {funcionario.email || 'Não informado'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Avaliação</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{funcionario.avaliacaoDesempenho}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Habilidades</div>
                      <div className="flex flex-wrap gap-1">
                        {funcionario.habilidades.map((habilidade, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {habilidade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};