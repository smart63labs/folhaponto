import { DashboardLayout } from "@/components/DashboardLayout";
import { FormBuilder } from "@/components/FormBuilder";
import { DragDropProvider } from "@/contexts/DragDropContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Users, Clock, Calendar, Download, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function CriadorFormulariosRH() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'analytics'>('builder');

  const rhTemplates = [
    { id: 1, name: "Avaliação de Desempenho", category: "Avaliação", usage: 45, lastUsed: "2024-01-15", status: "ativo" },
    { id: 2, name: "Solicitação de Férias", category: "Licenças", usage: 89, lastUsed: "2024-01-15", status: "ativo" },
    { id: 3, name: "Formulário de Admissão", category: "Admissão", usage: 12, lastUsed: "2024-01-14", status: "ativo" },
    { id: 4, name: "Pesquisa de Clima", category: "Pesquisa", usage: 156, lastUsed: "2024-01-13", status: "ativo" },
    { id: 5, name: "Justificativa de Ponto", category: "Frequência", usage: 78, lastUsed: "2024-01-12", status: "ativo" },
  ];

  const templateCategories = [
    { name: "Avaliação", count: 8, color: "bg-blue-100 text-blue-800" },
    { name: "Licenças", count: 12, color: "bg-green-100 text-green-800" },
    { name: "Admissão", count: 6, color: "bg-purple-100 text-purple-800" },
    { name: "Frequência", count: 15, color: "bg-orange-100 text-orange-800" },
    { name: "Pesquisa", count: 4, color: "bg-pink-100 text-pink-800" },
  ];

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Formulários RH</h1>
            <p className="text-gray-600 mt-1">
              Crie formulários específicos para gestão de recursos humanos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar Template
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Formulário RH
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
            <Users className="w-4 h-4 inline mr-2" />
            Templates RH
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Análises
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
                  Organize seus formulários por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {templateCategories.map((category) => (
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
                  <FileText className="w-5 h-5" />
                  Templates de RH
                </CardTitle>
                <CardDescription>
                  Formulários específicos para recursos humanos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rhTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">
                            {template.category} • {template.usage} usos • Último uso: {template.lastUsed}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default">
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Formulários Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-gray-500">+5 este mês</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Respostas Coletadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-gray-500">+89 esta semana</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-gray-500">+2% vs mês anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tempo Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.2min</div>
                  <p className="text-xs text-gray-500">-0.3min vs média</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Uso</CardTitle>
                <CardDescription>
                  Estatísticas de utilização dos formulários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Gráficos de análise serão implementados aqui</p>
                    <p className="text-sm">Incluindo: uso por período, formulários mais populares, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}