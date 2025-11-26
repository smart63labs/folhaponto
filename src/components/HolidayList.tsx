import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2,
  Globe,
  MapPin,
  Building,
  CheckCircle,
  X,
  AlertCircle,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff
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

interface HolidayListProps {
  holidays: Holiday[];
  cities?: City[];
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (holidayId: string) => void;
  onView?: (holiday: Holiday) => void;
  isLoading?: boolean;
  showActions?: boolean;
  showFilters?: boolean;
  selectedYear?: number;
  onYearChange?: (year: number) => void;
}

type SortField = 'name' | 'date' | 'type' | 'city';
type SortOrder = 'asc' | 'desc';

const HolidayList: React.FC<HolidayListProps> = ({
  holidays,
  cities = [],
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  showActions = true,
  showFilters = true,
  selectedYear,
  onYearChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showInactive, setShowInactive] = useState(true);

  // Filtrar e ordenar feriados
  const filteredAndSortedHolidays = useMemo(() => {
    let filtered = holidays.filter(holiday => {
      const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           holiday.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           holiday.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || holiday.type === filterType;
      const matchesCity = filterCity === 'all' || holiday.city === filterCity;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && holiday.isActive) ||
                           (filterStatus === 'inactive' && !holiday.isActive);
      const matchesVisibility = showInactive || holiday.isActive;
      
      return matchesSearch && matchesType && matchesCity && matchesStatus && matchesVisibility;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'city':
          aValue = a.city?.toLowerCase() || '';
          bValue = b.city?.toLowerCase() || '';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [holidays, searchTerm, filterType, filterCity, filterStatus, showInactive, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (holidayId: string, holidayName: string) => {
    if (confirm(`Tem certeza que deseja excluir o feriado "${holidayName}"?`)) {
      onDelete?.(holidayId);
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
      case 'nacional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'estadual': return 'bg-green-100 text-green-800 border-green-200';
      case 'municipal': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'nacional': return 'Nacional';
      case 'estadual': return 'Estadual';
      case 'municipal': return 'Municipal';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  // Estatísticas
  const stats = useMemo(() => {
    const total = holidays.length;
    const active = holidays.filter(h => h.isActive).length;
    const byType = holidays.reduce((acc, holiday) => {
      acc[holiday.type] = (acc[holiday.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, byType };
  }, [holidays]);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Nacionais</p>
                <p className="text-2xl font-bold text-blue-600">{stats.byType.nacional || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Municipais</p>
                <p className="text-2xl font-bold text-purple-600">{stats.byType.municipal || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Busca */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome, descrição ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Ano */}
              {selectedYear !== undefined && onYearChange && (
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => onYearChange(parseInt(value))}
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
              )}

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="filterType">Tipo</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="nacional">Nacional</SelectItem>
                    <SelectItem value="estadual">Estadual</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="filterCity">Cidade</Label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Apenas ativos</SelectItem>
                      <SelectItem value="inactive">Apenas inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInactive(!showInactive)}
                  >
                    {showInactive ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Ocultar inativos
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Mostrar inativos
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {filteredAndSortedHolidays.length} de {holidays.length} feriados
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Feriados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Feriados {selectedYear && `de ${selectedYear}`}
          </CardTitle>
          <CardDescription>
            {filteredAndSortedHolidays.length} feriado(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAndSortedHolidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum feriado encontrado</p>
              <p className="text-sm">
                {holidays.length === 0 
                  ? 'Não há feriados cadastrados ainda.'
                  : 'Tente ajustar os filtros para encontrar feriados.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Cabeçalho da tabela */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 rounded-lg font-medium text-sm">
                <div 
                  className="col-span-3 flex items-center space-x-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('name')}
                >
                  <span>Nome</span>
                  {getSortIcon('name')}
                </div>
                <div 
                  className="col-span-2 flex items-center space-x-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('date')}
                >
                  <span>Data</span>
                  {getSortIcon('date')}
                </div>
                <div 
                  className="col-span-2 flex items-center space-x-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('type')}
                >
                  <span>Tipo</span>
                  {getSortIcon('type')}
                </div>
                <div 
                  className="col-span-2 flex items-center space-x-1 cursor-pointer hover:text-primary"
                  onClick={() => handleSort('city')}
                >
                  <span>Cidade</span>
                  {getSortIcon('city')}
                </div>
                <div className="col-span-1">Status</div>
                {showActions && <div className="col-span-2">Ações</div>}
              </div>

              {/* Linhas da tabela */}
              {filteredAndSortedHolidays.map(holiday => (
                <div
                  key={holiday.id}
                  className={`grid grid-cols-12 gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors ${
                    !holiday.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="col-span-3">
                    <h3 className="font-medium">{holiday.name}</h3>
                    {holiday.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {holiday.description}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 text-sm">
                    {formatDate(holiday.date)}
                  </div>

                  <div className="col-span-2">
                    <Badge className={`${getTypeBadgeColor(holiday.type)} flex items-center space-x-1 w-fit`}>
                      {getTypeIcon(holiday.type)}
                      <span>{getTypeLabel(holiday.type)}</span>
                    </Badge>
                  </div>

                  <div className="col-span-2 text-sm">
                    {holiday.city || '-'}
                  </div>

                  <div className="col-span-1">
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
                  </div>

                  {showActions && (
                    <div className="col-span-2 flex space-x-1">
                      {onView && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(holiday)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(holiday)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(holiday.id, holiday.name)}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HolidayList;