import { FormTemplate } from '../types/formBuilder';

export interface SavedTemplate extends FormTemplate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

class TemplateService {
  private readonly STORAGE_KEY = 'sefaz_form_templates';
  private readonly CATEGORIES_KEY = 'sefaz_template_categories';

  // Default categories
  private defaultCategories: TemplateCategory[] = [
    {
      id: 'rh',
      name: 'Recursos Humanos',
      description: 'Formulários relacionados a RH',
      icon: 'Users',
      color: '#3B82F6'
    },
    {
      id: 'admin',
      name: 'Administrativo',
      description: 'Formulários administrativos',
      icon: 'Settings',
      color: '#8B5CF6'
    },
    {
      id: 'ponto',
      name: 'Controle de Ponto',
      description: 'Formulários de ponto e frequência',
      icon: 'Clock',
      color: '#10B981'
    },
    {
      id: 'ocorrencia',
      name: 'Ocorrências',
      description: 'Formulários de ocorrências',
      icon: 'AlertTriangle',
      color: '#F59E0B'
    },
    {
      id: 'relatorio',
      name: 'Relatórios',
      description: 'Formulários de relatórios',
      icon: 'FileText',
      color: '#EF4444'
    },
    {
      id: 'geral',
      name: 'Geral',
      description: 'Formulários diversos',
      icon: 'Folder',
      color: '#6B7280'
    }
  ];

  // Get all saved templates
  getTemplates(): SavedTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const templates = JSON.parse(stored);
      return templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  // Get templates by category
  getTemplatesByCategory(categoryId: string): SavedTemplate[] {
    return this.getTemplates().filter(template => template.category === categoryId);
  }

  // Search templates
  searchTemplates(query: string): SavedTemplate[] {
    const templates = this.getTemplates();
    const searchTerm = query.toLowerCase();
    
    return templates.filter(template => 
      template.metadata?.name?.toLowerCase().includes(searchTerm) ||
      template.metadata?.description?.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get template by ID
  getTemplate(id: string): SavedTemplate | null {
    const templates = this.getTemplates();
    return templates.find(template => template.id === id) || null;
  }

  // Save new template
  saveTemplate(template: FormTemplate, metadata: {
    category: string;
    tags?: string[];
    isPublic?: boolean;
    createdBy: string;
  }): SavedTemplate {
    const templates = this.getTemplates();
    
    const savedTemplate: SavedTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: metadata.createdBy,
      category: metadata.category,
      tags: metadata.tags || [],
      isPublic: metadata.isPublic || false,
      usageCount: 0
    };

    templates.push(savedTemplate);
    this.saveToStorage(templates);
    
    return savedTemplate;
  }

  // Update existing template
  updateTemplate(id: string, updates: Partial<FormTemplate & {
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  }>): SavedTemplate | null {
    const templates = this.getTemplates();
    const index = templates.findIndex(template => template.id === id);
    
    if (index === -1) return null;

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToStorage(templates);
    return templates[index];
  }

  // Delete template
  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filteredTemplates = templates.filter(template => template.id !== id);
    
    if (filteredTemplates.length === templates.length) {
      return false; // Template not found
    }

    this.saveToStorage(filteredTemplates);
    return true;
  }

  // Duplicate template
  duplicateTemplate(id: string, newName?: string): SavedTemplate | null {
    const template = this.getTemplate(id);
    if (!template) return null;

    const duplicated: SavedTemplate = {
      ...template,
      id: this.generateId(),
      metadata: {
        ...template.metadata,
        name: newName || `${template.metadata?.name || 'Template'} (Cópia)`
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    const templates = this.getTemplates();
    templates.push(duplicated);
    this.saveToStorage(templates);

    return duplicated;
  }

  // Increment usage count
  incrementUsage(id: string): void {
    const templates = this.getTemplates();
    const template = templates.find(t => t.id === id);
    
    if (template) {
      template.usageCount++;
      template.updatedAt = new Date();
      this.saveToStorage(templates);
    }
  }

  // Get popular templates
  getPopularTemplates(limit: number = 10): SavedTemplate[] {
    return this.getTemplates()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Get recent templates
  getRecentTemplates(limit: number = 10): SavedTemplate[] {
    return this.getTemplates()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  // Export template to JSON
  exportTemplate(id: string): string | null {
    const template = this.getTemplate(id);
    if (!template) return null;

    return JSON.stringify(template, null, 2);
  }

  // Import template from JSON
  importTemplate(jsonData: string, createdBy: string): SavedTemplate | null {
    try {
      const templateData = JSON.parse(jsonData);
      
      // Validate required fields
      if (!templateData.fields || !Array.isArray(templateData.fields)) {
        throw new Error('Invalid template format');
      }

      const template: FormTemplate = {
        fields: templateData.fields,
        layout: templateData.layout,
        style: templateData.style,
        metadata: {
          ...templateData.metadata,
          name: templateData.metadata?.name || 'Template Importado'
        }
      };

      return this.saveTemplate(template, {
        category: templateData.category || 'geral',
        tags: templateData.tags || ['importado'],
        isPublic: false,
        createdBy
      });
    } catch (error) {
      console.error('Error importing template:', error);
      return null;
    }
  }

  // Categories management
  getCategories(): TemplateCategory[] {
    try {
      const stored = localStorage.getItem(this.CATEGORIES_KEY);
      if (!stored) {
        this.saveCategories(this.defaultCategories);
        return this.defaultCategories;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading categories:', error);
      return this.defaultCategories;
    }
  }

  saveCategories(categories: TemplateCategory[]): void {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  addCategory(category: Omit<TemplateCategory, 'id'>): TemplateCategory {
    const categories = this.getCategories();
    const newCategory: TemplateCategory = {
      ...category,
      id: this.generateId()
    };
    
    categories.push(newCategory);
    this.saveCategories(categories);
    
    return newCategory;
  }

  // Utility methods
  private saveToStorage(templates: SavedTemplate[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear all data (for development/testing)
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CATEGORIES_KEY);
  }

  // Get statistics
  getStatistics() {
    const templates = this.getTemplates();
    const categories = this.getCategories();
    
    return {
      totalTemplates: templates.length,
      totalCategories: categories.length,
      publicTemplates: templates.filter(t => t.isPublic).length,
      privateTemplates: templates.filter(t => !t.isPublic).length,
      totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
      categoriesStats: categories.map(cat => ({
        category: cat.name,
        count: templates.filter(t => t.category === cat.id).length
      }))
    };
  }
}

export const templateService = new TemplateService();