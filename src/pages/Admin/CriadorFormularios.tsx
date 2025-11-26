import { DashboardLayout } from "@/components/DashboardLayout";
import { FormBuilder } from "@/components/FormBuilder";
import { DragDropProvider } from "@/contexts/DragDropContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Settings, Download, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function CriadorFormularios() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'builder' | 'templates'>('builder');

  const recentTemplates = [
    { id: 1, name: "Formulário de Justificativa", category: "Frequência", lastModified: "2024-01-15", status: "ativo" },
    { id: 2, name: "Solicitação de Férias", category: "RH", lastModified: "2024-01-14", status: "ativo" },
    { id: 3, name: "Relatório de Atividades", category: "Chefia", lastModified: "2024-01-13", status: "rascunho" },
    { id: 4, name: "Avaliação de Desempenho", category: "RH", lastModified: "2024-01-12", status: "ativo" },
  ];

  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Criador de Formulários</h1>
            <p className="text-gray-600 mt-1">
              Crie e gerencie formulários personalizados com drag-and-drop
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
            Construtor Visual
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Gerenciar Templates
          </button>
        </div>

        {/* Content */}
        {activeTab === 'builder' ? (
          <DragDropProvider>
            <FormBuilder />
          </DragDropProvider>
        ) : (
          <div className="space-y-6">
            {/* Templates Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-gray-500">+3 este mês</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Templates Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-gray-500">75% do total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Mais Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-gray-500">Justificativas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rascunhos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                  <p className="text-xs text-gray-500">Pendentes</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Templates Recentes
                </CardTitle>
                <CardDescription>
                  Gerencie seus formulários personalizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">
                            {template.category} • Modificado em {template.lastModified}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={template.status === 'ativo' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
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
      </div>
    </DashboardLayout>
  );
}