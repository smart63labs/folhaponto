import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit3, Send, Eye, Calendar, Users, Clock, AlertTriangle, CheckCircle, Save } from "lucide-react";

interface Escala {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  setor: string;
  status: 'planejada' | 'publicada' | 'ativa' | 'concluida';
  items: any[];
  observacoes?: string;
  publicadaEm?: string;
  publicadoPor?: string;
}

interface EditarPublicarEscalaProps {
  onEscalaAtualizada?: (escala: Escala) => void;
}

export function EditarPublicarEscala({ onEscalaAtualizada }: EditarPublicarEscalaProps) {
  const [open, setOpen] = useState(false);
  const [escalasSelecionada, setEscalaSelecionada] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");
  const [notificarEquipe, setNotificarEquipe] = useState(true);
  const [publicarImediatamente, setPublicarImediatamente] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Dados mockados de escalas
  const escalas: Escala[] = [
    {
      id: "1",
      nome: "Escala Janeiro 2024",
      dataInicio: "2024-01-01",
      dataFim: "2024-01-31",
      setor: "Fiscalização",
      status: "planejada",
      items: [
        { funcionarioId: "1", turnoId: "manha", data: "2024-01-01" },
        { funcionarioId: "2", turnoId: "tarde", data: "2024-01-01" }
      ]
    },
    {
      id: "2",
      nome: "Escala Fevereiro 2024",
      dataInicio: "2024-02-01",
      dataFim: "2024-02-29",
      setor: "Arrecadação",
      status: "publicada",
      items: [
        { funcionarioId: "3", turnoId: "manha", data: "2024-02-01" },
        { funcionarioId: "4", turnoId: "noite", data: "2024-02-01" }
      ],
      publicadaEm: "2024-01-25T10:00:00Z",
      publicadoPor: "Admin"
    },
    {
      id: "3",
      nome: "Escala Março 2024",
      dataInicio: "2024-03-01",
      dataFim: "2024-03-31",
      setor: "TI",
      status: "ativa",
      items: [
        { funcionarioId: "1", turnoId: "tarde", data: "2024-03-01" }
      ]
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planejada':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Planejada', icon: Calendar };
      case 'publicada':
        return { color: 'bg-blue-100 text-blue-800', label: 'Publicada', icon: Send };
      case 'ativa':
        return { color: 'bg-green-100 text-green-800', label: 'Ativa', icon: CheckCircle };
      case 'concluida':
        return { color: 'bg-gray-100 text-gray-800', label: 'Concluída', icon: CheckCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Desconhecido', icon: AlertTriangle };
    }
  };

  const escalaAtual = escalas.find(e => e.id === escalasSelecionada);

  const handlePublicarEscala = () => {
    if (!escalaAtual) {
      setSuccessMessage("Por favor, selecione uma escala para publicar.");
      setShowSuccessModal(true);
      return;
    }

    const escalaAtualizada: Escala = {
      ...escalaAtual,
      status: publicarImediatamente ? 'ativa' : 'publicada',
      observacoes,
      publicadaEm: new Date().toISOString(),
      publicadoPor: "Admin" // Aqui seria o usuário logado
    };

    onEscalaAtualizada?.(escalaAtualizada);

    if (notificarEquipe) {
      setSuccessMessage(`A escala "${escalaAtual.nome}" foi publicada e a equipe foi notificada por email.`);
    } else {
      setSuccessMessage(`A escala "${escalaAtual.nome}" foi publicada com sucesso.`);
    }
    setShowSuccessModal(true);

    // Reset form
    setEscalaSelecionada("");
    setObservacoes("");
    setNotificarEquipe(true);
    setPublicarImediatamente(false);
    setOpen(false);
  };

  const handleSalvarRascunho = () => {
    if (!escalaAtual) return;

    const escalaAtualizada: Escala = {
      ...escalaAtual,
      observacoes
    };

    onEscalaAtualizada?.(escalaAtualizada);
    
    setSuccessMessage("As alterações foram salvas como rascunho.");
    setShowSuccessModal(true);
  };

  const getDiasEscala = (escala: Escala) => {
    const inicio = new Date(escala.dataInicio);
    const fim = new Date(escala.dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
          <Edit3 className="w-4 h-4 mr-2" />
          Editar/Publicar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Editar e Publicar Escala
          </DialogTitle>
          <DialogDescription>
            Selecione uma escala para editar, revisar e publicar para a equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de escala */}
          <div className="space-y-2">
            <Label htmlFor="escala">Selecionar Escala</Label>
            <Select value={escalasSelecionada} onValueChange={setEscalaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma escala para editar" />
              </SelectTrigger>
              <SelectContent>
                {escalas.map((escala) => {
                  const statusConfig = getStatusConfig(escala.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <SelectItem key={escala.id} value={escala.id}>
                      <div className="flex items-center gap-3 w-full">
                        <StatusIcon className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{escala.nome}</div>
                          <div className="text-xs text-gray-500">
                            {escala.setor} • {new Date(escala.dataInicio).toLocaleDateString('pt-BR')} - {new Date(escala.dataFim).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Detalhes da escala selecionada */}
          {escalaAtual && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Detalhes da Escala
                  </div>
                  <Badge className={getStatusConfig(escalaAtual.status).color}>
                    {getStatusConfig(escalaAtual.status).label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Nome</Label>
                    <p className="font-medium">{escalaAtual.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Setor</Label>
                    <p className="font-medium">{escalaAtual.setor}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Período</Label>
                    <p className="font-medium">
                      {new Date(escalaAtual.dataInicio).toLocaleDateString('pt-BR')} - {new Date(escalaAtual.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Duração</Label>
                    <p className="font-medium">{getDiasEscala(escalaAtual)} dias</p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {escalaAtual.items.length}
                      </div>
                      <div className="text-sm text-gray-600">Atribuições</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {new Set(escalaAtual.items.map(item => item.funcionarioId)).size}
                      </div>
                      <div className="text-sm text-gray-600">Funcionários</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(escalaAtual.items.map(item => item.turnoId)).size}
                      </div>
                      <div className="text-sm text-gray-600">Turnos</div>
                    </div>
                  </div>
                </div>

                {/* Informações de publicação */}
                {escalaAtual.publicadaEm && (
                  <div className="mt-4 pt-4 border-t bg-blue-50 p-3 rounded">
                    <div className="flex items-center gap-2 text-sm">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Publicada em:</span>
                      {new Date(escalaAtual.publicadaEm).toLocaleString('pt-BR')}
                      <span className="text-gray-500">por {escalaAtual.publicadoPor}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {escalaAtual && (
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações da Publicação</Label>
              <Textarea
                id="observacoes"
                placeholder="Adicione observações importantes sobre esta escala..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Opções de publicação */}
          {escalaAtual && escalaAtual.status === 'planejada' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Opções de Publicação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notificar"
                    checked={notificarEquipe}
                    onCheckedChange={setNotificarEquipe}
                  />
                  <Label htmlFor="notificar" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Notificar equipe por email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativar"
                    checked={publicarImediatamente}
                    onCheckedChange={setPublicarImediatamente}
                  />
                  <Label htmlFor="ativar" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Ativar escala imediatamente
                  </Label>
                </div>

                <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                  <strong>Atenção:</strong> Ao publicar a escala, ela ficará visível para toda a equipe. 
                  {publicarImediatamente && " A escala será ativada imediatamente e entrará em vigor."}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview de ações */}
          {escalaAtual && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Ações Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {escalaAtual.status === 'planejada' && (
                    <div className="text-center p-3 bg-white rounded border">
                      <Send className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="font-medium">Publicar</div>
                      <div className="text-xs text-gray-600">Tornar visível para equipe</div>
                    </div>
                  )}
                  
                  <div className="text-center p-3 bg-white rounded border">
                    <Save className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Salvar Rascunho</div>
                    <div className="text-xs text-gray-600">Salvar alterações</div>
                  </div>

                  <div className="text-center p-3 bg-white rounded border">
                    <Edit3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-medium">Editar</div>
                    <div className="text-xs text-gray-600">Modificar atribuições</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            
            {escalaAtual && (
              <>
                <Button variant="outline" onClick={handleSalvarRascunho}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>
                
                {escalaAtual.status === 'planejada' && (
                  <Button onClick={handlePublicarEscala} className="bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4 mr-2" />
                    Publicar Escala
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Modal de Sucesso */}
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
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