import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Calendar, 
  User, 
  Save, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { InternScheduleRule, internService } from '@/services/internService';
import { User as UserType } from '@/types';

interface InternScheduleFormProps {
  intern?: UserType;
  onSave?: (rule: InternScheduleRule) => void;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

export const InternScheduleForm: React.FC<InternScheduleFormProps> = ({
  intern,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<InternScheduleRule>>({
    maxDailyHours: 6,
    maxWeeklyHours: 30,
    allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '08:00',
    endTime: '17:00',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (intern) {
      loadInternRule();
    }
  }, [intern]);

  const loadInternRule = async () => {
    if (!intern) return;
    
    try {
      const rule = await internService.getInternScheduleRule(intern.id);
      if (rule) {
        setFormData(rule);
      }
    } catch (error) {
      console.error('Erro ao carregar regra do estagiário:', error);
    }
  };

  const handleInputChange = (field: keyof InternScheduleRule, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
    setSuccess(false);
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    const currentDays = formData.allowedDays || [];
    const newDays = checked 
      ? [...currentDays, day]
      : currentDays.filter(d => d !== day);
    
    handleInputChange('allowedDays', newDays);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.maxDailyHours || formData.maxDailyHours <= 0 || formData.maxDailyHours > 8) {
      newErrors.push('Horas diárias deve estar entre 1 e 8 horas');
    }

    if (!formData.maxWeeklyHours || formData.maxWeeklyHours <= 0 || formData.maxWeeklyHours > 40) {
      newErrors.push('Horas semanais deve estar entre 1 e 40 horas');
    }

    if (!formData.allowedDays || formData.allowedDays.length === 0) {
      newErrors.push('Selecione pelo menos um dia da semana');
    }

    if (!formData.startTime || !formData.endTime) {
      newErrors.push('Horário de início e fim são obrigatórios');
    }

    if (formData.startTime && formData.endTime) {
      const startHour = parseFloat(formData.startTime.replace(':', '.'));
      const endHour = parseFloat(formData.endTime.replace(':', '.'));
      
      if (startHour >= endHour) {
        newErrors.push('Horário de início deve ser anterior ao horário de fim');
      }
    }

    // Validar se horas diárias não excedem o período de trabalho
    if (formData.startTime && formData.endTime && formData.maxDailyHours) {
      const startHour = parseFloat(formData.startTime.replace(':', '.'));
      const endHour = parseFloat(formData.endTime.replace(':', '.'));
      const maxPossibleHours = endHour - startHour;
      
      if (formData.maxDailyHours > maxPossibleHours) {
        newErrors.push(`Horas diárias (${formData.maxDailyHours}h) não pode exceder o período de trabalho (${maxPossibleHours}h)`);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !intern) return;

    setLoading(true);
    try {
      const rule = await internService.saveInternScheduleRule({
        ...formData,
        userId: intern.id,
        supervisorId: 'current-user-id' // Em produção, pegar do contexto de autenticação
      });

      setSuccess(true);
      onSave?.(rule);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar regra:', error);
      setErrors(['Erro ao salvar configurações do estagiário']);
    } finally {
      setLoading(false);
    }
  };

  if (!intern) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Selecione um estagiário para configurar os horários
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Configuração de Horários - {intern.name}
        </CardTitle>
        <CardDescription>
          Configure os horários e limites específicos para este estagiário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Limites de Horas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Limites de Horas
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="maxDailyHours">Máximo de horas por dia</Label>
              <Input
                id="maxDailyHours"
                type="number"
                min="1"
                max="8"
                value={formData.maxDailyHours || ''}
                onChange={(e) => handleInputChange('maxDailyHours', parseInt(e.target.value))}
                placeholder="6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWeeklyHours">Máximo de horas por semana</Label>
              <Input
                id="maxWeeklyHours"
                type="number"
                min="1"
                max="40"
                value={formData.maxWeeklyHours || ''}
                onChange={(e) => handleInputChange('maxWeeklyHours', parseInt(e.target.value))}
                placeholder="30"
              />
            </div>
          </div>

          {/* Horários Permitidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários Permitidos
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário de início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Horário de fim</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dias da Semana */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dias Permitidos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={formData.allowedDays?.includes(day.value) || false}
                  onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                />
                <Label htmlFor={day.value} className="text-sm">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive || false}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">
              Configuração ativa
            </Label>
          </div>
        </div>

        {/* Resumo */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Resumo da Configuração</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• Máximo: {formData.maxDailyHours}h/dia, {formData.maxWeeklyHours}h/semana</p>
            <p>• Horário: {formData.startTime} às {formData.endTime}</p>
            <p>• Dias: {formData.allowedDays?.length || 0} dias selecionados</p>
            <div className="flex gap-1 mt-2">
              {formData.allowedDays?.map(day => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {DAYS_OF_WEEK.find(d => d.value === day)?.label.slice(0, 3)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};