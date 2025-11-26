import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { holidayService, ImportResult } from '@/services/holidayService';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  MapPin,
  Globe,
  Building,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'nacional' | 'estadual' | 'municipal';
  city?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface City {
  id: string;
  name: string;
  code: string;
}

const GerenciamentoFeriados: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Import states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importYears, setImportYears] = useState<number[]>([new Date().getFullYear()]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'nacional' as 'nacional' | 'estadual' | 'municipal',
    city: '',
    description: '',
    isActive: true
  });

  // Cidades do Tocantins
  const tocantinsCities: City[] = [
    { id: '1', name: 'Palmas', code: '1721000' },
    { id: '2', name: 'Araguaína', code: '1702109' },
    { id: '3', name: 'Gurupi', code: '1709500' },
    { id: '4', name: 'Porto Nacional', code: '1718204' },
    { id: '5', name: 'Paraíso do Tocantins', code: '1716109' },
    { id: '6', name: 'Colinas do Tocantins', code: '1705508' },
    { id: '7', name: 'Guaraí', code: '1709302' },
    { id: '8', name: 'Formoso do Araguaia', code: '1708205' },
    { id: '9', name: 'Dianópolis', code: '1707009' },
    { id: '10', name: 'Tocantinópolis', code: '1721208' },
    { id: '11', name: 'Miracema do Tocantins', code: '1713205' },
    { id: '12', name: 'Miranorte', code: '1713304' },
    { id: '13', name: 'Pedro Afonso', code: '1716505' },
    { id: '14', name: 'Taguatinga', code: '1720903' },
    { id: '15', name: 'Arraias', code: '1702406' },
    { id: '16', name: 'Augustinópolis', code: '1702554' },
    { id: '17', name: 'Axixá do Tocantins', code: '1703008' },
    { id: '18', name: 'Babaçulândia', code: '1703057' },
    { id: '19', name: 'Campos Lindos', code: '1703842' },
    { id: '20', name: 'Araguacema', code: '1701903' }
  ];

  useEffect(() => {
    setCities(tocantinsCities);
    loadHolidays();
  }, [selectedYear]);

  const loadHolidays = async () => {
    setIsLoading(true);
    try {
      // Simulação de carregamento de feriados
      // Em produção, isso seria uma chamada para a API
      const mockHolidays: Holiday[] = [
        {
          id: '1',
          name: 'Confraternização Universal',
          date: `${selectedYear}-01-01`,
          type: 'nacional',
          description: 'Feriado nacional',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Criação do Estado do Tocantins',
          date: `${selectedYear}-10-05`,
          type: 'estadual',
          description: 'Feriado estadual do Tocantins',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Aniversário de Palmas',
          date: `${selectedYear}-05-20`,
          type: 'municipal',
          city: 'Palmas',
          description: 'Aniversário da capital do Tocantins',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      setHolidays(mockHolidays);
    } catch (error) {
      console.error('Erro ao carregar feriados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          holiday.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || holiday.type === filterType;
    const matchesCity = filterCity === 'all' || holiday.city === filterCity;

    return matchesSearch && matchesType && matchesCity;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const holidayData = {
        ...formData,
        id: editingHoliday?.id || Date.now().toString(),
        createdAt: editingHoliday?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingHoliday) {
        // Atualizar feriado existente
        setHolidays(prev => prev.map(h => h.id === editingHoliday.id ? holidayData as Holiday : h));
      } else {
        // Adicionar novo feriado
        setHolidays(prev => [...prev, holidayData as Holiday]);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar feriado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      city: holiday.city || '',
      description: holiday.description || '',
      isActive: holiday.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (holidayId: string) => {
    if (confirm('Tem certeza que deseja excluir este feriado?')) {
      setHolidays(prev => prev.filter(h => h.id !== holidayId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      type: 'nacional',
      city: '',
      description: '',
      isActive: true
    });
    setEditingHoliday(null);
  };

  // Import functions
  const handleImportFromAPI = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      const results: ImportResult[] = [];

      for (let i = 0; i < importYears.length; i++) {
        const year = importYears[i];
        setImportProgress((i / importYears.length) * 50);

        // Import from API
        const apiResult = await holidayService.importHolidaysFromAPI(year);
        results.push(apiResult);

        setImportProgress(((i + 1) / importYears.length) * 50);

        // Save to file
        if (apiResult.success && apiResult.data) {
          await holidayService.saveHolidaysToFile(apiResult.data, year);
        }

        setImportProgress(((i + 1) / importYears.length) * 100);
      }

      // Combine results
      const combinedResult: ImportResult = {
        success: results.every(r => r.success),
        imported: results.reduce((sum, r) => sum + r.imported, 0),
        skipped: results.reduce((sum, r) => sum + r.skipped, 0),
        errors: results.flatMap(r => r.errors),
        data: results.flatMap(r => r.data || [])
      };

      setImportResult(combinedResult);

      if (combinedResult.success) {
        // Reload holidays to show imported data
        await loadHolidays();
      }
    } catch (error) {
      console.error('Erro ao importar feriados:', error);
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [`Erro ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      });
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
  };

  const addImportYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = Math.max(...importYears) + 1;
    if (nextYear <= currentYear + 5) {
      setImportYears([...importYears, nextYear]);
    }
  };

  const removeImportYear = (year: number) => {
    if (importYears.length > 1) {
      setImportYears(importYears.filter(y => y !== year));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nacional': return <Globe className="h-4 w-4" />;
      case 'estadual': return <MapPin className="h-4 w-4" />;
      case 'municipal': return <Building className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'nacional': return 'bg-blue-100 text-blue-800';
      case 'estadual': return 'bg-green-100 text-green-800';
      case 'municipal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Feriados</h1>
            <p className="text-gray-600">Gerencie feriados nacionais, estaduais e municipais do Tocantins</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Feriados</p>
                  <p className="text-3xl font-bold text-blue-600">{holidays.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Feriados cadastrados</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Feriados Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{holidays.filter(h => h.isActive).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Feriados em vigor</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Feriados Nacionais</p>
                  <p className="text-3xl font-bold text-purple-600">{holidays.filter(h => h.type === 'nacional').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Feriados federais</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Feriados Estaduais</p>
                  <p className="text-3xl font-bold text-orange-600">{holidays.filter(h => h.type === 'estadual').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Feriados do Tocantins</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Importar da API
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Importar Feriados da API</DialogTitle>
                <DialogDescription>
                  Importe feriados nacionais e estaduais do Brasil diretamente da API pública.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Anos para Importar</Label>
                  <div className="flex flex-wrap gap-2">
                    {importYears.map((year) => (
                      <div key={year} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                        <span className="text-sm">{year}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeImportYear(year)}
                          disabled={importYears.length === 1}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImportYear}
                      disabled={importYears.length >= 5}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar Ano
                    </Button>
                  </div>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Importando feriados...</span>
                    </div>
                    <Progress value={importProgress} className="w-full" />
                  </div>
                )}

                {importResult && (
                  <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {importResult.success ? (
                        <div>
                          <p className="font-medium text-green-800">Importação concluída com sucesso!</p>
                          <p className="text-sm text-green-700">
                            {importResult.imported} feriados importados, {importResult.skipped} ignorados
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-red-800">Erro na importação</p>
                          <ul className="text-sm text-red-700 mt-1">
                            {importResult.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsImportDialogOpen(false)}
                    disabled={isImporting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleImportFromAPI}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Importar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Feriado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingHoliday ? 'Editar Feriado' : 'Novo Feriado'}
                </DialogTitle>
                <DialogDescription>
                  {editingHoliday
                    ? 'Edite as informações do feriado selecionado.'
                    : 'Adicione um novo feriado ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Feriado</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Dia da Independência"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'nacional' | 'estadual' | 'municipal') =>
                      setFormData(prev => ({ ...prev, type: value, city: value !== 'municipal' ? '' : prev.city }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nacional">Nacional</SelectItem>
                      <SelectItem value="estadual">Estadual</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'municipal' && (
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do feriado..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Feriado ativo</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : editingHoliday ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome do feriado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterType">Tipo</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    <SelectItem value="estadual">Estadual</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterCity">Cidade</Label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holiday List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Feriados de {selectedYear} ({filteredHolidays.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredHolidays.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum feriado encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHolidays.map(holiday => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(holiday.type)}
                        <div>
                          <h3 className="font-medium">{holiday.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(holiday.date).toLocaleDateString('pt-BR')}
                            {holiday.city && ` • ${holiday.city}`}
                          </p>
                          {holiday.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {holiday.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeBadgeColor(holiday.type)}>
                        {holiday.type}
                      </Badge>
                      
                      {holiday.isActive ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <X className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}

                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(holiday)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(holiday.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GerenciamentoFeriados;