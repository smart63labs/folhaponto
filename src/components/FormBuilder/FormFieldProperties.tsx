import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { FormField, FormFieldOption } from '../../types/formBuilder';
import { 
  Settings, 
  Palette, 
  Eye, 
  Plus, 
  Trash2, 
  Move,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Circle,
  ChevronDown,
  Upload,
  MousePointer
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormFieldPropertiesProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export const FormFieldProperties: React.FC<FormFieldPropertiesProps> = ({
  field,
  onUpdate,
}) => {
  const [newOption, setNewOption] = useState({ label: '', value: '' });

  const handleBasicUpdate = (key: keyof FormField, value: any) => {
    onUpdate({ [key]: value });
  };

  const handleStyleUpdate = (key: string, value: any) => {
    onUpdate({
      style: {
        ...field.style,
        [key]: value,
      },
    });
  };

  const handleValidationUpdate = (key: string, value: any) => {
    onUpdate({
      validation: {
        ...field.validation,
        [key]: value,
      },
    });
  };

  const addOption = () => {
    if (newOption.label && newOption.value) {
      const options = field.options || [];
      onUpdate({
        options: [...options, { ...newOption }],
      });
      setNewOption({ label: '', value: '' });
    }
  };

  const removeOption = (index: number) => {
    const options = field.options || [];
    onUpdate({
      options: options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, updates: Partial<FormFieldOption>) => {
    const options = field.options || [];
    onUpdate({
      options: options.map((option, i) => 
        i === index ? { ...option, ...updates } : option
      ),
    });
  };

  const getFieldIcon = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'tel':
        return Type;
      case 'number':
        return Hash;
      case 'date':
      case 'time':
      case 'datetime-local':
        return Calendar;
      case 'checkbox':
        return CheckSquare;
      case 'radio':
        return Circle;
      case 'select':
        return ChevronDown;
      case 'file':
        return Upload;
      case 'button':
      case 'submit':
      case 'reset':
        return MousePointer;
      default:
        return Settings;
    }
  };

  const FieldIcon = getFieldIcon();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <FieldIcon className="h-4 w-4 text-blue-600" />
        <div>
          <h3 className="font-medium text-sm">{field.label || 'Campo sem nome'}</h3>
          <p className="text-xs text-gray-500 capitalize">{field.type}</p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="text-xs">Básico</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Estilo</TabsTrigger>
          <TabsTrigger value="validation" className="text-xs">Validação</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Basic Properties */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="field-label" className="text-xs font-medium">
                Rótulo
              </Label>
              <Input
                id="field-label"
                value={field.label}
                onChange={(e) => handleBasicUpdate('label', e.target.value)}
                placeholder="Digite o rótulo do campo"
                className="mt-1"
              />
            </div>

            {field.type !== 'button' && field.type !== 'submit' && field.type !== 'reset' && (
              <div>
                <Label htmlFor="field-placeholder" className="text-xs font-medium">
                  Placeholder
                </Label>
                <Input
                  id="field-placeholder"
                  value={field.placeholder || ''}
                  onChange={(e) => handleBasicUpdate('placeholder', e.target.value)}
                  placeholder="Texto de exemplo"
                  className="mt-1"
                />
              </div>
            )}

            {(field.type === 'button' || field.type === 'submit' || field.type === 'reset') && (
              <div>
                <Label htmlFor="field-value" className="text-xs font-medium">
                  Texto do Botão
                </Label>
                <Input
                  id="field-value"
                  value={field.value || ''}
                  onChange={(e) => handleBasicUpdate('value', e.target.value)}
                  placeholder="Texto do botão"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="field-default" className="text-xs font-medium">
                Valor Padrão
              </Label>
              <Input
                id="field-default"
                value={field.defaultValue || ''}
                onChange={(e) => handleBasicUpdate('defaultValue', e.target.value)}
                placeholder="Valor inicial"
                className="mt-1"
              />
            </div>

            <Separator />

            {/* Switches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="field-required" className="text-xs font-medium">
                  Campo Obrigatório
                </Label>
                <Switch
                  id="field-required"
                  checked={field.required || false}
                  onCheckedChange={(checked) => handleBasicUpdate('required', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="field-disabled" className="text-xs font-medium">
                  Desabilitado
                </Label>
                <Switch
                  id="field-disabled"
                  checked={field.disabled || false}
                  onCheckedChange={(checked) => handleBasicUpdate('disabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="field-readonly" className="text-xs font-medium">
                  Somente Leitura
                </Label>
                <Switch
                  id="field-readonly"
                  checked={field.readonly || false}
                  onCheckedChange={(checked) => handleBasicUpdate('readonly', checked)}
                />
              </div>
            </div>

            {/* Options for select, radio, checkbox */}
            {(field.type === 'select' || field.type === 'radio') && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Opções
                  </Label>
                  
                  <div className="space-y-2 mb-3">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option.label}
                          onChange={(e) => updateOption(index, { label: e.target.value })}
                          placeholder="Rótulo"
                          className="flex-1"
                        />
                        <Input
                          value={option.value}
                          onChange={(e) => updateOption(index, { value: e.target.value })}
                          placeholder="Valor"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={newOption.label}
                      onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="Nova opção"
                      className="flex-1"
                    />
                    <Input
                      value={newOption.value}
                      onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Valor"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="px-2"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-4">
          {/* Style Properties */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="field-width" className="text-xs font-medium">
                  Largura
                </Label>
                <Input
                  id="field-width"
                  value={field.style?.width || ''}
                  onChange={(e) => handleStyleUpdate('width', e.target.value)}
                  placeholder="auto"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="field-height" className="text-xs font-medium">
                  Altura
                </Label>
                <Input
                  id="field-height"
                  value={field.style?.height || ''}
                  onChange={(e) => handleStyleUpdate('height', e.target.value)}
                  placeholder="auto"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="field-margin" className="text-xs font-medium">
                Margem
              </Label>
              <Input
                id="field-margin"
                value={field.style?.margin || ''}
                onChange={(e) => handleStyleUpdate('margin', e.target.value)}
                placeholder="0px"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="field-padding" className="text-xs font-medium">
                Preenchimento
              </Label>
              <Input
                id="field-padding"
                value={field.style?.padding || ''}
                onChange={(e) => handleStyleUpdate('padding', e.target.value)}
                placeholder="8px"
                className="mt-1"
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="field-bg-color" className="text-xs font-medium">
                Cor de Fundo
              </Label>
              <Input
                id="field-bg-color"
                type="color"
                value={field.style?.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                className="mt-1 h-8"
              />
            </div>

            <div>
              <Label htmlFor="field-border-color" className="text-xs font-medium">
                Cor da Borda
              </Label>
              <Input
                id="field-border-color"
                type="color"
                value={field.style?.borderColor || '#d1d5db'}
                onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                className="mt-1 h-8"
              />
            </div>

            <div>
              <Label htmlFor="field-border-radius" className="text-xs font-medium">
                Raio da Borda
              </Label>
              <Input
                id="field-border-radius"
                value={field.style?.borderRadius || ''}
                onChange={(e) => handleStyleUpdate('borderRadius', e.target.value)}
                placeholder="4px"
                className="mt-1"
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="field-font-size" className="text-xs font-medium">
                Tamanho da Fonte
              </Label>
              <Select
                value={field.style?.fontSize || '14px'}
                onValueChange={(value) => handleStyleUpdate('fontSize', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px</SelectItem>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                  <SelectItem value="20px">20px</SelectItem>
                  <SelectItem value="24px">24px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="field-font-weight" className="text-xs font-medium">
                Peso da Fonte
              </Label>
              <Select
                value={field.style?.fontWeight || 'normal'}
                onValueChange={(value) => handleStyleUpdate('fontWeight', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Negrito</SelectItem>
                  <SelectItem value="lighter">Mais Leve</SelectItem>
                  <SelectItem value="bolder">Mais Negrito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="field-color" className="text-xs font-medium">
                Cor do Texto
              </Label>
              <Input
                id="field-color"
                type="color"
                value={field.style?.color || '#000000'}
                onChange={(e) => handleStyleUpdate('color', e.target.value)}
                className="mt-1 h-8"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4 mt-4">
          {/* Validation Properties */}
          <div className="space-y-3">
            {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'password') && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="field-min-length" className="text-xs font-medium">
                      Min. Caracteres
                    </Label>
                    <Input
                      id="field-min-length"
                      type="number"
                      value={field.validation?.minLength || ''}
                      onChange={(e) => handleValidationUpdate('minLength', parseInt(e.target.value) || undefined)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-max-length" className="text-xs font-medium">
                      Max. Caracteres
                    </Label>
                    <Input
                      id="field-max-length"
                      type="number"
                      value={field.validation?.maxLength || ''}
                      onChange={(e) => handleValidationUpdate('maxLength', parseInt(e.target.value) || undefined)}
                      placeholder="∞"
                      className="mt-1"
                    />
                  </div>
                </div>
              </>
            )}

            {field.type === 'number' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="field-min" className="text-xs font-medium">
                      Valor Mínimo
                    </Label>
                    <Input
                      id="field-min"
                      type="number"
                      value={field.validation?.min || ''}
                      onChange={(e) => handleValidationUpdate('min', parseFloat(e.target.value) || undefined)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-max" className="text-xs font-medium">
                      Valor Máximo
                    </Label>
                    <Input
                      id="field-max"
                      type="number"
                      value={field.validation?.max || ''}
                      onChange={(e) => handleValidationUpdate('max', parseFloat(e.target.value) || undefined)}
                      placeholder="∞"
                      className="mt-1"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="field-pattern" className="text-xs font-medium">
                Padrão (RegEx)
              </Label>
              <Input
                id="field-pattern"
                value={field.validation?.pattern || ''}
                onChange={(e) => handleValidationUpdate('pattern', e.target.value)}
                placeholder="^[a-zA-Z0-9]+$"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="field-validation-message" className="text-xs font-medium">
                Mensagem de Erro
              </Label>
              <Textarea
                id="field-validation-message"
                value={field.validation?.message || ''}
                onChange={(e) => handleValidationUpdate('message', e.target.value)}
                placeholder="Mensagem personalizada de erro"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};