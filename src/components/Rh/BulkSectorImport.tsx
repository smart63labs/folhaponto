import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Eye, Download } from 'lucide-react';

interface ImportResult {
  success: number;
  errors: string[];
  processed: number;
}

interface PreviewData {
  id: number;
  codigo_setor: string;
  nome_setor: string;
  orgao: string;
  ativo: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  status: string;
  errors: string[];
}

const BulkSectorImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['text/csv', 'text/plain'];
      const allowedExtensions = ['.csv', '.txt'];

      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const isValidType = allowedTypes.includes(file.type);
      const isValidExtension = allowedExtensions.includes(fileExtension);

      if (!isValidType && !isValidExtension) {
        setError('Tipo de arquivo não suportado. Use apenas arquivos .csv ou .txt');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. O tamanho máximo é 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/sectors/bulk-import?preview=true', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no processamento do arquivo');
      }

      const result = await response.json();
      setPreviewData(result.data);
      setShowPreview(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/sectors/bulk-import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na importação');
      }

      const result = await response.json();
      setImportResult(result.results);
      setShowPreview(false);
      setPreviewData(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    setPreviewData(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = `CODIGO_SETOR,NOME_SETOR,ORGAO,ATIVO,LOGRADOURO,NUMERO,COMPLEMENTO,BAIRRO,CIDADE,ESTADO,CEP,TELEFONE,EMAIL
013.DICREFIS,Diretoria da Cobrança e Recup de Créditos Fiscais,Secretaria da Fazenda,1,atualizar endereço,0,complemento do endereço,CENTRO,PALMAS,TO,77062048,63 - 1234-5678,atualizar_email@sefaz.to.gov.br`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_setores.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importação em Lote de Setores
        </CardTitle>
        <CardDescription>
          Importe múltiplos setores através de arquivo CSV ou TXT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <h4 className="font-medium text-blue-900">Template de Importação</h4>
            <p className="text-sm text-blue-700">
              Baixe o template com o formato correto dos dados
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <FileText className="w-4 h-4 mr-2" />
            Baixar Template
          </Button>
        </div>

        {/* File Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Selecione o arquivo (.csv ou .txt)
          </label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectedFile ? selectedFile.name : 'Selecionar Arquivo'}
            </Button>
            {selectedFile && (
              <Button variant="ghost" onClick={clearFile} disabled={isUploading}>
                <XCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>

        {/* Preview Button */}
        {!showPreview && (
          <Button
            onClick={handlePreview}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isUploading ? 'Processando...' : 'Visualizar Dados'}
          </Button>
        )}

        {/* Confirm Import Button */}
        {showPreview && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={isUploading}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {isUploading ? 'Importando...' : 'Confirmar Importação'}
            </Button>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center text-gray-600">
              Processando arquivo...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Preview Grid */}
        {showPreview && previewData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview dos Dados ({previewData.length} registros)</CardTitle>
              <CardDescription>
                Verifique se os dados foram carregados corretamente antes de confirmar a importação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Orgão</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-sm">{row.id}</TableCell>
                        <TableCell className="font-mono">{row.codigo_setor}</TableCell>
                        <TableCell>{row.nome_setor}</TableCell>
                        <TableCell>{row.orgao}</TableCell>
                        <TableCell>
                          <Badge variant={row.ativo === '1' ? 'default' : 'secondary'}>
                            {row.ativo === '1' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.logradouro && `${row.logradouro}, ${row.numero}`}
                          {row.complemento && ` - ${row.complemento}`}
                        </TableCell>
                        <TableCell>{row.cidade}/{row.estado}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Result */}
        {importResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Importação concluída!</p>
                <div className="text-sm space-y-1">
                  <p>✓ Registros processados: {importResult.processed}</p>
                  <p>✓ Registros importados: {importResult.success}</p>
                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="text-orange-600">⚠ Erros encontrados: {importResult.errors.length}</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Ver detalhes dos erros</summary>
                        <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                          {importResult.errors.map((error, index) => (
                            <li key={index} className="text-red-600">{error}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <h4 className="font-medium">Instruções:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>O arquivo deve conter as colunas na ordem: CODIGO_SETOR, NOME_SETOR, ORGAO, ATIVO, LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, ESTADO, CEP, TELEFONE, EMAIL</li>
            <li>A primeira linha deve ser o cabeçalho</li>
            <li>Para ATIVO, use 1 para ativo ou 0 para inativo</li>
            <li>Campos obrigatórios: CODIGO_SETOR e NOME_SETOR</li>
            <li>Tamanho máximo do arquivo: 5MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkSectorImport;