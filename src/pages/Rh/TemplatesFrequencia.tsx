import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Copy,
  Eye,
  Search,
  Filter,
  Settings
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
import { FormBuilder } from '@/components/FormBuilder';
import { DragDropProvider } from '@/contexts/DragDropContext';

interface Template {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'servidor' | 'estagiario' | 'terceirizado';
  categoria: 'mensal' | 'quinzenal' | 'semanal' | 'especial';
  campos: string[];
  status: 'ativo' | 'inativo';
  dataCriacao: string;
  ultimaModificacao: string;
  criadoPor: string;
  utilizacoes: number;
}

const TemplatesFrequencia: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'templates' | 'builder'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    nome: '',
    descricao: '',
    tipo: 'servidor',
    categoria: 'mensal',
    campos: [] as string[]
  });

  // Mock data - em produção viria da API
  const [templates] = useState<Template[]>([
    {
      id: '1',
      nome: 'Frequência Mensal Servidor',
      descricao: 'Template padrão para frequência mensal de servidores efetivos',
      tipo: 'servidor',
      categoria: 'mensal',
      campos: ['Data', 'Entrada', 'Saída Almoço', 'Retorno Almoço', 'Saída', 'Horas Trabalhadas', 'Observações'],
      status: 'ativo',
      dataCriacao: '2024-01-01',
      ultimaModificacao: '2024-01-15',
      criadoPor: 'Admin RH',
      utilizacoes: 245
    },
    {
      id: '2',
      nome: 'Frequência Estagiário',
      descricao: 'Template específico para controle de frequência de estagiários',
      tipo: 'estagiario',
      categoria: 'mensal',
      campos: ['Data', 'Entrada', 'Saída', 'Horas Trabalhadas', 'Atividades Realizadas', 'Supervisor'],
      status: 'ativo',
      dataCriacao: '2024-01-05',
      ultimaModificacao: '2024-01-10',
      criadoPor: 'Maria Silva',
      utilizacoes: 89
    },
    {
      id: '3',
      nome: 'Frequência Terceirizado',
      descricao: 'Template para funcionários terceirizados',
      tipo: 'terceirizado',
      categoria: 'mensal',
      campos: ['Data', 'Entrada', 'Saída', 'Empresa', 'Setor', 'Responsável', 'Observações'],
      status: 'ativo',
      dataCriacao: '2024-01-03',
      ultimaModificacao: '2024-01-12',
      criadoPor: 'João Santos',
      utilizacoes: 156
    },
    {
      id: '4',
      nome: 'Frequência Semanal Especial',
      descricao: 'Template para situações especiais com controle semanal',
      tipo: 'servidor',
      categoria: 'semanal',
      campos: ['Data', 'Entrada', 'Saída', 'Motivo Especial', 'Autorização', 'Observações'],
      status: 'inativo',
      dataCriacao: '2023-12-15',
      ultimaModificacao: '2023-12-20',
      criadoPor: 'Ana Costa',
      utilizacoes: 23
    }
  ]);

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      servidor: 'Servidor',
      estagiario: 'Estagiário',
      terceirizado: 'Terceirizado'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getCategoriaLabel = (categoria: string) => {
    const categorias = {
      mensal: 'Mensal',
      quinzenal: 'Quinzenal',
      semanal: 'Semanal',
      especial: 'Especial'
    };
    return categorias[categoria as keyof typeof categorias] || categoria;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-800' }
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
      servidor: 'bg-blue-100 text-blue-800',
      estagiario: 'bg-purple-100 text-purple-800',
      terceirizado: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={tipoConfig[tipo as keyof typeof tipoConfig]}>
        {getTipoLabel(tipo)}
      </Badge>
    );
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || template.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || template.status === statusFilter;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const handleCreateTemplate = () => {
    console.log('Criar template:', newTemplate);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      nome: '',
      descricao: '',
      tipo: 'servidor',
      categoria: 'mensal',
      campos: []
    });
  };

  const handleDuplicateTemplate = (id: string) => {
    console.log('Duplicar template:', id);
  };

  const handleDownloadTemplate = (id: string) => {
    console.log('Download template:', id);
  };

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates de Frequência</h1>
            <p className="text-gray-600">Gerencie modelos de frequência para diferentes tipos de funcionários</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Crie um novo template de frequência personalizado.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={newTemplate.nome}
                      onChange={(e) => setNewTemplate({...newTemplate, nome: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="descricao" className="text-right">
                      Descrição
                    </Label>
                    <Textarea
                      id="descricao"
                      value={newTemplate.descricao}
                      onChange={(e) => setNewTemplate({...newTemplate, descricao: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tipo" className="text-right">
                      Tipo
                    </Label>
                    <Select value={newTemplate.tipo} onValueChange={(value) => setNewTemplate({...newTemplate, tipo: value as any})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servidor">Servidor</SelectItem>
                        <SelectItem value="estagiario">Estagiário</SelectItem>
                        <SelectItem value="terceirizado">Terceirizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="categoria" className="text-right">
                      Categoria
                    </Label>
                    <Select value={newTemplate.categoria} onValueChange={(value) => setNewTemplate({...newTemplate, categoria: value as any})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="especial">Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateTemplate}>
                    Criar Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Gerenciar Templates
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'builder'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Construtor Visual
          </button>
        </div>

        {/* Content */}
        {activeTab === 'templates' ? (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Templates</p>
                      <p className="text-3xl font-bold text-blue-600">{templates.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Templates cadastrados</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
    
              <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Templates Ativos</p>
                      <p className="text-3xl font-bold text-green-600">
                        {templates.filter(t => t.status === 'ativo').length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Em uso atualmente</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
    
              <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mais Utilizado</p>
                      <p className="text-lg font-bold text-purple-600">Servidor Mensal</p>
                      <p className="text-xs text-gray-500 mt-1">Template popular</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
    
              <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Usos</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {templates.reduce((acc, t) => acc + t.utilizacoes, 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Utilizações totais</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <FileText className="w-8 h-8 text-orange-600" />
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
                  <SelectItem value="servidor">Servidor</SelectItem>
                  <SelectItem value="estagiario">Estagiário</SelectItem>
                  <SelectItem value="terceirizado">Terceirizado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Templates</CardTitle>
            <CardDescription>
              {filteredTemplates.length} template(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Utilizações</TableHead>
                  <TableHead>Última Modificação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.nome}</div>
                        <div className="text-sm text-gray-500">{template.descricao}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(template.tipo)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoriaLabel(template.categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(template.status)}</TableCell>
                    <TableCell>
                      <div className="text-center font-medium">{template.utilizacoes}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(template.ultimaModificacao).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="Visualizar">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Duplicar"
                          onClick={() => handleDuplicateTemplate(template.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Download"
                          onClick={() => handleDownloadTemplate(template.id)}
                        >
                          <Download className="w-4 h-4" />
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
          </>
        ) : (
          /* Construtor Visual */
          <DragDropProvider>
            <FormBuilder />
          </DragDropProvider>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TemplatesFrequencia;