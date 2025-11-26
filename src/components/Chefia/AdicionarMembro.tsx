import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Users, Building2, Mail, Phone, Calendar } from "lucide-react";

interface Membro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  matricula: string;
  dataAdmissao: string;
  status: 'ativo' | 'inativo';
  setor?: string;
  chefe?: string;
}

interface AdicionarMembroProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMembroAdicionado?: (membro: Membro) => void;
}

export function AdicionarMembro({ isOpen, onClose, onMembroAdicionado }: AdicionarMembroProps) {
  const [open, setOpen] = useState(isOpen || false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembro, setSelectedMembro] = useState<Membro | null>(null);
  const [setor, setSetor] = useState("");
  const [funcao, setFuncao] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Sincronizar o estado interno com a prop externa
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Função para fechar o modal
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Dados mockados de membros disponíveis (já cadastrados no sistema)
  const membrosDisponiveis: Membro[] = [
    {
      id: "1",
      nome: "Maria Santos",
      email: "maria.santos@sefaz.to.gov.br",
      telefone: "(63) 99999-5678",
      cargo: "Analista Tributário",
      matricula: "54321",
      dataAdmissao: "2023-01-15",
      status: "ativo"
    },
    {
      id: "2",
      nome: "Carlos Oliveira",
      email: "carlos.oliveira@sefaz.to.gov.br",
      telefone: "(63) 99999-9012",
      cargo: "Auditor Fiscal",
      matricula: "67890",
      dataAdmissao: "2022-08-20",
      status: "ativo"
    },
    {
      id: "3",
      nome: "Ana Costa",
      email: "ana.costa@sefaz.to.gov.br",
      telefone: "(63) 99999-3456",
      cargo: "Técnico Tributário",
      matricula: "13579",
      dataAdmissao: "2023-03-10",
      status: "ativo"
    },
    {
      id: "4",
      nome: "Roberto Lima",
      email: "roberto.lima@sefaz.to.gov.br",
      telefone: "(63) 99999-7890",
      cargo: "Analista de Sistemas",
      matricula: "24680",
      dataAdmissao: "2022-11-05",
      status: "ativo"
    }
  ];

  const setores = [
    "Fiscalização",
    "Arrecadação",
    "Tecnologia da Informação",
    "Recursos Humanos",
    "Contabilidade",
    "Auditoria"
  ];

  const funcoes = [
    "Analista",
    "Coordenador",
    "Supervisor",
    "Especialista",
    "Técnico"
  ];

  const filteredMembros = membrosDisponiveis.filter(membro =>
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.matricula.includes(searchTerm)
  );

  const handleAdicionarMembro = () => {
    if (!selectedMembro || !setor || !funcao) {
      setSuccessMessage("Por favor, selecione um membro, setor e função.");
      setShowSuccessModal(true);
      return;
    }

    const membroComVinculo = {
      ...selectedMembro,
      setor,
      funcao,
      chefe: "Chefe Atual" // Aqui seria o ID do chefe logado
    };

    onMembroAdicionado?.(membroComVinculo);
    
    setSuccessMessage(`${selectedMembro.nome} foi vinculado ao setor ${setor}.`);
    setShowSuccessModal(true);

    // Reset form
    setSelectedMembro(null);
    setSetor("");
    setFuncao("");
    setSearchTerm("");
    handleClose();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose();
      } else {
        setOpen(true);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Adicionar Membro à Equipe
          </DialogTitle>
          <DialogDescription>
            Selecione um membro já cadastrado no sistema para vincular à sua equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Busca de membros */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Membro</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Digite o nome, email ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de membros disponíveis */}
          <div className="space-y-2">
            <Label>Membros Disponíveis</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {filteredMembros.map((membro) => (
                <Card
                  key={membro.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMembro?.id === membro.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedMembro(membro)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{membro.nome}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {membro.matricula}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{membro.cargo}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {membro.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {membro.telefone}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Admissão: {new Date(membro.dataAdmissao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Informações do membro selecionado */}
          {selectedMembro && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Membro Selecionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Nome:</strong> {selectedMembro.nome}
                  </div>
                  <div>
                    <strong>Matrícula:</strong> {selectedMembro.matricula}
                  </div>
                  <div>
                    <strong>Cargo:</strong> {selectedMembro.cargo}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedMembro.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configurações do vínculo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setor">Setor *</Label>
              <Select value={setor} onValueChange={setSetor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((s) => (
                    <SelectItem key={s} value={s}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {s}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funcao">Função *</Label>
              <Select value={funcao} onValueChange={setFuncao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {funcoes.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdicionarMembro}
              disabled={!selectedMembro || !setor || !funcao}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar à Equipe
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
            <UserPlus className="w-5 h-5 text-green-600" />
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