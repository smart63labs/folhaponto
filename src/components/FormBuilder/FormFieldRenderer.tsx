import React from 'react';
import { FormField } from '../../types/formBuilder';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';
import FrequencyTable from './FrequencyTable';

interface FormFieldRendererProps {
  field: FormField;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
  preview?: boolean;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  preview = false,
}) => {
  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const renderLabel = () => {
    if (!field.label) return null;
    
    return (
      <Label 
        htmlFor={field.id}
        className={cn(
          'block text-sm font-medium mb-2',
          field.required && 'after:content-["*"] after:text-red-500 after:ml-1'
        )}
        style={field.style ? {
          color: field.style.color,
          fontSize: field.style.fontSize,
          fontWeight: field.style.fontWeight,
        } : undefined}
      >
        {field.label}
      </Label>
    );
  };

  const getCommonProps = () => ({
    id: field.id,
    disabled: disabled || field.disabled,
    readOnly: field.readonly,
    required: field.required,
    className: cn(field.style?.className),
    style: field.style ? {
      width: field.style.width,
      height: field.style.height,
      margin: field.style.margin,
      padding: field.style.padding,
      backgroundColor: field.style.backgroundColor,
      borderColor: field.style.borderColor,
      borderRadius: field.style.borderRadius,
      fontSize: field.style.fontSize,
      fontWeight: field.style.fontWeight,
      color: field.style.color,
    } : undefined,
    ...field.attributes,
  });

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value || field.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            {...getCommonProps()}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || field.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            {...getCommonProps()}
          />
        );

      case 'select':
        return (
          <Select
            value={value || field.value || ''}
            onValueChange={handleChange}
            disabled={disabled || field.disabled}
          >
            <SelectTrigger {...getCommonProps()}>
              <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || field.value || false}
              onCheckedChange={handleChange}
              disabled={disabled || field.disabled}
              {...field.attributes}
            />
            <Label 
              htmlFor={field.id}
              className="text-sm font-normal cursor-pointer"
            >
              {field.label}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value || field.value || ''}
            onValueChange={handleChange}
            disabled={disabled || field.disabled}
            className="space-y-2"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={String(option.value)} 
                  id={`${field.id}_${option.value}`}
                  disabled={option.disabled}
                />
                <Label 
                  htmlFor={`${field.id}_${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => handleChange(e.target.files)}
            {...getCommonProps()}
          />
        );

      case 'button':
      case 'submit':
      case 'reset':
        return (
          <Button
            type={field.type === 'submit' ? 'submit' : field.type === 'reset' ? 'reset' : 'button'}
            variant={field.type === 'submit' ? 'default' : 'outline'}
            disabled={disabled || field.disabled}
            onClick={() => !preview && handleChange(field.value)}
            {...getCommonProps()}
          >
            {field.value || field.label}
          </Button>
        );

      case 'frequency-table':
        return (
          <FrequencyTable
            id={field.id}
            label={field.label}
            onChange={handleChange}
            value={value}
          />
        );

      default:
        return (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            Tipo de campo não suportado: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && renderLabel()}
      {renderField()}
      
      {/* Validation Error Display (for preview mode) */}
      {preview && field.validation && (
        <div className="text-xs text-gray-500">
          {field.required && 'Campo obrigatório'}
          {field.validation.minLength && ` • Mín: ${field.validation.minLength} caracteres`}
          {field.validation.maxLength && ` • Máx: ${field.validation.maxLength} caracteres`}
          {field.validation.min && ` • Valor mín: ${field.validation.min}`}
          {field.validation.max && ` • Valor máx: ${field.validation.max}`}
          {field.validation.pattern && ` • Formato específico`}
        </div>
      )}
    </div>
  );
};