import { CheckCircle2, XCircle, Clock, AlertTriangle, Calendar } from "lucide-react";

export interface BadgeConfig {
  label: string;
  className: string;
  bgClass: string;
  icon: any;
  textColor: string;
  bgColor: string;
}

export const ATTENDANCE_STATUS_CONFIG: Record<string, BadgeConfig> = {
  presente: {
    label: "Presente",
    className: "bg-emerald-500 text-white shadow-sm border-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    icon: CheckCircle2,
    textColor: "text-emerald-800",
    bgColor: "bg-emerald-100"
  },
  falta: {
    label: "Falta",
    className: "bg-red-500 text-white shadow-sm border-red-600",
    bgClass: "bg-red-50 border-red-200 hover:bg-red-100",
    icon: XCircle,
    textColor: "text-red-800",
    bgColor: "bg-red-100"
  },
  atraso: {
    label: "Atraso",
    className: "bg-amber-500 text-white shadow-sm border-amber-600",
    bgClass: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    icon: Clock,
    textColor: "text-amber-800",
    bgColor: "bg-amber-100"
  },
  justificado: {
    label: "Justificado",
    className: "bg-blue-500 text-white shadow-sm border-blue-600",
    bgClass: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    icon: AlertTriangle,
    textColor: "text-blue-800",
    bgColor: "bg-blue-100"
  },
  pendente: {
    label: "Pendente",
    className: "bg-orange-500 text-white shadow-sm border-orange-600",
    bgClass: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    icon: Calendar,
    textColor: "text-orange-800",
    bgColor: "bg-orange-100"
  }
};

export const APPROVAL_STATUS_CONFIG: Record<string, BadgeConfig> = {
  aprovado: {
    label: "Aprovado",
    className: "bg-emerald-500 text-white shadow-sm border-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    textColor: "text-emerald-800",
    bgColor: "bg-emerald-100"
  },
  pendente: {
    label: "Pendente",
    className: "bg-orange-500 text-white shadow-sm border-orange-600",
    bgClass: "bg-orange-50 border-orange-200",
    icon: Clock,
    textColor: "text-orange-800",
    bgColor: "bg-orange-100"
  },
  rejeitado: {
    label: "Rejeitado",
    className: "bg-red-500 text-white shadow-sm border-red-600",
    bgClass: "bg-red-50 border-red-200",
    icon: XCircle,
    textColor: "text-red-800",
    bgColor: "bg-red-100"
  }
};

export const GENERAL_STATUS_CONFIG: Record<string, BadgeConfig> = {
  ativo: {
    label: "Ativo",
    className: "bg-emerald-500 text-white shadow-sm border-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    textColor: "text-emerald-800",
    bgColor: "bg-emerald-100"
  },
  inativo: {
    label: "Inativo",
    className: "bg-gray-500 text-white shadow-sm border-gray-600",
    bgClass: "bg-gray-50 border-gray-200",
    icon: XCircle,
    textColor: "text-gray-800",
    bgColor: "bg-gray-100"
  },
  processando: {
    label: "Processando",
    className: "bg-blue-500 text-white shadow-sm border-blue-600",
    bgClass: "bg-blue-50 border-blue-200",
    icon: Clock,
    textColor: "text-blue-800",
    bgColor: "bg-blue-100"
  },
  erro: {
    label: "Erro",
    className: "bg-red-500 text-white shadow-sm border-red-600",
    bgClass: "bg-red-50 border-red-200",
    icon: XCircle,
    textColor: "text-red-800",
    bgColor: "bg-red-100"
  },
  sucesso: {
    label: "Sucesso",
    className: "bg-emerald-500 text-white shadow-sm border-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    textColor: "text-emerald-800",
    bgColor: "bg-emerald-100"
  }
};

// Função utilitária para obter configuração de badge
export const getBadgeConfig = (status: string, type: 'attendance' | 'approval' | 'general' = 'general'): BadgeConfig => {
  const configs = {
    attendance: ATTENDANCE_STATUS_CONFIG,
    approval: APPROVAL_STATUS_CONFIG,
    general: GENERAL_STATUS_CONFIG
  };
  
  const config = configs[type];
  return config[status.toLowerCase()] || {
    label: status,
    className: "bg-gray-500 text-white shadow-sm border-gray-600",
    bgClass: "bg-gray-50 border-gray-200",
    icon: Calendar,
    textColor: "text-gray-800",
    bgColor: "bg-gray-100"
  };
};

// Função para renderizar badge padronizado
export const renderStandardBadge = (status: string, type: 'attendance' | 'approval' | 'general' = 'general', showIcon: boolean = true) => {
  const config = getBadgeConfig(status, type);
  const Icon = config.icon;
  
  return {
    config,
    Icon,
    className: `${config.bgColor} ${config.textColor} flex items-center gap-1`
  };
};