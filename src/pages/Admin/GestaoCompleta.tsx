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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  UserCheck,
  Settings,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const GestaoCompleta: React.FC = () => {


  // Estatísticas gerais
  const estatisticas: Estatistica[] = [
    {
      titulo: 'Usuários Ativos',
      valor: 245,
      variacao: 12,
      icone: UserCheck,
      cor: 'text-emerald-600',
      descricao: 'Usuários com acesso ativo'
    },
    {
      titulo: 'Aprovações Pendentes',
      valor: 18,
      variacao: -8,
      icone: CheckCircle,
      cor: 'text-blue-600',
      descricao: 'Solicitações aguardando aprovação'
    },
    {
      titulo: 'Relatórios Gerados',
      valor: 156,
      variacao: 23,
      icone: TrendingUp,
      cor: 'text-green-600',
      descricao: 'Relatórios criados no mês'
    },
    {
      titulo: 'Pendências',
      valor: 3,
      variacao: -15,
      icone: AlertTriangle,
      cor: 'text-orange-600',
      descricao: 'Solicitações pendentes'
    }
  ];







  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão Completa</h1>
            <p className="text-gray-600">Gerenciamento completo de usuários, setores e sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-emerald-600">{estatisticas[0].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Usuários com acesso ativo</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <UserCheck className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovações Pendentes</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas[1].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações aguardando aprovação</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Relatórios Gerados</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas[2].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Relatórios criados no mês</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendências</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas[3].valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Solicitações pendentes</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="configuracoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
          </TabsList>




          {/* Tab Configurações */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configure parâmetros gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Configurações Gerais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="mr-2 h-4 w-4" />
                          Parâmetros do Sistema
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="mr-2 h-4 w-4" />
                          Configurações de Segurança
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Clock className="mr-2 h-4 w-4" />
                          Configurações de Ponto
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Manutenção</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Limpar Cache
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Download className="mr-2 h-4 w-4" />
                          Backup Manual
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Upload className="mr-2 h-4 w-4" />
                          Restaurar Backup
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Atividades */}
          <TabsContent value="atividades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>
                  Acompanhe as atividades mais recentes do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { acao: 'Usuário criado', usuario: 'João Silva', tempo: '2 minutos atrás', tipo: 'sucesso' },
                    { acao: 'Setor atualizado', usuario: 'Maria Costa', tempo: '15 minutos atrás', tipo: 'info' },
                    { acao: 'Permissão alterada', usuario: 'Carlos Oliveira', tempo: '1 hora atrás', tipo: 'warning' },
                    { acao: 'Usuário removido', usuario: 'Ana Santos', tempo: '2 horas atrás', tipo: 'erro' }
                  ].map((atividade, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        atividade.tipo === 'sucesso' ? 'bg-green-500' :
                        atividade.tipo === 'info' ? 'bg-blue-500' :
                        atividade.tipo === 'alerta' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{atividade.acao}</p>
                        <p className="text-xs text-muted-foreground">{atividade.usuario}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {atividade.tempo}
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

export default GestaoCompleta;