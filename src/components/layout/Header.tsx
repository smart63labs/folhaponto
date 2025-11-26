import { Bell, Search, User, Menu, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import logoSefaz from "@/assets/logo-sefaz-tocantins.png";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="header-govto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoSefaz} 
              alt="Logo SEFAZ Tocantins"
              className="h-10 sm:h-12 object-contain bg-transparent"
              style={{ backgroundColor: 'transparent' }}
            />
          </div>

          {/* Barra de Pesquisa */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Pesquisar funcionários, relatórios..."
                className="pl-10 bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-300"
              />
            </div>
          </div>

          {/* Menu Ações */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Indicador de Status Offline */}
            <OfflineIndicator />
            
            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 relative">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center text-[10px] sm:text-xs">
                3
              </span>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'email@exemplo.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;