import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { OccurrenceFilters } from '@/components/OccurrenceFilters';
import { OccurrenceForm } from '@/components/OccurrenceForm';
import { OccurrenceList } from '@/components/OccurrenceList';
import { OccurrenceDetails } from '@/components/OccurrenceDetails';
import OccurrenceGridView from '@/components/OccurrenceGridView';
import OccurrenceListView from '@/components/OccurrenceListView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { getBadgeConfig } from '@/config/badgeConfig';
import { 
  Plus, 
  History, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  TrendingUp,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';

interface Ocorrencia {
  id: string;
  tipo: 'ajuste_ponto' | 'justificativa_falta' | 'justificativa_atraso';
  data: string;
  horario?: string;
  novoHorario?: string;
  motivo: string;
  justificativa: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataEnvio: string;
  anexos?: string[];
}

const GestaoOcorrencias = () => {
  // Estados para modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  const [activeTab, setActiveTab] = useState('historico');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Ocorrencia | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSolicitacao, setShowSolicitacao] = useState(false);
  
  // Estados para busca e visualização
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    tipo: 'todos',
    status: 'todos',
    dataInicio: '',
    dataFim: '',
    busca: ''
  });

  // Dados mockados de ocorrências
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([
    {
      id: '2024001',
      tipo: 'ajuste_ponto',
      data: '2024-01-15',
      horario: '08:30',
      novoHorario: '08:00',
      motivo: 'Esquecimento de registrar',
      justificativa: 'Houve um acidente na rodovia que causou um engarrafamento de mais de 1 hora. Tenho comprovante da polícia rodoviária.',
      status: 'aprovado',
      dataEnvio: '2024-01-15T09:30:00',
      anexos: ['comprovante_acidente.pdf']
    },
    {
      id: '2024002',
      tipo: 'justificativa_atraso',
      data: '2024-01-10',
      motivo: 'Trânsito',
      justificativa: 'Consulta médica de emergência devido a dores no peito. Atestado médico em anexo.',
      status: 'pendente',
      dataEnvio: '2024-01-11T08:15:00',
      anexos: ['atestado_medico.pdf']
    }
  ]);

  const handleNewOccurrence = (data: any) => {
    const newOccurrence: Ocorrencia = {
      id: `2024${String(ocorrencias.length + 1).padStart(3, '0')}`,
      tipo: data.tipo,
      data: data.data,
      horario: data.horarioOriginal,
      novoHorario: data.novoHorario,
      motivo: data.motivo,
      justificativa: data.justificativa,
      status: 'pendente',
      dataEnvio: new Date().toISOString(),
      anexos: data.anexos?.map((file: File) => file.name) || []
    };

    setOcorrencias(prev => [newOccurrence, ...prev]);
    setShowSolicitacao(false);
    setActiveTab('historico');
  };

  const handleViewDetails = (ocorrencia: Ocorrencia) => {
    setSelectedOccurrence(ocorrencia);
    setShowDetails(true);
  };

  const handleDownloadAttachment = (anexo: string) => {
    setModalTitle("Download iniciado");
    setModalMessage(`Baixando arquivo: ${anexo}`);
    setModalType('info');
    setModalOpen(true);
    // Aqui seria implementado o download real do arquivo
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      tipo: 'todos',
      status: 'todos',
      dataInicio: '',
      dataFim: '',
      busca: ''
    });
  };

  // Filtrar ocorrências baseado na busca e filtros
  const filteredOcorrencias = ocorrencias.filter(ocorrencia => {
    // Busca fulltext
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        ocorrencia.id.toLowerCase().includes(searchLower) ||
        ocorrencia.motivo.toLowerCase().includes(searchLower) ||
        ocorrencia.justificativa.toLowerCase().includes(searchLower) ||
        ocorrencia.tipo.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Filtro por status
    if (statusFilter !== 'todos' && ocorrencia.status !== statusFilter) return false;
    
    // Filtro por tipo
    if (tipoFilter !== 'todos' && ocorrencia.tipo !== tipoFilter) return false;
    
    // Filtros existentes
    if (filters.tipo !== 'todos' && ocorrencia.tipo !== filters.tipo) return false;
    if (filters.status !== 'todos' && ocorrencia.status !== filters.status) return false;
    if (filters.dataInicio && ocorrencia.data < filters.dataInicio) return false;
    if (filters.dataFim && ocorrencia.data > filters.dataFim) return false;
    if (filters.busca && !ocorrencia.justificativa.toLowerCase().includes(filters.busca.toLowerCase())) return false;
    return true;
  });

  // Funções para gerenciar anexos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, tipo: 'ajuste' | 'justificativa') => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setModalTitle("Tipo de arquivo inválido");
        setModalMessage("Apenas PDF, JPG e PNG são permitidos.");
        setModalType('error');
        setModalOpen(true);
        return false;
      }
      
      if (file.size > maxSize) {
        setModalTitle("Arquivo muito grande");
        setModalMessage("O arquivo deve ter no máximo 5MB.");
        setModalType('error');
        setModalOpen(true);
        return false;
      }
      
      return true;
    });

    if (tipo === 'ajuste') {
      setAnexosAjuste(prev => [...prev, ...validFiles]);
    } else {
      setAnexosJustificativa(prev => [...prev, ...validFiles]);
    }

    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (index: number, tipo: 'ajuste' | 'justificativa') => {
    if (tipo === 'ajuste') {
      setAnexosAjuste(prev => prev.filter((_, i) => i !== index));
    } else {
      setAnexosJustificativa(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmitAjuste = () => {
    if (!dataAjuste || !horarioOriginal || !novoHorario || !tipoAjuste || !motivoAjuste || !justificativaAjuste) {
      setModalTitle("Campos obrigatórios");
      setModalMessage("Por favor, preencha todos os campos obrigatórios.");
      setModalType('error');
      setModalOpen(true);
      return;
    }

    // Simular envio
    setModalTitle("Solicitação enviada!");
    setModalMessage(`Ajuste de ponto para ${dataAjuste} foi solicitado com sucesso. ${anexosAjuste.length > 0 ? `${anexosAjuste.length} arquivo(s) anexado(s).` : ''}`);
    setModalType('success');
    setModalOpen(true);

    // Limpar formulário
    setDataAjuste("");
    setHorarioOriginal("");
    setNovoHorario("");
    setTipoAjuste("");
    setMotivoAjuste("");
    setJustificativaAjuste("");
    setAnexosAjuste([]);
  };

  const handleSubmitJustificativa = () => {
    if (!dataJustificativa || !tipoJustificativa || !motivoJustificativa || !justificativaTexto) {
      setModalTitle("Campos obrigatórios");
      setModalMessage("Por favor, preencha todos os campos obrigatórios.");
      setModalType('error');
      setModalOpen(true);
      return;
    }

    // Simular envio
    setModalTitle("Justificativa enviada!");
    setModalMessage(`Justificativa para ${dataJustificativa} foi enviada com sucesso. ${anexosJustificativa.length > 0 ? `${anexosJustificativa.length} arquivo(s) anexado(s).` : ''}`);
    setModalType('success');
    setModalOpen(true);

    // Limpar formulário
    setDataJustificativa("");
    setTipoJustificativa("");
    setMotivoJustificativa("");
    setJustificativaTexto("");
    setAnexosJustificativa([]);
  };

  const getStatusBadge = (status: string) => {
    const config = getBadgeConfig(status, 'approval');
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.bgColor} ${config.textColor} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Estatísticas das ocorrências
  const stats = {
    total: ocorrencias.length,
    pendentes: ocorrencias.filter(o => o.status === 'pendente').length,
    aprovadas: ocorrencias.filter(o => o.status === 'aprovado').length,
    rejeitadas: ocorrencias.filter(o => o.status === 'rejeitado').length
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'ajuste_ponto':
        return 'Ajuste de Ponto';
      case 'justificativa_falta':
        return 'Justificativa de Falta';
      case 'justificativa_atraso':
        return 'Justificativa de Atraso';
      default:
        return tipo;
    }
  };

  return (
    <DashboardLayout userRole="servidor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestão de Ocorrências
            </h1>
            <p className="text-gray-600 mt-2">Solicite ajustes de ponto e envie justificativas para faltas e atrasos</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSolicitacao} onOpenChange={setShowSolicitacao}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Solicitação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Solicitação de Ocorrência</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para solicitar um ajuste de ponto ou justificar uma falta/atraso
                  </DialogDescription>
                </DialogHeader>
                <OccurrenceForm onSubmit={handleNewOccurrence} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Todas as ocorrências</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.pendentes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando análise</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.aprovadas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Deferidas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.rejeitadas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Indeferidas</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta para Pendências */}
        {stats.pendentes > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Você tem {stats.pendentes} solicitação{stats.pendentes > 1 ? 'ões' : ''} pendente{stats.pendentes > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-orange-700">
                    Acompanhe o status das suas solicitações na aba de histórico.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex flex-1 items-center gap-4">
            {/* Input de busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por ID, motivo, justificativa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="ajuste_ponto">Ajuste de Ponto</SelectItem>
                  <SelectItem value="justificativa_falta">Justificativa de Falta</SelectItem>
                  <SelectItem value="justificativa_atraso">Justificativa de Atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Botões de visualização */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Grid
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Ocorrências
                </CardTitle>
                <CardDescription>
                  Acompanhe o status das suas solicitações
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showFilters && (
              <OccurrenceFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            )}
            
            {/* Renderização condicional baseada no modo de visualização */}
            {viewMode === 'grid' ? (
              <OccurrenceGridView
                occurrences={filteredOcorrencias.map(ocorrencia => ({
                  id: ocorrencia.id,
                  tipo: ocorrencia.tipo === 'ajuste_ponto' ? 'Ajuste de Ponto' :
                        ocorrencia.tipo === 'justificativa_falta' ? 'Justificativa de Falta' :
                        'Justificativa de Atraso',
                  dataInicio: new Date(ocorrencia.data).toLocaleDateString('pt-BR'),
                  horaInicio: ocorrencia.horario || '',
                  dataFim: new Date(ocorrencia.data).toLocaleDateString('pt-BR'),
                  horaFim: ocorrencia.novoHorario || ocorrencia.horario || '',
                  motivo: ocorrencia.motivo,
                  justificativa: ocorrencia.justificativa,
                  status: ocorrencia.status === 'aprovado' ? 'Aprovado' :
                          ocorrencia.status === 'pendente' ? 'Pendente' : 'Rejeitado',
                  anexos: ocorrencia.anexos
                }))}
                onViewDetails={(occurrence) => {
                  const originalOcorrencia = filteredOcorrencias.find(o => o.id === occurrence.id);
                  if (originalOcorrencia) handleViewDetails(originalOcorrencia);
                }}
              />
            ) : (
              <OccurrenceListView
                occurrences={filteredOcorrencias.map(ocorrencia => ({
                  id: ocorrencia.id,
                  tipo: ocorrencia.tipo === 'ajuste_ponto' ? 'Ajuste de Ponto' :
                        ocorrencia.tipo === 'justificativa_falta' ? 'Justificativa de Falta' :
                        'Justificativa de Atraso',
                  dataInicio: new Date(ocorrencia.data).toLocaleDateString('pt-BR'),
                  horaInicio: ocorrencia.horario || '',
                  dataFim: new Date(ocorrencia.data).toLocaleDateString('pt-BR'),
                  horaFim: ocorrencia.novoHorario || ocorrencia.horario || '',
                  motivo: ocorrencia.motivo,
                  justificativa: ocorrencia.justificativa,
                  status: ocorrencia.status === 'aprovado' ? 'Aprovado' :
                          ocorrencia.status === 'pendente' ? 'Pendente' : 'Rejeitado',
                  anexos: ocorrencia.anexos
                }))}
                onViewDetails={(occurrence) => {
                  const originalOcorrencia = filteredOcorrencias.find(o => o.id === occurrence.id);
                  if (originalOcorrencia) handleViewDetails(originalOcorrencia);
                }}
              />
            )}
          </CardContent>
        </Card>

        <OccurrenceDetails
          ocorrencia={selectedOccurrence}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onDownloadAttachment={handleDownloadAttachment}
        />

        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalTitle}
          message={modalMessage}
          type={modalType}
          showConfirmButton={false}
        />
      </div>
    </DashboardLayout>
  );
};

export default GestaoOcorrencias;