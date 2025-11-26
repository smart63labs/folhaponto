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
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  TrendingUp,
  Filter,
  Search,
  Eye,
  BarChart3,
  Activity,
  CheckCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportUtils';
import { useAuth } from '@/contexts/AuthContext';

interface RelatorioTemplate {
  id: string;
  nome: string;
  categoria: 'frequencia' | 'banco_horas' | 'ocorrencias' | 'pessoal';
  descricao: string;
  icone: React.ComponentType<any>;
  cor: string;
  status: 'disponivel' | 'em_desenvolvimento';
  parametros: string[];
  formatos: ('pdf' | 'excel' | 'csv')[];
}

interface RelatorioHistorico {
  id: string;
  template: string;
  nome: string;
  dataGeracao: string;
  periodo: string;
  formato: string;
  status: 'concluido' | 'processando' | 'erro';
  tamanho?: string;
}

const RelatoriosServidor: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('meus-relatorios');
  const [showGerarRelatorio, setShowGerarRelatorio] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState<RelatorioTemplate | null>(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    categoria: 'todos',
    status: 'todos',
    busca: ''
  });

  // Estados para geração de relatório
  const [parametrosRelatorio, setParametrosRelatorio] = useState({
    periodo: 'mes_atual',
    dataInicio: '',
    dataFim: '',
    formato: 'pdf' as 'pdf' | 'excel' | 'csv',
    incluirDetalhes: true,
    incluirGraficos: true
  });

  // Templates de relatórios disponíveis para servidores (apenas dados pessoais)
  const templatesRelatorios: RelatorioTemplate[] = [
    {
      id: 'meu-espelho-ponto',
      nome: 'Meu Espelho de Ponto',
      categoria: 'frequencia',
      descricao: 'Relatório detalhado da minha frequência pessoal',
      icone: FileText,
      cor: 'text-blue-600',
      status: 'disponivel',
      parametros: ['periodo', 'incluir_observacoes'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'meu-banco-horas',
      nome: 'Meu Extrato de Banco de Horas',
      categoria: 'banco_horas',
      descricao: 'Histórico completo do meu banco de horas',
      icone: Clock,
      cor: 'text-green-600',
      status: 'disponivel',
      parametros: ['periodo', 'incluir_projecoes'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'minhas-ocorrencias',
      nome: 'Minhas Ocorrências',
      categoria: 'ocorrencias',
      descricao: 'Relatório das minhas solicitações e justificativas',
      icone: Activity,
      cor: 'text-orange-600',
      status: 'disponivel',
      parametros: ['periodo', 'tipo_ocorrencia', 'status_aprovacao'],
      formatos: ['pdf', 'excel', 'csv']
    },
    {
      id: 'meu-resumo-mensal',
      nome: 'Meu Resumo Mensal',
      categoria: 'pessoal',
      descricao: 'Consolidado mensal da minha frequência e produtividade',
      icone: BarChart3,
      cor: 'text-purple-600',
      status: 'disponivel',
      parametros: ['mes_referencia', 'incluir_comparativo'],
      formatos: ['pdf', 'excel']
    }
  ];

  // Histórico de relatórios gerados pelo usuário logado
  const historicoRelatorios: RelatorioHistorico[] = [
    {
      id: '1',
      template: 'meu-espelho-ponto',
      nome: 'Espelho de Ponto - Janeiro 2025',
      dataGeracao: '2025-01-25',
      periodo: 'Janeiro 2025',
      formato: 'PDF',
      status: 'concluido',
      tamanho: '2.3 MB'
    },
    {
      id: '2',
      template: 'meu-banco-horas',
      nome: 'Banco de Horas - Dezembro 2024',
      dataGeracao: '2025-01-02',
      periodo: 'Dezembro 2024',
      formato: 'Excel',
      status: 'concluido',
      tamanho: '1.8 MB'
    },
    {
      id: '3',
      template: 'minhas-ocorrencias',
      nome: 'Ocorrências - 4º Trimestre 2024',
      dataGeracao: '2025-01-15',
      periodo: '4º Trimestre 2024',
      formato: 'PDF',
      status: 'concluido',
      tamanho: '1.2 MB'
    }
  ];

  // Estatísticas pessoais do usuário
  const estatisticasPessoais = {
    relatoriosGeradosEsteAno: 12,
    ultimoRelatorioGerado: '25/01/2025',
    formatoMaisUsado: 'PDF',
    categoriaPreferida: 'Frequência'
  };

  // Filtrar templates
  const templatesFiltrados = useMemo(() => {
    return templatesRelatorios.filter(template => {
      const matchCategoria = filtros.categoria === 'todos' || template.categoria === filtros.categoria;
      const matchStatus = filtros.status === 'todos' || template.status === filtros.status;
      const matchBusca = filtros.busca === '' || 
        template.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        template.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
      
      return matchCategoria && matchStatus && matchBusca;
    });
  }, [filtros]);

  const handleGerarRelatorio = async () => {
    if (!templateSelecionado || !user) return;

    // Dados mockados específicos do usuário logado
    const dadosRelatorio = {
      usuario: {
        nome: user.name,
        email: user.email,
        departamento: user.department,
        id: user.id
      },
      periodo: parametrosRelatorio.periodo,
      dataGeracao: new Date().toISOString(),
      template: templateSelecionado.nome,
      dados: `Dados específicos do relatório ${templateSelecionado.nome} para ${user.name}`
    };

    try {
      switch (parametrosRelatorio.formato) {
        case 'pdf':
          await exportToPDF(dadosRelatorio, `${templateSelecionado.nome}_${user.name}`);
          break;
        case 'excel':
          await exportToExcel(dadosRelatorio, `${templateSelecionado.nome}_${user.name}`);
          break;
        case 'csv':
          await exportToCSV(dadosRelatorio, `${templateSelecionado.nome}_${user.name}`);
          break;
      }
      
      setShowGerarRelatorio(false);
      setTemplateSelecionado(null);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      frequencia: 'Frequência',
      banco_horas: 'Banco de Horas',
      ocorrencias: 'Ocorrências',
      pessoal: 'Pessoal'
    };
    
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      disponivel: 'default',
      em_desenvolvimento: 'secondary',
      concluido: 'default',
      processando: 'secondary',
      erro: 'destructive'
    };
    
    const labels = {
      disponivel: 'Disponível',
      em_desenvolvimento: 'Em Desenvolvimento',
      concluido: 'Concluído',
      processando: 'Processando',
      erro: 'Erro'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout userRole="servidor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meus Relatórios
            </h1>
            <p className="text-muted-foreground mt-2">
              Gere e gerencie seus relatórios pessoais de frequência e ponto
            </p>
          </div>
        </div>

        {/* Cards de Estatísticas Pessoais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Relatórios Este Ano</p>
                   <p className="text-3xl font-bold text-blue-600">
                     {estatisticasPessoais.relatoriosGeradosEsteAno}
                   </p>
                   <p className="text-xs text-gray-500 mt-1">Relatórios gerados</p>
                 </div>
                 <div className="p-3 bg-blue-100 rounded-full">
                   <FileText className="w-8 h-8 text-blue-600" />
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Último Relatório</p>
                   <p className="text-2xl font-bold text-green-600">
                     {estatisticasPessoais.ultimoRelatorioGerado}
                   </p>
                   <p className="text-xs text-gray-500 mt-1">Data da geração</p>
                 </div>
                 <div className="p-3 bg-green-100 rounded-full">
                   <Download className="w-8 h-8 text-green-600" />
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Formato Preferido</p>
                   <p className="text-3xl font-bold text-purple-600">
                     {estatisticasPessoais.formatoMaisUsado}
                   </p>
                   <p className="text-xs text-gray-500 mt-1">Mais utilizado</p>
                 </div>
                 <div className="p-3 bg-purple-100 rounded-full">
                   <Eye className="w-8 h-8 text-purple-600" />
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Categoria Preferida</p>
                   <p className="text-2xl font-bold text-orange-600">
                     {estatisticasPessoais.categoriaPreferida}
                   </p>
                   <p className="text-xs text-gray-500 mt-1">Mais solicitada</p>
                 </div>
                 <div className="p-3 bg-orange-100 rounded-full">
                   <BarChart3 className="w-8 h-8 text-orange-600" />
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

        {/* Navegação por Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="meus-relatorios">Meus Relatórios</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          {/* Aba: Meus Relatórios */}
          <TabsContent value="meus-relatorios" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltros({ categoria: 'todos', status: 'todos', busca: '' })}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={filtros.categoria} onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as categorias</SelectItem>
                        <SelectItem value="frequencia">Frequência</SelectItem>
                        <SelectItem value="banco_horas">Banco de Horas</SelectItem>
                        <SelectItem value="ocorrencias">Ocorrências</SelectItem>
                        <SelectItem value="pessoal">Pessoal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="busca">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="busca"
                        placeholder="Buscar por nome ou descrição..."
                        value={filtros.busca}
                        onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Templates */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templatesFiltrados.map((template) => {
                const IconComponent = template.icone;
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gray-50 ${template.cor}`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.nome}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {getCategoriaLabel(template.categoria)}
                            </Badge>
                          </div>
                        </div>
                        {getStatusBadge(template.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {template.descricao}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Formatos:</span>
                          <div className="flex gap-1">
                            {template.formatos.map((formato) => (
                              <Badge key={formato} variant="secondary" className="text-xs">
                                {formato.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Dialog open={showGerarRelatorio && templateSelecionado?.id === template.id} onOpenChange={(open) => {
                        setShowGerarRelatorio(open);
                        if (!open) setTemplateSelecionado(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full mt-4" 
                            disabled={template.status !== 'disponivel'}
                            onClick={() => setTemplateSelecionado(template)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Gerar Relatório
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Gerar {template.nome}</DialogTitle>
                            <DialogDescription>
                              Configure os parâmetros para gerar seu relatório personalizado.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="periodo">Período</Label>
                              <Select value={parametrosRelatorio.periodo} onValueChange={(value) => setParametrosRelatorio(prev => ({ ...prev, periodo: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mes_atual">Mês Atual</SelectItem>
                                  <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                                  <SelectItem value="trimestre_atual">Trimestre Atual</SelectItem>
                                  <SelectItem value="ano_atual">Ano Atual</SelectItem>
                                  <SelectItem value="personalizado">Período Personalizado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {parametrosRelatorio.periodo === 'personalizado' && (
                              <div className="grid gap-4 grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="dataInicio">Data Início</Label>
                                  <Input
                                    id="dataInicio"
                                    type="date"
                                    value={parametrosRelatorio.dataInicio}
                                    onChange={(e) => setParametrosRelatorio(prev => ({ ...prev, dataInicio: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="dataFim">Data Fim</Label>
                                  <Input
                                    id="dataFim"
                                    type="date"
                                    value={parametrosRelatorio.dataFim}
                                    onChange={(e) => setParametrosRelatorio(prev => ({ ...prev, dataFim: e.target.value }))}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="formato">Formato de Exportação</Label>
                              <Select value={parametrosRelatorio.formato} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setParametrosRelatorio(prev => ({ ...prev, formato: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {template.formatos.map((formato) => (
                                    <SelectItem key={formato} value={formato}>
                                      {formato.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                              <Button variant="outline" onClick={() => setShowGerarRelatorio(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleGerarRelatorio}>
                                <Download className="w-4 h-4 mr-2" />
                                Gerar Relatório
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {templatesFiltrados.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum relatório encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar os filtros para encontrar os relatórios desejados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba: Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Relatórios Gerados</CardTitle>
                <CardDescription>
                  Visualize e baixe novamente seus relatórios anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicoRelatorios.map((relatorio) => (
                    <div key={relatorio.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{relatorio.nome}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Gerado em {format(new Date(relatorio.dataGeracao), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            <span>•</span>
                            <span>{relatorio.formato}</span>
                            {relatorio.tamanho && (
                              <>
                                <span>•</span>
                                <span>{relatorio.tamanho}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(relatorio.status)}
                        {relatorio.status === 'concluido' && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </Button>
                        )}
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

export default RelatoriosServidor;