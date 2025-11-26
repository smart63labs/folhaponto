import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDay } from "@/types";
import { getBadgeConfig } from "@/config/badgeConfig";
import { Clock, Calendar, User, FileText, X } from "lucide-react";

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: CalendarDay | null;
  date: number;
  month: string;
  year: number;
}

export function DayDetailsModal({ isOpen, onClose, day, date, month, year }: DayDetailsModalProps) {
  if (!day) return null;

  const config = day.status ? getBadgeConfig(day.status, 'attendance') : null;
  const IconComponent = config?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Detalhes do Dia {date} de {month} {year}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status do Dia */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-700">Status:</div>
              {config && IconComponent ? (
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${config.className}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary" className={config.bgClass}>
                    {config.label}
                  </Badge>
                </div>
              ) : (
                <Badge variant="outline">Sem registro</Badge>
              )}
            </div>
          </div>

          {/* Horários */}
          {day.hours && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900">Horas Trabalhadas</div>
                <div className="text-lg font-bold text-blue-700">{day.hours}</div>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Funcionário: Admin Protocolo</span>
            </div>
            
            {day.isToday && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Dia atual</span>
              </div>
            )}
            
            {day.isWeekend && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Calendar className="h-4 w-4" />
                <span>Final de semana</span>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-800">Observações</div>
                <div className="text-sm text-yellow-700 mt-1">
                  {day.status === 'presente' && 'Presença registrada com sucesso.'}
                  {day.status === 'falta' && 'Falta não justificada registrada.'}
                  {day.status === 'atraso' && 'Atraso registrado. Verificar justificativa.'}
                  {day.status === 'justificado' && 'Ausência devidamente justificada.'}
                  {day.status === 'pendente' && 'Aguardando confirmação de presença.'}
                  {!day.status && 'Nenhum registro de frequência para este dia.'}
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Ver Detalhes Completos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}