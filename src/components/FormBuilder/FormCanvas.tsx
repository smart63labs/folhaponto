import React, { useCallback, useRef } from 'react';
import { Droppable, Draggable } from '../DragDrop';
import { FormTemplate, FormField } from '../../types/formBuilder';
import { FormFieldRenderer } from './FormFieldRenderer';
import { Button } from '../ui/button';
import { Trash2, Copy, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormCanvasProps {
  template: FormTemplate;
  selectedField: string | null;
  onFieldAdd: (field: FormField, position?: { x: number; y: number }) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldRemove: (fieldId: string) => void;
  onFieldSelect: (fieldId: string | null) => void;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  template,
  selectedField,
  onFieldAdd,
  onFieldUpdate,
  onFieldRemove,
  onFieldSelect,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((item: any, targetZone: string) => {
    if (item.content && item.content.type) {
      // Criar novo campo baseado no componente da paleta
      const newField: FormField = {
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...item.content.defaultProps,
      };
      
      onFieldAdd(newField);
    }
  }, [onFieldAdd]);

  const handleFieldClick = useCallback((fieldId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onFieldSelect(fieldId);
  }, [onFieldSelect]);

  const handleCanvasClick = useCallback(() => {
    onFieldSelect(null);
  }, [onFieldSelect]);

  const handleDuplicateField = useCallback((field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: `${field.label} (Cópia)`,
    };
    onFieldAdd(duplicatedField);
  }, [onFieldAdd]);

  const renderGridLayout = () => {
    const { layout } = template;
    const gridCols = layout.columns || 2;
    
    return (
      <div
        className={cn(
          'grid gap-4 p-6 min-h-96',
          `grid-cols-${gridCols}`
        )}
        style={{
          gap: layout.gap,
          padding: layout.padding,
          backgroundColor: layout.backgroundColor,
          minHeight: layout.minHeight,
        }}
      >
        {template.fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              'relative group border-2 border-transparent rounded-lg p-2',
              'hover:border-blue-200 transition-all duration-200',
              {
                'border-blue-400 bg-blue-50': selectedField === field.id,
                'col-span-full': field.type === 'frequency-table', // FrequencyTable ocupa toda a largura
              }
            )}
            onClick={(e) => handleFieldClick(field.id, e)}
          >
            <FormFieldRenderer field={field} />
            
            {/* Field Actions */}
            {selectedField === field.id && (
              <div className="absolute -top-2 -right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 bg-white shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateField(field);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 bg-white shadow-sm text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFieldRemove(field.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFlexLayout = () => {
    const { layout } = template;
    
    return (
      <div
        className="flex flex-wrap p-6 min-h-96"
        style={{
          gap: layout.gap,
          padding: layout.padding,
          backgroundColor: layout.backgroundColor,
          minHeight: layout.minHeight,
        }}
      >
        {template.fields.map((field) => (
          <div
            key={field.id}
            className={cn(
              'relative group border-2 border-transparent rounded-lg p-2 flex-1 min-w-64',
              'hover:border-blue-200 transition-all duration-200',
              {
                'border-blue-400 bg-blue-50': selectedField === field.id,
              }
            )}
            onClick={(e) => handleFieldClick(field.id, e)}
          >
            <FormFieldRenderer field={field} />
            
            {selectedField === field.id && (
              <div className="absolute -top-2 -right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 bg-white shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateField(field);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 bg-white shadow-sm text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFieldRemove(field.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAbsoluteLayout = () => {
    const { layout } = template;
    
    return (
      <div
        className="relative p-6 min-h-96"
        style={{
          padding: layout.padding,
          backgroundColor: layout.backgroundColor,
          minHeight: layout.minHeight,
        }}
      >
        {template.fields.map((field) => (
          <Draggable
            key={field.id}
            id={field.id}
            type="form-field-positioned"
            content={field}
            className="absolute"
            style={{
              left: field.position?.x || 0,
              top: field.position?.y || 0,
            }}
          >
            <div
              className={cn(
                'relative group border-2 border-transparent rounded-lg p-2',
                'hover:border-blue-200 transition-all duration-200 cursor-move',
                {
                  'border-blue-400 bg-blue-50': selectedField === field.id,
                }
              )}
              onClick={(e) => handleFieldClick(field.id, e)}
            >
              <FormFieldRenderer field={field} />
              
              {selectedField === field.id && (
                <div className="absolute -top-2 -right-2 flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0 bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateField(field);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0 bg-white shadow-sm text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFieldRemove(field.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </Draggable>
        ))}
      </div>
    );
  };

  const renderLayout = () => {
    switch (template.layout.type) {
      case 'flex':
        return renderFlexLayout();
      case 'absolute':
        return renderAbsoluteLayout();
      case 'grid':
      default:
        return renderGridLayout();
    }
  };

  return (
    <div className="h-full bg-white">
      {/* Canvas Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500">
              {template.fields.length} campo(s) • Layout: {template.layout.type}
            </p>
          </div>
          
          <div className="text-xs text-gray-400">
            Arraste componentes da paleta para adicionar campos
          </div>
        </div>
      </div>

      {/* Canvas Content */}
      <Droppable
        id="form-canvas"
        acceptedTypes={['form-field']}
        onDrop={handleDrop}
        className="h-full"
        placeholder={
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Formulário Vazio</p>
              <p className="text-sm">Arraste componentes da paleta para começar</p>
            </div>
          </div>
        }
      >
        <div
          ref={canvasRef}
          className="min-h-full"
          onClick={handleCanvasClick}
        >
          {template.fields.length > 0 ? (
            renderLayout()
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Formulário Vazio</p>
                <p className="text-sm">Arraste componentes da paleta para começar</p>
              </div>
            </div>
          )}
        </div>
      </Droppable>
    </div>
  );
};