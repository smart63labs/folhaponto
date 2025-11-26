import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários mockados para demonstração
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@sefaz.to.gov.br',
    password: '123456',
    role: 'servidor',
    department: 'Tributação',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@sefaz.to.gov.br',
    password: '123456',
    role: 'chefia',
    department: 'Tributação',
    supervisor: '4',
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@sefaz.to.gov.br',
    password: '123456',
    role: 'rh',
    department: 'Recursos Humanos',
  },
  {
    id: '4',
    name: 'Ana Paula',
    email: 'ana.paula@sefaz.to.gov.br',
    password: '123456',
    role: 'admin',
    department: 'Administração',
  },
  {
    id: '6',
    name: 'Admin Chefia de Setor',
    email: 'admin_chefiasetor@sefaz.to.gov.br',
    password: '123456',
    role: 'chefia',
    department: 'Tributação',
  },
  {
    id: '7',
    name: 'Admin Chefia RH',
    email: 'admin_chefiarh@sefaz.to.gov.br',
    password: '123456',
    role: 'rh',
    department: 'Recursos Humanos',
  },
  {
    id: '8',
    name: 'Admin Ponto Eletrônico',
    email: 'admin_pontoeletronico@sefaz.to.gov.br',
    password: '123456',
    role: 'admin',
    department: 'Administração',
  },
  {
    id: '5',
    name: 'Admin Protocolo',
    email: 'admin_protocolo@sefaz.to.gov.br',
    password: 'admin123',
    role: 'admin',
    department: 'Administração',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se há sessão salva no localStorage
    const savedUser = localStorage.getItem('sefaz_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('sefaz_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('sefaz_user', JSON.stringify(userWithoutPassword));
        return { success: true };
      }

      return { success: false, error: 'Email ou senha incorretos' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sefaz_user');
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }), [user, login, logout, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
