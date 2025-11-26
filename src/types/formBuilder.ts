export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'datetime-local' | 'file' | 'button' | 'submit' | 'reset' | 'frequency-table';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: any;
  defaultValue?: any;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  style?: FormFieldStyle;
  attributes?: Record<string, any>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface FormFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => string | null;
}

export interface FormFieldStyle {
  className?: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  layout: FormLayout;
  style?: FormTemplateStyle;
  metadata?: FormTemplateMetadata;
  printConfig?: PrintConfig;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FormLayout {
  type: 'grid' | 'flex' | 'absolute';
  columns?: number;
  gap?: string;
  padding?: string;
  backgroundColor?: string;
  minHeight?: string;
}

export interface FormTemplateStyle {
  theme?: 'light' | 'dark' | 'sefaz';
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

export interface FormTemplateMetadata {
  category?: string;
  tags?: string[];
  version?: string;
  isPublic?: boolean;
  department?: string;
}

export interface PaperFormat {
  name: string;
  width: number; // em mm
  height: number; // em mm
  orientation: 'portrait' | 'landscape';
}

export interface HeaderFooterConfig {
  header?: {
    enabled: boolean;
    logo?: string; // URL ou base64 da imagem
    logoPosition?: 'left' | 'center' | 'right';
    title?: string;
    subtitle?: string;
    customText?: string;
    height?: number; // em mm
  };
  footer?: {
    enabled: boolean;
    logo?: string; // URL ou base64 da imagem
    logoPosition?: 'left' | 'center' | 'right';
    text?: string;
    showPageNumber?: boolean;
    customText?: string;
    height?: number; // em mm
  };
}

export interface PrintConfig {
  paperFormat: PaperFormat;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerFooter: HeaderFooterConfig;
}

export interface FormBuilderState {
  template: FormTemplate;
  selectedField: string | null;
  draggedField: FormField | null;
  isPreviewMode: boolean;
  isDirty: boolean;
  history: FormTemplate[];
  historyIndex: number;
}

export interface FormFieldComponent {
  type: string;
  label: string;
  icon: React.ComponentType;
  defaultProps: Partial<FormField>;
  category: 'input' | 'selection' | 'action' | 'layout';
}