import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  User, 
  MessageSquare, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Tag
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

interface OccurrenceDetailsProps {
  ocorrencia: Ocorrencia | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadAttachment?: (anexo: string) => void;
}

export const OccurrenceDetails: React.FC<OccurrenceDetailsProps> = ({
  ocorrencia,
  isOpen,
  onClose,
  onDownloadAttachment
}) => {
  if (!ocorrencia) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { 
        icon: AlertCircle, 
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      aprovado: { 
        icon: CheckCircle, 
        label: 'Aprovado',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      rejeitado: { 
        icon: XCircle, 
        label: 'Rejeitado',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <Badge className={config.className}>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">
                {getTipoLabel(ocorrencia.tipo)}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Protocolo: #{ocorrencia.id}
              </DialogDescription>
            </div>
            {getStatusBadge(ocorrencia.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Ocorrência */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações da Ocorrência
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Data da Ocorrência:</span>
                </div>
                <p className="text-sm ml-6">{formatDate(ocorrencia.data)}</p>
              </div>

              {ocorrencia.tipo === 'ajuste_ponto' && ocorrencia.horarioOriginal && ocorrencia.novoHorario && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Horários:</span>
                  </div>
                  <p className="text-sm ml-6">
                    <span className="text-red-600">{ocorrencia.horarioOriginal}</span>
                    {' → '}
                    <span className="text-green-600">{ocorrencia.novoHorario}</span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">Motivo:</span>
                </div>
                <p className="text-sm ml-6">{getMotivoLabel(ocorrencia.motivo)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Data da Solicitação:</span>
                </div>
                <p className="text-sm ml-6">{formatDateTime(ocorrencia.dataSolicitacao)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Justificativa:</span>
              </div>
              <div className="ml-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{ocorrencia.justificativa}</p>
              </div>
            </div>
          </div>

          {/* Anexos */}
          {ocorrencia.anexos && ocorrencia.anexos.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Anexos ({ocorrencia.anexos.length})
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ocorrencia.anexos.map((anexo, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => onDownloadAttachment?.(anexo)}
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-4 h-4" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Anexo {index + 1}</p>
                          <p className="text-xs text-gray-500">Clique para baixar</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Status e Aprovação */}
          {ocorrencia.status !== 'pendente' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {ocorrencia.status === 'aprovado' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {ocorrencia.status === 'aprovado' ? 'Aprovação' : 'Rejeição'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ocorrencia.dataResposta && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Data da Resposta:</span>
                      </div>
                      <p className="text-sm ml-6">{formatDateTime(ocorrencia.dataResposta)}</p>
                    </div>
                  )}

                  {ocorrencia.aprovadoPor && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {ocorrencia.status === 'aprovado' ? 'Aprovado por:' : 'Rejeitado por:'}
                        </span>
                      </div>
                      <p className="text-sm ml-6">{ocorrencia.aprovadoPor}</p>
                    </div>
                  )}
                </div>

                {ocorrencia.observacoes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">Observações:</span>
                    </div>
                    <div className="ml-6 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{ocorrencia.observacoes}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Status Pendente */}
          {ocorrencia.status === 'pendente' && (
            <>
              <Separator />
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Aguardando Análise</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Sua solicitação está sendo analisada pela equipe responsável. 
                  Você será notificado assim que houver uma resposta.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};