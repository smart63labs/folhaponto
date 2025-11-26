import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Shield, Clock, Users, Save, RotateCcw } from "lucide-react";

interface ConfiguracaoEquipe {
  id: string;
  nome: string;
  valor: string | boolean | number;
  tipo: 'texto' | 'numero' | 'boolean' | 'select';
  opcoes?: string[];
  categoria: 'notificacoes' | 'permissoes' | 'horarios' | 'geral';
  descricao: string;
}

interface ConfigurarEquipeProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSalva?: (configs: ConfiguracaoEquipe[]) => void;
}

export function ConfigurarEquipe({ isOpen, onClose, onConfigSalva }: ConfigurarEquipeProps) {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoEquipe[]>([
    // Notificações
    {
      id: "notif_atrasos",
      nome: "Notificar Atrasos",
      valor: true,
      tipo: "boolean",
      categoria: "notificacoes",
      descricao: "Receber notificações quando membros da equipe chegarem atrasados"
    },
    {
      id: "notif_ausencias",
      nome: "Notificar Ausências",
      valor: true,
      tipo: "boolean",
      categoria: "notificacoes",
      descricao: "Receber notificações sobre ausências não justificadas"
    },
    {
      id: "notif_horas_extras",
      nome: "Notificar Horas Extras",
      valor: false,
      tipo: "boolean",
      categoria: "notificacoes",
      descricao: "Receber notificações sobre horas extras realizadas"
    },
    {
      id: "notif_frequencia",
      nome: "Frequência de Notificações",
      valor: "imediata",
      tipo: "select",
      opcoes: ["imediata", "diaria", "semanal"],
      categoria: "notificacoes",
      descricao: "Com que frequência receber as notificações"
    },
    
    // Permissões
    {
      id: "perm_editar_ponto",
      nome: "Permitir Edição de Ponto",
      valor: true,
      tipo: "boolean",
      categoria: "permissoes",
      descricao: "Permitir que membros da equipe editem seus próprios registros de ponto"
    },
    {
      id: "perm_justificar_ausencia",
      nome: "Auto-justificar Ausências",
      valor: false,
      tipo: "boolean",
      categoria: "permissoes",
      descricao: "Permitir que membros justifiquem suas próprias ausências"
    },
    {
      id: "perm_visualizar_equipe",
      nome: "Visualizar Dados da Equipe",
      valor: true,
      tipo: "boolean",
      categoria: "permissoes",
      descricao: "Permitir que membros vejam dados básicos dos colegas"
    },
    
    // Horários
    {
      id: "horario_tolerancia",
      nome: "Tolerância de Atraso (min)",
      valor: 15,
      tipo: "numero",
      categoria: "horarios",
      descricao: "Minutos de tolerância antes de considerar como atraso"
    },
    {
      id: "horario_inicio_padrao",
      nome: "Horário Padrão de Início",
      valor: "08:00",
      tipo: "texto",
      categoria: "horarios",
      descricao: "Horário padrão de início do expediente"
    },
    {
      id: "horario_fim_padrao",
      nome: "Horário Padrão de Fim",
      valor: "17:00",
      tipo: "texto",
      categoria: "horarios",
      descricao: "Horário padrão de fim do expediente"
    },
    
    // Geral
    {
      id: "geral_auto_backup",
      nome: "Backup Automático",
      valor: true,
      tipo: "boolean",
      categoria: "geral",
      descricao: "Realizar backup automático dos dados da equipe"
    },
    {
      id: "geral_periodo_backup",
      nome: "Período do Backup",
      valor: "semanal",
      tipo: "select",
      opcoes: ["diario", "semanal", "mensal"],
      categoria: "geral",
      descricao: "Frequência do backup automático"
    }
  ]);

  const [configuracoesEditadas, setConfiguracoesEditadas] = useState<Record<string, any>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const categorias = [
    { id: "notificacoes", nome: "Notificações", icon: Bell },
    { id: "permissoes", nome: "Permissões", icon: Shield },
    { id: "horarios", nome: "Horários", icon: Clock },
    { id: "geral", nome: "Geral", icon: Users }
  ];

  const handleConfigChange = (configId: string, valor: any) => {
    setConfiguracoesEditadas(prev => ({
      ...prev,
      [configId]: valor
    }));
  };

  const getValorAtual = (config: ConfiguracaoEquipe) => {
    return configuracoesEditadas[config.id] !== undefined 
      ? configuracoesEditadas[config.id] 
      : config.valor;
  };

  const handleSalvar = () => {
    // Aplicar as alterações às configurações
    const configsAtualizadas = configuracoes.map(config => ({
      ...config,
      valor: getValorAtual(config)
    }));
    
    setConfiguracoes(configsAtualizadas);
    setConfiguracoesEditadas({});
    
    onConfigSalva?.(configsAtualizadas);
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setShowSuccessModal(false);
      onClose();
    }, 2000);
  };

  const handleResetar = () => {
    setConfiguracoesEditadas({});
  };

  const renderCampoConfig = (config: ConfiguracaoEquipe) => {
    const valor = getValorAtual(config);

    switch (config.tipo) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={valor as boolean}
              onCheckedChange={(checked) => handleConfigChange(config.id, checked)}
            />
            <Label className="text-sm">
              {valor ? 'Habilitado' : 'Desabilitado'}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={valor as string}
            onValueChange={(value) => handleConfigChange(config.id, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.opcoes?.map((opcao) => (
                <SelectItem key={opcao} value={opcao}>
                  {opcao.charAt(0).toUpperCase() + opcao.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'numero':
        return (
          <Input
            type="number"
            value={valor as number}
            onChange={(e) => handleConfigChange(config.id, parseInt(e.target.value))}
            min="0"
            max="999"
          />
        );

      case 'texto':
        return (
          <Input
            type={config.id.includes('horario') ? 'time' : 'text'}
            value={valor as string}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  const configuracoesPorCategoria = (categoria: string) => {
    return configuracoes.filter(config => config.categoria === categoria);
  };

  const temAlteracoes = Object.keys(configuracoesEditadas).length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações da Equipe
            </DialogTitle>
            <DialogDescription>
              Configure as preferências e permissões para sua equipe.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="notificacoes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {categorias.map((categoria) => {
                const Icon = categoria.icon;
                return (
                  <TabsTrigger key={categoria.id} value={categoria.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{categoria.nome}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categorias.map((categoria) => (
              <TabsContent key={categoria.id} value={categoria.id} className="space-y-4">
                <div className="space-y-4">
                  {configuracoesPorCategoria(categoria.id).map((config) => (
                    <Card key={config.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div>
                              <Label className="text-sm font-medium">{config.nome}</Label>
                              <p className="text-xs text-gray-600">{config.descricao}</p>
                            </div>
                          </div>
                          <div className="ml-4 min-w-[200px]">
                            {renderCampoConfig(config)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleResetar} disabled={!temAlteracoes}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={!temAlteracoes}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Settings className="w-5 h-5" />
              Configurações Salvas
            </DialogTitle>
            <DialogDescription>
              As configurações da equipe foram atualizadas com sucesso.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}