import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  BarChart3,
  Target,
  Activity,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
  Shield,
  Settings,
  Database
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Auto-rotação dos slides
  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => prev === 1 ? 0 : prev + 1);
    }, 5000); // Muda slide a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const pendingApprovals = [
    {
      id: 1,
      employee: "Maria Santos",
      type: "Ajuste de Horário",
      date: "15/01/2025",
      status: "Pendente",
    },
    {
      id: 2,
      employee: "Pedro Oliveira",
      type: "Justificativa de Falta",
      date: "14/01/2025",
      status: "Pendente",
    },
    {
      id: 3,
      employee: "Ana Costa",
      type: "Banco de Horas",
      date: "13/01/2025",
      status: "Pendente",
    },
  ];

  const teamPerformance = [
    { name: "Maria Santos", presence: 95, hours: 176, status: "Excelente" },
    { name: "Pedro Oliveira", presence: 88, hours: 168, status: "Bom" },
    { name: "Ana Costa", presence: 92, hours: 172, status: "Excelente" },
    { name: "Carlos Lima", presence: 78, hours: 152, status: "Atenção" },
  ];

  // Dados para gráficos
  const sistemaData = [
    { name: 'Usuários Ativos', value: 1247, fill: '#10b981' },
    { name: 'Usuários Inativos', value: 89, fill: '#6b7280' },
    { name: 'Administradores', value: 12, fill: '#8b5cf6' }
  ];

  const acessosMensaisData = [
    { mes: 'Jan', acessos: 15420, usuarios: 1200 },
    { mes: 'Fev', acessos: 16850, usuarios: 1245 },
    { mes: 'Mar', acessos: 17200, usuarios: 1278 },
    { mes: 'Abr', acessos: 18900, usuarios: 1247 },
  ];

  const performanceSistemaData = [
    { semana: 'Sem 1', uptime: 99.8, resposta: 245 },
    { semana: 'Sem 2', uptime: 99.9, resposta: 238 },
    { semana: 'Sem 3', uptime: 99.7, resposta: 252 },
    { semana: 'Sem 4', uptime: 99.9, resposta: 241 },
  ];

  const logsSistemaData = [
    { mes: 'Nov', logs: 2456 },
    { mes: 'Dez', logs: 2890 },
    { mes: 'Jan', logs: 3120 },
  ];

  const hoje = new Date();
  const hojeFormatado = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Dados adicionais para o dashboard
  const notificacoes = [
    { tipo: "sistema", mensagem: "Manutenção programada para amanhã às 02:00", tempo: "2h atrás" },
    { tipo: "alerta", mensagem: "5 usuários com acesso expirado", tempo: "4h atrás" },
    { tipo: "info", mensagem: "Backup automático concluído com sucesso", tempo: "6h atrás" }
  ];

  const atividadesRecentes = [
    { tipo: "Usuário criado", descricao: "Novo administrador adicionado", horario: "14:30", status: "concluido" },
    { tipo: "Backup realizado", descricao: "Backup diário do sistema", horario: "02:00", status: "concluido" },
    { tipo: "Relatório gerado", descricao: "Relatório mensal de acessos", horario: "11:45", status: "concluido" }
  ];

  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <div className="space-y-6">
        {/* Header Principal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600">
              Gestão completa do sistema de controle de ponto - SEFAZ Tocantins
            </p>
          </div>
        </div>

        {/* Saudação personalizada */}
        <Card className="border-l-4 border-l-indigo-500 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-2">
                  Olá, {user?.name || 'Administrador'}! 👋
                </h2>
                <div className="text-lg text-gray-600 font-medium">
                  {hojeFormatado}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Administrador do Sistema - SEFAZ Tocantins
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                  <p className="text-3xl font-bold text-blue-600">1,336</p>
                  <p className="text-xs text-gray-500 mt-1">Ativos no sistema</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovações Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">12</p>
                  <p className="text-xs text-gray-500 mt-1">Requerem atenção</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime do Sistema</p>
                  <p className="text-3xl font-bold text-green-600">99.8%</p>
                  <p className="text-xs text-gray-500 mt-1">Este mês</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Logs de Auditoria</p>
                  <p className="text-3xl font-bold text-purple-600">3,120</p>
                  <p className="text-xs text-gray-500 mt-1">Este mês</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slideshow de Gráficos */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Análise do Sistema
                </CardTitle>
                <CardDescription>
                  Visualize métricas de uso e performance - 2 gráficos por slide
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAutoRotating(false);
                    setCurrentSlide(currentSlide === 0 ? 1 : currentSlide - 1);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAutoRotating(false);
                    setCurrentSlide(currentSlide === 1 ? 0 : currentSlide + 1);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className="h-8 px-3"
                >
                  {isAutoRotating ? 'Pausar' : 'Reproduzir'}
                </Button>
              </div>
            </div>

            {/* Indicadores de slide */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1].map((index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoRotating(false);
                    setCurrentSlide(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-blue-600 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 1: Usuários + Acessos */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Distribuição de Usuários */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Distribuição de Usuários
                      </h3>
                      <p className="text-sm text-gray-600">
                        Usuários ativos no sistema
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        ativos: {
                          label: "Usuários Ativos",
                          color: "#22c55e",
                        },
                        inativos: {
                          label: "Usuários Inativos",
                          color: "#6b7280",
                        },
                        admins: {
                          label: "Administradores",
                          color: "#8b5cf6",
                        },
                      }}
                      className="h-64"
                    >
                      <PieChart>
                        <Pie
                          data={sistemaData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sistemaData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">1,247</p>
                      <p className="text-sm text-gray-500">Usuários ativos</p>
                    </div>
                  </div>

                  {/* Acessos Mensais */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Acessos Mensais
                      </h3>
                      <p className="text-sm text-gray-600">
                        Volume de acessos por mês
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        acessos: {
                          label: "Acessos",
                          color: "#3b82f6",
                        },
                        usuarios: {
                          label: "Usuários Únicos",
                          color: "#10b981",
                        },
                      }}
                      className="h-64"
                    >
                      <BarChart data={acessosMensaisData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="acessos" fill="#3b82f6" name="Acessos" />
                        <Bar dataKey="usuarios" fill="#10b981" name="Usuários" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>

              {/* Slide 2: Performance + Logs */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance do Sistema */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Performance do Sistema
                      </h3>
                      <p className="text-sm text-gray-600">
                        Uptime e tempo de resposta
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        uptime: {
                          label: "Uptime (%)",
                          color: "#8b5cf6",
                        },
                      }}
                      className="h-64"
                    >
                      <LineChart data={performanceSistemaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semana" />
                        <YAxis domain={[99, 100]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="uptime"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>

                  {/* Logs de Auditoria */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        Logs de Auditoria
                      </h3>
                      <p className="text-sm text-gray-600">
                        Registros de auditoria por mês
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        logs: {
                          label: "Logs",
                          color: "#10b981",
                        },
                      }}
                      className="h-64"
                    >
                      <AreaChart data={logsSistemaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="logs"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">3,120</p>
                      <p className="text-sm text-gray-500">Logs este mês</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações Importantes */}
        {notificacoes.some(n => n.tipo === 'sistema' || n.tipo === 'alerta') && (
          <Alert className="border-l-4 border-l-orange-500 bg-orange-50 border-orange-200">
            <Bell className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800 font-semibold">Notificações do Sistema</AlertTitle>
            <AlertDescription className="text-gray-700">
              <div className="space-y-2 mt-2">
                {notificacoes.slice(0, 2).map((notif, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{notif.mensagem}</span>
                    <span className="text-gray-500">{notif.tempo}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resumo Consolidado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Resumo do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">99.8%</div>
                <div className="text-sm text-gray-600">Uptime Sistema</div>
                <div className="text-xs text-gray-500">Meta: 99.5%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">18,900</div>
                <div className="text-sm text-gray-600">Acessos</div>
                <div className="text-xs text-gray-500">Este mês</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">241ms</div>
                <div className="text-sm text-gray-600">Tempo Médio</div>
                <div className="text-xs text-gray-500">Resposta</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">3,120</div>
                <div className="text-sm text-gray-600">Logs</div>
                <div className="text-xs text-gray-500">Auditoria</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Performance Geral do Sistema</span>
                <span>98% / 100%</span>
              </div>
              <Progress value={98} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Seção Principal com Tabs */}
        <Tabs defaultValue="aprovacoes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aprovacoes" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprovações
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="equipe" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aprovacoes" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Aprovações Pendentes */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Aprovações Pendentes
                  </CardTitle>
                  <CardDescription>
                    Solicitações aguardando revisão administrativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingApprovals.map((approval) => (
                      <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{approval.employee}</div>
                          <div className="text-xs text-gray-600">{approval.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            {approval.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Revisar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas de Aprovação */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Estatísticas de Aprovação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">1,456</div>
                      <div className="text-sm text-gray-600">Aprovadas</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">12</div>
                      <div className="text-sm text-gray-600">Pendentes</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">234</div>
                      <div className="text-sm text-gray-600">Rejeitadas</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">94%</div>
                      <div className="text-sm text-gray-600">Taxa Aprovação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sistema" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Status do Sistema */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Status do Sistema
                  </CardTitle>
                  <CardDescription>
                    Monitoramento em tempo real dos serviços
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">API Backend</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Banco de Dados</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Servidor Web</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Administrativas */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Ações Administrativas
                  </CardTitle>
                  <CardDescription>
                    Ferramentas de manutenção e configuração
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Backup do Sistema
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Logs de Auditoria
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Relatórios do Sistema
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações Avançadas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipe" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Desempenho da Equipe
                </CardTitle>
                <CardDescription>
                  Resumo de frequência e pontualidade da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.hours}h trabalhadas</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">{member.presence}%</div>
                          <div className="text-xs text-gray-500">presença</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            member.status === "Excelente"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : member.status === "Bom"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
