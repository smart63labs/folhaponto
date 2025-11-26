import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Plus, X, CalendarPlus, Save } from "lucide-react";

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  matricula: string;
  disponibilidade: string[];
}

interface Turno {
  id: string;
  nome: string;
  horarioInicio: string;
  horarioFim: string;
  cor: string;
}

interface EscalaItem {
  funcionarioId: string;
  turnoId: string;
  data: string;
}

interface AdicionarEscalaProps {
  isOpen?: boolean;
  onClose?: () => void;
  onEscalaCriada?: (escala: any) => void;
}

export function AdicionarEscala({ isOpen = false, onClose, onEscalaCriada }: AdicionarEscalaProps) {
  const [nomeEscala, setNomeEscala] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [setor, setSetor] = useState("");
  const [escalaItems, setEscalaItems] = useState<EscalaItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ type: 'funcionario' | 'turno', id: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Dados mockados
  const funcionarios: Funcionario[] = [
    {
      id: "1",
      nome: "João Silva",
      cargo: "Analista Tributário",
      matricula: "12345",
      disponibilidade: ["manhã", "tarde"]
    },
    {
      id: "2",
      nome: "Maria Santos",
      cargo: "Auditor Fiscal",
      matricula: "54321",
      disponibilidade: ["manhã", "noite"]
    },
    {
      id: "3",
      nome: "Carlos Oliveira",
      cargo: "Técnico Tributário",
      matricula: "67890",
      disponibilidade: ["tarde", "noite"]
    },
    {
      id: "4",
      nome: "Ana Costa",
      cargo: "Analista de Sistemas",
      matricula: "13579",
      disponibilidade: ["manhã", "tarde", "noite"]
    }
  ];

  const turnos: Turno[] = [
    {
      id: "manha",
      nome: "Manhã",
      horarioInicio: "08:00",
      horarioFim: "12:00",
      cor: "bg-yellow-100 border-yellow-300 text-yellow-800"
    },
    {
      id: "tarde",
      nome: "Tarde",
      horarioInicio: "13:00",
      horarioFim: "17:00",
      cor: "bg-orange-100 border-orange-300 text-orange-800"
    },
    {
      id: "noite",
      nome: "Noite",
      horarioInicio: "18:00",
      horarioFim: "22:00",
      cor: "bg-blue-100 border-blue-300 text-blue-800"
    }
  ];

  const setores = ["Fiscalização", "Arrecadação", "TI", "RH", "Contabilidade"];

  // Gerar dias da semana entre as datas
  const getDaysInRange = () => {
    if (!dataInicio || !dataFim) return [];
    
    const start = new Date(dataInicio);
    const end = new Date(dataFim);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  };

  const days = getDaysInRange();

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'funcionario' | 'turno', id: string) => {
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, data: string, turnoId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.type !== 'funcionario') return;
    
    const funcionarioId = draggedItem.id;
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    const turno = turnos.find(t => t.id === turnoId);
    
    if (!funcionario || !turno) return;
    
    // Verificar disponibilidade
    if (!funcionario.disponibilidade.includes(turno.nome.toLowerCase())) {
      setSuccessMessage(`${funcionario.nome} não está disponível para o turno ${turno.nome}.`);
      setShowSuccessModal(true);
      return;
    }
    
    // Verificar se já existe uma escala para este funcionário nesta data
    const existingItem = escalaItems.find(
      item => item.funcionarioId === funcionarioId && item.data === data
    );
    
    if (existingItem) {
      // Atualizar turno existente
      setEscalaItems(prev => 
        prev.map(item => 
          item.funcionarioId === funcionarioId && item.data === data
            ? { ...item, turnoId }
            : item
        )
      );
    } else {
      // Adicionar nova escala
      setEscalaItems(prev => [...prev, { funcionarioId, turnoId, data }]);
    }
    
    setDraggedItem(null);
  };

  const removeEscalaItem = (funcionarioId: string, data: string) => {
    setEscalaItems(prev => 
      prev.filter(item => !(item.funcionarioId === funcionarioId && item.data === data))
    );
  };

  const getEscalaItem = (funcionarioId: string, data: string) => {
    return escalaItems.find(item => item.funcionarioId === funcionarioId && item.data === data);
  };

  const handleSalvarEscala = () => {
    if (!nomeEscala || !dataInicio || !dataFim || !setor) {
      setSuccessMessage("Por favor, preencha todos os campos obrigatórios.");
      setShowSuccessModal(true);
      return;
    }

    const escala = {
      id: Date.now().toString(),
      nome: nomeEscala,
      dataInicio,
      dataFim,
      setor,
      items: escalaItems,
      status: 'planejada',
      criadoEm: new Date().toISOString()
    };

    onEscalaCriada?.(escala);
    
    setSuccessMessage(`A escala "${nomeEscala}" foi criada e está pronta para publicação.`);
    setShowSuccessModal(true);

    // Reset form
    setNomeEscala("");
    setDataInicio("");
    setDataFim("");
    setSetor("");
    setEscalaItems([]);
  };

  const limparEscala = () => {
    setEscalaItems([]);
    setSuccessMessage("Todas as atribuições foram removidas.");
    setShowSuccessModal(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Criar Nova Escala
            </DialogTitle>
          <DialogDescription>
            Arraste os funcionários para os turnos desejados para criar a escala.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Escala *</Label>
              <Input
                id="nome"
                placeholder="Ex: Escala Janeiro 2024"
                value={nomeEscala}
                onChange={(e) => setNomeEscala(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim *</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setor">Setor *</Label>
              <Select value={setor} onValueChange={setSetor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Painel de funcionários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Funcionários Disponíveis
              </CardTitle>
              <CardDescription>
                Arraste os funcionários para os turnos na grade abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {funcionarios.map((funcionario) => (
                  <Card
                    key={funcionario.id}
                    className="cursor-move hover:shadow-md transition-shadow bg-gray-50"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'funcionario', funcionario.id)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{funcionario.nome}</h4>
                        <p className="text-xs text-gray-600">{funcionario.cargo}</p>
                        <Badge variant="secondary" className="text-xs">
                          {funcionario.matricula}
                        </Badge>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {funcionario.disponibilidade.map((disp) => (
                            <Badge key={disp} variant="outline" className="text-xs">
                              {disp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grade de escala */}
          {days.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Grade de Escala
                  </CardTitle>
                  <CardDescription>
                    {days.length} dias • {escalaItems.length} atribuições
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={limparEscala}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-50 text-left min-w-[150px]">
                          Funcionário
                        </th>
                        {days.map((day) => (
                          <th key={day.toISOString()} className="border p-2 bg-gray-50 text-center min-w-[120px]">
                            <div className="text-sm font-medium">
                              {day.toLocaleDateString('pt-BR', { 
                                weekday: 'short', 
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {funcionarios.map((funcionario) => (
                        <tr key={funcionario.id}>
                          <td className="border p-2 bg-gray-50">
                            <div className="text-sm font-medium">{funcionario.nome}</div>
                            <div className="text-xs text-gray-600">{funcionario.cargo}</div>
                          </td>
                          {days.map((day) => {
                            const dateStr = day.toISOString().split('T')[0];
                            const escalaItem = getEscalaItem(funcionario.id, dateStr);
                            const turno = escalaItem ? turnos.find(t => t.id === escalaItem.turnoId) : null;
                            
                            return (
                              <td
                                key={`${funcionario.id}-${dateStr}`}
                                className="border p-1 h-16 relative"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, dateStr, draggedItem?.type === 'funcionario' ? 'manha' : '')}
                              >
                                {turno ? (
                                  <div className={`${turno.cor} p-2 rounded text-xs text-center relative group`}>
                                    <div className="font-medium">{turno.nome}</div>
                                    <div className="text-xs">{turno.horarioInicio}-{turno.horarioFim}</div>
                                    <button
                                      onClick={() => removeEscalaItem(funcionario.id, dateStr)}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-2 h-2" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded">
                                    Arraste aqui
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legenda de turnos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Turnos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {turnos.map((turno) => (
                  <div key={turno.id} className={`${turno.cor} p-2 rounded text-sm`}>
                    <div className="font-medium">{turno.nome}</div>
                    <div className="text-xs">{turno.horarioInicio} - {turno.horarioFim}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarEscala}
              disabled={!nomeEscala || !dataInicio || !dataFim || !setor}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Escala
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Modal de Sucesso */}
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-green-600" />
            Operação Realizada
          </DialogTitle>
          <DialogDescription>
            {successMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}