import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Download,
  Upload,
  Eye,
  Search,
  User,
  Clock,
  CheckCircle,
  BarChart3,
  Activity,
  Target,
  Layout,
  Database,
  FormInput
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface Template {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'formulario' | 'documento' | 'relatorio' | 'email' | 'contrato';
  tipo: 'html' | 'pdf' | 'docx' | 'json' | 'xml';
  status: 'ativo' | 'inativo' | 'rascunho';
  versao: string;
  autor: string;
  dataCriacao: string;
  dataModificacao: string;
  usos: number;
  tags: string[];
  campos?: CampoFormulario[];
  conteudo?: string;
}

interface CampoFormulario {
  id: string;
  nome: string;
  tipo: 'texto' | 'numero' | 'data' | 'email' | 'telefone' | 'select' | 'checkbox' | 'textarea';
  obrigatorio: boolean;
  opcoes?: string[];
  validacao?: string;
  placeholder?: string;
}

interface EstatisticaTemplate {
  titulo: string;
  valor: number | string;
  variacao?: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

const TemplatesFormularios: React.FC = () => {
  const navigate = useNavigate();
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [buscaFiltro, setBuscaFiltro] = useState('');
  const [templateSelecionado, setTemplateSelecionado] = useState<Template | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [novoTemplate, setNovoTemplate] = useState<Partial<Template>>({});

  // Templates mockados
  const templates: Template[] = [
    {
      id: '1',
      nome: 'Formulário de Solicitação de Férias',
      descricao: 'Template padrão para solicitação de férias dos funcionários',
      categoria: 'formulario',
      tipo: 'html',
      status: 'ativo',
      versao: '2.1',
      autor: 'Admin Sistema',
      dataCriacao: '2024-01-01T10:00:00',
      dataModificacao: '2024-01-15T14:30:00',
      usos: 245,
      tags: ['ferias', 'rh', 'solicitacao'],
      campos: [
        { id: '1', nome: 'Nome Completo', tipo: 'texto', obrigatorio: true, placeholder: 'Digite seu nome completo' },
        { id: '2', nome: 'Matrícula', tipo: 'numero', obrigatorio: true, placeholder: 'Número da matrícula' },
        { id: '3', nome: 'Data Início', tipo: 'data', obrigatorio: true },
        { id: '4', nome: 'Data Fim', tipo: 'data', obrigatorio: true },
        { id: '5', nome: 'Motivo', tipo: 'textarea', obrigatorio: true, placeholder: 'Descreva o motivo das férias' }
      ]
    },
    {
      id: '2',
      nome: 'Relatório Mensal de Frequência',
      descricao: 'Template para geração de relatórios mensais de frequência',
      categoria: 'relatorio',
      tipo: 'pdf',
      status: 'ativo',
      versao: '1.5',
      autor: 'Admin Sistema',
      dataCriacao: '2023-12-15T09:00:00',
      dataModificacao: '2024-01-10T16:20:00',
      usos: 89,
      tags: ['frequencia', 'mensal', 'relatorio'],
      conteudo: 'Template de relatório com cabeçalho, dados tabulares e gráficos'
    },
    {
      id: '3',
      nome: 'Contrato de Trabalho Padrão',
      descricao: 'Template padrão para contratos de trabalho',
      categoria: 'contrato',
      tipo: 'docx',
      status: 'ativo',
      versao: '3.0',
      autor: 'Jurídico',
      dataCriacao: '2023-11-20T11:30:00',
      dataModificacao: '2024-01-05T10:15:00',
      usos: 156,
      tags: ['contrato', 'trabalho', 'juridico']
    },
    {
      id: '4',
      nome: 'Email de Boas-vindas',
      descricao: 'Template de email para novos funcionários',
      categoria: 'email',
      tipo: 'html',
      status: 'ativo',
      versao: '1.2',
      autor: 'RH',
      dataCriacao: '2024-01-08T15:45:00',
      dataModificacao: '2024-01-12T09:30:00',
      usos: 67,
      tags: ['email', 'boas-vindas', 'onboarding']
    },
    {
      id: '5',
      nome: 'Formulário de Avaliação de Desempenho',
      descricao: 'Template para avaliação anual de desempenho',
      categoria: 'formulario',
      tipo: 'json',
      status: 'rascunho',
      versao: '0.8',
      autor: 'RH',
      dataCriacao: '2024-01-14T13:20:00',
      dataModificacao: '2024-01-14T13:20:00',
      usos: 0,
      tags: ['avaliacao', 'desempenho', 'anual'],
      campos: [
        { id: '1', nome: 'Funcionário', tipo: 'texto', obrigatorio: true },
        { id: '2', nome: 'Período Avaliado', tipo: 'select', obrigatorio: true, opcoes: ['1º Semestre', '2º Semestre', 'Anual'] },
        { id: '3', nome: 'Nota Geral', tipo: 'numero', obrigatorio: true },
        { id: '4', nome: 'Comentários', tipo: 'textarea', obrigatorio: false }
      ]
    },
    {
      id: '6',
      nome: 'Documento de Advertência',
      descricao: 'Template para documentos de advertência disciplinar',
      categoria: 'documento',
      tipo: 'pdf',
      status: 'inativo',
      versao: '2.0',
      autor: 'RH',
      dataCriacao: '2023-10-30T14:00:00',
      dataModificacao: '2023-12-20T11:45:00',
      usos: 23,
      tags: ['advertencia', 'disciplinar', 'documento']
    }
  ];

  // Estatísticas
  const estatisticas: EstatisticaTemplate[] = [
    {
      titulo: 'Templates Ativos',
      valor: templates.filter(t => t.status === 'ativo').length,
      variacao: 12.5,
      icone: Activity,
      cor: 'text-green-600',
      descricao: 'Templates em uso'
    },
    {
      titulo: 'Usos Este Mês',
      valor: templates.reduce((acc, t) => acc + t.usos, 0),
      variacao: 8.3,
      icone: Target,
      cor: 'text-blue-600',
      descricao: 'Total de utilizações'
    },
    {
      titulo: 'Formulários',
      valor: templates.filter(t => t.categoria === 'formulario').length,
      icone: FormInput,
      cor: 'text-purple-600',
      descricao: 'Templates de formulário'
    },
    {
      titulo: 'Documentos',
      valor: templates.filter(t => t.categoria === 'documento' || t.categoria === 'contrato').length,
      icone: FileText,
      cor: 'text-orange-600',
      descricao: 'Templates de documento'
    }
  ];

  // Filtros
  const templatesFiltrados = useMemo(() => {
    return templates.filter(template => {
      const matchCategoria = categoriaFiltro === 'todos' || template.categoria === categoriaFiltro;
      const matchTipo = tipoFiltro === 'todos' || template.tipo === tipoFiltro;
      const matchStatus = statusFiltro === 'todos' || template.status === statusFiltro;
      const matchBusca = template.nome.toLowerCase().includes(buscaFiltro.toLowerCase()) ||
                        template.descricao.toLowerCase().includes(buscaFiltro.toLowerCase()) ||
                        template.tags.some(tag => tag.toLowerCase().includes(buscaFiltro.toLowerCase()));
      
      return matchCategoria && matchTipo && matchStatus && matchBusca;
    });
  }, [categoriaFiltro, tipoFiltro, statusFiltro, buscaFiltro]);

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      rascunho: 'bg-yellow-100 text-yellow-800'
    };
    
