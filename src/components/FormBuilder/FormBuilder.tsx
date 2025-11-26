import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DragDropProvider, useDragDrop } from '../DragDrop';
import { FormTemplate, FormField, FormBuilderState, PrintConfig } from '../../types/formBuilder';
import { FormFieldPalette } from './FormFieldPalette';
import { FormCanvas } from './FormCanvas';
import { FormFieldProperties } from './FormFieldProperties';
import { FormPreview } from './FormPreview';
import { FormTemplateManager } from './FormTemplateManager';
import { PrintConfigPanel } from './PrintConfigPanel';
import { Eye, Settings, Save, Undo, Redo, Download, Upload, Printer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DEFAULT_PAPER_FORMAT, DEFAULT_MARGINS, DEFAULT_HEADER_FOOTER_CONFIG } from '../../constants/paperFormats';

interface FormBuilderProps {
  initialTemplate?: FormTemplate;
  onSave?: (template: FormTemplate) => void;
  onExport?: (template: FormTemplate, format: 'json' | 'pdf') => void;
  className?: string;
}

const createEmptyTemplate = (): FormTemplate => ({
  id: `template_${Date.now()}`,
  name: 'Novo Formulário',
  description: '',
  fields: [],
  layout: {
    type: 'grid',
    columns: 2,
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    minHeight: '400px',
  },
  printConfig: {
    paperFormat: DEFAULT_PAPER_FORMAT,
    margins: DEFAULT_MARGINS,
    headerFooter: DEFAULT_HEADER_FOOTER_CONFIG
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'current_user',
});

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialTemplate,
  onSave,
  onExport,
  className,
}) => {
  const [state, setState] = useState<FormBuilderState>({
    template: initialTemplate || createEmptyTemplate(),
    selectedField: null,
    draggedField: null,
    isPreviewMode: false,
    isDirty: false,
    history: [initialTemplate || createEmptyTemplate()],
    historyIndex: 0,
  });

  const [activeTab, setActiveTab] = useState('design');

  const updateTemplate = useCallback((updater: (template: FormTemplate) => FormTemplate) => {
    setState(prev => {
      const newTemplate = updater(prev.template);
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newTemplate);
      
      return {
        ...prev,
        template: newTemplate,
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const addField = useCallback((field: FormField, position?: { x: number; y: number }) => {
    updateTemplate(template => ({
      ...template,
      fields: [...template.fields, { ...field, position }],
      updatedAt: new Date(),
    }));
  }, [updateTemplate]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    updateTemplate(template => ({
      ...template,
      fields: template.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
      updatedAt: new Date(),
    }));
  }, [updateTemplate]);

  const removeField = useCallback((fieldId: string) => {
    updateTemplate(template => ({
      ...template,
      fields: template.fields.filter(field => field.id !== fieldId),
      updatedAt: new Date(),
    }));
    setState(prev => ({ ...prev, selectedField: null }));
  }, [updateTemplate]);

  const selectField = useCallback((fieldId: string | null) => {
    setState(prev => ({ ...prev, selectedField: fieldId }));
  }, []);

  const updatePrintConfig = useCallback((printConfig: PrintConfig) => {
    updateTemplate(template => ({
      ...template,
      printConfig,
      updatedAt: new Date(),
    }));
  }, [updateTemplate]);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        return {
          ...prev,
          template: prev.history[prev.historyIndex - 1],
          historyIndex: prev.historyIndex - 1,
          isDirty: true,
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        return {
          ...prev,
          template: prev.history[prev.historyIndex + 1],
          historyIndex: prev.historyIndex + 1,
          isDirty: true,
        };
      }
      return prev;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(state.template);
      setState(prev => ({ ...prev, isDirty: false }));
    }
  }, [onSave, state.template]);

  const handleExport = useCallback((format: 'json' | 'pdf') => {
    if (onExport) {
      onExport(state.template, format);
    }
  }, [onExport, state.template]);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }));
  }, []);

  const selectedField = state.template.fields.find(field => field.id === state.selectedField);
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <DragDropProvider>
      <div className={cn('h-full flex flex-col bg-gray-50', className)}>
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {state.template.name}
              </h2>
              {state.isDirty && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  Não salvo
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                {state.isPreviewMode ? 'Editar' : 'Visualizar'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!state.isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!state.isPreviewMode ? (
            <>
              {/* Top Section - Field Palette */}
              <div className="bg-white border-b border-gray-200 h-64">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                    <TabsTrigger value="design">Componentes</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="print">
                      <Printer className="w-4 h-4 mr-1" />
                      Impressão
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="design" className="p-3 flex-1 overflow-y-auto">
                    <FormFieldPalette onFieldSelect={addField} />
                  </TabsContent>
                  
                  <TabsContent value="templates" className="p-3 flex-1 overflow-y-auto">
                    <FormTemplateManager
                      currentTemplate={state.template}
                      onTemplateLoad={(template) => {
                        setState(prev => ({
                          ...prev,
                          template,
                          selectedField: null,
                          isDirty: false,
                          history: [template],
                          historyIndex: 0,
                        }));
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="print" className="p-3 flex-1 overflow-y-auto">
                    <PrintConfigPanel
                      config={state.template.printConfig || {
                        paperFormat: DEFAULT_PAPER_FORMAT,
                        margins: DEFAULT_MARGINS,
                        headerFooter: DEFAULT_HEADER_FOOTER_CONFIG
                      }}
                      onConfigChange={updatePrintConfig}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Bottom Section - Form Canvas and Properties */}
              <div className="flex-1 flex">
                {/* Center - Form Canvas */}
                <div className="flex-1">
                  <FormCanvas
                    template={state.template}
                    selectedField={state.selectedField}
                    onFieldAdd={addField}
                    onFieldUpdate={updateField}
                    onFieldRemove={removeField}
                    onFieldSelect={selectField}
                  />
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-72 bg-white border-l border-gray-200 flex-shrink-0">
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Propriedades
                    </h3>
                    
                    {selectedField ? (
                      <FormFieldProperties
                        field={selectedField}
                        onUpdate={(updates) => updateField(selectedField.id, updates)}
                      />
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-6">
                        Selecione um campo para editar suas propriedades
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="flex-1 p-8">
              <FormPreview template={state.template} />
            </div>
          )}
        </div>
      </div>
    </DragDropProvider>
  );
};