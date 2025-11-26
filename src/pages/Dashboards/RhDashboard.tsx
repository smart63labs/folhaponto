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
  ClipboardList,
  Shield,
  BarChart3,
  Target,
  Activity,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
  UserCheck,
  FileSpreadsheet,
  Settings
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

export default function RhDashboard() {
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

  // Mock data para estatísticas do RH
  const rhStats = [
    {
      title: "Total de Servidores",
      value: "1,247",
      subtitle: "Ativos no sistema",
      icon: Users,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Aprovações Pendentes",
      value: "89",
      subtitle: "Aguardando análise",
      icon: Clock,
      trend: { value: 5, isPositive: false }
    },
    {
      title: "Templates Ativos",
      value: "15",
      subtitle: "Formulários disponíveis",
      icon: ClipboardList,
      trend: { value: 3, isPositive: true }
    },
    {
      title: "Logs de Auditoria",
      value: "2,456",
      subtitle: "Registros este mês",
      icon: Shield,
      trend: { value: 0, isPositive: true }
    }
  ];

  // Dados adicionais para o dashboard
  const notificacoes = [
    { tipo: "aprovacao", mensagem: "89 solicitações aguardando aprovação", tempo: "Agora" },
    { tipo: "alerta", mensagem: "5 templates precisam de atualização", tempo: "2h atrás" },
    { tipo: "info", mensagem: "Relatório mensal gerado com sucesso", tempo: "1 dia atrás" }
  ];

  const atividadesRecentes = [
    { tipo: "Servidor cadastrado", descricao: "João Silva Santos", horario: "14:30", status: "concluido" },
    { tipo: "Template atualizado", descricao: "Frequência Mensal v2.1", horario: "13:15", status: "concluido" },
    { tipo: "Relatório gerado", descricao: "Consolidado Janeiro/2025", horario: "11:45", status: "concluido" }
  ];

  // Dados para gráficos
  const aprovacaoData = [
    { name: 'Aprovadas', value: 1456, fill: '#10b981' },
    { name: 'Pendentes', value: 89, fill: '#f59e0b' },
    { name: 'Rejeitadas', value: 234, fill: '#ef4444' }
  ];

  const servidoresMensaisData = [
    { mes: 'Jan', servidores: 1200, novos: 45 },
    { mes: 'Fev', servidores: 1245, novos: 32 },
    { mes: 'Mar', servidores: 1278, novos: 28 },
    { mes: 'Abr', servidores: 1247, novos: 15 },
  ];

  const eficienciaData = [
    { semana: 'Sem 1', eficiencia: 92 },
    { semana: 'Sem 2', eficiencia: 95 },
    { semana: 'Sem 3', eficiencia: 88 },
    { semana: 'Sem 4', eficiencia: 96 },
  ];

  const templatesData = [
    { mes: 'Nov', templates: 12 },
    { mes: 'Dez', templates: 13 },
    { mes: 'Jan', templates: 15 },
  ];

  const hoje = new Date();
  const hojeFormatado = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Mock data para aprovações pendentes
  const pendingApprovals = [
    {
      id: "1",
      servidor: "João Silva",
      tipo: "Justificativa de Falta",
      data: "2024-01-15",
      status: "Pendente",
      prioridade: "Alta"
    },
    {
      id: "2",
      servidor: "Maria Santos",
      tipo: "Banco de Horas",
      data: "2024-01-14",
      status: "Pendente",
      prioridade: "Média"
    },
    {
      id: "3",
      servidor: "Carlos Oliveira",
      tipo: "Alteração de Jornada",
      data: "2024-01-13",
      status: "Pendente",
      prioridade: "Baixa"
    }
  ];

  // Mock data para templates recentes
  const recentTemplates = [
    {
      nome: "Formulário de Frequência Padrão",
      versao: "v2.1",
      dataAtualizacao: "2024-01-10",
      status: "Ativo"
    },
    {
      nome: "Justificativa de Ausência",
      versao: "v1.5",
      dataAtualizacao: "2024-01-08",
      status: "Ativo"
    },
    {
      nome: "Solicitação de Banco de Horas",
      versao: "v3.0",
      dataAtualizacao: "2024-01-05",
      status: "Em Revisão"
    }
  ];

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header Principal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard RH
            </h1>
            <p className="text-gray-600">
              Gestão completa de recursos humanos e controle de ponto
            </p>
          </div>
        </div>

        {/* Saudação personalizada */}
        <Card className="border-l-4 border-l-indigo-500 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-2">
                  Olá, {user?.name || 'Coordenador RH'}! 👋
                </h2>
                <div className="text-lg text-gray-600 font-medium">
                  {hojeFormatado}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Coordenador de Recursos Humanos - SEFAZ Tocantins
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
                  <p className="text-sm font-medium text-gray-600">Total de Servidores</p>
                  <p className="text-3xl font-bold text-blue-600">1,247</p>
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
                  <p className="text-3xl font-bold text-yellow-600">89</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando análise</p>
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
                  <p className="text-sm font-medium text-gray-600">Templates Ativos</p>
                  <p className="text-3xl font-bold text-green-600">15</p>
                  <p className="text-xs text-gray-500 mt-1">Formulários disponíveis</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ClipboardList className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eficiência Geral</p>
                  <p className="text-3xl font-bold text-purple-600">92%</p>
                  <p className="text-xs text-gray-500 mt-1">Mês atual</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-8 h-8 text-purple-600" />
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
                  Análise de Gestão RH
                </CardTitle>
                <CardDescription>
                  Visualize dados de gestão e eficiência - 2 gráficos por slide
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
              {/* Slide 1: Aprovações + Servidores Mensais */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status das Aprovações */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Status das Aprovações
                      </h3>
                      <p className="text-sm text-gray-600">
                        Distribuição mensal de solicitações
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        aprovadas: {
                          label: "Aprovadas",
                          color: "#22c55e",
                        },
                        pendentes: {
                          label: "Pendentes",
                          color: "#f59e0b",
                        },
                        rejeitadas: {
                          label: "Rejeitadas",
                          color: "#ef4444",
                        },
                      }}
                      className="h-64"
                    >
                      <PieChart>
                        <Pie
                          data={aprovacaoData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {aprovacaoData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">1,456</p>
                      <p className="text-sm text-gray-500">Total processado</p>
                    </div>
                  </div>

                  {/* Evolução de Servidores */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Evolução de Servidores
                      </h3>
                      <p className="text-sm text-gray-600">
                        Crescimento mensal da equipe
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        servidores: {
                          label: "Total de Servidores",
                          color: "#3b82f6",
                        },
                        novos: {
                          label: "Novos Servidores",
                          color: "#10b981",
                        },
                      }}
                      className="h-64"
                    >
                      <BarChart data={servidoresMensaisData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="servidores" fill="#3b82f6" name="Total" />
                        <Bar dataKey="novos" fill="#10b981" name="Novos" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>

              {/* Slide 2: Eficiência + Templates */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Eficiência Semanal */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Eficiência Semanal
                      </h3>
                      <p className="text-sm text-gray-600">
                        Percentual de eficiência por semana
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        eficiencia: {
                          label: "Eficiência",
                          color: "#8b5cf6",
                        },
                      }}
                      className="h-64"
                    >
                      <LineChart data={eficienciaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semana" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="eficiencia"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>

                  {/* Evolução de Templates */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <ClipboardList className="h-5 w-5 text-emerald-600" />
                        Evolução de Templates
                      </h3>
                      <p className="text-sm text-gray-600">
                        Templates criados nos últimos meses
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        templates: {
                          label: "Templates",
                          color: "#10b981",
                        },
                      }}
                      className="h-64"
                    >
                      <AreaChart data={templatesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="templates"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">+15</p>
                      <p className="text-sm text-gray-500">Templates ativos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações Importantes */}
        {notificacoes.some(n => n.tipo === 'aprovacao' || n.tipo === 'alerta') && (
          <Alert className="border-l-4 border-l-orange-500 bg-orange-50 border-orange-200">
            <Bell className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800 font-semibold">Notificações Importantes</AlertTitle>
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
              Resumo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-gray-600">Eficiência Geral</div>
                <div className="text-xs text-gray-500">Meta: 90%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1,456</div>
                <div className="text-sm text-gray-600">Aprovações</div>
                <div className="text-xs text-gray-500">Processadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">15</div>
                <div className="text-sm text-gray-600">Templates</div>
                <div className="text-xs text-gray-500">Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">2,456</div>
                <div className="text-sm text-gray-600">Logs</div>
                <div className="text-xs text-gray-500">Auditoria</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso das Metas Mensais</span>
                <span>92% / 100%</span>
              </div>
              <Progress value={92} className="h-3" />
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
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="atividades" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Atividades
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
                    Solicitações aguardando análise do RH
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingApprovals.map((approval) => (
                      <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{approval.servidor}</div>
                          <div className="text-xs text-gray-600">{approval.tipo}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              approval.prioridade === "Alta" ? "destructive" :
                              approval.prioridade === "Média" ? "default" : "secondary"
                            }
                          >
                            {approval.prioridade}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Analisar
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
                      <div className="text-2xl font-bold text-yellow-600">89</div>
                      <div className="text-sm text-gray-600">Pendentes</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">234</div>
                      <div className="text-sm text-gray-600">Rejeitadas</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">94%</div>
                      <div className="text-sm text-gray-600">Taxa de Aprovação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Templates Recentes */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Templates Recentes
                  </CardTitle>
                  <CardDescription>
                    Formulários e templates gerenciados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentTemplates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{template.nome}</p>
                        <p className="text-xs text-gray-600">
                          {template.versao} • {template.dataAtualizacao}
                        </p>
                      </div>
                      <Badge variant={template.status === "Ativo" ? "default" : "secondary"}>
                        {template.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription>
                    Acesso rápido às principais funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Gestão de Servidores
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Relatórios Gerais
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Criador de Templates
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Logs de Auditoria
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="atividades" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Atividades Recentes
                </CardTitle>
                <CardDescription>
                  Últimas ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {atividadesRecentes.map((atividade, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{atividade.tipo}</div>
                          <div className="text-sm text-gray-600">{atividade.descricao}</div>
                          <div className="text-xs text-gray-500">{atividade.horario}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {atividade.status}
                      </Badge>
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
}