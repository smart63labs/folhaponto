import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Clock, 
  Home, 
  GraduationCap,
  Edit,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building,
  Calendar,
  Save,
  X
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, WorkMode } from '@/types';
import { InternScheduleForm } from './InternScheduleForm';
import { internService } from '@/services/internService';

interface FlexibleUser extends User {
  isFlexibleSchedule?: boolean;
  workMode?: WorkMode;
  internshipEndDate?: string;
  internshipHours?: number;
  flexibleReason?: string;
  approvedBy?: string;
  approvalDate?: string;
}

interface FlexibleScheduleManagerProps {
  users: FlexibleUser[];
  onUpdateUser: (userId: string, updates: Partial<FlexibleUser>) => void;
}

export const FlexibleScheduleManager: React.FC<FlexibleScheduleManagerProps> = ({
  users,
  onUpdateUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterWorkMode, setFilterWorkMode] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<FlexibleUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FlexibleUser>>({});

  // Filtrar usuários que são chefias ou têm horário flexível
  const flexibleUsers = (users || []).filter(user => 
    user.role === 'chefia' || user.isFlexibleSchedule || user.role === 'estagiario'
  );

  // Aplicar filtros
  const filteredUsers = flexibleUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesWorkMode = filterWorkMode === 'all' || user.workMode === filterWorkMode;
    
    return matchesSearch && matchesRole && matchesWorkMode;
  });

  const handleEditUser = (user: FlexibleUser) => {
    setSelectedUser(user);
    setFormData({
      isFlexibleSchedule: user.isFlexibleSchedule,
      workMode: user.workMode,
      internshipEndDate: user.internshipEndDate,
      internshipHours: user.internshipHours,
      flexibleReason: user.flexibleReason
    });
    setIsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedUser) {
      onUpdateUser(selectedUser.id, {
        ...formData,
        approvedBy: 'Sistema',
        approvalDate: new Date().toISOString()
      });
      setIsDialogOpen(false);
      setSelectedUser(null);
      setFormData({});
    }
  };

  const getWorkModeIcon = (workMode?: WorkMode) => {
    switch (workMode) {
      case 'home_office':
        return <Home className="h-4 w-4" />;
      case 'hibrido':
        return <Building className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getWorkModeLabel = (workMode?: WorkMode) => {
    switch (workMode) {
      case 'home_office':
        return 'Home Office';
      case 'hibrido':
        return 'Híbrido';
      case 'presencial':
        return 'Presencial';
      default:
        return 'Não definido';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'chefia':
        return 'Chefia';
      case 'estagiario':
        return 'Estagiário';
      case 'servidor':
        return 'Servidor';
      case 'rh':
        return 'RH';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'chefia':
        return 'bg-purple-100 text-purple-800';
      case 'estagiario':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'rh':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestão de Horários Flexíveis
          </CardTitle>
          <CardDescription>
            Gerencie chefias com horário flexível, servidores em home-office e estagiários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Label htmlFor="filterRole">Filtrar por tipo</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="chefia">Chefias</SelectItem>
                  <SelectItem value="estagiario">Estagiários</SelectItem>
                  <SelectItem value="servidor">Servidores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <Label htmlFor="filterWorkMode">Modo de trabalho</Label>
              <Select value={filterWorkMode} onValueChange={setFilterWorkMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os modos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os modos</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="home_office">Home Office</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chefias</p>
                    <p className="text-2xl font-bold">
                      {flexibleUsers.filter(u => u.role === 'chefia').length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Home Office</p>
                    <p className="text-2xl font-bold">
                      {flexibleUsers.filter(u => u.workMode === 'home_office').length}
                    </p>
                  </div>
                  <Home className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Estagiários</p>
                    <p className="text-2xl font-bold">
                      {flexibleUsers.filter(u => u.role === 'estagiario').length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Horário Flexível</p>
                    <p className="text-2xl font-bold">
                      {flexibleUsers.filter(u => u.isFlexibleSchedule).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de usuários */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Modo de Trabalho</TableHead>
                  <TableHead>Horário Flexível</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getWorkModeIcon(user.workMode)}
                        <span>{getWorkModeLabel(user.workMode)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isFlexibleSchedule ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.setor || user.department}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Horário Flexível</DialogTitle>
            <DialogDescription>
              Configure as opções de horário flexível para {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="flexible"
                checked={formData.isFlexibleSchedule || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isFlexibleSchedule: checked }))
                }
              />
              <Label htmlFor="flexible">Horário flexível ativo</Label>
            </div>

            <div>
              <Label htmlFor="workMode">Modo de trabalho</Label>
              <Select 
                value={formData.workMode || 'presencial'} 
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, workMode: value as WorkMode }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="home_office">Home Office</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUser?.role === 'estagiario' && (
              <>
                <div>
                  <Label htmlFor="internshipHours">Horas diárias do estágio</Label>
                  <Input
                    id="internshipHours"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.internshipHours || ''}
                    onChange={(e) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        internshipHours: parseInt(e.target.value) || undefined 
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="internshipEndDate">Data de término do estágio</Label>
                  <Input
                    id="internshipEndDate"
                    type="date"
                    value={formData.internshipEndDate || ''}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, internshipEndDate: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="flexibleReason">Justificativa</Label>
              <Textarea
                id="flexibleReason"
                placeholder="Motivo para horário flexível..."
                value={formData.flexibleReason || ''}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, flexibleReason: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveChanges}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlexibleScheduleManager;