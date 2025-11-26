import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
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
import {
  Building,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  Save,
  X,
  Search,
  Filter,
  Upload,
  Download,
  Trash2,
  Grid,
  List
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SectorHierarchyBuilder } from '@/components/Admin/SectorHierarchy/SectorHierarchyBuilder';
import BulkSectorImport from '@/components/Rh/BulkSectorImport';
import SectorGridList from '@/components/Rh/SectorGridList';
import SectorCardList from '@/components/Rh/SectorCardList';
import { useSectors } from '@/hooks/useSectors';
import { SectorService } from '@/services/sectorService';
import { Sector } from '@/types/sector';
import { CepService } from '@/services/cepService';

// Interfaces para os dados
interface Setor {
  id: string;
  nome: string;
  sigla: string;
  responsavel: string;
  totalServidores: number;
  status: 'ativo' | 'inativo';
  orcamento?: number;
}

interface Estatistica {
  titulo: string;
  valor: string | number;
  variacao: number;
  icone: React.ComponentType<any>;
  cor: string;
  descricao: string;
}

const GestaoSetores: React.FC = () => {
  const { sectors, getSectorOptions, getSectorName, loading: sectorsLoading } = useSectors();
  const [currentView, setCurrentView] = useState<'setores' | 'hierarquia'>('setores');
  const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid');
  const [dialogoNovoSetor, setDialogoNovoSetor] = useState(false);
  const [modalImportacao, setModalImportacao] = useState(false);
  const [setores, setSetores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [setorEditando, setSetorEditando] = useState<Setor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [orgaoFilter, setOrgaoFilter] = useState('todos');

  // Carregar setores da API
  useEffect(() => {
    const loadSetores = async () => {
      try {
        setLoading(true);
        const data = await SectorService.getAllSectors();
        setSetores(data);
      } catch (error) {
        console.error('Erro ao carregar setores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSetores();
  }, []);

  // Funções para o SectorHierarchyBuilder
  const handleSaveHierarchy = async (sectors: Sector[]) => {
    try {
      // Atualizar cada setor com o novo parentId
      for (const sector of sectors) {
        await SectorService.updateSector(sector.id, { parentId: sector.parentId });
      }
      // Recarregar setores após salvar
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar hierarquia:', error);
      throw error;
    }
  };

  const handleCreateSector = async (sectorData: any) => {
    try {
      await SectorService.createSector(sectorData);
      // Recarregar setores locais
      const data = await SectorService.getAllSectors();
      setSetores(data);
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      throw error;
    }
  };

  const handleUpdateSector = async (sectorId: string, changes: any) => {
    try {
      await SectorService.updateSector(sectorId, changes);
      // Recarregar setores locais
      const data = await SectorService.getAllSectors();
      setSetores(data);
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      throw error;
    }
  };

  const handleDeleteSector = async (sectorId: string) => {
    try {
      await SectorService.deleteSector(sectorId);
      // Recarregar setores locais
      const data = await SectorService.getAllSectors();
      setSetores(data);
    } catch (error) {
      console.error('Erro ao deletar setor:', error);
      throw error;
    }
  };

  // Estado para formulário de setor
  const [formularioSetor, setFormularioSetor] = useState({
    name: '',
    code: '',
    active: true,
    orgao: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    semNumero: false
  });
  const [cepLoading, setCepLoading] = useState(false);


  // Estatísticas gerais baseadas nos dados reais
  const estatisticas = useMemo(() => [
    {
      title: 'Total de Setores',
      value: setores.length,
      icon: Building,
      color: 'blue' as const,
      trend: {
        value: 5,
        isPositive: true
      }
    },
    {
      title: 'Setores Ativos',
      value: setores.filter(s => s.active === true).length,
      icon: CheckCircle,
      color: 'green' as const,
      trend: {
        value: 2,
        isPositive: true
      }
    },
    {
      title: 'Setores Inativos',
      value: setores.filter(s => s.active === false).length,
      icon: AlertTriangle,
      color: 'red' as const,
      trend: {
        value: 1,
        isPositive: false
      }
    }
  ], [setores]);



  const abrirModalSetor = (setor?: any) => {
    if (setor) {
      setSetorEditando(setor);
      setFormularioSetor({
        name: setor.nome || '',  // Corrigido: nome -> name
        code: setor.codigo || '',  // Corrigido: codigo -> code
        active: setor.ativo !== undefined ? setor.ativo : true,  // Corrigido: ativo -> active
        orgao: setor.orgao || '',
        logradouro: setor.logradouro || '',
        numero: setor.numero || '',
        complemento: setor.complemento || '',
        bairro: setor.bairro || '',
        cidade: setor.cidade || '',
        estado: setor.estado || '',
        cep: setor.cep || '',
        telefone: setor.telefone || '',
        email: setor.email || '',
        semNumero: setor.numero === 'Sem Numero'
      });
    } else {
      setSetorEditando(null);
      setFormularioSetor({
        name: '',
        code: '',
        active: true,
        orgao: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        semNumero: false
      });
    }
    setDialogoNovoSetor(true);
  };


  const handleSalvarSetor = async () => {
    try {
      if (setorEditando) {
        await SectorService.updateSector(setorEditando.id, formularioSetor);
      } else {
        await SectorService.createSector(formularioSetor);
      }
      
      // Recarregar setores
      const data = await SectorService.getAllSectors();
      setSetores(data);
      
      setDialogoNovoSetor(false);
      setSetorEditando(null);
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      alert('Erro ao salvar setor. Tente novamente.');
    }
  };

  const handleBuscarCep = async () => {
    if (!formularioSetor.cep.trim()) {
      alert('Digite um CEP válido');
      return;
    }

    setCepLoading(true);
    try {
      const cepData = await CepService.buscarCep(formularioSetor.cep);
      if (cepData) {
        setFormularioSetor(prev => ({
          ...prev,
          logradouro: cepData.logradouro,
          complemento: cepData.complemento,
          bairro: cepData.bairro,
          cidade: cepData.localidade,
          estado: cepData.uf,
          cep: CepService.formatarCep(cepData.cep)
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Verifique se o CEP está correto.');
    } finally {
      setCepLoading(false);
    }
  };



  const getStatusBadge = (status: boolean) => {
    return status 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredSetores = useMemo(() => {
    return setores.filter(setor => {
      const matchesSearch = searchTerm === '' || 
        setor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setor.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setor.orgao?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || 
        (statusFilter === 'ativo' && setor.active) ||
        (statusFilter === 'inativo' && !setor.active);
      
      const matchesOrgao = orgaoFilter === 'todos' || setor.orgao === orgaoFilter;
      
      return matchesSearch && matchesStatus && matchesOrgao;
    });
  }, [setores, searchTerm, statusFilter, orgaoFilter]);

  // Obter lista única de órgãos
  const orgaos = useMemo(() => {
    const uniqueOrgaos = [...new Set(setores.map(s => s.orgao).filter(Boolean))];
    return uniqueOrgaos.sort();
  }, [setores]);

  return (
    <DashboardLayout userRole="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Setores</h1>
            <p className="text-gray-600">Gerencie setores e suas configurações</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {estatisticas.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={currentView === 'setores' ? 'default' : 'outline'}
            onClick={() => setCurrentView('setores')}
          >
            Setores
          </Button>
        </div>

        {/* Content based on current view */}
        {currentView === 'setores' && (
          <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Tabela
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <List className="w-4 h-4 mr-2" />
                  Cards
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={modalImportacao} onOpenChange={setModalImportacao}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Importar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Importação em Lote de Setores</DialogTitle>
                      <DialogDescription>
                        Importe múltiplos setores através de arquivo CSV ou TXT
                      </DialogDescription>
                    </DialogHeader>
                    <BulkSectorImport />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  variant={currentView === 'hierarquia' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setCurrentView('hierarquia')}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Hierarquia
                </Button>
                <Button size="sm" onClick={() => abrirModalSetor()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Setor
                </Button>
              </div>
            </div>

            {/* Render GridList or CardList based on viewMode */}
            {viewMode === 'grid' ? (
              <SectorGridList 
                sectors={setores}
                loading={loading}
                onEdit={abrirModalSetor}
                onDelete={handleDeleteSector}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                orgaoFilter={orgaoFilter}
                onOrgaoFilterChange={setOrgaoFilter}
                orgaos={orgaos}
              />
            ) : (
              <SectorCardList 
                sectors={setores}
                loading={loading}
                onEdit={abrirModalSetor}
                onDelete={handleDeleteSector}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                orgaoFilter={orgaoFilter}
                onOrgaoFilterChange={setOrgaoFilter}
                orgaos={orgaos}
              />
            )}
          </div>
        )}

        {/* Hierarquia View */}
        {currentView === 'hierarquia' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Hierarquia de Setores</CardTitle>
                    <CardDescription>
                      Gerencie a hierarquia organizacional dos setores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SectorHierarchyBuilder
                  sectors={sectors}
                  onSave={handleSaveHierarchy}
                  onCreateSector={handleCreateSector}
                  onUpdateSector={handleUpdateSector}
                  onDeleteSector={handleDeleteSector}
                  isLoading={sectorsLoading}
                />
              </CardContent>
            </Card>

            {/* Importação Tab */}
            <Card>
              <CardHeader>
                <CardTitle>Importação em Massa</CardTitle>
                <CardDescription>
                  Importe setores em lote através de arquivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkSectorImport />
              </CardContent>
            </Card>
          </div>
        )}


        {/* Modal de Formulário de Setor */}
        <Dialog open={dialogoNovoSetor} onOpenChange={setDialogoNovoSetor}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-3">
            <DialogHeader>
              <DialogTitle className="text-base">
                {setorEditando ? 'Editar Setor' : 'Novo Setor'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {setorEditando
                  ? 'Edite as informações do setor selecionado.'
                  : 'Preencha as informações para criar um novo setor.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {/* Informações Básicas */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Informações Básicas</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="setor-nome">Nome do Setor *</Label>
                    <Input
                      id="setor-nome"
                      value={formularioSetor.name}
                      onChange={(e) => setFormularioSetor({...formularioSetor, name: e.target.value})}
                      placeholder="Digite o nome do setor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor-codigo">Código *</Label>
                    <Input
                      id="setor-codigo"
                      value={formularioSetor.code}
                      onChange={(e) => setFormularioSetor({...formularioSetor, code: e.target.value.toUpperCase()})}
                      placeholder="Ex: DITEC"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Informações do Órgão */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Informações do Órgão</h3>
                <div>
                  <Label htmlFor="setor-orgao">Órgão</Label>
                  <Input
                    id="setor-orgao"
                    value={formularioSetor.orgao}
                    onChange={(e) => setFormularioSetor({...formularioSetor, orgao: e.target.value})}
                    placeholder="Ex: Secretaria da Fazenda"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Endereço</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="setor-cep">CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="setor-cep"
                        value={formularioSetor.cep}
                        onChange={(e) => setFormularioSetor({...formularioSetor, cep: CepService.formatarCep(e.target.value)})}
                        placeholder="Ex: 77001-000"
                        maxLength={9}
                        disabled={cepLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBuscarCep}
                        disabled={cepLoading || !formularioSetor.cep.trim()}
                      >
                        {cepLoading ? '...' : '🔍'}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="setor-logradouro">Logradouro</Label>
                    <Input
                      id="setor-logradouro"
                      value={formularioSetor.logradouro}
                      onChange={(e) => setFormularioSetor({...formularioSetor, logradouro: e.target.value})}
                      placeholder="Ex: Rua das Flores"
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor-numero">Número</Label>
                    <div className="flex gap-2">
                      <Input
                        id="setor-numero"
                        value={formularioSetor.numero}
                        onChange={(e) => setFormularioSetor({...formularioSetor, numero: e.target.value})}
                        placeholder="Ex: 123"
                        disabled={formularioSetor.semNumero}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="setor-sem-numero"
                          checked={formularioSetor.semNumero || false}
                          onChange={(e) => setFormularioSetor({...formularioSetor, semNumero: e.target.checked, numero: e.target.checked ? 'Sem Numero' : ''})}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="setor-sem-numero" className="text-sm">S/N</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="setor-complemento">Complemento</Label>
                    <Input
                      id="setor-complemento"
                      value={formularioSetor.complemento}
                      onChange={(e) => setFormularioSetor({...formularioSetor, complemento: e.target.value})}
                      placeholder="Ex: Sala 101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor-bairro">Bairro</Label>
                    <Input
                      id="setor-bairro"
                      value={formularioSetor.bairro}
                      onChange={(e) => setFormularioSetor({...formularioSetor, bairro: e.target.value})}
                      placeholder="Ex: Centro"
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor-cidade">Cidade</Label>
                    <Input
                      id="setor-cidade"
                      value={formularioSetor.cidade}
                      onChange={(e) => setFormularioSetor({...formularioSetor, cidade: e.target.value})}
                      placeholder="Ex: Palmas"
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor-estado">Estado</Label>
                    <Select
                      value={formularioSetor.estado || "none"}
                      onValueChange={(value) => setFormularioSetor({...formularioSetor, estado: value === "none" ? "" : value})}
                      disabled={true}
                    >
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue placeholder="Selecionar estado..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecionar estado...</SelectItem>
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Contato</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="setor-telefone">Telefone</Label>
                    <Input
                      id="setor-telefone"
                      value={formularioSetor.telefone}
                      onChange={(e) => setFormularioSetor({...formularioSetor, telefone: e.target.value})}
                      placeholder="Ex: (63) 3218-1234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor-email">Email</Label>
                    <Input
                      id="setor-email"
                      type="email"
                      value={formularioSetor.email}
                      onChange={(e) => setFormularioSetor({...formularioSetor, email: e.target.value})}
                      placeholder="Ex: setor@sefaz.to.gov.br"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Botões de Ação - Fixos no rodapé */}
            <div className="flex items-center justify-between pt-2 border-t mt-auto">
              <div className="flex items-center space-x-2">
                <Label>Setor ativo</Label>
                <Switch
                  checked={formularioSetor.active}
                  onCheckedChange={(checked) =>
                    setFormularioSetor({...formularioSetor, active: checked})
                  }
                  disabled={!setorEditando}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogoNovoSetor(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSalvarSetor}>
                  <Save className="mr-2 h-4 w-4" />
                  {setorEditando ? 'Atualizar' : 'Criar'} Setor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GestaoSetores;