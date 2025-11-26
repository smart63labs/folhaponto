import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Paperclip } from 'lucide-react';

interface Occurrence {
  id: string;
  tipo: string;
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  motivo: string;
  justificativa: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  anexos?: string[];
}

interface OccurrenceGridViewProps {
  occurrences: Occurrence[];
  onViewDetails: (occurrence: Occurrence) => void;
}

const OccurrenceGridView: React.FC<OccurrenceGridViewProps> = ({ 
  occurrences, 
  onViewDetails 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (occurrences.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma ocorrência encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">ID</th>
            <th className="text-left p-3 font-medium">Tipo</th>
            <th className="text-left p-3 font-medium">Data/Hora Início</th>
            <th className="text-left p-3 font-medium">Data/Hora Fim</th>
            <th className="text-left p-3 font-medium">Motivo</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Anexos</th>
            <th className="text-left p-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {occurrences.map((occurrence) => (
            <tr key={occurrence.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-mono text-sm">{occurrence.id}</td>
              <td className="p-3">
                <span className="text-sm font-medium">{occurrence.tipo}</span>
              </td>
              <td className="p-3">
                <div className="text-sm">
                  <div>{occurrence.dataInicio}</div>
                  <div className="text-gray-500">{occurrence.horaInicio}</div>
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm">
                  <div>{occurrence.dataFim}</div>
                  <div className="text-gray-500">{occurrence.horaFim}</div>
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm max-w-xs truncate" title={occurrence.motivo}>
                  {occurrence.motivo}
                </div>
              </td>
              <td className="p-3">
                <Badge className={getStatusColor(occurrence.status)}>
                  {occurrence.status}
                </Badge>
              </td>
              <td className="p-3">
                {occurrence.anexos && occurrence.anexos.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Paperclip className="h-4 w-4 mr-1" />
                    {occurrence.anexos.length}
                  </div>
                )}
              </td>
              <td className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(occurrence)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OccurrenceGridView;