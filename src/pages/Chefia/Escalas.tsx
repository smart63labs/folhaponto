import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Plus,
  Edit,
  Eye,
  FileText,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Upload,
  Filter,
  Search,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { AdicionarEscala } from "@/components/Chefia/AdicionarEscala";
import { ConfigurarRegras } from "@/components/Chefia/ConfigurarRegras";
import { EditarPublicarEscala } from "@/components/Chefia/EditarPublicarEscala";
import { CriarEscalaAvancada } from "@/components/Chefia/CriarEscalaAvancada";
import { useAuth } from "@/contexts/AuthContext";

type Turno = 'Manhã' | 'Tarde' | 'Noite';

interface Escala {
  id: string;
  equipe: string;
  data: string; // ISO date
  turno: Turno;
  status: 'ativa' | 'planejada' | 'concluída';
}

export function Escalas() {
  const { user } = useAuth();
  const [novaEscala, setNovaEscala] = useState({
    data: '',
    equipe: '',
    turno: ''
  });
  const [isAdicionarEscalaOpen, setIsAdicionarEscalaOpen] = useState(false);
  const [isConfigurarRegrasOpen, setIsConfigurarRegrasOpen] = useState(false);
  const [isEditarPublicarOpen, setIsEditarPublicarOpen] = useState(false);
  const [isCriarEscalaAvancadaOpen, setIsCriarEscalaAvancadaOpen] = useState(false);

  const [escalas, setEscalas] = useState<Escala[]>([
    { id: '1', equipe: 'Equipe A', data: '2025-01-28', turno: 'Manhã', status: 'ativa' },
    { id: '2', equipe: 'Equipe B', data: '2025-01-28', turno: 'Tarde', status: 'planejada' },
    { id: '3', equipe: 'Equipe A', data: '2025-01-29', turno: 'Noite', status: 'concluída' },
  ]);

  const adicionarEscala = () => {
    if (!novaEscala.data) return;
    const nova: Escala = {
      id: String(Date.now()),
      data: novaEscala.data,
      equipe: novaEscala.equipe,
      turno: novaEscala.turno as Turno,
      status: 'planejada',
    };
    setEscalas(prev => [nova, ...prev]);
    setNovaEscala({ data: '', equipe: 'Equipe A', turno: 'Manhã' });
  };

  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escalas</h1>
            <p className="text-gray-600 mt-1">Gerencie turnos e escalas da sua equipe</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsConfigurarRegrasOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Configurar Regras
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCriarEscalaAvancadaOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Escala Avançada
            </Button>
            <Button variant="default" size="sm" onClick={() => setIsAdicionarEscalaOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Escala
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Escalas</p>
                  <p className="text-3xl font-bold text-blue-600">{escalas.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Escalas cadastradas</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalas Ativas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {escalas.filter(e => e.status === 'ativa').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Em vigor atualmente</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalas Planejadas</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {escalas.filter(e => e.status === 'planejada').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Agendadas para futuro</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalas Concluídas</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {escalas.filter(e => e.status === 'concluída').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Finalizadas</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Criar Nova Escala */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Criar nova escala
            </CardTitle>
            <CardDescription>
              Defina data, equipe e turno ou use a <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 hover:text-blue-800"
                onClick={() => setIsCriarEscalaAvancadaOpen(true)}
              >
                Escala Avançada
              </Button> com arrastar e soltar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={novaEscala.data}
                  onChange={(e) => setNovaEscala(s => ({ ...s, data: e.target.value }))}
                />
              </div>
              <div>
                <Label>Equipe</Label>
                <Select value={novaEscala.equipe} onValueChange={(val) => setNovaEscala(s => ({ ...s, equipe: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipe A">Equipe A</SelectItem>
                    <SelectItem value="Equipe B">Equipe B</SelectItem>
                    <SelectItem value="Equipe C">Equipe C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Turno</Label>
                <Select value={novaEscala.turno} onValueChange={(val: Turno) => setNovaEscala(s => ({ ...s, turno: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={adicionarEscala}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escalas Atuais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Escalas cadastradas
            </CardTitle>
            <CardDescription>Liste e gerencie as escalas existentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalas.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium">{new Date(e.data).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-gray-500">ID: {e.id}</div>
                    </TableCell>
                    <TableCell>{e.equipe}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {e.turno}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={e.status === 'ativa' ? 'default' : e.status === 'planejada' ? 'secondary' : 'outline'}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsEditarPublicarOpen(true)}>
                          Editar
                        </Button>
                        <Button size="sm" onClick={() => setIsEditarPublicarOpen(true)}>
                          Publicar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
            <CardDescription>Atalhos úteis para gestão de escalas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">Associar Equipes</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <ClipboardList className="w-6 h-6" />
                <span className="text-sm">Templates de Escala</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <CheckCircle className="w-6 h-6" />
                <span className="text-sm">Validar Escalas</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Visão Calendário</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modais - Temporariamente removidos para evitar erros de compilação */}
    </DashboardLayout>
  );
}

export default Escalas;