    return variants[status as keyof typeof variants] || variants.ativo;
  };

  const getCategoriaBadge = (categoria: string) => {
    const variants = {
      formulario: 'bg-blue-100 text-blue-800',
      documento: 'bg-purple-100 text-purple-800',
      relatorio: 'bg-green-100 text-green-800',
      email: 'bg-orange-100 text-orange-800',
      contrato: 'bg-red-100 text-red-800'
    };
    
    return variants[categoria as keyof typeof variants] || variants.formulario;
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      formulario: 'Formulário',
      documento: 'Documento',
      relatorio: 'Relatório',
      email: 'Email',
      contrato: 'Contrato'
    };
    
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      html: Layout,
      pdf: FileText,
      docx: FileText,
      json: Database,
      xml: Database
    };
    
    return icons[tipo as keyof typeof icons] || FileText;
  };

  const handleDuplicarTemplate = (templateId: string) => {
    // Aqui seria implementada a lógica de duplicação
    console.log(`Duplicando template ${templateId}`);
  };

  const handleExcluirTemplate = (templateId: string) => {
    // Aqui seria implementada a lógica de exclusão
    console.log(`Excluindo template ${templateId}`);
  };

  const handleSalvarTemplate = () => {
    // Aqui seria implementada a lógica de salvamento
    console.log('Salvando template:', novoTemplate);
    setModoEdicao(false);
    setNovoTemplate({});
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates & Formulários</h1>
            <p className="text-gray-600">Gerencie templates de formulários, documentos e relatórios do sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Templates Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Templates em uso</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usos Este Mês</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Total de utilizações</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Formulários</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Templates de formulário</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FormInput className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documentos</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Templates de documento</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biblioteca de Templates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Biblioteca de Templates</CardTitle>
                <CardDescription>
                  Gerencie todos os templates disponíveis no sistema
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
                <Button size="sm" onClick={() => navigate('/admin/criador-formularios')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros compactos */}
            <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar templates..."
                    value={buscaFiltro}
                    onChange={(e) => setBuscaFiltro(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="formulario">Formulário</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                  <SelectItem value="relatorio">Relatório</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grid de templates otimizada */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templatesFiltrados.map((template) => {
                const TipoIcon = getTipoIcon(template.tipo);
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TipoIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">{template.nome}</CardTitle>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge className={getCategoriaBadge(template.categoria)} variant="secondary">
                                {getCategoriaLabel(template.categoria)}
                              </Badge>
                              <Badge className={getStatusBadge(template.status)} variant="outline">
                                {template.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {template.descricao}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={() => setTemplateSelecionado(template)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDuplicarTemplate(template.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleExcluirTemplate(template.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {templatesFiltrados.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum template encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Não foram encontrados templates com os filtros aplicados.
                </p>
                <Button onClick={() => navigate('/admin/criador-formularios')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para visualização de template */}
        {templateSelecionado && (
          <Dialog open={!!templateSelecionado} onOpenChange={() => setTemplateSelecionado(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {templateSelecionado.nome}
                </DialogTitle>
                <DialogDescription>
                  Detalhes e informações do template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoriaBadge(templateSelecionado.categoria)}>
                    {getCategoriaLabel(templateSelecionado.categoria)}
                  </Badge>
                  <Badge className={getStatusBadge(templateSelecionado.status)}>
                    {templateSelecionado.status}
                  </Badge>
                  <Badge variant="outline">
                    {templateSelecionado.tipo.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">DESCRIÇÃO</Label>
                  <p className="text-sm mt-1">{templateSelecionado.descricao}</p>
                </div>

                {templateSelecionado.tags.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">TAGS</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {templateSelecionado.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {templateSelecionado.campos && templateSelecionado.campos.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">CAMPOS DO FORMULÁRIO</Label>
                    <div className="space-y-2 mt-2">
                      {templateSelecionado.campos.map((campo) => (
                        <div key={campo.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{campo.nome}</span>
                            <Badge variant="outline" className="text-xs">
                              {campo.tipo}
                            </Badge>
                            {campo.obrigatorio && (
                              <Badge variant="outline" className="text-xs text-red-600">
                                obrigatório
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button size="sm" className="flex-1">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicarTemplate(templateSelecionado.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog para criação/edição de template */}
        {modoEdicao && (
          <Dialog open={modoEdicao} onOpenChange={() => setModoEdicao(false)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Template</DialogTitle>
                <DialogDescription>
                  Crie um novo template para o sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="nome">Nome do Template</Label>
                    <Input
                      id="nome"
                      placeholder="Digite o nome do template"
                      value={novoTemplate.nome || ''}
                      onChange={(e) => setNovoTemplate({...novoTemplate, nome: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select onValueChange={(value) => setNovoTemplate({...novoTemplate, categoria: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formulario">Formulário</SelectItem>
                        <SelectItem value="documento">Documento</SelectItem>
                        <SelectItem value="relatorio">Relatório</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="contrato">Contrato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva o propósito do template"
                    value={novoTemplate.descricao || ''}
                    onChange={(e) => setNovoTemplate({...novoTemplate, descricao: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="tipo">Tipo de Arquivo</Label>
                    <Select onValueChange={(value) => setNovoTemplate({...novoTemplate, tipo: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="versao">Versão</Label>
                    <Input
                      id="versao"
                      placeholder="1.0"
                      value={novoTemplate.versao || ''}
                      onChange={(e) => setNovoTemplate({...novoTemplate, versao: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button className="flex-1" onClick={handleSalvarTemplate}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Template
                  </Button>
                  <Button variant="outline" onClick={() => setModoEdicao(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TemplatesFormularios;