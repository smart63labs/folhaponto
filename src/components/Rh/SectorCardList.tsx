import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Trash2,
  Search,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';

interface SectorData {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  ativo: boolean;
  orgao?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

interface SectorCardListProps {
  onEdit?: (sector: SectorData) => void;
  onDelete?: (sector: SectorData) => void;
  onView?: (sector: SectorData) => void;
  onImport?: () => void;
  onExport?: () => void;
}

const SectorCardList: React.FC<SectorCardListProps> = ({
  onEdit,
  onDelete,
  onView,
  onImport,
  onExport
}) => {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [orgaoFilter, setOrgaoFilter] = useState('todos');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Carregar setores da API
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/setores');
        if (!response.ok) {
          throw new Error('Erro ao carregar setores');
        }
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error('Erro ao carregar setores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  // Filtrar setores
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = sector.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sector.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sector.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || 
                         (statusFilter === 'ativo' && sector.ativo) ||
                         (statusFilter === 'inativo' && !sector.ativo);
    
    const matchesOrgao = orgaoFilter === 'todos' || sector.orgao === orgaoFilter;
    
    return matchesSearch && matchesStatus && matchesOrgao;
  });

  // Lógica de paginação
  const totalItems = filteredSectors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSectors = filteredSectors.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orgaoFilter]);

  // Funções de navegação
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPage = (page: number) => setCurrentPage(page);

  // Gerar números de páginas para exibição
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Obter lista única de órgãos para filtro
  const orgaos = Array.from(new Set(sectors.map(s => s.orgao).filter(Boolean)));

  const getStatusBadge = (ativo: boolean) => {
    return ativo 
      ? 'bg-green-100 text-green-800 hover:bg-green-200'
      : 'bg-red-100 text-red-800 hover:bg-red-200';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatAddress = (sector: SectorData) => {
    const parts = [];
    if (sector.logradouro) parts.push(sector.logradouro);
    if (sector.numero) parts.push(sector.numero);
    if (sector.bairro) parts.push(sector.bairro);
    if (sector.cidade) parts.push(sector.cidade);
    if (sector.estado) parts.push(sector.estado);
    if (sector.cep) parts.push(`CEP: ${sector.cep}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando setores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de ferramentas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Busca */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar setores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orgaoFilter} onValueChange={setOrgaoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por órgão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os órgãos</SelectItem>
                {orgaos.map(orgao => (
                  <SelectItem key={orgao} value={orgao || ''}>{orgao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Informações de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} setores
        </div>
        <div className="flex items-center gap-2">
          <span>Itens por página:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de Cards */}
      {paginatedSectors.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum setor encontrado</p>
          <p className="text-gray-400 text-sm">Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginatedSectors.map((sector) => (
            <Card key={sector.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 px-3 pt-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {sector.nome}
                    </CardTitle>
                    <div className="flex items-center gap-1 mb-1">
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {sector.codigo}
                      </code>
                      <Badge className={`${getStatusBadge(sector.ativo)} text-xs`}>
                        {sector.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {sector.descricao && (
                  <CardDescription className="text-xs text-gray-600 line-clamp-2">
                    {sector.descricao}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0 px-3 pb-3">
                <div className="space-y-2">
                  {/* Órgão */}
                  {sector.orgao && (
                    <div className="flex items-center gap-1 text-xs">
                      <Building className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{sector.orgao}</span>
                    </div>
                  )}

                  {/* Endereço */}
                  <div className="flex items-start gap-1 text-xs">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 line-clamp-2">
                      {formatAddress(sector)}
                    </span>
                  </div>

                  {/* Contato */}
                  <div className="space-y-1">
                    {sector.telefone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{sector.telefone}</span>
                      </div>
                    )}
                    
                    {sector.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{sector.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Data de criação */}
                  {sector.created_at && (
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500">
                        Criado em {formatDate(sector.created_at)}
                      </span>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex justify-end pt-1 border-t">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(sector)}>
                            <Eye className="w-3 h-3 mr-2" />
                            <span className="text-xs">Ver</span>
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(sector)}>
                            <Edit className="w-3 h-3 mr-2" />
                            <span className="text-xs">Editar</span>
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(sector)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            <span className="text-xs">Excluir</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Primeira página */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
              title="Primeira página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            
            {/* Página anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Números das páginas */}
            <div className="flex gap-1">
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            
            {/* Próxima página */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorCardList;