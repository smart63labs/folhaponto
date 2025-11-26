import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdicionarMembro } from "@/components/Chefia/AdicionarMembro";
import { ConfigurarEquipe } from "@/components/Chefia/ConfigurarEquipe";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Search,
  Filter,
  Download,
  UserPlus,
  Settings,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getBadgeConfig } from "@/config/badgeConfig";
import { 
  exportEquipeToCSV, 
  exportEquipeToExcel, 
  exportEquipeToPDF, 
  exportEquipeToJSON,
  calcularEstatisticasEquipe,
  type MembroEquipe,
  type EstatisticasEquipe
} from "@/utils/exportEquipeUtils";

export function MinhaEquipe() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [isAdicionarMembroOpen, setIsAdicionarMembroOpen] = useState(false);
  const [isConfigurarEquipeOpen, setIsConfigurarEquipeOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv');

  // Dados mockados da equipe
  const equipeData = [
    {
      id: 1,
      nome: "João Silva",
      cargo: "Analista Tributário",
      matricula: "12345",
      status: "presente",
      entrada: "08:00",
      saida: "17:00",
      horasExtras: 2.5,
      faltas: 0,
      atrasos: 1,
      email: "joao.silva@sefaz.to.gov.br",
      telefone: "(63) 99999-1234"
    },
    {
      id: 2,
      nome: "Ana Costa",
      cargo: "Técnico Fazendário",
      matricula: "12346",
      status: "presente",
      entrada: "08:15",
      saida: "17:15",
      horasExtras: 1.0,
      faltas: 1,
      atrasos: 0,
      email: "ana.costa@sefaz.to.gov.br",
      telefone: "(63) 99999-5678"
    },
    {
      id: 3,
      nome: "Carlos Santos",
      cargo: "Auditor Fiscal",
      matricula: "12347",
      status: "ausente",
      entrada: "-",
      saida: "-",
      motivo: "Licença médica",
      horasExtras: 0,
      faltas: 3,
      atrasos: 2,
      email: "carlos.santos@sefaz.to.gov.br",
      telefone: "(63) 99999-9012"
    },
    {
      id: 4,
      nome: "Maria Oliveira",
      cargo: "Analista Tributário",
      matricula: "12348",
      status: "presente",
      entrada: "07:45",
      saida: "16:45",
      horasExtras: 3.0,
      faltas: 0,
      atrasos: 0,
      email: "maria.oliveira@sefaz.to.gov.br",
      telefone: "(63) 99999-3456"
    },
    {
      id: 5,
      nome: "Pedro Lima",
      cargo: "Técnico Fazendário",
      matricula: "12349",
      status: "atraso",
      entrada: "08:30",
      saida: "-",
      horasExtras: 0.5,
      faltas: 2,
      atrasos: 5,
      email: "pedro.lima@sefaz.to.gov.br",
      telefone: "(63) 99999-7890"
    }
  ];

  // Estatísticas da equipe
  const statsData = {
    totalEquipe: equipeData.length,
    presentesHoje: equipeData.filter(f => f.status === 'presente').length,
    ausentesHoje: equipeData.filter(f => f.status === 'ausente').length,
    atrasosHoje: equipeData.filter(f => f.status === 'atraso').length,
    horasExtrasMes: equipeData.reduce((acc, f) => acc + f.horasExtras, 0),
    mediaFaltas: (equipeData.reduce((acc, f) => acc + f.faltas, 0) / equipeData.length).toFixed(1)
  };

  // Filtrar equipe
  const equipeFiltrada = equipeData.filter(funcionario => {
    const matchSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       funcionario.matricula.includes(searchTerm) ||
                       funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === "todos" || funcionario.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  // Função para converter dados da equipe para o formato de exportação
  const convertToMembroEquipe = (data: any[]): MembroEquipe[] => {
    return data.map(membro => ({
      id: membro.id,
      nome: membro.nome,
      cargo: membro.cargo,
      matricula: membro.matricula,
      setor: 'Setor Padrão', // Campo obrigatório
      status: membro.status,
      entrada: membro.entrada,
      saida: membro.saida,
      horasExtras: membro.horasExtras || 0,
      faltas: membro.faltas || 0,
      atrasos: membro.atrasos || 0,
      email: membro.email,
      telefone: membro.telefone,
      dataAdmissao: '2023-01-01', // Campo obrigatório
      motivo: membro.motivo
    }));
  };

  // Handler para exportação
  const handleExport = () => {
    try {
      const membrosFormatados = convertToMembroEquipe(equipeFiltrada);
      const estatisticas = calcularEstatisticasEquipe(membrosFormatados);

      switch (exportFormat) {
        case 'csv':
          exportEquipeToCSV(membrosFormatados, estatisticas);
          break;
        case 'excel':
          exportEquipeToExcel(membrosFormatados, estatisticas);
          break;
        case 'pdf':
          exportEquipeToPDF(membrosFormatados, estatisticas);
          break;
        case 'json':
          exportEquipeToJSON(membrosFormatados, estatisticas);
          break;
      }

      console.log(`Arquivo exportado com sucesso`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  const getStatusBadge = (status: string, motivo?: string) => {
    const config = getBadgeConfig(status, 'attendance');
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.bgColor} ${config.textColor} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minha Equipe</h1>
            <p className="text-gray-600 mt-1">
              Gestão e acompanhamento da equipe - {user?.department}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowExportModal(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsConfigurarEquipeOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
            <Button variant="default" size="sm" onClick={() => setIsAdicionarMembroOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total da Equipe</p>
                  <p className="text-3xl font-bold text-blue-600">{statsData.totalEquipe}</p>
                  <p className="text-xs text-gray-500 mt-1">Funcionários ativos</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Presentes Hoje</p>
                  <p className="text-3xl font-bold text-green-600">{statsData.presentesHoje}</p>
                  <p className="text-xs text-gray-500 mt-1">{statsData.ausentesHoje} ausentes</p>
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
                  <p className="text-sm font-medium text-gray-600">Atrasos Hoje</p>
                  <p className="text-3xl font-bold text-orange-600">{statsData.atrasosHoje}</p>
                  <p className="text-xs text-gray-500 mt-1">Funcionários em atraso</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Extras (Mês)</p>
                  <p className="text-3xl font-bold text-purple-600">{statsData.horasExtrasMes}</p>
                  <p className="text-xs text-gray-500 mt-1">Total acumulado</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, matrícula ou cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("todos")}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === "presente" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("presente")}
                >
                  Presentes
                </Button>
                <Button
                  variant={filterStatus === "ausente" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("ausente")}
                >
                  Ausentes
                </Button>
                <Button
                  variant={filterStatus === "atraso" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("atraso")}
                >
                  Atrasos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela da Equipe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista da Equipe ({equipeFiltrada.length} funcionários)
            </CardTitle>
            <CardDescription>
              Acompanhe o status e informações da sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status Hoje</TableHead>
                    <TableHead>Horários</TableHead>
                    <TableHead>H. Extras (Mês)</TableHead>
                    <TableHead>Faltas</TableHead>
                    <TableHead>Atrasos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipeFiltrada.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{funcionario.nome}</div>
                          <div className="text-sm text-gray-500">Mat: {funcionario.matricula}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{funcionario.cargo}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(funcionario.status)}
                        {funcionario.motivo && (
                          <div className="text-xs text-gray-500 mt-1">{funcionario.motivo}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {funcionario.entrada} - {funcionario.saida}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{funcionario.horasExtras}h</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{funcionario.faltas}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{funcionario.atrasos}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                          <Button size="sm" variant="outline">
                            Histórico
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relatórios da Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Relatório Mensal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Horas Extras
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Faltas e Atrasos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Jornadas de Trabalho
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Equipe
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Escalas e Plantões
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar Pendências
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Adicionar Membro */}
      <AdicionarMembro 
        isOpen={isAdicionarMembroOpen}
        onClose={() => setIsAdicionarMembroOpen(false)}
        onMembroAdicionado={(membro) => {
          console.log('Membro adicionado:', membro);
          // Aqui você pode adicionar lógica para atualizar a lista da equipe
          setIsAdicionarMembroOpen(false);
        }}
      />

      {/* Modal Configurar Equipe */}
      <ConfigurarEquipe 
        isOpen={isConfigurarEquipeOpen}
        onClose={() => setIsConfigurarEquipeOpen(false)}
      />

      {/* Modal de Exportação */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Dados da Equipe</DialogTitle>
            <DialogDescription>
              Selecione o formato desejado para exportar os dados da sua equipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Formato de Exportação</label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'pdf' | 'json') => setExportFormat(value)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Planilha)</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (Relatório)</SelectItem>
                  <SelectItem value="json">JSON (Dados)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default MinhaEquipe;