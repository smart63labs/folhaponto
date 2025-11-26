import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download,
  Trash2,
  Eye,
  Calendar,
  Users,
  FileCheck,
  X
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function UploadFrequencia() {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [observations, setObservations] = useState("");

  // Dados mockados de uploads anteriores
  const uploadsHistorico = [
    {
      id: 1,
      arquivo: "frequencia_janeiro_2024.pdf",
      mes: "Janeiro",
      ano: "2024",
      dataUpload: "2024-02-05",
      status: "processado",
      funcionarios: 15,
      observacoes: "Upload completo sem inconsistências",
      tamanho: "2.5 MB"
    },
    {
      id: 2,
      arquivo: "frequencia_dezembro_2023.pdf",
      mes: "Dezembro",
      ano: "2023",
      dataUpload: "2024-01-08",
      status: "processando",
      funcionarios: 14,
      observacoes: "Processamento em andamento",
      tamanho: "3.1 MB"
    },
    {
      id: 3,
      arquivo: "frequencia_novembro_2023.pdf",
      mes: "Novembro",
      ano: "2023",
      dataUpload: "2023-12-05",
      status: "erro",
      funcionarios: 0,
      observacoes: "Erro na leitura do arquivo - formato inválido",
      tamanho: "1.8 MB"
    },
    {
      id: 4,
      arquivo: "frequencia_outubro_2023.pdf",
      mes: "Outubro",
      ano: "2023",
      dataUpload: "2023-11-03",
      status: "processado",
      funcionarios: 16,
      observacoes: "Upload processado com sucesso",
      tamanho: "2.9 MB"
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedMonth || !selectedYear) {
      alert("Por favor, selecione os arquivos e preencha todos os campos obrigatórios.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simular upload com progresso
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          alert("Upload realizado com sucesso!");
          setSelectedFiles([]);
          setObservations("");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processado':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Processado</Badge>;
      case 'processando':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Processando</Badge>;
      case 'erro':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const anos = ["2024", "2023", "2022", "2021"];

  return (
    <DashboardLayout userRole={user?.role || 'servidor'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload de Frequência</h1>
            <p className="text-gray-600 mt-1">
              Upload de formulários físicos de frequência - {user?.department}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Modelo de Formulário
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Instruções
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                  <p className="text-3xl font-bold text-blue-600">{uploadsHistorico.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Arquivos enviados</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processados</p>
                  <p className="text-3xl font-bold text-green-600">
                    {uploadsHistorico.filter(u => u.status === 'processado').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Com sucesso</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processando</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {uploadsHistorico.filter(u => u.status === 'processando').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Em andamento</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Funcionários</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {uploadsHistorico.reduce((acc, u) => acc + u.funcionarios, 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total processados</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Novo Upload de Frequência
            </CardTitle>
            <CardDescription>
              Faça upload dos formulários físicos de frequência da sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mes">Mês de Referência *</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano de Referência *</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Upload de Arquivos */}
            <div className="space-y-4">
              <Label>Arquivos de Frequência *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Clique para selecionar arquivos ou arraste aqui
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PDF, JPG, PNG até 10MB cada
                    </span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Lista de Arquivos Selecionados */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Selecionados:</Label>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Adicione observações sobre este upload (opcional)"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />
            </div>

            {/* Progresso do Upload */}
            {isUploading && (
              <div className="space-y-2">
                <Label>Progresso do Upload</Label>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600">{uploadProgress}% concluído</p>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || selectedFiles.length === 0}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedFiles([]);
                  setObservations("");
                  setSelectedMonth("");
                  setSelectedYear("");
                }}
                disabled={isUploading}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Histórico de Uploads
            </CardTitle>
            <CardDescription>
              Acompanhe o status dos uploads realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Data Upload</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Funcionários</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadsHistorico.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="font-medium">{upload.arquivo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {upload.mes}/{upload.ano}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(upload.dataUpload).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(upload.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{upload.funcionarios}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{upload.tamanho}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {upload.observacoes}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
                          </Button>
                          {upload.status === 'erro' && (
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Instruções para Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Formatos Aceitos:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>PDF (recomendado para formulários escaneados)</li>
                  <li>JPG/JPEG (para fotos dos formulários)</li>
                  <li>PNG (para imagens de alta qualidade)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Requisitos:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Tamanho máximo: 10MB por arquivo</li>
                  <li>Resolução mínima: 300 DPI para melhor leitura</li>
                  <li>Formulários devem estar legíveis e completos</li>
                  <li>Um arquivo por funcionário ou consolidado por setor</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Processamento:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Os arquivos são processados automaticamente após o upload</li>
                  <li>O sistema extrai as informações de frequência dos formulários</li>
                  <li>Inconsistências são reportadas para revisão manual</li>
                  <li>Você receberá notificação quando o processamento for concluído</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}