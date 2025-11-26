import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
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
  UserCheck,
  ClipboardList
} from "lucide-react";
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
import { useNavigate } from "react-router-dom";

export default function ChefiaDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Dados para gráficos
  const presencaData = [
    { name: 'Presentes', value: 10, fill: '#10b981' },
    { name: 'Ausentes', value: 2, fill: '#ef4444' }
  ];

  const horasEquipeData = [
    { semana: 'Sem 1', horas: 80, meta: 88 },
    { semana: 'Sem 2', horas: 85, meta: 88 },
    { semana: 'Sem 3', hours: 82, meta: 88 },
    { semana: 'Sem 4', horas: 87, meta: 88 },
  ];

  const produtividadeData = [
    { dia: 'Seg', produtividade: 95 },
    { dia: 'Ter', produtividade: 88 },
    { dia: 'Qua', produtividade: 92 },
    { dia: 'Qui', produtividade: 96 },
    { dia: 'Sex', produtividade: 90 },
  ];

  const aprovacoesData = [
    { mes: 'Nov', aprovacoes: 45 },
    { mes: 'Dez', aprovacoes: 52 },
    { mes: 'Jan', aprovacoes: 48 },
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
    { tipo: "aprovacao", mensagem: "5 solicitações aguardando aprovação", tempo: "Agora" },
    { tipo: "alerta", mensagem: "2 funcionários com atrasos recorrentes", tempo: "2h atrás" },
    { tipo: "info", mensagem: "Relatório mensal da equipe gerado", tempo: "1 dia atrás" }
  ];

  const atividadesRecentes = [
    { tipo: "Aprovação realizada", descricao: "Justificativa de João Silva", horario: "14:30", status: "concluido" },
    { tipo: "Relatório gerado", descricao: "Frequência da equipe Janeiro", horario: "11:45", status: "concluido" },
    { tipo: "Escala atualizada", descricao: "Plantão de fim de semana", horario: "09:15", status: "concluido" }
  ];

  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
        {/* Header Principal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard da Chefia
            </h1>
            <p className="text-gray-600">
              Gestão e acompanhamento da equipe - SEFAZ Tocantins
            </p>
          </div>
        </div>

        {/* Saudação personalizada */}
        <Card className="border-l-4 border-l-indigo-500 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-2">
                  Olá, {user?.name || 'Chefe de Equipe'}! 👋
                </h2>
                <div className="text-lg text-gray-600 font-medium">
                  {hojeFormatado}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Supervisor de Equipe - SEFAZ Tocantins
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
                  <p className="text-sm font-medium text-gray-600">Total da Equipe</p>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-gray-500 mt-1">Funcionários supervisionados</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Presentes Hoje</p>
                  <p className="text-3xl font-bold text-green-600">10</p>
                  <p className="text-xs text-gray-500 mt-1">2 ausências registradas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendências</p>
                  <p className="text-3xl font-bold text-yellow-600">5</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando aprovação</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Extras (Mês)</p>
                  <p className="text-3xl font-bold text-purple-600">45h</p>
                  <p className="text-xs text-gray-500 mt-1">Total da equipe</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
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
                  Análise de Gestão
                </CardTitle>
                <CardDescription>
                  Visualize dados de presença e produtividade - 2 gráficos por slide
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
              {/* Slide 1: Presença + Horas da Equipe */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Presença Hoje */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Presença Hoje
                      </h3>
                      <p className="text-sm text-gray-600">
                        Status de presença da equipe
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        presentes: {
                          label: "Presentes",
                          color: "#22c55e",
                        },
                        ausentes: {
                          label: "Ausentes",
                          color: "#ef4444",
                        },
                      }}
                      className="h-64"
                    >
                      <PieChart>
                        <Pie
                          data={presencaData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {presencaData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">83%</p>
                      <p className="text-sm text-gray-500">Taxa de presença</p>
                    </div>
                  </div>

                  {/* Horas da Equipe */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Horas da Equipe
                      </h3>
                      <p className="text-sm text-gray-600">
                        Comparativo semanal com meta
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        horas: {
                          label: "Horas Trabalhadas",
                          color: "#3b82f6",
                        },
                        meta: {
                          label: "Meta",
                          color: "#e5e7eb",
                        },
                      }}
                      className="h-64"
                    >
                      <BarChart data={horasEquipeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semana" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="horas" fill="#3b82f6" name="Trabalhadas" />
                        <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>

              {/* Slide 2: Produtividade + Aprovações */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Produtividade Semanal */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Produtividade Semanal
                      </h3>
                      <p className="text-sm text-gray-600">
                        Percentual de produtividade por dia
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        produtividade: {
                          label: "Produtividade",
                          color: "#8b5cf6",
                        },
                      }}
                      className="h-64"
                    >
                      <LineChart data={produtividadeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="produtividade"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>

                  {/* Aprovações Mensais */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <ClipboardList className="h-5 w-5 text-emerald-600" />
                        Aprovações Mensais
                      </h3>
                      <p className="text-sm text-gray-600">
                        Solicitações aprovadas nos últimos meses
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        aprovacoes: {
                          label: "Aprovações",
                          color: "#10b981",
                        },
                      }}
                      className="h-64"
                    >
                      <AreaChart data={aprovacoesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="aprovacoes"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">48</p>
                      <p className="text-sm text-gray-500">Este mês</p>
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
                <div className="text-3xl font-bold text-blue-600">83%</div>
                <div className="text-sm text-gray-600">Presença Média</div>
                <div className="text-xs text-gray-500">Meta: 85%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">334h</div>
                <div className="text-sm text-gray-600">Horas Trabalhadas</div>
                <div className="text-xs text-gray-500">Total da equipe</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">48</div>
                <div className="text-sm text-gray-600">Aprovações</div>
                <div className="text-xs text-gray-500">Processadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">5</div>
                <div className="text-sm text-gray-600">Pendências</div>
                <div className="text-xs text-gray-500">Para análise</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso das Metas Mensais</span>
                <span>83% / 100%</span>
              </div>
              <Progress value={83} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Seção Principal com Tabs */}
        <Tabs defaultValue="equipe" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equipe" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Minha Equipe
            </TabsTrigger>
            <TabsTrigger value="aprovacoes" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprovações
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipe" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Status da Equipe */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Status da Equipe Hoje
                  </CardTitle>
                  <CardDescription>
                    Acompanhe a presença e horários da sua equipe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { nome: "João Silva", status: "presente", entrada: "08:00", saida: "17:00" },
                      { nome: "Ana Costa", status: "presente", entrada: "08:15", saida: "17:15" },
                      { nome: "Carlos Santos", status: "ausente", motivo: "Licença médica" },
                      { nome: "Maria Oliveira", status: "presente", entrada: "07:45", saida: "16:45" },
                      { nome: "Pedro Lima", status: "atraso", entrada: "08:30", saida: "-" },
                    ].map((funcionario, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-sm">{funcionario.nome}</div>
                          <Badge
                            variant={
                              funcionario.status === 'presente' ? 'default' :
                              funcionario.status === 'atraso' ? 'destructive' : 'secondary'
                            }
                          >
                            {funcionario.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {funcionario.status === 'presente' || funcionario.status === 'atraso' ? (
                            <span>{funcionario.entrada} - {funcionario.saida}</span>
                          ) : (
                            <span>{funcionario.motivo}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription>
                    Funcionalidades mais utilizadas pela chefia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/chefia/equipe')}>
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Equipe
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/chefia/aprovacoes')}>
                    <Clock className="mr-2 h-4 w-4" />
                    Aprovar Solicitações
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/chefia/relatorios')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Relatórios da Equipe
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/chefia/escalas')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Escalas e Plantões
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="aprovacoes" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pendências de Aprovação */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Pendências de Aprovação
                  </CardTitle>
                  <CardDescription>
                    Solicitações que precisam da sua aprovação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { funcionario: "João Silva", tipo: "Ajuste de ponto", data: "15/01/2025", urgencia: "alta" },
                      { funcionario: "Ana Costa", tipo: "Banco de horas", data: "14/01/2025", urgencia: "media" },
                      { funcionario: "Carlos Santos", tipo: "Justificativa", data: "13/01/2025", urgencia: "baixa" },
                    ].map((pendencia, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{pendencia.funcionario}</div>
                          <div className="text-sm text-gray-600">{pendencia.tipo}</div>
                          <div className="text-xs text-gray-500">{pendencia.data}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              pendencia.urgencia === 'alta' ? 'destructive' :
                              pendencia.urgencia === 'media' ? 'default' : 'secondary'
                            }
                          >
                            {pendencia.urgencia}
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
                      <div className="text-2xl font-bold text-green-600">145</div>
                      <div className="text-sm text-gray-600">Aprovadas</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">5</div>
                      <div className="text-sm text-gray-600">Pendentes</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">12</div>
                      <div className="text-sm text-gray-600">Rejeitadas</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">92%</div>
                      <div className="text-sm text-gray-600">Taxa Aprovação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Relatórios da Equipe
                </CardTitle>
                <CardDescription>
                  Geração de relatórios gerenciais da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => navigate('/chefia/relatorios')}
                  >
                    <FileText className="w-8 h-8" />
                    <span className="text-sm">Relatório de Frequência</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => navigate('/chefia/relatorios')}
                  >
                    <Clock className="w-8 h-8" />
                    <span className="text-sm">Banco de Horas</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => navigate('/chefia/relatorios')}
                  >
                    <TrendingUp className="w-8 h-8" />
                    <span className="text-sm">Produtividade</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}