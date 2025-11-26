import { FormTemplate, FormField } from '@/types/formBuilder';
import { SavedTemplate } from './templateService';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'json' | 'pdf' | 'html' | 'csv';
  includeData?: boolean;
  includeMetadata?: boolean;
  customFileName?: string;
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  data?: string | Blob;
  error?: string;
}

export class ExportService {
  /**
   * Exporta um template no formato especificado
   */
  static async exportTemplate(
    template: SavedTemplate | FormTemplate,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const fileName = options.customFileName || 
        `template_${template.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;

      switch (options.format) {
        case 'json':
          return this.exportAsJSON(template, fileName, options);
        case 'pdf':
          return await this.exportAsPDF(template, fileName, options);
        case 'html':
          return this.exportAsHTML(template, fileName, options);
        case 'csv':
          return this.exportAsCSV(template, fileName, options);
        default:
          throw new Error(`Formato de exportação não suportado: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido na exportação'
      };
    }
  }

  /**
   * Exporta múltiplos templates
   */
  static async exportMultipleTemplates(
    templates: (SavedTemplate | FormTemplate)[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const fileName = options.customFileName || `templates_export_${Date.now()}`;
      
      if (options.format === 'json') {
        const exportData = {
          exportDate: new Date().toISOString(),
          templatesCount: templates.length,
          templates: templates.map(template => ({
            ...template,
            ...(options.includeMetadata && 'createdAt' in template ? {
              metadata: {
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
                createdBy: template.createdBy,
                usageCount: template.usageCount
              }
            } : {})
          }))
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        this.downloadFile(jsonString, `${fileName}.json`, 'application/json');

        return {
          success: true,
          fileName: `${fileName}.json`,
          data: jsonString
        };
      } else {
        throw new Error('Exportação múltipla só é suportada para formato JSON');
      }
    } catch (error) {
      return {
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : 'Erro na exportação múltipla'
      };
    }
  }

  /**
   * Exporta como JSON
   */
  private static exportAsJSON(
    template: SavedTemplate | FormTemplate,
    fileName: string,
    options: ExportOptions
  ): ExportResult {
    const exportData = {
      exportDate: new Date().toISOString(),
      format: 'json',
      template: {
        ...template,
        ...(options.includeMetadata && 'createdAt' in template ? {
          metadata: {
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
            createdBy: template.createdBy,
            usageCount: template.usageCount
          }
        } : {})
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonString, `${fileName}.json`, 'application/json');

    return {
      success: true,
      fileName: `${fileName}.json`,
      data: jsonString
    };
  }

  /**
   * Exporta como PDF
   */
  private static async exportAsPDF(
    template: SavedTemplate | FormTemplate,
    fileName: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Título
    pdf.setFontSize(20);
    pdf.text(template.name, 20, yPosition);
    yPosition += 15;

    // Descrição
    if (template.description) {
      pdf.setFontSize(12);
      pdf.text(`Descrição: ${template.description}`, 20, yPosition);
      yPosition += 10;
    }

    // Metadados
    if (options.includeMetadata && 'createdAt' in template) {
      pdf.setFontSize(10);
      pdf.text(`Criado em: ${new Date(template.createdAt).toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Criado por: ${template.createdBy}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Categoria: ${template.category}`, 20, yPosition);
      yPosition += 15;
    }

    // Campos do formulário
    pdf.setFontSize(14);
    pdf.text('Campos do Formulário:', 20, yPosition);
    yPosition += 10;

    template.fields.forEach((field, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${field.label || field.type}`, 25, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.text(`   Tipo: ${field.type}`, 25, yPosition);
      yPosition += 5;

      if (field.placeholder) {
        pdf.text(`   Placeholder: ${field.placeholder}`, 25, yPosition);
        yPosition += 5;
      }

      if (field.validation?.required) {
        pdf.text('   Campo obrigatório', 25, yPosition);
        yPosition += 5;
      }

      yPosition += 5;
    });

    const pdfBlob = pdf.output('blob');
    this.downloadBlob(pdfBlob, `${fileName}.pdf`);

    return {
      success: true,
      fileName: `${fileName}.pdf`,
      data: pdfBlob
    };
  }

  /**
   * Exporta como HTML
   */
  private static exportAsHTML(
    template: SavedTemplate | FormTemplate,
    fileName: string,
    options: ExportOptions
  ): ExportResult {
    const html = this.generateHTMLForm(template, options);
    this.downloadFile(html, `${fileName}.html`, 'text/html');

    return {
      success: true,
      fileName: `${fileName}.html`,
      data: html
    };
  }

  /**
   * Exporta como CSV (estrutura dos campos)
   */
  private static exportAsCSV(
    template: SavedTemplate | FormTemplate,
    fileName: string,
    options: ExportOptions
  ): ExportResult {
    const headers = ['Campo', 'Tipo', 'Label', 'Placeholder', 'Obrigatório', 'Posição X', 'Posição Y'];
    const rows = template.fields.map(field => [
      field.id,
      field.type,
      field.label || '',
      field.placeholder || '',
      field.validation?.required ? 'Sim' : 'Não',
      field.position?.x || 0,
      field.position?.y || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${fileName}.csv`, 'text/csv');

    return {
      success: true,
      fileName: `${fileName}.csv`,
      data: csvContent
    };
  }

  /**
   * Gera HTML do formulário
   */
  private static generateHTMLForm(
    template: SavedTemplate | FormTemplate,
    options: ExportOptions
  ): string {
    const fieldsHTML = template.fields.map(field => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
        case 'tel':
        case 'url':
          return `
            <div class="form-field">
              <label for="${field.id}">${field.label || field.type}</label>
              <input 
                type="${field.type}" 
                id="${field.id}" 
                name="${field.id}"
                placeholder="${field.placeholder || ''}"
                ${field.validation?.required ? 'required' : ''}
                ${field.disabled ? 'disabled' : ''}
                ${field.readonly ? 'readonly' : ''}
              />
            </div>`;
        
        case 'textarea':
          return `
            <div class="form-field">
              <label for="${field.id}">${field.label || 'Textarea'}</label>
              <textarea 
                id="${field.id}" 
                name="${field.id}"
                placeholder="${field.placeholder || ''}"
                ${field.validation?.required ? 'required' : ''}
                ${field.disabled ? 'disabled' : ''}
                ${field.readonly ? 'readonly' : ''}
              ></textarea>
            </div>`;
        
        case 'select':
          const selectOptions = field.options?.map(option => 
            `<option value="${option.value}">${option.label}</option>`
          ).join('') || '';
          
          return `
            <div class="form-field">
              <label for="${field.id}">${field.label || 'Select'}</label>
              <select 
                id="${field.id}" 
                name="${field.id}"
                ${field.validation?.required ? 'required' : ''}
                ${field.disabled ? 'disabled' : ''}
              >
                <option value="">Selecione uma opção</option>
                ${selectOptions}
              </select>
            </div>`;
        
        case 'checkbox':
          return `
            <div class="form-field">
              <label>
                <input 
                  type="checkbox" 
                  id="${field.id}" 
                  name="${field.id}"
                  ${field.validation?.required ? 'required' : ''}
                  ${field.disabled ? 'disabled' : ''}
                />
                ${field.label || 'Checkbox'}
              </label>
            </div>`;
        
        case 'radio':
          const radioOptions = field.options?.map(option => 
            `<label>
              <input type="radio" name="${field.id}" value="${option.value}" />
              ${option.label}
            </label>`
          ).join('') || '';
          
          return `
            <div class="form-field">
              <fieldset>
                <legend>${field.label || 'Radio Group'}</legend>
                ${radioOptions}
              </fieldset>
            </div>`;
        
        case 'button':
        case 'submit':
        case 'reset':
          return `
            <div class="form-field">
              <button type="${field.type}" ${field.disabled ? 'disabled' : ''}>
                ${field.label || field.type}
              </button>
            </div>`;
        
        default:
          return `
            <div class="form-field">
              <label for="${field.id}">${field.label || field.type}</label>
              <input 
                type="text" 
                id="${field.id}" 
                name="${field.id}"
                placeholder="${field.placeholder || ''}"
              />
            </div>`;
      }
    }).join('\n');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .form-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .form-title {
            color: #333;
            margin-bottom: 10px;
        }
        .form-description {
            color: #666;
            margin-bottom: 30px;
        }
        .form-field {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        textarea {
            height: 100px;
            resize: vertical;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        fieldset {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
        }
        legend {
            font-weight: bold;
            padding: 0 10px;
        }
        input[type="checkbox"], input[type="radio"] {
            width: auto;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1 class="form-title">${template.name}</h1>
        ${template.description ? `<p class="form-description">${template.description}</p>` : ''}
        
        <form>
            ${fieldsHTML}
        </form>
        
        ${options.includeMetadata && 'createdAt' in template ? `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Criado em: ${new Date(template.createdAt).toLocaleDateString('pt-BR')}</p>
            <p>Criado por: ${template.createdBy}</p>
            <p>Categoria: ${template.category}</p>
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }

  /**
   * Faz download de arquivo de texto
   */
  private static downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, fileName);
  }

  /**
   * Faz download de blob
   */
  private static downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Importa template de arquivo JSON
   */
  static async importTemplate(file: File): Promise<{
    success: boolean;
    template?: SavedTemplate;
    error?: string;
  }> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Verifica se é um template válido
      if (data.template && data.template.name && data.template.fields) {
        const template: SavedTemplate = {
          ...data.template,
          id: `imported_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Importado',
          usageCount: 0
        };

        return {
          success: true,
          template
        };
      } else {
        throw new Error('Formato de arquivo inválido');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao importar template'
      };
    }
  }
}