import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Key, 
  Shield, 
  Mail, 
  Database, 
  CheckCircle, 
  XCircle, 
  Settings, 
  AlertTriangle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Globe,
  Server
} from 'lucide-react';

interface AuthConfig {
  id: number;
  tipo_auth: 'MOCK' | 'LDAP' | 'GMAIL';
  ativo: boolean;
  configuracao: any;
  data_criacao: string;
  data_atualizacao: string;
}

interface AuthConfigPanelProps {
  onConfigChange?: (configs: AuthConfig[]) => void;
}

const AuthConfigPanel: React.FC<AuthConfigPanelProps> = ({ onConfigChange }) => {
  const [configs, setConfigs] = useState<AuthConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AuthConfig | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Carregar configurações do backend
  useEffect(() => {
    loadAuthConfigs();
  }, []);

  const loadAuthConfigs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth-config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.data || []);
        onConfigChange?.(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthProvider = async (tipo: string, ativo: boolean) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/auth-config/toggle/${tipo}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo }),
      });

      if (response.ok) {
        await loadAuthConfigs();
      }
    } catch (error) {
      console.error('Erro ao alternar provedor de autenticação:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateAuthConfig = async (config: AuthConfig) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/auth-config/${config.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo_auth: config.tipo_auth,
          ativo: config.ativo,
          configuracao: config.configuracao,
        }),
      });

      if (response.ok) {
        await loadAuthConfigs();
        setEditingConfig(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    } finally {
      setSaving(false);
    }
  };

  const getProviderIcon = (tipo: string) => {
    switch (tipo) {
      case 'MOCK':
        return Database;
      case 'LDAP':
        return Server;
      case 'GMAIL':
        return Mail;
      default:
        return Key;
    }
  };

  const getProviderName = (tipo: string) => {
    switch (tipo) {
      case 'MOCK':
        return 'Dados Mockados';
      case 'LDAP':
        return 'Active Directory / LDAP';
      case 'GMAIL':
        return 'Gmail OAuth';
      default:
        return tipo;
    }
  };

  const getProviderDescription = (tipo: string) => {
    switch (tipo) {
      case 'MOCK':
        return 'Autenticação usando dados de teste locais';
      case 'LDAP':
        return 'Autenticação via Active Directory ou servidor LDAP';
      case 'GMAIL':
        return 'Autenticação usando conta do Google/Gmail';
      default:
        return 'Método de autenticação';
    }
  };

  const renderConfigForm = (config: AuthConfig) => {
    const Icon = getProviderIcon(config.tipo_auth);
    
    return (
      <Dialog open={editingConfig?.id === config.id} onOpenChange={(open) => !open && setEditingConfig(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setEditingConfig(config)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              Configurar {getProviderName(config.tipo_auth)}
            </DialogTitle>
            <DialogDescription>
              {getProviderDescription(config.tipo_auth)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {config.tipo_auth === 'LDAP' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ldap-server">Servidor LDAP</Label>
                    <Input
                      id="ldap-server"
                      value={config.configuracao?.server || ''}
                      onChange={(e) => setEditingConfig({
                        ...config,
                        configuracao: { ...config.configuracao, server: e.target.value }
                      })}
                      placeholder="ldap://servidor.sefaz.to.gov.br"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ldap-port">Porta</Label>
                    <Input
                      id="ldap-port"
                      type="number"
                      value={config.configuracao?.port || 389}
                      onChange={(e) => setEditingConfig({
                        ...config,
                        configuracao: { ...config.configuracao, port: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ldap-base-dn">Base DN</Label>
                  <Input
                    id="ldap-base-dn"
                    value={config.configuracao?.baseDN || ''}
                    onChange={(e) => setEditingConfig({
                      ...config,
                      configuracao: { ...config.configuracao, baseDN: e.target.value }
                    })}
                    placeholder="dc=sefaz,dc=to,dc=gov,dc=br"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ldap-bind-dn">Bind DN</Label>
                  <Input
                    id="ldap-bind-dn"
                    value={config.configuracao?.bindDN || ''}
                    onChange={(e) => setEditingConfig({
                      ...config,
                      configuracao: { ...config.configuracao, bindDN: e.target.value }
                    })}
                    placeholder="cn=admin,dc=sefaz,dc=to,dc=gov,dc=br"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ldap-bind-password">Senha do Bind</Label>
                  <div className="relative">
                    <Input
                      id="ldap-bind-password"
                      type={showPasswords['ldap'] ? 'text' : 'password'}
                      value={config.configuracao?.bindPassword || ''}
                      onChange={(e) => setEditingConfig({
                        ...config,
                        configuracao: { ...config.configuracao, bindPassword: e.target.value }
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, ldap: !prev.ldap }))}
                    >
                      {showPasswords['ldap'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {config.tipo_auth === 'GMAIL' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gmail-client-id">Client ID</Label>
                  <Input
                    id="gmail-client-id"
                    value={config.configuracao?.clientId || ''}
                    onChange={(e) => setEditingConfig({
                      ...config,
                      configuracao: { ...config.configuracao, clientId: e.target.value }
                    })}
                    placeholder="seu-client-id.apps.googleusercontent.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gmail-client-secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="gmail-client-secret"
                      type={showPasswords['gmail'] ? 'text' : 'password'}
                      value={config.configuracao?.clientSecret || ''}
                      onChange={(e) => setEditingConfig({
                        ...config,
                        configuracao: { ...config.configuracao, clientSecret: e.target.value }
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, gmail: !prev.gmail }))}
                    >
                      {showPasswords['gmail'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gmail-redirect-uri">URI de Redirecionamento</Label>
                  <Input
                    id="gmail-redirect-uri"
                    value={config.configuracao?.redirectUri || ''}
                    onChange={(e) => setEditingConfig({
                      ...config,
                      configuracao: { ...config.configuracao, redirectUri: e.target.value }
                    })}
                    placeholder="http://localhost:3001/auth/google/callback"
                  />
                </div>
              </>
            )}
            
            {config.tipo_auth === 'MOCK' && (
              <div className="space-y-2">
                <Label>Configurações de Dados Mockados</Label>
                <p className="text-sm text-muted-foreground">
                  Este método usa dados de teste pré-definidos. Não requer configuração adicional.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">Usuários de teste disponíveis:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• admin_protocolo@sefaz.to.gov.br (Admin)</li>
                    <li>• joao.silva@sefaz.to.gov.br (Servidor)</li>
                    <li>• maria.santos@sefaz.to.gov.br (Chefia)</li>
                    <li>• carlos.oliveira@sefaz.to.gov.br (RH)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditingConfig(null)}>
              Cancelar
            </Button>
            <Button onClick={() => editingConfig && updateAuthConfig(editingConfig)} disabled={saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando configurações de autenticação...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Métodos de Autenticação
          </CardTitle>
          <CardDescription>
            Configure os métodos de autenticação disponíveis no sistema. Apenas um método pode estar ativo por vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configs.map((config, index) => {
            const Icon = getProviderIcon(config.tipo_auth);
            
            return (
              <div key={config.id}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{getProviderName(config.tipo_auth)}</h3>
                        <Badge variant={config.ativo ? "default" : "secondary"}>
                          {config.ativo ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getProviderDescription(config.tipo_auth)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {renderConfigForm(config)}
                    <Switch
                      checked={config.ativo}
                      onCheckedChange={(checked) => toggleAuthProvider(config.tipo_auth, checked)}
                      disabled={saving}
                    />
                  </div>
                </div>
                
                {index < configs.length - 1 && <Separator className="my-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Segurança</p>
              <p className="text-sm text-muted-foreground">
                Apenas um método de autenticação pode estar ativo por vez. Ao ativar um método, os outros serão automaticamente desativados.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Conectividade</p>
              <p className="text-sm text-muted-foreground">
                Para LDAP e Gmail, certifique-se de que o servidor tem acesso à internet e às portas necessárias estão abertas.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Credenciais</p>
              <p className="text-sm text-muted-foreground">
                Todas as credenciais são armazenadas de forma segura e criptografada no banco de dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthConfigPanel;