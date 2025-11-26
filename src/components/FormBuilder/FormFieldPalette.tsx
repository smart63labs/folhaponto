import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Draggable } from '../DragDrop';
import { FormField, FormFieldComponent } from '../../types/formBuilder';
import { 
  Type, 
  Mail, 
  Lock, 
  Hash, 
  Phone, 
  Link, 
  FileText, 
  ChevronDown, 
  CheckSquare, 
  Circle, 
  Calendar, 
  Clock, 
  CalendarClock, 
  Upload, 
  MousePointer, 
  Send, 
  RotateCcw,
  Heading1,
  Heading2,
  Heading3,
  Separator,
  Image,
  AlignLeft,
  Table,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const FORM_FIELD_COMPONENTS: FormFieldComponent[] = [
  // Input Fields
  {
    type: 'text',
    label: 'Texto',
    icon: Type,
    category: 'input',
    defaultProps: {
      type: 'text',
      label: 'Campo de Texto',
      placeholder: 'Digite aqui...',
      required: false,
    },
  },
  {
    type: 'email',
    label: 'E-mail',
    icon: Mail,
    category: 'input',
    defaultProps: {
      type: 'email',
      label: 'E-mail',
      placeholder: 'exemplo@email.com',
      required: false,
    },
  },
  {
    type: 'password',
    label: 'Senha',
    icon: Lock,
    category: 'input',
    defaultProps: {
      type: 'password',
      label: 'Senha',
      placeholder: '••••••••',
      required: false,
    },
  },
  {
    type: 'number',
    label: 'Número',
    icon: Hash,
    category: 'input',
    defaultProps: {
      type: 'number',
      label: 'Número',
      placeholder: '0',
      required: false,
    },
  },
  {
    type: 'tel',
    label: 'Telefone',
    icon: Phone,
    category: 'input',
    defaultProps: {
      type: 'tel',
      label: 'Telefone',
      placeholder: '(00) 00000-0000',
      required: false,
    },
  },
  {
    type: 'url',
    label: 'URL',
    icon: Link,
    category: 'input',
    defaultProps: {
      type: 'url',
      label: 'URL',
      placeholder: 'https://exemplo.com',
      required: false,
    },
  },
  {
    type: 'textarea',
    label: 'Área de Texto',
    icon: FileText,
    category: 'input',
    defaultProps: {
      type: 'textarea',
      label: 'Área de Texto',
      placeholder: 'Digite seu texto aqui...',
      required: false,
    },
  },
  
  // Selection Fields
  {
    type: 'select',
    label: 'Lista Suspensa',
    icon: ChevronDown,
    category: 'selection',
    defaultProps: {
      type: 'select',
      label: 'Lista Suspensa',
      required: false,
      options: [
        { label: 'Opção 1', value: 'opcao1' },
        { label: 'Opção 2', value: 'opcao2' },
        { label: 'Opção 3', value: 'opcao3' },
      ],
    },
  },
  {
    type: 'checkbox',
    label: 'Caixa de Seleção',
    icon: CheckSquare,
    category: 'selection',
    defaultProps: {
      type: 'checkbox',
      label: 'Caixa de Seleção',
      required: false,
    },
  },
  {
    type: 'radio',
    label: 'Botão de Opção',
    icon: Circle,
    category: 'selection',
    defaultProps: {
      type: 'radio',
      label: 'Botão de Opção',
      required: false,
      options: [
        { label: 'Opção A', value: 'a' },
        { label: 'Opção B', value: 'b' },
        { label: 'Opção C', value: 'c' },
      ],
    },
  },
  
  // Date/Time Fields
  {
    type: 'date',
    label: 'Data',
    icon: Calendar,
    category: 'input',
    defaultProps: {
      type: 'date',
      label: 'Data',
      required: false,
    },
  },
  {
    type: 'time',
    label: 'Hora',
    icon: Clock,
    category: 'input',
    defaultProps: {
      type: 'time',
      label: 'Hora',
      required: false,
    },
  },
  {
    type: 'datetime-local',
    label: 'Data e Hora',
    icon: CalendarClock,
    category: 'input',
    defaultProps: {
      type: 'datetime-local',
      label: 'Data e Hora',
      required: false,
    },
  },
  
  // File Upload
  {
    type: 'file',
    label: 'Upload de Arquivo',
    icon: Upload,
    category: 'input',
    defaultProps: {
      type: 'file',
      label: 'Upload de Arquivo',
      required: false,
    },
  },
  
  // Action Buttons
  {
    type: 'button',
    label: 'Botão',
    icon: MousePointer,
    category: 'action',
    defaultProps: {
      type: 'button',
      label: 'Botão',
      value: 'Clique aqui',
    },
  },
  {
    type: 'submit',
    label: 'Enviar',
    icon: Send,
    category: 'action',
    defaultProps: {
      type: 'submit',
      label: 'Botão Enviar',
      value: 'Enviar',
    },
  },
  {
    type: 'reset',
    label: 'Limpar',
    icon: RotateCcw,
    category: 'action',
    defaultProps: {
      type: 'reset',
      label: 'Botão Limpar',
      value: 'Limpar',
    },
  },
  {
    type: 'frequency-table',
    label: 'Tabela de Frequência',
    icon: Table,
    category: 'input',
    defaultProps: {
      type: 'frequency-table',
      label: 'Tabela de Frequência Mensal',
      required: false,
    },
  },
];

const CATEGORIES = [
  { id: 'input', label: 'Entrada', icon: Type },
  { id: 'selection', label: 'Seleção', icon: CheckSquare },
  { id: 'action', label: 'Ações', icon: MousePointer },
  { id: 'help', label: 'Ajuda', icon: HelpCircle },
];

interface FormFieldPaletteProps {
  onFieldSelect: (field: FormField, position?: { x: number; y: number }) => void;
}

export const FormFieldPalette: React.FC<FormFieldPaletteProps> = ({ onFieldSelect }) => {
  const createField = (component: FormFieldComponent): FormField => ({
    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...component.defaultProps,
  } as FormField);

  const handleFieldClick = (component: FormFieldComponent) => {
    const field = createField(component);
    onFieldSelect(field);
  };

  const renderComponentGrid = (categoryId: string) => {
    const categoryComponents = FORM_FIELD_COMPONENTS.filter(
      component => component.category === categoryId
    );

    if (categoryComponents.length === 0) return null;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 p-1">
        {categoryComponents.map(component => {
          const IconComponent = component.icon;
          
          return (
            <Draggable
              key={component.type}
              id={`palette_${component.type}`}
              type="form-field"
              content={component}
              className="inline-block"
            >
              <div
                className={cn(
                  'flex flex-col items-center justify-center p-1 rounded-md border border-gray-200',
                  'hover:border-blue-300 hover:bg-blue-50 cursor-grab',
                  'transition-all duration-200 group text-xs h-12 min-w-0'
                )}
                onClick={() => handleFieldClick(component)}
                title={component.label}
              >
                <IconComponent className="h-3 w-3 mb-0.5 text-gray-600 group-hover:text-blue-600 flex-shrink-0" />
                <span className="font-medium text-gray-700 group-hover:text-blue-700 text-center leading-tight truncate w-full text-[10px]">
                  {component.label}
                </span>
              </div>
            </Draggable>
          );
        })}
      </div>
    );
  };

  const renderHelpContent = () => (
    <div className="p-4 space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <HelpCircle className="h-4 w-4 mr-2" />
          Como usar os componentes
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Arrastar:</strong> Arraste os componentes para o formulário</p>
          <p>• <strong>Clicar:</strong> Clique para adicionar rapidamente</p>
          <p>• <strong>Editar:</strong> Selecione no formulário para editar propriedades</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-green-800 mb-1">Campos de Entrada</h5>
          <p className="text-xs text-green-700">Campos para coleta de dados do usuário</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-purple-800 mb-1">Seleção</h5>
          <p className="text-xs text-purple-700">Componentes para escolhas múltiplas</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-orange-800 mb-1">Ações</h5>
          <p className="text-xs text-orange-700">Botões para interações do usuário</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-gray-800 mb-1">Dica</h5>
          <p className="text-xs text-gray-700">Use Ctrl+Z para desfazer ações</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="input" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 h-9">
          {CATEGORIES.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="flex items-center justify-center gap-1 text-xs px-2"
            >
              <category.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="input" className="h-full m-0 overflow-auto">
            {renderComponentGrid('input')}
          </TabsContent>
          
          <TabsContent value="selection" className="h-full m-0 overflow-auto">
            {renderComponentGrid('selection')}
          </TabsContent>
          
          <TabsContent value="action" className="h-full m-0 overflow-auto">
            {renderComponentGrid('action')}
          </TabsContent>
          
          <TabsContent value="help" className="h-full m-0 overflow-auto">
            {renderHelpContent()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};