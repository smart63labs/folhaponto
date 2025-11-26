import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/AuthContext";
import logoSefaz from "@/assets/logo-sefaz-tocantins.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Redireciona baseado no role do usuário
      const redirectPath = user.role === 'chefia' ? '/chefia' : 
                          user.role === 'rh' ? '/rh' :
                          user.role === 'admin' ? '/admin' : '/';
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redireciona baseado no role do usuário
      const user = JSON.parse(localStorage.getItem('sefaz_user') || '{}');
      const redirectPath = user.role === 'chefia' ? '/chefia' : 
                          user.role === 'rh' ? '/rh' :
                          user.role === 'admin' ? '/admin' : '/';
      navigate(redirectPath);
    } else {
      console.error("Erro ao fazer login:", result.error || "Verifique suas credenciais");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-success/5">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="-mb-2">
            <img 
              src={logoSefaz} 
              alt="SEFAZ Tocantins" 
              className="h-16 w-auto mx-auto object-contain"
            />
          </div>
          <div className="mt-1">
            <CardTitle className="text-2xl font-bold">Sistema de Controle de Ponto</CardTitle>
            <CardDescription className="mt-2">
              SEFAZ-TO
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@sefaz.to.gov.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 p-4 bg-muted/50 rounded-md text-sm">
              <p className="font-semibold">Usuários de teste:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Servidor: joao.silva@sefaz.to.gov.br</li>
                <li>• Chefia: maria.santos@sefaz.to.gov.br</li>
                <li>• RH: carlos.oliveira@sefaz.to.gov.br</li>
                <li>• Admin: ana.paula@sefaz.to.gov.br</li>
                <li className="mt-2">Senha para todos: 123456</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center">
              <Button variant="link" className="text-sm text-muted-foreground" type="button">
                Esqueceu sua senha?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
