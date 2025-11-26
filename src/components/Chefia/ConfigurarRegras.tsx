import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Clock, Users, AlertTriangle, Save, RotateCcw, Trash2, Plus } from "lucide-react";

interface Regra {
  id: string;
  nome: string;
  tipo: 'horario' | 'descanso' | 'limite' | 'restricao';
  ativa: boolean;
  parametros: Record<string, any>;
  descricao: string;
}

interface ConfigurarRegrasProps {
  onRegrasSalvas?: (regras: Regra[]) => void;
}

export function ConfigurarRegras({ onRegrasSalvas }: ConfigurarRegrasProps) {
  const [open, setOpen] = useState(false);
  const [regras, setRegras] = useState<Regra[]>([
    {
      id: "1",
      nome: "Intervalo Mínimo Entre Turnos",
      tipo: "descanso",
      ativa: true,
      parametros: { horas: 12 },
      descricao: "Tempo mínimo de descanso entre turnos consecutivos"
    },
    {
      id: "2",
      nome: "Máximo de Horas Semanais",
      tipo: "limite",
      ativa: true,
      parametros: { horas: 44 },
      descricao: "Limite máximo de horas trabalhadas por semana"
    },
    {
      id: "3",
      nome: "Turnos Noturnos Consecutivos",
      tipo: "restricao",
      ativa: false,
      parametros: { maximo: 2 },
      descricao: "Máximo de turnos noturnos consecutivos permitidos"
    }
  ]);
  const [novaRegra, setNovaRegra] = useState({
    nome: "",
    tipo: "horario" as const,
    descricao: "",
    parametros: {}
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const tiposRegra = [
    { value: "horario", label: "Horário", icon: Clock },
    { value: "descanso", label: "Descanso", icon: Users },
    { value: "limite", label: "Limite", icon: AlertTriangle },
    { value: "restricao", label: "Restrição", icon: Settings }
  ];

  const toggleRegra = (id: string) => {
    setRegras(prev => 
      prev.map(regra => 
        regra.id === id ? { ...regra, ativa: !regra.ativa } : regra
      )
    );
  };

  const updateParametro = (id: string, parametro: string, valor: any) => {
    setRegras(prev => 
      prev.map(regra => 
        regra.id === id 
          ? { ...regra, parametros: { ...regra.parametros, [parametro]: valor } }
          : regra
      )
    );
  };

  const adicionarRegra = () => {
    if (!novaRegra.nome || !novaRegra.descricao) {
      setSuccessMessage("Por favor, preencha o nome e descrição da regra.");
      setShowSuccessModal(true);
      return;
    }

    const regra: Regra = {
      id: Date.now().toString(),
      nome: novaRegra.nome,
      tipo: novaRegra.tipo,
      ativa: true,
      parametros: getParametrosPadrao(novaRegra.tipo),
      descricao: novaRegra.descricao
    };

    setRegras(prev => [...prev, regra]);
    setNovaRegra({ nome: "", tipo: "horario", descricao: "", parametros: {} });
    
    setSuccessMessage(`A regra "${regra.nome}" foi adicionada com sucesso.`);
    setShowSuccessModal(true);
  };

  const removerRegra = (id: string) => {
    setRegras(prev => prev.filter(regra => regra.id !== id));
    setSuccessMessage("A regra foi removida com sucesso.");
    setShowSuccessModal(true);
  };

  const getParametrosPadrao = (tipo: string) => {
    switch (tipo) {
      case "horario":
        return { horaInicio: "08:00", horaFim: "17:00" };
      case "descanso":
        return { horas: 12 };
      case "limite":
        return { horas: 44 };
      case "restricao":
        return { maximo: 1 };
      default:
        return {};
    }
  };

  const renderParametros = (regra: Regra) => {
    switch (regra.tipo) {
      case "horario":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Hora Início</Label>
              <Input
                type="time"
                value={regra.parametros.horaInicio || "08:00"}
                onChange={(e) => updateParametro(regra.id, "horaInicio", e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Hora Fim</Label>
              <Input
                type="time"
                value={regra.parametros.horaFim || "17:00"}
                onChange={(e) => updateParametro(regra.id, "horaFim", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        );
      case "descanso":
      case "limite":
        return (
          <div>
            <Label className="text-xs">Horas</Label>
            <Input
              type="number"
              min="1"
              max="168"
              value={regra.parametros.horas || 0}
              onChange={(e) => updateParametro(regra.id, "horas", parseInt(e.target.value))}
              className="h-8"
            />
          </div>
        );
      case "restricao":
        return (
          <div>
            <Label className="text-xs">Máximo</Label>
            <Input
              type="number"
              min="1"
              max="7"
              value={regra.parametros.maximo || 1}
              onChange={(e) => updateParametro(regra.id, "maximo", parseInt(e.target.value))}
              className="h-8"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSalvar = () => {
    onRegrasSalvas?.(regras);
    setSuccessMessage(`${regras.filter(r => r.ativa).length} regras ativas foram configuradas.`);
    setShowSuccessModal(true);
    setOpen(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
          <Settings className="w-4 h-4 mr-2" />
          Configurar Regras
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Regras de Escala
          </DialogTitle>
          <DialogDescription>
            Defina as regras que serão aplicadas automaticamente na criação de escalas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Regras existentes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Regras Configuradas</h3>
            {regras.map((regra) => {
              const TipoIcon = tiposRegra.find(t => t.value === regra.tipo)?.icon || Settings;
              
              return (
                <Card key={regra.id} className={regra.ativa ? "border-green-200 bg-green-50" : "border-gray-200"}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <TipoIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <h4 className="font-semibold">{regra.nome}</h4>
                            <p className="text-sm text-gray-600">{regra.descricao}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            {renderParametros(regra)}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`regra-${regra.id}`}
                                checked={regra.ativa}
                                onCheckedChange={() => toggleRegra(regra.id)}
                              />
                              <Label htmlFor={`regra-${regra.id}`} className="text-sm">
                                {regra.ativa ? "Ativa" : "Inativa"}
                              </Label>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerRegra(regra.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Adicionar nova regra */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5" />
                Adicionar Nova Regra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Regra</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Limite de horas extras"
                    value={novaRegra.nome}
                    onChange={(e) => setNovaRegra(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Regra</Label>
                  <Select 
                    value={novaRegra.tipo} 
                    onValueChange={(value: any) => setNovaRegra(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposRegra.map((tipo) => {
                        const Icon = tipo.icon;
                        return (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {tipo.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva como esta regra será aplicada..."
                  value={novaRegra.descricao}
                  onChange={(e) => setNovaRegra(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button onClick={adicionarRegra} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Regra
              </Button>
            </CardContent>
          </Card>

          {/* Resumo das regras */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Resumo das Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {regras.length}
                  </div>
                  <div className="text-sm text-gray-600">Total de Regras</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {regras.filter(r => r.ativa).length}
                  </div>
                  <div className="text-sm text-gray-600">Regras Ativas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {regras.filter(r => r.tipo === 'limite').length}
                  </div>
                  <div className="text-sm text-gray-600">Regras de Limite</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {regras.filter(r => r.tipo === 'restricao').length}
                  </div>
                  <div className="text-sm text-gray-600">Restrições</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} className="bg-orange-600 hover:bg-orange-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
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
            <Settings className="w-5 h-5 text-green-600" />
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

    {/* Modal de Sucesso */}
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
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