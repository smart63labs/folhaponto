import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X, Search } from 'lucide-react';

interface OccurrenceFiltersProps {
  filters: {
    tipo: 'todos' | 'ajuste_ponto' | 'justificativa_falta' | 'justificativa_atraso';
    status: 'todos' | 'pendente' | 'aprovado' | 'rejeitado';
    dataInicio?: string;
    dataFim?: string;
    busca?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const OccurrenceFilters: React.FC<OccurrenceFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
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
          Filtros de Ocorrências
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Busca */}
          <div className="space-y-2">
            <Label htmlFor="busca">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="busca"
                placeholder="Buscar por motivo ou justificativa..."
                value={filters.busca || ''}
                onChange={(e) => handleFilterChange('busca', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={filters.tipo}
              onValueChange={(value) => handleFilterChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ajuste_ponto">Ajuste de Ponto</SelectItem>
                <SelectItem value="justificativa_falta">Justificativa de Falta</SelectItem>
                <SelectItem value="justificativa_atraso">Justificativa de Atraso</SelectItem>
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
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data Início</Label>
            <Input
              type="date"
              id="dataInicio"
              value={filters.dataInicio || ''}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
            />
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <Label htmlFor="dataFim">Data Fim</Label>
            <Input
              type="date"
              id="dataFim"
              value={filters.dataFim || ''}
              onChange={(e) => handleFilterChange('dataFim', e.target.value)}
            />
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};