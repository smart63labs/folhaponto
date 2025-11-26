import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FrequencyFiltersProps {
  filters: {
    periodo: 'mensal' | 'semanal' | 'quinzenal' | 'personalizado';
    status: 'todos' | 'presente' | 'falta' | 'atraso' | 'feriado';
    dataInicio?: Date;
    dataFim?: Date;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export const FrequencyFilters: React.FC<FrequencyFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onExport
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros e Exportação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <Select
              value={filters.periodo}
              onValueChange={(value) => handleFilterChange('periodo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="presente">Presente</SelectItem>
                <SelectItem value="falta">Falta</SelectItem>
                <SelectItem value="atraso">Atraso</SelectItem>
                <SelectItem value="feriado">Feriado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Início (apenas para período personalizado) */}
          {filters.periodo === 'personalizado' && (
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                type="date"
                value={filters.dataInicio ? format(filters.dataInicio, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          )}

          {/* Data Fim (apenas para período personalizado) */}
          {filters.periodo === 'personalizado' && (
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                type="date"
                value={filters.dataFim ? format(filters.dataFim, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFilterChange('dataFim', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onExport('pdf')}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport('excel')}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport('csv')}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};