import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Paperclip, Calendar, Clock, FileText, AlertTriangle } from 'lucide-react';

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

interface OccurrenceListViewProps {
  occurrences: Occurrence[];
  onViewDetails: (occurrence: Occurrence) => void;
}

const OccurrenceListView: React.FC<OccurrenceListViewProps> = ({ 
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'Rejeitado':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'Pendente':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {occurrences.map((occurrence) => (
        <Card key={occurrence.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                #{occurrence.id}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(occurrence.status)}
                <Badge className={getStatusColor(occurrence.status)}>
                  {occurrence.status}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {occurrence.tipo}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{occurrence.dataInicio}</span>
              <Clock className="h-4 w-4 text-gray-500 ml-2" />
              <span>{occurrence.horaInicio}</span>
            </div>
            
            {occurrence.dataFim && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{occurrence.dataFim}</span>
                <Clock className="h-4 w-4 text-gray-500 ml-2" />
                <span>{occurrence.horaFim}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Motivo:</div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {occurrence.motivo}
                  </div>
                </div>
              </div>
              
              {occurrence.justificativa && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Justificativa:</div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {occurrence.justificativa}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              {occurrence.anexos && occurrence.anexos.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Paperclip className="h-4 w-4" />
                  <span>{occurrence.anexos.length} anexo(s)</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(occurrence)}
                className="flex items-center gap-1 ml-auto"
              >
                <Eye className="h-4 w-4" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OccurrenceListView;