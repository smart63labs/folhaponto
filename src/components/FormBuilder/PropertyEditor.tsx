import React from 'react';
import { FormField, FormFieldOption } from '../../types/formBuilder';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Trash2, Plus, Settings, Palette, Eye } from 'lucide-react';

interface PropertyEditorProps {
  field: FormField | null;
  onFieldUpdate: (field: FormField) => void;
  onFieldDelete: (fieldId: string) => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  field,
  onFieldUpdate,
  onFieldDelete,
}) => {
  if (!field) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Editor de Propriedades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um campo para editar suas propriedades</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateField = (updates: Partial<FormField>) => {
    onFieldUpdate({ ...field, ...updates });
  };

  const updateValidation = (validation: Partial<FormField['validation']>) => {
    updateField({
      validation: { ...field.validation, ...validation }
    });
  };

  const updateStyle = (style: Partial<FormField['style']>) => {
    updateField({
      style: { ...field.style, ...style }
    });
  };

  const addOption = () => {
    const newOption: FormFieldOption = {
      label: 'Nova Opção',
      value: `option_${Date.now()}`,
      disabled: false
    };
    
    updateField({
      options: [...(field.options || []), newOption]
    });
  };

  const updateOption = (index: number, option: FormFieldOption) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = option;
    updateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(field.options || [])];
    newOptions.splice(index, 1);
    updateField({ options: newOptions });
  };

  const fieldTypeLabels: Record<string, string> = {
    text: 'Texto',
    email: 'E-mail',
    password: 'Senha',
    number: 'Número',
    tel: 'Telefone',
    url: 'URL',
    date: 'Data',
    time: 'Hora',
    'datetime-local': 'Data e Hora',
    textarea: 'Área de Texto',
    select: 'Seleção',
    checkbox: 'Checkbox',
    radio: 'Radio Button',
    file: 'Arquivo',
    button: 'Botão',
    submit: 'Enviar',
    reset: 'Limpar'
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Propriedades
          </CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onFieldDelete(field.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {fieldTypeLabels[field.type] || field.type}
          </Badge>
          <Badge variant="outline">
            ID: {field.id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="validation">Validação</TabsTrigger>
            <TabsTrigger value="style">Estilo</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-label">Rótulo</Label>
              <Input
                id="field-label"
                value={field.label || ''}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder="Digite o rótulo do campo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input
                id="field-placeholder"
                value={field.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                placeholder="Texto de exemplo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-value">Valor Padrão</Label>
              <Input
                id="field-value"
                value={field.value || ''}
                onChange={(e) => updateField({ value: e.target.value })}
                placeholder="Valor inicial"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-required"
                checked={field.required || false}
                onCheckedChange={(checked) => updateField({ required: !!checked })}
              />
              <Label htmlFor="field-required">Campo obrigatório</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-disabled"
                checked={field.disabled || false}
                onCheckedChange={(checked) => updateField({ disabled: !!checked })}
              />
              <Label htmlFor="field-disabled">Desabilitado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="field-readonly"
                checked={field.readonly || false}
                onCheckedChange={(checked) => updateField({ readonly: !!checked })}
              />
              <Label htmlFor="field-readonly">Somente leitura</Label>
            </div>

            {/* Options for select and radio fields */}
            {(field.type === 'select' || field.type === 'radio') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opções</Label>
                  <Button size="sm" variant="outline" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {field.options?.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded">
                      <Input
                        placeholder="Rótulo"
                        value={option.label}
                        onChange={(e) => updateOption(index, { ...option, label: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Valor"
                        value={option.value}
                        onChange={(e) => updateOption(index, { ...option, value: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-length">Comprimento Mínimo</Label>
              <Input
                id="min-length"
                type="number"
                value={field.validation?.minLength || ''}
                onChange={(e) => updateValidation({ minLength: parseInt(e.target.value) || undefined })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-length">Comprimento Máximo</Label>
              <Input
                id="max-length"
                type="number"
                value={field.validation?.maxLength || ''}
                onChange={(e) => updateValidation({ maxLength: parseInt(e.target.value) || undefined })}
                placeholder="100"
              />
            </div>

            {field.type === 'number' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="min-value">Valor Mínimo</Label>
                  <Input
                    id="min-value"
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => updateValidation({ min: parseFloat(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-value">Valor Máximo</Label>
                  <Input
                    id="max-value"
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => updateValidation({ max: parseFloat(e.target.value) || undefined })}
                    placeholder="100"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="pattern">Padrão (Regex)</Label>
              <Input
                id="pattern"
                value={field.validation?.pattern || ''}
                onChange={(e) => updateValidation({ pattern: e.target.value })}
                placeholder="^[A-Za-z]+$"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="error-message">Mensagem de Erro</Label>
              <Textarea
                id="error-message"
                value={field.validation?.message || ''}
                onChange={(e) => updateValidation({ message: e.target.value })}
                placeholder="Mensagem personalizada de erro"
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="width">Largura</Label>
                <Input
                  id="width"
                  value={field.style?.width || ''}
                  onChange={(e) => updateStyle({ width: e.target.value })}
                  placeholder="100%, 200px, auto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura</Label>
                <Input
                  id="height"
                  value={field.style?.height || ''}
                  onChange={(e) => updateStyle({ height: e.target.value })}
                  placeholder="auto, 40px"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin">Margem</Label>
              <Input
                id="margin"
                value={field.style?.margin || ''}
                onChange={(e) => updateStyle({ margin: e.target.value })}
                placeholder="10px, 5px 10px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                value={field.style?.padding || ''}
                onChange={(e) => updateStyle({ padding: e.target.value })}
                placeholder="10px, 5px 10px"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="bg-color">Cor de Fundo</Label>
                <Input
                  id="bg-color"
                  type="color"
                  value={field.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-color">Cor do Texto</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={field.style?.color || '#000000'}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="border-color">Cor da Borda</Label>
              <Input
                id="border-color"
                type="color"
                value={field.style?.borderColor || '#d1d5db'}
                onChange={(e) => updateStyle({ borderColor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="border-radius">Raio da Borda</Label>
              <Input
                id="border-radius"
                value={field.style?.borderRadius || ''}
                onChange={(e) => updateStyle({ borderRadius: e.target.value })}
                placeholder="4px, 50%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">Tamanho da Fonte</Label>
              <Select
                value={field.style?.fontSize || ''}
                onValueChange={(value) => updateStyle({ fontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px (Pequeno)</SelectItem>
                  <SelectItem value="14px">14px (Normal)</SelectItem>
                  <SelectItem value="16px">16px (Médio)</SelectItem>
                  <SelectItem value="18px">18px (Grande)</SelectItem>
                  <SelectItem value="20px">20px (Muito Grande)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-weight">Peso da Fonte</Label>
              <Select
                value={field.style?.fontWeight || ''}
                onValueChange={(value) => updateStyle({ fontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o peso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Negrito</SelectItem>
                  <SelectItem value="lighter">Mais Leve</SelectItem>
                  <SelectItem value="bolder">Mais Pesado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="css-class">Classe CSS</Label>
              <Input
                id="css-class"
                value={field.style?.className || ''}
                onChange={(e) => updateStyle({ className: e.target.value })}
                placeholder="custom-class another-class"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};