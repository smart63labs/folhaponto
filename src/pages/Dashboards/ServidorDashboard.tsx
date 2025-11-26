import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Timer, 
  Users,
  Target,
  Activity,
  Bell,
  MapPin,
  Coffee,
  History,
  CalendarDays,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
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

const ServidorDashboard = () => {
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
  
  // Temporariamente removendo useAuth para resolver erro de hooks
  const user = { name: 'João Silva' };
  
  // Mock data expandido
  const stats = {
    horasTrabalhadasMes: 168,
    horasEsperadas: 176,
    diasPresentes: 21,
    saldoBancoHoras: 8,
    pontualidade: 95,
    horasExtrasMes: 12,
    faltas: 0,
    atrasos: 2
  };

  // Dados para gráficos
  const progressoData = [
    { name: 'Trabalhadas', value: stats.horasTrabalhadasMes, fill: '#10b981' },
    { name: 'Restantes', value: stats.horasEsperadas - stats.horasTrabalhadasMes, fill: '#e5e7eb' }
  ];

  const horasSemanaisData = [
    { semana: 'Sem 1', horas: 40, meta: 44 },
    { semana: 'Sem 2', horas: 42, meta: 44 },
    { semana: 'Sem 3', horas: 44, meta: 44 },
    { semana: 'Sem 4', horas: 42, meta: 44 },
  ];

  const pontualidadeData = [
    { dia: 'Seg', pontualidade: 100 },
    { dia: 'Ter', pontualidade: 95 },
    { dia: 'Qua', pontualidade: 100 },
    { dia: 'Qui', pontualidade: 90 },
    { dia: 'Sex', pontualidade: 100 },
  ];

  const bancoHorasData = [
    { mes: 'Nov', saldo: 5 },
    { mes: 'Dez', saldo: 6 },
    { mes: 'Jan', saldo: 8 },
  ];

  const hoje = new Date();
  const hojeFormatado = hoje.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const statusHoje = {
    entrada: "08:00",
    saidaAlmoco: "12:00",
    voltaAlmoco: "13:00",
    saida: null,
    horasTrabalhadas: "4h 00min",
    localTrabalho: "Presencial - SEFAZ TO"
  };

  const proximasAtividades = [
    { tipo: "Reunião", descricao: "Reunião de equipe", horario: "14:30", status: "pendente" },
    { tipo: "Prazo", descricao: "Relatório mensal", data: "25/01/2025", status: "urgente" },
    { tipo: "Evento", descricao: "Treinamento obrigatório", data: "30/01/2025", status: "agendado" }
  ];

  const notificacoes = [
    { tipo: "aprovacao", mensagem: "Justificativa aprovada para 15/01/2025", tempo: "2h atrás" },
    { tipo: "lembrete", mensagem: "Lembre-se de registrar saída hoje", tempo: "Agora" },
    { tipo: "info", mensagem: "Novo comunicado disponível", tempo: "1 dia atrás" }
  ];

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const date = i - 2;
    if (date < 1 || date > 30) return { date: 0 };
    
    const statuses = ['presente', 'presente', 'presente', 'atraso', 'presente'] as const;
    return {
      date,
      status: date <= 21 ? statuses[date % 5] : undefined,
      hours: date <= 21 ? '8h' : undefined,
    };
  });

  const progressoMensal = Math.round((stats.horasTrabalhadasMes / stats.horasEsperadas) * 100);

  return (
    <DashboardLayout userRole="servidor">
      <div className="space-y-6">
        {/* Header Principal - Aplicando padrão da tela Registrar Ponto */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard do Servidor
            </h1>
            <p className="text-gray-600">
              Gerencie sua frequência e acompanhe seu desempenho
            </p>
          </div>
        </div>
        {/* Saudação personalizada */}
        <Card className="border-l-4 border-l-indigo-500 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-indigo-600 mb-2">
                  Olá, {user?.name || 'João Silva'}! 👋
                </h2>
                <div className="text-lg text-gray-600 font-medium">
                  {hojeFormatado}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Servidor - Departamento de Tecnologia da Informação - SEFAZ Tocantins
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Cards de Resumo - Mesmo padrão da tela Registrar Ponto */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Hoje</p>
                  <p className="text-3xl font-bold text-blue-600">{statusHoje.horasTrabalhadas}</p>
                  <p className="text-xs text-gray-500 mt-1">Trabalhadas</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statusHoje.saida ? 'Finalizado' : 'Trabalhando'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Atual</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progresso Mensal</p>
                  <p className="text-3xl font-bold text-purple-600">{progressoMensal}%</p>
                  <p className="text-xs text-gray-500 mt-1">Concluído</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Localização</p>
                  <p className="text-lg font-bold text-orange-600">SEFAZ-TO</p>
                  <p className="text-xs text-gray-500 mt-1">Palmas</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slideshow de Gráficos - 2 gráficos por slide */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Análise de Desempenho
                </CardTitle>
                <CardDescription>
                  Visualize seus dados de forma interativa - 2 gráficos por slide
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
            
            {/* Indicadores de slide - agora apenas 2 slides */}
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
              {/* Slide 1: Progresso Mensal + Horas Semanais */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progresso Mensal */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Progresso Mensal
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stats.horasTrabalhadasMes}h de {stats.horasEsperadas}h ({progressoMensal}%)
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        concluido: {
                          label: "Concluído",
                          color: "#22c55e",
                        },
                        restante: {
                          label: "Restante",
                          color: "#e5e7eb",
                        },
                      }}
                      className="h-64"
                    >
                      <PieChart>
                        <Pie
                          data={progressoData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {progressoData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{progressoMensal}%</p>
                      <p className="text-sm text-gray-500">Concluído</p>
                    </div>
                  </div>

                  {/* Horas Semanais */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Horas Semanais
                      </h3>
                      <p className="text-sm text-gray-600">
                        Comparativo com meta semanal
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
                      <BarChart data={horasSemanaisData}>
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

              {/* Slide 2: Pontualidade + Banco de Horas */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pontualidade Semanal */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Timer className="h-5 w-5 text-purple-600" />
                        Pontualidade Semanal
                      </h3>
                      <p className="text-sm text-gray-600">
                        Percentual de pontualidade por dia
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        pontualidade: {
                          label: "Pontualidade",
                          color: "#8b5cf6",
                        },
                      }}
                      className="h-64"
                    >
                      <LineChart data={pontualidadeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="pontualidade" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>

                  {/* Evolução Banco de Horas */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <Award className="h-5 w-5 text-emerald-600" />
                        Evolução Banco de Horas
                      </h3>
                      <p className="text-sm text-gray-600">
                        Saldo acumulado nos últimos meses
                      </p>
                    </div>
                    <ChartContainer
                      config={{
                        saldo: {
                          label: "Saldo",
                          color: "#10b981",
                        },
                      }}
                      className="h-64"
                    >
                      <AreaChart data={bancoHorasData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="saldo" 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ChartContainer>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">+{stats.saldoBancoHoras}h</p>
                      <p className="text-sm text-gray-500">Saldo atual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Status do Dia */}
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Status de Hoje</h3>
                  <p className="text-green-600">{statusHoje.localTrabalho}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4 text-sm text-green-700">
                  <span>Entrada: {statusHoje.entrada}</span>
                  <span>Almoço: {statusHoje.saidaAlmoco} - {statusHoje.voltaAlmoco}</span>
                  {statusHoje.saida ? (
                    <span>Saída: {statusHoje.saida}</span>
                  ) : (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      Em expediente
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações Importantes */}
        {notificacoes.some(n => n.tipo === 'lembrete' || n.tipo === 'aprovacao') && (
          <Alert className="border-l-4 border-l-protocolo-orange bg-orange-50 border-orange-200">
            <Bell className="h-4 w-4 text-protocolo-orange" />
            <AlertTitle className="text-protocolo-orange font-semibold">Notificações</AlertTitle>
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
              <Activity className="h-5 w-5 text-protocolo-blue" />
              Resumo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-protocolo-blue">{progressoMensal}%</div>
                <div className="text-sm text-gray-600">Progresso Mensal</div>
                <div className="text-xs text-gray-500">{stats.horasTrabalhadasMes}h / {stats.horasEsperadas}h</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.diasPresentes}</div>
                <div className="text-sm text-gray-600">Dias Presentes</div>
                <div className="text-xs text-gray-500">No mês atual</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.saldoBancoHoras > 0 ? '+' : ''}{stats.saldoBancoHoras}h</div>
                <div className="text-sm text-gray-600">Banco de Horas</div>
                <div className="text-xs text-gray-500">Saldo atual</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.pontualidade}%</div>
                <div className="text-sm text-gray-600">Pontualidade</div>
                <div className="text-xs text-gray-500">Últimos 30 dias</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso das Horas Trabalhadas</span>
                <span>{stats.horasTrabalhadasMes}h / {stats.horasEsperadas}h</span>
              </div>
              <Progress value={progressoMensal} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Seção Principal com Tabs */}
        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="acoes" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Ações Rápidas
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="mt-6">
            <AttendanceCalendar
              month="Janeiro"
              year={2025}
              days={calendarDays}
            />
          </TabsContent>

          <TabsContent value="acoes" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Ações Rápidas */}
              <Card className="card-govto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription>
                    Registre seu ponto ou gerencie sua frequência
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  <Button 
                    className="btn-govto-primary w-full" 
                    size="lg"
                    onClick={() => navigate('/registrar-ponto')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Registrar Ponto
                  </Button>
                  <Button 
                    className="btn-govto-secondary w-full"
                    onClick={() => navigate('/justificativas')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Solicitar Justificativa
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-protocolo-blue text-protocolo-blue hover:bg-protocolo-blue hover:text-white"
                    onClick={() => navigate('/minha-frequencia')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Espelho de Ponto
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                    onClick={() => navigate('/banco-horas')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Banco de Horas
                  </Button>
                </CardContent>
              </Card>

              {/* Próximas Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Coffee className="h-5 w-5" />
                    Próximas Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {proximasAtividades.map((atividade, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{atividade.descricao}</div>
                        <div className="text-xs text-gray-600">
                          {atividade.horario || atividade.data}
                        </div>
                      </div>
                      <Badge 
                        variant={atividade.status === 'urgente' ? 'destructive' : 'secondary'}
                        className={
                          atividade.status === 'urgente' ? 'bg-red-100 text-red-700' :
                          atividade.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }
                      >
                        {atividade.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Últimos Registros */}
              <Card className="card-govto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Últimos Registros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  {[
                    { date: "21/01/2025", entry: "08:00", exit: "17:00", status: "completo" },
                    { date: "20/01/2025", entry: "08:05", exit: "17:02", status: "atraso" },
                    { date: "17/01/2025", entry: "08:00", exit: "17:00", status: "completo" },
                    { date: "16/01/2025", entry: "08:00", exit: "17:00", status: "completo" },
                    { date: "15/01/2025", entry: "08:10", exit: "17:05", status: "atraso" },
                  ].map((record, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{record.date}</div>
                        <div className="text-xs text-gray-600">
                          {record.entry} - {record.exit}
                        </div>
                      </div>
                      <Badge 
                        variant={record.status === 'completo' ? 'secondary' : 'outline'}
                        className={record.status === 'completo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                      >
                        {record.status === 'completo' ? 'OK' : 'Atraso'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Estatísticas Detalhadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Award className="h-5 w-5" />
                    Estatísticas do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.diasPresentes}</div>
                      <div className="text-sm text-gray-600">Dias Presentes</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stats.faltas}</div>
                      <div className="text-sm text-gray-600">Faltas</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.horasExtrasMes}h</div>
                      <div className="text-sm text-gray-600">Horas Extras</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.atrasos}</div>
                      <div className="text-sm text-gray-600">Atrasos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ServidorDashboard;
