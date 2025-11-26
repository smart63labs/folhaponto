import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  Download,
  Upload,
  Eye,
  Save,
  X
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
import { CepService } from '@/services/cepService';
import { useSectors } from '@/hooks/useSectors';
import { FlexibleScheduleManager } from '@/components/Admin/FlexibleScheduleManager';
import { EmployeeWizard } from '@/components/Rh/EmployeeWizard';
import { Servidor, ServidorFilters } from '../../types/servidor';
import { Sector } from '../../types/sector';
import { ServidorService } from '../../services/servidorService';


const GestaoServidores: React.FC = () => {
  const { user } = useAuth();
  const { sectors, getSectorOptions, getSectorName, loading: sectorsLoading } = useSectors();
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [setores, setSetores] = useState<Sector[]>([]);
  const [filters, setFilters] = useState<ServidorFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'servidores' | 'horarios-flexiveis'>('servidores');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [setorFilter, setSetorFilter] = useState('todos');

  // Estados para gestão de servidores
  const [dialogoNovoServidor, setDialogoNovoServidor] = useState(false);
  const [servidorEditando, setServidorEditando] = useState<Servidor | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servidoresData, setoresData] = await Promise.all([
        ServidorService.getServidores(),
        ServidorService.getSetores()
      ]);
      
      setServidores(servidoresData);
      setSetores(setoresData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros usando useMemo para otimização
  const filteredServidores = useMemo(() => {
    return servidores.filter(servidor => {
      const matchesSearch = servidor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           servidor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           servidor.matricula.includes(searchTerm);
      const matchesStatus = statusFilter === 'todos' || servidor.status === statusFilter;
      const matchesSetor = setorFilter === 'todos' || servidor.setor === setorFilter;
      
      return matchesSearch && matchesStatus && matchesSetor;
    });
  }, [servidores, searchTerm, statusFilter, setorFilter]);

  const handleFilterChange = (field: keyof ServidorFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handleEdit = (servidor: Servidor) => {
    setServidorEditando(servidor);
    setDialogoNovoServidor(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este servidor?')) {
      try {
        await ServidorService.deleteServidor(id);
        await loadData();
        setSnackbar({ open: true, message: 'Servidor excluído com sucesso!', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: 'Erro ao excluir servidor', severity: 'error' });
      }
    }
  };

  const getSetorName = (setorId: number) => {
    const setor = setores.find(s => s.id === setorId);
    return setor ? setor.name : 'Setor não encontrado';
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      inativo: { label: 'Inativo', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      licenca: { label: 'Licença', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' },
      ferias: { label: 'Férias', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const setoresUnicos = [...new Set(servidores.map(s => s.setor).filter(setor => setor != null))];
  const defaultSetores = ['Recursos Humanos', 'Tecnologia da Informação', 'Fiscalização', 'Arrecadação'];

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-purple-100 text-purple-800',
      rh: 'bg-blue-100 text-blue-800',
      chefia: 'bg-orange-100 text-orange-800',
      servidor: 'bg-gray-100 text-gray-800'
    };

    return variants[role as keyof typeof variants] || variants.servidor;
  };

  const abrirModalServidor = (servidor?: Servidor) => {
    setServidorEditando(servidor);
    setDialogoNovoServidor(true);
  };

  const handleSalvarServidor = (data: any) => {
    // Aqui você implementaria a lógica de salvamento
    console.log('Salvando servidor:', data);

    // Simular salvamento
    if (servidorEditando) {
      // Atualizar servidor existente
      console.log('Atualizando servidor:', servidorEditando.id);
    } else {
      // Criar novo servidor
      console.log('Criando novo servidor');
    }

    setDialogoNovoServidor(false);
    setServidorEditando(null);
  };

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Servidores</h1>
            <p className="text-gray-600">Gerencie servidores e usuários da SEFAZ-TO</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={currentView === 'servidores' ? 'default' : 'outline'}
            onClick={() => setCurrentView('servidores')}
          >
            Servidores
          </Button>
          <Button
            variant={currentView === 'horarios-flexiveis' ? 'default' : 'outline'}
            onClick={() => setCurrentView('horarios-flexiveis')}
          >
            Horários Flexíveis
          </Button>
        </div>

        {/* Content based on current view */}
        {currentView === 'servidores' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" onClick={() => abrirModalServidor()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Servidor
              </Button>
            </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Servidores</p>
                  <p className="text-3xl font-bold text-blue-600">{servidores.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Ativos no sistema</p>
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
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {servidores.filter(s => s.status === 'ativo').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Servidores ativos</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Férias</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {servidores.filter(s => s.status === 'ferias').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Servidores ausentes</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <UserX className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Licença</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {servidores.filter(s => s.status === 'licenca').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Licenças médicas</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <UserX className="w-8 h-8 text-yellow-600" />
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
                    placeholder="Buscar por nome, email ou matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="todos" value="todos">Todos os Status</SelectItem>
                  <SelectItem key="ativo" value="ativo">Ativo</SelectItem>
                  <SelectItem key="inativo" value="inativo">Inativo</SelectItem>
                  <SelectItem key="licenca" value="licenca">Licença</SelectItem>
                  <SelectItem key="ferias" value="ferias">Férias</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={setorFilter} onValueChange={setSetorFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="todos-setores" value="todos">Todos os Setores</SelectItem>
                  {(setoresUnicos.length ? setoresUnicos : defaultSetores).map((setor, index) => (
                    <SelectItem key={`setor-${index}-${setor}`} value={setor}>{setor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Servidores Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Servidores</CardTitle>
            <CardDescription>
              {filteredServidores.length} servidor(es) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jornada</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServidores.map((servidor) => (
                  <TableRow key={servidor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{servidor.nome}</div>
                        <div className="text-sm text-gray-500">{servidor.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{servidor.matricula}</TableCell>
                    <TableCell>{servidor.cargo}</TableCell>
                    <TableCell>{servidor.setor}</TableCell>
                    <TableCell>{getStatusBadge(servidor.status)}</TableCell>
                    <TableCell>{servidor.jornada}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
        )}

        {/* Horários Flexíveis View */}
        {currentView === 'horarios-flexiveis' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestão de Horários Flexíveis</CardTitle>
                  <CardDescription>
                    Gerencie horários flexíveis para chefias, home-office e estagiários
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FlexibleScheduleManager
                users={[]}
                onUpdateUser={(userId, updates) => {
                  console.log('Update user:', userId, updates);
                }}
              />
            </CardContent>
          </Card>
        )}


        {/* Employee Wizard Component */}
        <EmployeeWizard
          open={dialogoNovoServidor}
          onOpenChange={setDialogoNovoServidor}
          onSave={handleSalvarServidor}
          editing={!!servidorEditando}
        />

      </div>
    </DashboardLayout>
  );
};

export default GestaoServidores;