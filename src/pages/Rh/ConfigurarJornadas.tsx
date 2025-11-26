import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Copy,
  Settings,
  Search,
  Filter,
  Calendar,
  Users
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

interface Jornada {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'padrao' | 'flexivel' | 'especial';
  horaInicio: string;
  horaFim: string;
  intervalos: {
    inicio: string;
    fim: string;
    descricao: string;
  }[];
  cargaHorariaDiaria: number;
  cargaHorariaSemanal: number;
  diasSemana: string[];
  toleranciaEntrada: number; // em minutos
  toleranciaSaida: number; // em minutos
  status: 'ativa' | 'inativa';
  dataCriacao: string;
  ultimaModificacao: string;
  criadoPor: string;
  servidoresVinculados: number;
}

const ConfigurarJornadas: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newJornada, setNewJornada] = useState({
    nome: '',
    descricao: '',
    tipo: 'padrao',
    horaInicio: '08:00',
    horaFim: '17:00',
    intervalos: [{ inicio: '12:00', fim: '13:00', descricao: 'Almoço' }],
    cargaHorariaDiaria: 8,
    toleranciaEntrada: 15,
    toleranciaSaida: 15,
    diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
  });

  // Mock data - em produção viria da API
  const [jornadas] = useState<Jornada[]>([
    {
      id: '1',
      nome: 'Jornada Padrão 8h',
      descricao: 'Jornada padrão de 8 horas diárias para servidores efetivos',
      tipo: 'padrao',
      horaInicio: '08:00',
      horaFim: '17:00',
      intervalos: [
        { inicio: '12:00', fim: '13:00', descricao: 'Almoço' }
      ],
      cargaHorariaDiaria: 8,
      cargaHorariaSemanal: 40,
      diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
      toleranciaEntrada: 15,
      toleranciaSaida: 15,
      status: 'ativa',
      dataCriacao: '2024-01-01',
      ultimaModificacao: '2024-01-15',
      criadoPor: 'Admin RH',
      servidoresVinculados: 245
    },
    {
      id: '2',
      nome: 'Jornada Flexível',
      descricao: 'Jornada flexível com horário de entrada entre 7h e 9h',
      tipo: 'flexivel',
      horaInicio: '07:00',
      horaFim: '16:00',
      intervalos: [
        { inicio: '11:30', fim: '12:30', descricao: 'Almoço' }
      ],
      cargaHorariaDiaria: 8,
      cargaHorariaSemanal: 40,
      diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
      toleranciaEntrada: 30,
      toleranciaSaida: 30,
      status: 'ativa',
      dataCriacao: '2024-01-05',
      ultimaModificacao: '2024-01-10',
      criadoPor: 'Maria Silva',
      servidoresVinculados: 89
    },
    {
      id: '3',
      nome: 'Jornada 6h Estagiário',
      descricao: 'Jornada de 6 horas para estagiários',
      tipo: 'especial',
      horaInicio: '08:00',
      horaFim: '14:00',
      intervalos: [],
      cargaHorariaDiaria: 6,
      cargaHorariaSemanal: 30,
      diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
      toleranciaEntrada: 10,
      toleranciaSaida: 10,
      status: 'ativa',
      dataCriacao: '2024-01-03',
      ultimaModificacao: '2024-01-12',
      criadoPor: 'João Santos',
      servidoresVinculados: 156
    },
    {
      id: '4',
      nome: 'Plantão 12x36',
      descricao: 'Jornada especial para plantões de 12 horas',
      tipo: 'especial',
      horaInicio: '07:00',
      horaFim: '19:00',
      intervalos: [
        { inicio: '12:00', fim: '13:00', descricao: 'Almoço' },
        { inicio: '18:00', fim: '19:00', descricao: 'Jantar' }
      ],
      cargaHorariaDiaria: 12,
      cargaHorariaSemanal: 36,
      diasSemana: ['segunda', 'quarta', 'sexta'],
      toleranciaEntrada: 5,
      toleranciaSaida: 5,
      status: 'inativa',
      dataCriacao: '2023-12-15',
      ultimaModificacao: '2023-12-20',
      criadoPor: 'Ana Costa',
      servidoresVinculados: 23
    }
  ]);

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      padrao: 'Padrão',
      flexivel: 'Flexível',
      especial: 'Especial'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativa: { label: 'Ativa', color: 'bg-green-100 text-green-800' },
      inativa: { label: 'Inativa', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      padrao: 'bg-blue-100 text-blue-800',
      flexivel: 'bg-purple-100 text-purple-800',
      especial: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={tipoConfig[tipo as keyof typeof tipoConfig]}>
        {getTipoLabel(tipo)}
      </Badge>
    );
  };

  const filteredJornadas = jornadas.filter(jornada => {
    const matchesSearch = jornada.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jornada.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || jornada.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || jornada.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const handleCreateJornada = () => {
    console.log('Criar jornada:', newJornada);
    setIsCreateDialogOpen(false);
    setNewJornada({
      nome: '',
      descricao: '',
      tipo: 'padrao',
      horaInicio: '08:00',
      horaFim: '17:00',
      intervalos: [{ inicio: '12:00', fim: '13:00', descricao: 'Almoço' }],
      cargaHorariaDiaria: 8,
      toleranciaEntrada: 15,
      toleranciaSaida: 15,
      diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
    });
  };

  const handleDuplicateJornada = (id: string) => {
    console.log('Duplicar jornada:', id);
  };

  const addIntervalo = () => {
    setNewJornada({
      ...newJornada,
      intervalos: [...newJornada.intervalos, { inicio: '', fim: '', descricao: '' }]
    });
  };

  const removeIntervalo = (index: number) => {
    const novosIntervalos = newJornada.intervalos.filter((_, i) => i !== index);
    setNewJornada({ ...newJornada, intervalos: novosIntervalos });
  };

  const updateIntervalo = (index: number, field: string, value: string) => {
    const novosIntervalos = [...newJornada.intervalos];
    novosIntervalos[index] = { ...novosIntervalos[index], [field]: value };
    setNewJornada({ ...newJornada, intervalos: novosIntervalos });
  };

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurar Jornadas</h1>
            <p className="text-gray-600">Gerencie jornadas de trabalho e horários dos funcionários</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Jornada
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Nova Jornada</DialogTitle>
                  <DialogDescription>
                    Configure uma nova jornada de trabalho personalizada.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={newJornada.nome}
                      onChange={(e) => setNewJornada({...newJornada, nome: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="descricao" className="text-right">
                      Descrição
                    </Label>
                    <Textarea
                      id="descricao"
                      value={newJornada.descricao}
                      onChange={(e) => setNewJornada({...newJornada, descricao: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tipo" className="text-right">
                      Tipo
                    </Label>
                    <Select value={newJornada.tipo} onValueChange={(value) => setNewJornada({...newJornada, tipo: value as any})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padrao">Padrão</SelectItem>
                        <SelectItem value="flexivel">Flexível</SelectItem>
                        <SelectItem value="especial">Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Horários</Label>
                    <div className="col-span-3 flex gap-2">
                      <Input
                        type="time"
                        value={newJornada.horaInicio}
                        onChange={(e) => setNewJornada({...newJornada, horaInicio: e.target.value})}
                        className="flex-1"
                      />
                      <span className="self-center">às</span>
                      <Input
                        type="time"
                        value={newJornada.horaFim}
                        onChange={(e) => setNewJornada({...newJornada, horaFim: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Carga Horária</Label>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={newJornada.cargaHorariaDiaria}
                        onChange={(e) => setNewJornada({...newJornada, cargaHorariaDiaria: Number(e.target.value)})}
                        placeholder="Horas por dia"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">Intervalos</Label>
                    <div className="col-span-3 space-y-2">
                      {newJornada.intervalos.map((intervalo, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            type="time"
                            value={intervalo.inicio}
                            onChange={(e) => updateIntervalo(index, 'inicio', e.target.value)}
                            className="w-24"
                          />
                          <span>às</span>
                          <Input
                            type="time"
                            value={intervalo.fim}
                            onChange={(e) => updateIntervalo(index, 'fim', e.target.value)}
                            className="w-24"
                          />
                          <Input
                            value={intervalo.descricao}
                            onChange={(e) => updateIntervalo(index, 'descricao', e.target.value)}
                            placeholder="Descrição"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIntervalo(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addIntervalo}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Intervalo
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Tolerância</Label>
                    <div className="col-span-3 flex gap-2">
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">Entrada (min)</Label>
                        <Input
                          type="number"
                          value={newJornada.toleranciaEntrada}
                          onChange={(e) => setNewJornada({...newJornada, toleranciaEntrada: Number(e.target.value)})}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">Saída (min)</Label>
                        <Input
                          type="number"
                          value={newJornada.toleranciaSaida}
                          onChange={(e) => setNewJornada({...newJornada, toleranciaSaida: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateJornada}>
                    <Save className="w-4 h-4 mr-2" />
                    Criar Jornada
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
                  <p className="text-sm font-medium text-gray-600">Total de Jornadas</p>
                  <p className="text-3xl font-bold text-blue-600">{jornadas.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Jornadas configuradas</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jornadas Ativas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {jornadas.filter(j => j.status === 'ativa').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Em uso atualmente</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Servidores Vinculados</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {jornadas.reduce((acc, j) => acc + j.servidoresVinculados, 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total alocados</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Carga Horária Média</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round(jornadas.reduce((acc, j) => acc + j.cargaHorariaDiaria, 0) / jornadas.length)}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Por jornada</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="padrao">Padrão</SelectItem>
                  <SelectItem value="flexivel">Flexível</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jornadas Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Jornadas</CardTitle>
            <CardDescription>
              {filteredJornadas.length} jornada(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Carga Horária</TableHead>
                  <TableHead>Servidores</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJornadas.map((jornada) => (
                  <TableRow key={jornada.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{jornada.nome}</div>
                        <div className="text-sm text-gray-500">{jornada.descricao}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(jornada.tipo)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{jornada.horaInicio} - {jornada.horaFim}</div>
                        {jornada.intervalos.length > 0 && (
                          <div className="text-gray-500">
                            Intervalos: {jornada.intervalos.length}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{jornada.cargaHorariaDiaria}h/dia</div>
                        <div className="text-sm text-gray-500">{jornada.cargaHorariaSemanal}h/sem</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center font-medium">{jornada.servidoresVinculados}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(jornada.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Duplicar"
                          onClick={() => handleDuplicateJornada(jornada.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

export default ConfigurarJornadas;