import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  Copy, 
  FileText, 
  Search,
  Plus,
  Eye
} from 'lucide-react';
import { FormTemplate } from '../../types/formBuilder';
import { templateService } from '../../services/templateService';
import { ExportService } from '../../services/exportService';

interface FormTemplateManagerProps {
  currentTemplate?: FormTemplate;
  onTemplateLoad?: (template: FormTemplate) => void;
  onTemplateCreate?: () => void;
}

export const FormTemplateManager: React.FC<FormTemplateManagerProps> = ({
  currentTemplate,
  onTemplateLoad,
  onTemplateCreate,
}) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar templates ao montar o componente
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const loadedTemplates = await templateService.getTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate) return;

    try {
      const savedTemplate = await templateService.saveTemplate(currentTemplate);
      setTemplates(prev => {
        const existing = prev.find(t => t.id === savedTemplate.id);
        if (existing) {
          return prev.map(t => t.id === savedTemplate.id ? savedTemplate : t);
        }
        return [...prev, savedTemplate];
      });
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templateService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setSelectedTemplates(prev => prev.filter(id => id !== templateId));
    } catch (error) {
      console.error('Erro ao deletar template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: FormTemplate) => {
    try {
      const duplicatedTemplate = await templateService.duplicateTemplate(template);
      setTemplates(prev => [...prev, duplicatedTemplate]);
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
    }
  };

  const handleExportTemplate = async (template: FormTemplate, format: 'json' | 'pdf' | 'html') => {
    try {
      await ExportService.exportTemplate(template, { format });
    } catch (error) {
      console.error(`Erro ao exportar template como ${format}:`, error);
    }
  };

  const handleExportMultiple = async (format: 'json' | 'pdf') => {
    if (selectedTemplates.length === 0) return;

    try {
      const templatesToExport = templates.filter(t => selectedTemplates.includes(t.id));
      await ExportService.exportMultipleTemplates(templatesToExport, { format });
    } catch (error) {
      console.error(`Erro ao exportar múltiplos templates como ${format}:`, error);
    }
  };

  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await ExportService.importTemplate(file);
      if (result.success && result.template) {
        const savedTemplate = await templateService.saveTemplate(result.template);
        setTemplates(prev => [...prev, savedTemplate]);
      } else {
        console.error('Erro ao importar template:', result.error);
      }
    } catch (error) {
      console.error('Erro ao importar template:', error);
    }
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Cabeçalho com ações */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Label htmlFor="search">Buscar Templates</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={onTemplateCreate}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>

          <Button
            onClick={handleSaveTemplate}
            disabled={!currentTemplate}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Atual
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
          </div>
        </div>
      </div>

      {/* Ações em lote */}
      {selectedTemplates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedTemplates.length} template(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExportMultiple('json')}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar JSON
                </Button>
                <Button
                  onClick={() => handleExportMultiple('pdf')}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button
                  onClick={() => setSelectedTemplates([])}
                  size="sm"
                  variant="ghost"
                >
                  Limpar Seleção
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de templates */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando templates...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template disponível'}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={() => toggleTemplateSelection(template.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {template.fields.length} campo(s)
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Separator className="mb-3" />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => onTemplateLoad?.(template)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Carregar
                    </Button>

                    <Button
                      onClick={() => handleDuplicateTemplate(template)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicar
                    </Button>

                    <Button
                      onClick={() => handleExportTemplate(template, 'json')}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      JSON
                    </Button>

                    <Button
                      onClick={() => handleExportTemplate(template, 'pdf')}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>

                    <Button
                      onClick={() => handleExportTemplate(template, 'html')}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      HTML
                    </Button>

                    <Button
                      onClick={() => handleDeleteTemplate(template.id)}
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};