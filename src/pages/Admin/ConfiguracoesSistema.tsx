import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import AuthConfigPanel from '@/components/AuthConfigPanel';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Database,
  Mail,
  Bell,
  Clock,
  Users,
  Building,
  Key,
  Globe,
  Palette,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Upload,
  Download,
  FileText,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Server,
  Cloud,
  Zap,
  Target,
  BarChart3,
  Calendar,
  MapPin,
  Phone,
  AtSign
} from 'lucide-react';

// Interfaces
interface ConfiguracaoSistema {
  id: string;
  categoria: string;
  nome: string;
  descricao: string;
  valor: string | boolean | number;
  tipo: 'texto' | 'numero' | 'boolean' | 'select' | 'password' | 'email' | 'url';
  opcoes?: string[];
  obrigatorio: boolean;
  editavel: boolean;
  sensivel?: boolean;
}

interface EstatisticaConfig {
  titulo: string;
  valor: number | string;
  variacao?: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

const ConfiguracoesSistema: React.FC = () => {
  const [categoriaAtiva, setCategoriaAtiva] = useState('geral');
  const [configuracoesEditadas, setConfiguracoesEditadas] = useState<Record<string, any>>({});
  const [mostrarSenhas, setMostrarSenhas] = useState<Record<string, boolean>>({});
  const [salvandoConfiguracoes, setSalvandoConfiguracoes] = useState(false);

  // Configurações do sistema
  const configuracoes: ConfiguracaoSistema[] = [
    // Configurações Gerais
    {
      id: 'sistema_nome',
      categoria: 'geral',
      nome: 'Nome do Sistema',
      descricao: 'Nome exibido no cabeçalho e documentos',
      valor: 'Sistema de Folha de Ponto',
      tipo: 'texto',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'sistema_versao',
      categoria: 'geral',
      nome: 'Versão do Sistema',
      descricao: 'Versão atual do sistema',
      valor: '2.1.0',
      tipo: 'texto',
      obrigatorio: true,
      editavel: false
    },
    {
      id: 'empresa_nome',
      categoria: 'geral',
      nome: 'Nome da Empresa',
      descricao: 'Nome da empresa/organização',
      valor: 'SEFAZ - TO',
      tipo: 'texto',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'empresa_cnpj',
      categoria: 'geral',
      nome: 'CNPJ',
      descricao: 'CNPJ da empresa',
      valor: '12.345.678/0001-90',
      tipo: 'texto',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'timezone',
      categoria: 'geral',
      nome: 'Fuso Horário',
      descricao: 'Fuso horário padrão do sistema',
      valor: 'America/Sao_Paulo',
      tipo: 'select',
      opcoes: ['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Recife'],
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'idioma_padrao',
      categoria: 'geral',
      nome: 'Idioma Padrão',
      descricao: 'Idioma padrão da interface',
      valor: 'pt-BR',
      tipo: 'select',
      opcoes: ['pt-BR', 'en-US', 'es-ES'],
      obrigatorio: true,
      editavel: true
    },

    // Configurações de Segurança
    {
      id: 'senha_min_caracteres',
      categoria: 'seguranca',
      nome: 'Mínimo de Caracteres na Senha',
      descricao: 'Número mínimo de caracteres para senhas',
      valor: 8,
      tipo: 'numero',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'senha_exigir_maiuscula',
      categoria: 'seguranca',
      nome: 'Exigir Letra Maiúscula',
      descricao: 'Senhas devem conter ao menos uma letra maiúscula',
      valor: true,
      tipo: 'boolean',
      obrigatorio: false,
      editavel: true
    },
    {
      id: 'senha_exigir_numero',
      categoria: 'seguranca',
      nome: 'Exigir Número',
      descricao: 'Senhas devem conter ao menos um número',
      valor: true,
      tipo: 'boolean',
      obrigatorio: false,
      editavel: true
    },
    {
      id: 'sessao_timeout',
      categoria: 'seguranca',
      nome: 'Timeout de Sessão (minutos)',
      descricao: 'Tempo limite para sessões inativas',
      valor: 30,
      tipo: 'numero',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'tentativas_login',
      categoria: 'seguranca',
      nome: 'Máximo de Tentativas de Login',
      descricao: 'Número máximo de tentativas antes do bloqueio',
      valor: 5,
      tipo: 'numero',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'jwt_secret',
      categoria: 'seguranca',
      nome: 'JWT Secret',
      descricao: 'Chave secreta para tokens JWT',
      valor: '*********************',
      tipo: 'password',
      obrigatorio: true,
      editavel: true,
      sensivel: true
    },

    // Configurações de Email
    {
      id: 'smtp_host',
      categoria: 'email',
      nome: 'Servidor SMTP',
      descricao: 'Endereço do servidor SMTP',
      valor: 'smtp.gmail.com',
      tipo: 'texto',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'smtp_porta',
      categoria: 'email',
      nome: 'Porta SMTP',
      descricao: 'Porta do servidor SMTP',
      valor: 587,
      tipo: 'numero',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'smtp_usuario',
      categoria: 'email',
      nome: 'Usuário SMTP',
      descricao: 'Usuário para autenticação SMTP',
      valor: 'sistema@sefaz.to.gov.br',
      tipo: 'email',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'smtp_senha',
      categoria: 'email',
      nome: 'Senha SMTP',
      descricao: 'Senha para autenticação SMTP',
      valor: '***************',
      tipo: 'password',
      obrigatorio: true,
      editavel: true,
      sensivel: true
    },
    {
      id: 'email_remetente',
      categoria: 'email',
      nome: 'Email Remetente',
      descricao: 'Email padrão para envio de mensagens',
      valor: 'noreply@sefaz.to.gov.br',
      tipo: 'email',
      obrigatorio: true,
      editavel: true
    },

    // Configurações de Notificações
    {
      id: 'notif_email_ativo',
      categoria: 'notificacoes',
      nome: 'Notificações por Email',
      descricao: 'Habilitar envio de notificações por email',
      valor: true,
      tipo: 'boolean',
      obrigatorio: false,
      editavel: true
    },
    {
      id: 'notif_push_ativo',
      categoria: 'notificacoes',
      nome: 'Notificações Push',
      descricao: 'Habilitar notificações push no navegador',
      valor: false,
      tipo: 'boolean',
      obrigatorio: false,
      editavel: true
    },
    {
      id: 'notif_frequencia_resumo',
      categoria: 'notificacoes',
      nome: 'Frequência de Resumos',
      descricao: 'Frequência de envio de resumos por email',
      valor: 'semanal',
      tipo: 'select',
      opcoes: ['diario', 'semanal', 'mensal', 'nunca'],
      obrigatorio: false,
      editavel: true
    },

    // Configurações de Banco de Dados
    {
      id: 'db_host',
      categoria: 'database',
      nome: 'Host do Banco',
      descricao: 'Endereço do servidor de banco de dados',
      valor: 'localhost',
      tipo: 'texto',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'db_porta',
      categoria: 'database',
      nome: 'Porta do Banco',
      descricao: 'Porta do servidor de banco de dados',
      valor: 5432,
      tipo: 'numero',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'db_nome',
      categoria: 'database',
      nome: 'Nome do Banco',
      descricao: 'Nome da base de dados',
      valor: 'folha_ponto',
      tipo: 'texto',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'db_backup_auto',
      categoria: 'database',
      nome: 'Backup Automático',
      descricao: 'Habilitar backup automático do banco',
      valor: true,
      tipo: 'boolean',
      obrigatorio: false,
      editavel: true
    },
    {
      id: 'db_backup_frequencia',
      categoria: 'database',
      nome: 'Frequência de Backup',
      descricao: 'Frequência dos backups automáticos',
      valor: 'diario',
      tipo: 'select',
      opcoes: ['diario', 'semanal', 'mensal'],
      obrigatorio: false,
      editavel: true
    },

    // Configurações de Interface
    {
      id: 'ui_tema_padrao',
      categoria: 'interface',
      nome: 'Tema Padrão',
      descricao: 'Tema padrão da interface',
      valor: 'claro',
      tipo: 'select',
      opcoes: ['claro', 'escuro', 'auto'],
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'ui_cor_primaria',
      categoria: 'interface',
      nome: 'Cor Primária',
      descricao: 'Cor primária da interface',
      valor: '#3b82f6',
      tipo: 'texto',
      obrigatorio: true,
      editavel: true
    },
    {
      id: 'ui_logo_url',
      categoria: 'interface',
      nome: 'URL do Logo',
      descricao: 'URL da imagem do logo da empresa',
      valor: '/logo-sefaz.png',
      tipo: 'url',
      obrigatorio: false,
      editavel: true
    },
    {
      id: 'ui_itens_por_pagina',
      categoria: 'interface',
      nome: 'Itens por Página',
      descricao: 'Número padrão de itens por página nas listagens',
      valor: 20,
      tipo: 'numero',
      obrigatorio: true,
      editavel: true
    }
    , {
      id: 'modo_registro_ponto',
      categoria: 'ponto',
      nome: 'Modo de Registro de Ponto',
      descricao: 'Selecione entre registro manual ou reconhecimento facial',
      valor: 'manual',
      tipo: 'select',
      opcoes: ['manual', 'facial', 'biometria'],
      obrigatorio: true,
      editavel: true
    }
  ];

  // Estatísticas
  const estatisticas: EstatisticaConfig[] = [
    {
      titulo: 'Configurações Ativas',
      valor: configuracoes.filter(c => c.editavel).length,
      icone: Settings,
      cor: 'text-blue-600',
      descricao: 'Configurações editáveis'
    },
    {
      titulo: 'Configurações Críticas',
      valor: configuracoes.filter(c => c.sensivel).length,
      icone: Shield,
      cor: 'text-red-600',
      descricao: 'Configurações sensíveis'
    },
    {
      titulo: 'Última Atualização',
      valor: '2 dias atrás',
      icone: Clock,
      cor: 'text-green-600',
      descricao: 'Última modificação'
    },
    {
      titulo: 'Status do Sistema',
      valor: 'Online',
      icone: Activity,
      cor: 'text-green-600',
      descricao: 'Sistema operacional'
    }
  ];

  // Categorias
  const categorias = [
    { id: 'geral', nome: 'Geral', icone: Settings, descricao: 'Configurações gerais do sistema' },
    { id: 'autenticacao', nome: 'Autenticação', icone: Key, descricao: 'Configurações de métodos de autenticação' },
    { id: 'seguranca', nome: 'Segurança', icone: Shield, descricao: 'Configurações de segurança e autenticação' },
    { id: 'email', nome: 'Email', icone: Mail, descricao: 'Configurações de servidor de email' },
    { id: 'notificacoes', nome: 'Notificações', icone: Bell, descricao: 'Configurações de notificações' },
    { id: 'database', nome: 'Banco de Dados', icone: Database, descricao: 'Configurações do banco de dados' },
    { id: 'interface', nome: 'Interface', icone: Palette, descricao: 'Configurações da interface do usuário' },
    { id: 'ponto', nome: 'Registro de Ponto', icone: Clock, descricao: 'Configurações do modo de registro de ponto' }
  ];

  const configuracoesPorCategoria = useMemo(() => {
    return configuracoes.filter(config => config.categoria === categoriaAtiva);
  }, [categoriaAtiva]);

  const handleConfigChange = (configId: string, valor: any) => {
    setConfiguracoesEditadas(prev => ({
      ...prev,
      [configId]: valor
    }));
  };

  const getValorAtual = (config: ConfiguracaoSistema) => {
    return configuracoesEditadas[config.id] !== undefined
      ? configuracoesEditadas[config.id]
      : config.valor;
  };

  const toggleMostrarSenha = (configId: string) => {
    setMostrarSenhas(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const handleSalvarConfiguracoes = async () => {
    setSalvandoConfiguracoes(true);

    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Aqui seria implementada a lógica de salvamento real
    console.log('Configurações salvas:', configuracoesEditadas);
    if (configuracoesEditadas['modo_registro_ponto'] !== undefined) {
      try {
        localStorage.setItem('modo_registro_ponto', String(configuracoesEditadas['modo_registro_ponto']));
      } catch { }
    }

    setConfiguracoesEditadas({});
    setSalvandoConfiguracoes(false);
  };

  const handleResetarConfiguracoes = () => {
    setConfiguracoesEditadas({});
  };

  const renderCampoConfig = (config: ConfiguracaoSistema) => {
    const valor = getValorAtual(config);
    const temAlteracao = configuracoesEditadas[config.id] !== undefined;

    switch (config.tipo) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={valor as boolean}
              onCheckedChange={(checked) => handleConfigChange(config.id, checked)}
              disabled={!config.editavel}
            />
            <Label className="text-sm">
              {valor ? 'Habilitado' : 'Desabilitado'}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={valor as string}
            onValueChange={(value) => handleConfigChange(config.id, value)}
            disabled={!config.editavel}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.opcoes?.map((opcao) => (
                <SelectItem key={opcao} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'password':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type={mostrarSenhas[config.id] ? 'text' : 'password'}
              value={valor as string}
              onChange={(e) => handleConfigChange(config.id, e.target.value)}
              disabled={!config.editavel}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleMostrarSenha(config.id)}
              disabled={!config.editavel}
            >
              {mostrarSenhas[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        );

      case 'numero':
        return (
          <Input
            type="number"
            value={valor as number}
            onChange={(e) => handleConfigChange(config.id, parseInt(e.target.value) || 0)}
            disabled={!config.editavel}
          />
        );

      default:
        return (
          <Input
            type={config.tipo === 'email' ? 'email' : config.tipo === 'url' ? 'url' : 'text'}
            value={valor as string}
            onChange={(e) => handleConfigChange(config.id, e.target.value)}
            disabled={!config.editavel}
          />
        );
    }
  };

  const temAlteracoesPendentes = Object.keys(configuracoesEditadas).length > 0;

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-600">Gerencie as configurações globais do sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Configurações Ativas</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Configurações editáveis</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Configurações Críticas</p>
                  <p className="text-3xl font-bold text-red-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Configurações sensíveis</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Última Atualização</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Última modificação</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status do Sistema</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Sistema operacional</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de alterações pendentes */}
        {temAlteracoesPendentes && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium text-orange-800">
                    Você tem {Object.keys(configuracoesEditadas).length} configuração(ões) não salva(s)
                  </p>
                  <p className="text-sm text-orange-700">
                    Lembre-se de salvar suas alterações antes de sair da página.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetarConfiguracoes}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Descartar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSalvarConfiguracoes}
                    disabled={salvandoConfiguracoes}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {salvandoConfiguracoes ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Menu lateral de categorias */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Categorias</CardTitle>
              <CardDescription>
                Selecione uma categoria para configurar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {categorias.map((categoria) => {
                  const IconeCategoria = categoria.icone;
                  const isAtiva = categoriaAtiva === categoria.id;
                  const temAlteracaoCategoria = configuracoes
                    .filter(c => c.categoria === categoria.id)
                    .some(c => configuracoesEditadas[c.id] !== undefined);

                  return (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaAtiva(categoria.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${isAtiva ? 'bg-muted border-r-2 border-primary' : ''
                        }`}
                    >
                      <IconeCategoria className={`h-4 w-4 ${isAtiva ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isAtiva ? 'text-primary' : ''}`}>
                            {categoria.nome}
                          </span>
                          {temAlteracaoCategoria && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {categoria.descricao}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configurações da categoria selecionada */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {(() => {
                    const categoria = categorias.find(c => c.id === categoriaAtiva);
                    const IconeCategoria = categoria?.icone || Settings;
                    return <IconeCategoria className="h-5 w-5 text-primary" />;
                  })()}
                  <div>
                    <CardTitle>
                      {categorias.find(c => c.id === categoriaAtiva)?.nome}
                    </CardTitle>
                    <CardDescription>
                      {categorias.find(c => c.id === categoriaAtiva)?.descricao}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoriaAtiva === 'autenticacao' ? (
                  <AuthConfigPanel />
                ) : (
                  configuracoesPorCategoria.map((config) => {
                    const temAlteracao = configuracoesEditadas[config.id] !== undefined;

                    return (
                      <div key={config.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={config.id} className="font-medium">
                              {config.nome}
                            </Label>
                            {config.obrigatorio && (
                              <Badge variant="outline" className="text-xs">
                                obrigatório
                              </Badge>
                            )}
                            {config.sensivel && (
                              <Badge variant="outline" className="text-xs text-red-600">
                                <Lock className="h-3 w-3 mr-1" />
                                sensível
                              </Badge>
                            )}
                            {temAlteracao && (
                              <Badge variant="outline" className="text-xs text-orange-600">
                                modificado
                              </Badge>
                            )}
                            {!config.editavel && (
                              <Badge variant="outline" className="text-xs text-gray-600">
                                somente leitura
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {config.descricao}
                        </p>

                        <div className="max-w-md">
                          {renderCampoConfig(config)}
                        </div>

                        {config !== configuracoesPorCategoria[configuracoesPorCategoria.length - 1] && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Ações da categoria */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ações da Categoria</p>
                    <p className="text-sm text-muted-foreground">
                      Gerencie as configurações desta categoria
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restaurar Padrões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de ação globais */}
        {temAlteracoesPendentes && (
          <Card className="sticky bottom-4 border-2 border-primary/20 bg-background/95 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alterações Pendentes</p>
                  <p className="text-sm text-muted-foreground">
                    {Object.keys(configuracoesEditadas).length} configuração(ões) modificada(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResetarConfiguracoes}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Descartar Alterações
                  </Button>
                  <Button
                    onClick={handleSalvarConfiguracoes}
                    disabled={salvandoConfiguracoes}
                  >
                    {salvandoConfiguracoes ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConfiguracoesSistema;