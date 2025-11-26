import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  FileText, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Ocorrencia {
  id: string;
  tipo: 'ajuste_ponto' | 'justificativa_falta' | 'justificativa_atraso';
  data: string;
  horarioOriginal?: string;
  novoHorario?: string;
  motivo: string;
  justificativa: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataSolicitacao: string;
  dataResposta?: string;
  aprovadoPor?: string;
  observacoes?: string;
  anexos?: string[];
}

interface OccurrenceListProps {
  ocorrencias: Ocorrencia[];
  onViewDetails: (ocorrencia: Ocorrencia) => void;
  onDownloadAttachment?: (anexo: string) => void;
}

export const OccurrenceList: React.FC<OccurrenceListProps> = ({
  ocorrencias,
  onViewDetails,
  onDownloadAttachment
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { 
        variant: 'secondary' as const, 
        icon: AlertCircle, 
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      aprovado: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: 'Aprovado',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      rejeitado: { 
        variant: 'destructive' as const, 
        icon: XCircle, 
        label: 'Rejeitado',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ajuste_ponto': 'Ajuste de Ponto',
      'justificativa_falta': 'Justificativa de Falta',
      'justificativa_atraso': 'Justificativa de Atraso'
    };
    return labels[tipo] || tipo;
  };

  const getMotivoLabel = (motivo: string) => {
    const labels: Record<string, string> = {
      'esquecimento': 'Esquecimento',
      'problema_tecnico': 'Problema Técnico',
      'reuniao': 'Reunião',
      'transito': 'Trânsito',
      'saude': 'Questões de Saúde',
      'emergencia': 'Emergência',
      'outros': 'Outros'
    };
    return labels[motivo] || motivo;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (ocorrencias.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma solicitação encontrada
          </h3>
          <p className="text-gray-500 text-center">
            Você ainda não possui solicitações de ocorrências.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ocorrencias.map((ocorrencia) => (
        <Card key={ocorrencia.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {getTipoLabel(ocorrencia.tipo)}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(ocorrencia.data)}
                  </span>
                  {ocorrencia.tipo === 'ajuste_ponto' && ocorrencia.horarioOriginal && ocorrencia.novoHorario && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {ocorrencia.horarioOriginal} → {ocorrencia.novoHorario}
                    </span>
                  )}
                </CardDescription>
              </div>
              {getStatusBadge(ocorrencia.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Informações principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Motivo</h4>
                <p className="text-sm">{getMotivoLabel(ocorrencia.motivo)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Data da Solicitação</h4>
                <p className="text-sm">{formatDateTime(ocorrencia.dataSolicitacao)}</p>
              </div>
            </div>

            {/* Justificativa */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-1">Justificativa</h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {ocorrencia.justificativa}
              </p>
            </div>

            {/* Informações de aprovação/rejeição */}
            {ocorrencia.status !== 'pendente' && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ocorrencia.dataResposta && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">
                        Data da Resposta
                      </h4>
                      <p className="text-sm">{formatDateTime(ocorrencia.dataResposta)}</p>
                    </div>
                  )}
                  {ocorrencia.aprovadoPor && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">
                        {ocorrencia.status === 'aprovado' ? 'Aprovado por' : 'Rejeitado por'}
                      </h4>
                      <p className="text-sm flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ocorrencia.aprovadoPor}
                      </p>
                    </div>
                  )}
                </div>

                {ocorrencia.observacoes && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Observações
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {ocorrencia.observacoes}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Anexos */}
            {ocorrencia.anexos && ocorrencia.anexos.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Anexos ({ocorrencia.anexos.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ocorrencia.anexos.map((anexo, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadAttachment?.(anexo)}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Anexo {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(ocorrencia)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};