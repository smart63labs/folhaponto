import { DashboardLayout } from "@/components/DashboardLayout";
import { FormBuilder } from "@/components/FormBuilder";
import { DragDropProvider } from "@/contexts/DragDropContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Users, ClipboardList, Calendar, Download, Upload, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function CriadorFormulariosChefia() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'team'>('builder');

  const chefiaTemplates = [
    { id: 1, name: "Avaliação de Equipe", category: "Avaliação", teamUsage: 12, lastUsed: "2024-01-15", status: "ativo" },
    { id: 2, name: "Relatório de Atividades", category: "Relatório", teamUsage: 8, lastUsed: "2024-01-14", status: "ativo" },
    { id: 3, name: "Solicitação de Recursos", category: "Recursos", teamUsage: 5, lastUsed: "2024-01-13", status: "ativo" },
    { id: 4, name: "Feedback de Projeto", category: "Feedback", teamUsage: 15, lastUsed: "2024-01-12", status: "ativo" },
    { id: 5, name: "Planejamento Mensal", category: "Planejamento", teamUsage: 3, lastUsed: "2024-01-11", status: "rascunho" },
  ];

  const teamMembers = [
    { id: 1, name: "João Silva", role: "Analista", formsCompleted: 12, pendingForms: 2 },
    { id: 2, name: "Ana Costa", role: "Especialista", formsCompleted: 15, pendingForms: 1 },
    { id: 3, name: "Carlos Santos", role: "Técnico", formsCompleted: 8, pendingForms: 3 },
    { id: 4, name: "Maria Oliveira", role: "Analista", formsCompleted: 10, pendingForms: 1 },
  ];

  const formCategories = [
    { name: "Avaliação", count: 5, color: "bg-blue-100 text-blue-800" },
    { name: "Relatório", count: 8, color: "bg-green-100 text-green-800" },
    { name: "Feedback", count: 3, color: "bg-purple-100 text-purple-800" },
    { name: "Planejamento", count: 4, color: "bg-orange-100 text-orange-800" },
  ];

  return (
    <DashboardLayout userRole={user?.role || 'chefia'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Formulários da Chefia</h1>
            <p className="text-gray-600 mt-1">
              Crie formulários para gestão e avaliação da sua equipe
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar Template
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Formulário
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'builder'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Construtor
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            Meus Templates
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'team'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Equipe
          </button>
        </div>

        {/* Content */}
        {activeTab === 'builder' && (
          <DragDropProvider>
            <FormBuilder />
          </DragDropProvider>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias de Formulários</CardTitle>
                <CardDescription>
                  Organize seus formulários por tipo de atividade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formCategories.map((category) => (
                    <div key={category.name} className="text-center">
                      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${category.color}`}>
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{category.count} templates</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Templates List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Templates da Chefia
                </CardTitle>
                <CardDescription>
                  Formulários para gestão e avaliação de equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chefiaTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">
                            {template.category} • {template.teamUsage} usos pela equipe • Último uso: {template.lastUsed}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={template.status === 'ativo' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Team Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Membros da Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <p className="text-xs text-gray-500">Ativos</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Formulários Enviados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamMembers.reduce((acc, member) => acc + member.formsCompleted, 0)}
                  </div>
                  <p className="text-xs text-gray-500">Este mês</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamMembers.reduce((acc, member) => acc + member.pendingForms, 0)}
                  </div>
                  <p className="text-xs text-gray-500">Para revisar</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-gray-500">Média da equipe</p>
                </CardContent>
              </Card>
            </div>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Status da Equipe
                </CardTitle>
                <CardDescription>
                  Acompanhe o progresso dos formulários da sua equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{member.formsCompleted} concluídos</div>
                          <div className="text-sm text-gray-600">{member.pendingForms} pendentes</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}