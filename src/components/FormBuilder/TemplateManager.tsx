import React, { useState, useEffect } from 'react';
import { FormTemplate } from '../../types/formBuilder';
import { templateService, SavedTemplate, TemplateCategory } from '../../services/templateService';
import { ExportService, ExportOptions } from '../../services/exportService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Eye, 
  Star,
  Clock,
  TrendingUp,
  Filter,
  Grid,
  List,
  MoreVertical,
  FileText,
  FileImage,
  Code,
  Calendar,
  User,
  Tag,
  BarChart3
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TemplateManagerProps {
  onTemplateSelect?: (template: SavedTemplate) => void;
  onTemplateLoad?: (template: FormTemplate) => void;
  currentTemplate?: FormTemplate;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'usage' | 'category';

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onTemplateSelect,
  onTemplateLoad,
  currentTemplate,
  className,
}) => {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Save template form
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    isPublic: false
  });

  // Import form
  const [importData, setImportData] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(templateService.getTemplates());
    setCategories(templateService.getCategories());
  };

  const filteredAndSortedTemplates = () => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery) {
      filtered = templateService.searchTemplates(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.metadata?.name || '').localeCompare(b.metadata?.name || '');
        case 'date':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate || !saveForm.name.trim()) return;

    const tags = saveForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const savedTemplate = templateService.saveTemplate(currentTemplate, {
      category: saveForm.category,
      tags,
      isPublic: saveForm.isPublic,
      createdBy: 'current_user' // TODO: Get from auth context
    });

    // Update metadata
    templateService.updateTemplate(savedTemplate.id, {
      metadata: {
        ...currentTemplate.metadata,
        name: saveForm.name,
        description: saveForm.description
      }
    });

    loadData();
    setShowSaveDialog(false);
    setSaveForm({
      name: '',
      description: '',
      category: '',
      tags: '',
      isPublic: false
    });
  };

  const handleImportTemplate = () => {
    if (!importData.trim()) return;

    const imported = templateService.importTemplate(importData, 'current_user');
    if (imported) {
      loadData();
      setShowImportDialog(false);
      setImportData('');
    } else {
      alert('Erro ao importar template. Verifique o formato JSON.');
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      templateService.deleteTemplate(id);
      loadData();
    }
  };

  const handleDuplicateTemplate = (id: string) => {
    const duplicated = templateService.duplicateTemplate(id);
    if (duplicated) {
      loadData();
    }
  };

  const handleExportTemplate = async (template: SavedTemplate, format: 'json' | 'pdf' | 'html' | 'csv') => {
    try {
      const options: ExportOptions = {
        format,
        includeMetadata: true,
        customFileName: `template_${template.metadata?.name?.replace(/\s+/g, '_').toLowerCase() || template.id}`
      };

      const result = await ExportService.exportTemplate(template, options);
      
      if (result.success) {
        console.log(`Template exportado como ${result.fileName}`);
      } else {
        console.error('Erro na exportação:', result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar template:', error);
    }
  };

  const handleExportMultiple = async (format: 'json' | 'pdf' | 'html' | 'csv') => {
    try {
      const options: ExportOptions = {
        format,
        includeMetadata: true,
        customFileName: `templates_export_${new Date().toISOString().split('T')[0]}`
      };

      const result = await ExportService.exportMultipleTemplates(filteredAndSortedTemplates(), options);
      
      if (result.success) {
        console.log(`${filteredAndSortedTemplates().length} templates exportados como ${result.fileName}`);
      } else {
        console.error('Erro na exportação múltipla:', result.error);
      }
    } catch (error) {
      console.error('Erro ao exportar templates:', error);
    }
  };

  const handleImportTemplateFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await ExportService.importTemplate(file);
      
      if (result.success && result.template) {
        templateService.saveTemplate(result.template, {
          category: 'imported',
          tags: ['imported'],
          isPublic: false,
          createdBy: 'current_user'
        });
        loadData();
        console.log('Template importado com sucesso');
      } else {
        console.error('Erro na importação:', result.error);
      }
    } catch (error) {
      console.error('Erro ao importar template:', error);
    }

    // Reset input
    event.target.value = '';
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    templateService.incrementUsage(template.id);
    loadData();
    
    if (onTemplateLoad) {
      onTemplateLoad(template);
    }
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderTemplateCard = (template: SavedTemplate) => {
    const category = getCategoryById(template.category);
    
    return (
      <Card 
        key={template.id} 
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          viewMode === 'list' && 'flex-row'
        )}
        onClick={() => handleLoadTemplate(template)}
      >
        <CardHeader className={cn('pb-2', viewMode === 'list' && 'flex-1')}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium line-clamp-1">
                {template.metadata?.name || 'Template sem nome'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {category && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.name}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {template.usageCount} usos
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateTemplate(template.id);
                }}
                title="Duplicar template"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportTemplate(template, 'json');
                }}
                title="Exportar como JSON"
              >
                <Code className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportTemplate(template, 'pdf');
                }}
                title="Exportar como PDF"
              >
                <FileText className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportTemplate(template, 'html');
                }}
                title="Exportar como HTML"
              >
                <FileImage className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTemplate(template.id);
                }}
                title="Excluir template"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn('pt-0', viewMode === 'list' && 'flex-1')}>
          {template.metadata?.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {template.metadata.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(template.updatedAt)}</span>
            <span>{template.fields.length} campos</span>
          </div>
          
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gerenciar Templates</h2>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Save Current Template */}
          {currentTemplate && (
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Salvar Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nome</Label>
                    <Input
                      id="template-name"
                      value={saveForm.name}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do template"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-description">Descrição</Label>
                    <Textarea
                      id="template-description"
                      value={saveForm.description}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do template"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Categoria</Label>
                    <Select
                      value={saveForm.category}
                      onValueChange={(value) => setSaveForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="template-tags"
                      value={saveForm.tags}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveTemplate} disabled={!saveForm.name.trim()}>
                      Salvar Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Export Multiple Templates */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportMultiple('json')}
              disabled={filteredAndSortedTemplates().length === 0}
            >
              <Code className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportMultiple('pdf')}
              disabled={filteredAndSortedTemplates().length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          {/* Import Template */}
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplateFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-template"
            />
            <Button variant="outline" asChild>
              <label htmlFor="import-template" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </label>
            </Button>
          </div>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar JSON
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-data">JSON do Template</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Cole aqui o JSON do template..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImportTemplate} disabled={!importData.trim()}>
                    Importar Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Data de modificação</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="usage">Mais usados</SelectItem>
            <SelectItem value="category">Categoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Grid className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mais Usado</p>
                <p className="text-lg font-semibold">
                  {Math.max(...templates.map(t => t.usageCount), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-lg font-semibold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recentes</p>
                <p className="text-lg font-semibold">
                  {templates.filter(t => 
                    (Date.now() - t.updatedAt.getTime()) < 7 * 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid/List */}
      <div className={cn(
        'gap-4',
        viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-2'
      )}>
        {filteredAndSortedTemplates().map(renderTemplateCard)}
      </div>

      {/* Empty State */}
      {filteredAndSortedTemplates().length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Grid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando seu primeiro template'
            }
          </p>
          {currentTemplate && (
            <Button onClick={() => setShowSaveDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Salvar Template Atual
            </Button>
          )}
        </div>
      )}
    </div>
  );
};