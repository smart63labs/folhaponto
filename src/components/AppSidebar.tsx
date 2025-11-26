import {
  Home,
  Clock,
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  UserCheck,
  ClipboardList,
  Database,
  Archive,
  CalendarDays,
  MapPin
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AppSidebarProps {
  userRole: 'servidor' | 'chefia' | 'rh' | 'admin';
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Menu especializado para SERVIDOR baseado na documentação
  const servidorItems = [
    { 
      title: "Dashboard", 
      url: "/", 
      icon: Home,
      description: "Visão geral pessoal",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      activeBgColor: "bg-blue-600"
    },
    { 
      title: "Registrar Ponto", 
      url: "/registrar-ponto", 
      icon: Clock,
      description: "Registro de entrada e saída",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      activeBgColor: "bg-green-600"
    },
    { 
      title: "Minha Frequência", 
      url: "/minha-frequencia", 
      icon: Calendar,
      description: "Espelho de ponto e histórico",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      activeBgColor: "bg-purple-600"
    },
    { 
      title: "Banco de Horas", 
      url: "/banco-horas", 
      icon: BarChart3,
      description: "Saldo e solicitações de banco de horas",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
      activeBgColor: "bg-indigo-600"
    },
    { 
      title: "Relatórios", 
      url: "/servidor/relatorios", 
      icon: FileText,
      description: "Gerar e visualizar relatórios",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
      activeBgColor: "bg-emerald-600"
    },
    { 
      title: "Justificativas", 
      url: "/gestao-ocorrencias", 
      icon: AlertCircle,
      description: "Enviar justificativas e ajustes",
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
      activeBgColor: "bg-amber-600"
    }
  ];

  // Menu especializado para CHEFIA baseado na documentação
  const chefiaItems = [
    { 
      title: "Dashboard", 
      url: "/chefia", 
      icon: Home,
      description: "Visão geral da equipe",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      activeBgColor: "bg-blue-600"
    },
    { 
      title: "Minha Equipe", 
      url: "/chefia/equipe", 
      icon: Users,
      description: "Gestão e acompanhamento da equipe",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 hover:bg-cyan-100",
      activeBgColor: "bg-cyan-600"
    },
    {
      title: "Escalas",
      url: "/chefia/escalas",
      icon: ClipboardList,
      description: "Gerenciar escalas e turnos da equipe",
      color: "text-rose-600",
      bgColor: "bg-rose-50 hover:bg-rose-100",
      activeBgColor: "bg-rose-600"
    },
    { 
      title: "Aprovações", 
      url: "/chefia/aprovacoes", 
      icon: CheckCircle,
      description: "Aprovar frequências e solicitações",
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
      activeBgColor: "bg-orange-600"
    },
    { 
      title: "Relatórios", 
      url: "/chefia/relatorios", 
      icon: BarChart3,
      description: "Relatórios gerenciais da chefia",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
      activeBgColor: "bg-emerald-600"
    },
    { 
      title: "Upload Frequência", 
      url: "/chefia/upload-frequencia", 
      icon: Upload,
      description: "Anexar formulários físicos de frequência",
      color: "text-violet-600",
      bgColor: "bg-violet-50 hover:bg-violet-100",
      activeBgColor: "bg-violet-600"
    },
  ];

  // Menu especializado para RH baseado na documentação
  const rhItems = [
    { 
      title: "Dashboard", 
      url: "/rh", 
      icon: Home,
      description: "Visão geral do RH",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      activeBgColor: "bg-blue-600"
    },
    {
      title: "Gestão de Servidores",
      url: "/rh/gestao-servidores",
      icon: Users,
      description: "Gerenciamento de todos os servidores",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 hover:bg-cyan-100",
      activeBgColor: "bg-cyan-600"
    },
    {
      title: "Gestão de Setores",
      url: "/rh/gestao-setores",
      icon: MapPin,
      description: "Gerenciamento de setores organizacionais",
      color: "text-pink-600",
      bgColor: "bg-pink-50 hover:bg-pink-100",
      activeBgColor: "bg-pink-600"
    },
    {
      title: "Atestos",
      url: "/rh/atestos",
      icon: FileText,
      description: "Sistema de attestos automáticos",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      activeBgColor: "bg-purple-600"
    },
    {
      title: "Aprovações Gerais",
      url: "/rh/aprovacoes-gerais",
      icon: CheckCircle,
      description: "Aprovação de todas as solicitações",
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
      activeBgColor: "bg-orange-600"
    },
    {
      title: "Relatórios", 
      url: "/rh/relatorios", 
      icon: BarChart3,
      description: "Relatórios e análises gerais",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
      activeBgColor: "bg-emerald-600"
    },
    {
      title: "Cadastro Facial",
      url: "/rh/cadastro-facial",
      icon: UserCheck,
      description: "Cadastrar imagem para reconhecimento",
      color: "text-rose-600",
      bgColor: "bg-rose-50 hover:bg-rose-100",
      activeBgColor: "bg-rose-600"
    },
    { 
      title: "Templates de Frequência", 
      url: "/rh/templates-frequencia", 
      icon: ClipboardList,
      description: "Gerenciar templates de formulários",
      color: "text-violet-600",
      bgColor: "bg-violet-50 hover:bg-violet-100",
      activeBgColor: "bg-violet-600"
    },
    { 
      title: "Configurar Jornadas", 
      url: "/rh/configurar-jornadas", 
      icon: Settings,
      description: "Configuração de jornadas de trabalho",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
      activeBgColor: "bg-indigo-600"
    },
    { 
      title: "Logs de Auditoria", 
      url: "/rh/logs-auditoria", 
      icon: Shield,
      description: "Histórico de alterações e auditoria",
      color: "text-red-600",
      bgColor: "bg-red-50 hover:bg-red-100",
      activeBgColor: "bg-red-600"
    },
    { 
      title: "Exportar Dados", 
      url: "/rh/exportar-dados", 
      icon: Download,
      description: "Exportação de relatórios e dados",
      color: "text-gray-600",
      bgColor: "bg-gray-50 hover:bg-gray-100",
      activeBgColor: "bg-gray-600"
    },
  ];

  // Menu especializado para ADMIN baseado na documentação
  const adminItems = [
    { 
      title: "Dashboard", 
      url: "/admin", 
      icon: Home,
      description: "Visão geral administrativa",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      activeBgColor: "bg-blue-600"
    },
    { 
      title: "Gestão Completa", 
      url: "/admin/gestao-completa", 
      icon: Users,
      description: "Gerenciamento completo do sistema",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 hover:bg-cyan-100",
      activeBgColor: "bg-cyan-600"
    },
    { 
      title: "Aprovações Gerais", 
      url: "/admin/aprovacoes-gerais", 
      icon: CheckCircle,
      description: "Aprovação de todas as solicitações",
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
      activeBgColor: "bg-orange-600"
    },
    { 
      title: "Relatórios", 
      url: "/admin/relatorios", 
      icon: BarChart3,
      description: "Relatórios e analytics avançados",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
      activeBgColor: "bg-emerald-600"
    },
    { 
      title: "Templates & Formulários", 
      url: "/admin/templates-formularios", 
      icon: ClipboardList,
      description: "Gestão completa de templates",
      color: "text-violet-600",
      bgColor: "bg-violet-50 hover:bg-violet-100",
      activeBgColor: "bg-violet-600"
    },
    { 
      title: "Configurações Sistema", 
      url: "/admin/configuracoes-sistema", 
      icon: Settings,
      description: "Configurações gerais do sistema",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
      activeBgColor: "bg-indigo-600"
    },
    { 
      title: "Gerenciar Feriados", 
      url: "/admin/gerenciar-feriados", 
      icon: CalendarDays,
      description: "Gestão de feriados nacionais, estaduais e municipais",
      color: "text-pink-600",
      bgColor: "bg-pink-50 hover:bg-pink-100",
      activeBgColor: "bg-pink-600"
    },
    { 
      title: "Auditoria & Logs", 
      url: "/admin/auditoria-logs", 
      icon: Shield,
      description: "Auditoria completa e logs do sistema",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      activeBgColor: "bg-purple-600"
    },
    { 
      title: "Backup & Arquivos", 
      url: "/admin/backup-arquivos", 
      icon: Archive,
      description: "Backup e gestão de arquivos",
      color: "text-slate-600",
      bgColor: "bg-slate-50 hover:bg-slate-100",
      activeBgColor: "bg-slate-600"
    },
    { 
      title: "Banco de Dados", 
      url: "/admin/banco-dados", 
      icon: Database,
      description: "Gestão da base de dados",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      activeBgColor: "bg-green-600"
    },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'servidor':
        return servidorItems;
      case 'chefia':
        return chefiaItems;
      case 'rh':
        return rhItems;
      case 'admin':
        return adminItems;
      default:
        return servidorItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div 
      className={cn(
        "flex flex-col bg-white transition-all duration-300",
        "min-h-full", // Altura mínima para ocupar todo o espaço disponível
        isCollapsed ? "w-20" : "w-80"
      )}
    >
      {/* Header - Apenas botão de toggle */}
      <div className="flex items-center justify-center p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          
          if (isCollapsed) {
            return (
              <div key={item.url} title={`${item.title} - ${item.description}`}>
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                      isActive 
                        ? `${item.activeBgColor} text-white shadow-sm` 
                        : `${item.bgColor} transition-colors`
                    )
                  }
                >
                  {({ isActive }) => (
                    <IconComponent
                      size={48}
                      className={cn(
                        "flex-shrink-0",
                        isActive ? "text-white" : item.color
                      )}
                    />
                  )}
                </NavLink>
              </div>
            );
          }

          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                  isActive 
                    ? `${item.activeBgColor} text-white shadow-sm` 
                    : `${item.bgColor} transition-colors`
                )
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent
                    size={48}
                    className={cn(
                      "flex-shrink-0",
                      isActive ? "text-white" : item.color
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-white" : "text-gray-900"
                    )}>
                      {item.title}
                    </p>
                    <p className={cn(
                      "text-xs truncate",
                      isActive ? "text-white/80" : "text-gray-600"
                    )}>
                      {item.description}
                    </p>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
