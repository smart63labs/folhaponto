import React, { useState } from 'react';
import { FormTemplate, FormField } from '../../types/formBuilder';
import { FormFieldRenderer } from './FormFieldRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, EyeOff, Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormPreviewProps {
  template: FormTemplate;
  className?: string;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export const FormPreview: React.FC<FormPreviewProps> = ({
  template,
  className,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [showValidation, setShowValidation] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return field.validation?.message || 'Este campo é obrigatório';
    }

    if (field.validation && value) {
      const validation = field.validation;

      if (validation.minLength && String(value).length < validation.minLength) {
        return validation.message || `Mínimo de ${validation.minLength} caracteres`;
      }

      if (validation.maxLength && String(value).length > validation.maxLength) {
        return validation.message || `Máximo de ${validation.maxLength} caracteres`;
      }

      if (validation.min && Number(value) < validation.min) {
        return validation.message || `Valor mínimo: ${validation.min}`;
      }

      if (validation.max && Number(value) > validation.max) {
        return validation.message || `Valor máximo: ${validation.max}`;
      }

      if (validation.pattern && !new RegExp(validation.pattern).test(String(value))) {
        return validation.message || 'Formato inválido';
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    template.fields.forEach(field => {
      const value = formData[field.id];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted successfully:', formData);
      alert('Formulário enviado com sucesso! Verifique o console para ver os dados.');
    }
  };

  const resetForm = () => {
    setFormData({});
    setErrors({});
  };

  const getViewportClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-md';
      case 'desktop':
        return 'max-w-2xl';
      default:
        return 'max-w-2xl';
    }
  };

  const getLayoutClass = () => {
    switch (template.layout?.type) {
      case 'grid':
        return `grid gap-4 ${template.layout.columns ? `grid-cols-${template.layout.columns}` : 'grid-cols-1'}`;
      case 'flex':
        return `flex ${template.layout.direction === 'row' ? 'flex-row' : 'flex-col'} gap-4`;
      case 'absolute':
        return 'relative';
      default:
        return 'space-y-4';
    }
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Preview</Badge>
          <span className="text-sm text-gray-600">
            {template.metadata?.name || 'Formulário sem nome'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Size Controls */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewportSize === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('mobile')}
              className="rounded-r-none"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={viewportSize === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('tablet')}
              className="rounded-none border-x"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewportSize === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('desktop')}
              className="rounded-l-none"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Validation Toggle */}
          <Button
            variant={showValidation ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowValidation(!showValidation)}
          >
            {showValidation ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 overflow-auto bg-gray-100">
        <div className={cn('mx-auto transition-all duration-300', getViewportClass())}>
          <Card 
            className="shadow-lg"
            style={template.style ? {
              backgroundColor: template.style.backgroundColor,
              borderColor: template.style.borderColor,
              borderRadius: template.style.borderRadius,
            } : undefined}
          >
            {template.metadata?.name && (
              <CardHeader>
                <CardTitle 
                  style={template.style ? {
                    color: template.style.color,
                    fontSize: template.style.fontSize,
                    fontWeight: template.style.fontWeight,
                  } : undefined}
                >
                  {template.metadata.name}
                </CardTitle>
                {template.metadata.description && (
                  <p className="text-sm text-gray-600">
                    {template.metadata.description}
                  </p>
                )}
              </CardHeader>
            )}

            <CardContent>
              <form onSubmit={handleSubmit} className={getLayoutClass()}>
                {template.fields.map((field) => (
                  <div 
                    key={field.id}
                    className={cn(
                      'transition-all duration-200',
                      template.layout?.type === 'absolute' && 'absolute',
                      errors[field.id] && 'animate-pulse'
                    )}
                    style={template.layout?.type === 'absolute' ? {
                      left: field.position?.x || 0,
                      top: field.position?.y || 0,
                    } : undefined}
                  >
                    <FormFieldRenderer
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      preview={true}
                    />
                    
                    {/* Error Display */}
                    {showValidation && errors[field.id] && (
                      <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors[field.id]}
                      </div>
                    )}
                  </div>
                ))}

                {/* Auto-generated Submit Button if none exists */}
                {!template.fields.some(field => field.type === 'submit') && (
                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      Enviar Formulário
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Data Display (Development) */}
      {import.meta.env.DEV && (
        <div className="border-t bg-gray-50 p-4">
          <details className="text-xs">
            <summary className="cursor-pointer font-medium mb-2">
              Dados do Formulário (Desenvolvimento)
            </summary>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify({ formData, errors }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};