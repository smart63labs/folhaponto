import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  Globe,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Holiday {
  id?: string;
  name: string;
  date: string;
  type: 'nacional' | 'estadual' | 'municipal';
  city?: string;
  description?: string;
  isActive: boolean;
}

interface City {
  id: string;
  name: string;
  code: string;
}

interface HolidayFormProps {
  holiday?: Holiday | null;
  onSubmit: (holiday: Holiday) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  cities?: City[];
}

const HolidayForm: React.FC<HolidayFormProps> = ({
  holiday,
  onSubmit,
  onCancel,
  isLoading = false,
  cities = []
}) => {
  const [formData, setFormData] = useState<Holiday>({
    name: '',
    date: '',
    type: 'nacional',
    city: '',
    description: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cidades do Tocantins (fallback se não fornecidas via props)
  const defaultCities: City[] = [
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

  const availableCities = cities.length > 0 ? cities : defaultCities;

  useEffect(() => {
    if (holiday) {
      setFormData({
        id: holiday.id,
        name: holiday.name,
        date: holiday.date,
        type: holiday.type,
        city: holiday.city || '',
        description: holiday.description || '',
        isActive: holiday.isActive
      });
    } else {
      resetForm();
    }
  }, [holiday]);

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      type: 'nacional',
      city: '',
      description: '',
      isActive: true
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do feriado é obrigatório';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.date);
      const currentYear = new Date().getFullYear();
      const selectedYear = selectedDate.getFullYear();
      
      if (selectedYear < currentYear - 1 || selectedYear > currentYear + 10) {
        newErrors.date = 'Data deve estar entre o ano passado e os próximos 10 anos';
      }
    }

    if (formData.type === 'municipal' && !formData.city) {
      newErrors.city = 'Cidade é obrigatória para feriados municipais';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const holidayData = {
        ...formData,
        city: formData.type === 'municipal' ? formData.city : undefined
      };
      
      await onSubmit(holidayData);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar feriado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: 'nacional' | 'estadual' | 'municipal') => {
    setFormData(prev => ({
      ...prev,
      type,
      city: type !== 'municipal' ? '' : prev.city
    }));
    
    // Limpar erro de cidade se não for municipal
    if (type !== 'municipal' && errors.city) {
      setErrors(prev => {
        const { city, ...rest } = prev;
        return rest;
      });
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

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'nacional': return 'Feriado válido em todo o território nacional';
      case 'estadual': return 'Feriado válido apenas no estado do Tocantins';
      case 'municipal': return 'Feriado válido apenas na cidade selecionada';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{holiday ? 'Editar Feriado' : 'Novo Feriado'}</span>
        </CardTitle>
        <CardDescription>
          {holiday 
            ? 'Edite as informações do feriado selecionado.'
            : 'Adicione um novo feriado ao sistema.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Feriado */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Feriado *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Dia da Independência"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.date}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tipo de Feriado */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Feriado *</Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nacional">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Nacional</span>
                  </div>
                </SelectItem>
                <SelectItem value="estadual">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Estadual</span>
                  </div>
                </SelectItem>
                <SelectItem value="municipal">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Municipal</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground flex items-center space-x-2">
              {getTypeIcon(formData.type)}
              <span>{getTypeDescription(formData.type)}</span>
            </p>
          </div>

          {/* Cidade (apenas para feriados municipais) */}
          {formData.type === 'municipal' && (
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              >
                <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma cidade do Tocantins" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map(city => (
                    <SelectItem key={city.id} value={city.name}>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>{city.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.city}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição opcional do feriado..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Adicione informações adicionais sobre o feriado (opcional)
            </p>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive" className="flex items-center space-x-2">
              {formData.isActive ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>
                {formData.isActive ? 'Feriado ativo' : 'Feriado inativo'}
              </span>
            </Label>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="min-w-[100px]"
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                holiday ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HolidayForm;