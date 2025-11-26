import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Upload, X, File, Send } from 'lucide-react';

interface OccurrenceFormProps {
  onSubmit: (data: any) => void;
}

export const OccurrenceForm: React.FC<OccurrenceFormProps> = ({ onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para o modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  const [formData, setFormData] = useState({
    tipo: '',
    data: '',
    horarioOriginal: '',
    novoHorario: '',
    motivo: '',
    justificativa: '',
    anexos: [] as File[]
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setModalTitle("Tipo de arquivo inválido");
        setModalMessage("Apenas PDF, JPG e PNG são permitidos.");
        setModalType('error');
        setModalOpen(true);
        return false;
      }
      
      if (file.size > maxSize) {
        setModalTitle("Arquivo muito grande");
        setModalMessage("O arquivo deve ter no máximo 5MB.");
        setModalType('error');
        setModalOpen(true);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        anexos: [...prev.anexos, ...validFiles]
      }));
      
      setModalTitle("Arquivos adicionados");
      setModalMessage(`${validFiles.length} arquivo(s) adicionado(s) com sucesso.`);
      setModalType('success');
      setModalOpen(true);
    }
  };

  const removeAnexo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.data || !formData.motivo || !formData.justificativa) {
      setModalTitle("Campos obrigatórios");
      setModalMessage("Preencha todos os campos obrigatórios.");
      setModalType('error');
      setModalOpen(true);
      return;
    }

    if (formData.tipo === 'ajuste_ponto' && (!formData.horarioOriginal || !formData.novoHorario)) {
      setModalTitle("Horários obrigatórios");
      setModalMessage("Para ajuste de ponto, informe o horário original e o novo horário.");
      setModalType('error');
      setModalOpen(true);
      return;
    }

    onSubmit(formData);
    
    // Limpar formulário
    setFormData({
      tipo: '',
      data: '',
      horarioOriginal: '',
      novoHorario: '',
      motivo: '',
      justificativa: '',
      anexos: []
    });

    setModalTitle("Solicitação enviada");
    setModalMessage("Sua solicitação foi enviada com sucesso e está aguardando aprovação.");
    setModalType('success');
    setModalOpen(true);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ajuste_ponto': 'Ajuste de Ponto',
      'justificativa_falta': 'Justificativa de Falta',
      'justificativa_atraso': 'Justificativa de Atraso'
    };
    return labels[tipo] || tipo;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Solicitação</CardTitle>
        <CardDescription>
          Preencha os dados para solicitar um ajuste ou justificativa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primeira linha: Tipo e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="tipo">Tipo de Solicitação *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleInputChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ajuste_ponto">Ajuste de Ponto</SelectItem>
                  <SelectItem value="justificativa_falta">Justificativa de Falta</SelectItem>
                  <SelectItem value="justificativa_atraso">Justificativa de Atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="data">Data da Ocorrência *</Label>
              <Input
                type="date"
                id="data"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Horários (apenas para ajuste de ponto) */}
          {formData.tipo === 'ajuste_ponto' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="horarioOriginal">Horário Original *</Label>
                <Input
                  type="time"
                  id="horarioOriginal"
                  value={formData.horarioOriginal}
                  onChange={(e) => handleInputChange('horarioOriginal', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="novoHorario">Novo Horário *</Label>
                <Input
                  type="time"
                  id="novoHorario"
                  value={formData.novoHorario}
                  onChange={(e) => handleInputChange('novoHorario', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Motivo */}
          <div className="space-y-1">
            <Label htmlFor="motivo">Motivo *</Label>
            <Select
              value={formData.motivo}
              onValueChange={(value) => handleInputChange('motivo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="esquecimento">Esquecimento</SelectItem>
                <SelectItem value="problema_tecnico">Problema Técnico</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="transito">Trânsito</SelectItem>
                <SelectItem value="saude">Questões de Saúde</SelectItem>
                <SelectItem value="emergencia">Emergência</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justificativa */}
          <div className="space-y-1">
            <Label htmlFor="justificativa">Justificativa Detalhada *</Label>
            <Textarea
              id="justificativa"
              placeholder="Descreva detalhadamente a situação..."
              value={formData.justificativa}
              onChange={(e) => handleInputChange('justificativa', e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload de Anexos */}
          <div className="space-y-1">
            <Label>Anexos (Opcional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Selecionar Arquivos
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG ou PNG até 5MB cada
                </p>
              </div>
            </div>

            {/* Lista de Anexos */}
            {formData.anexos.length > 0 && (
              <div className="space-y-1 mt-2">
                <Label className="text-xs">Arquivos Selecionados:</Label>
                {formData.anexos.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <File className="w-3 h-3" />
                      <span className="text-xs">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnexo(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Envio */}
          <Button type="submit" className="w-full mt-4">
            <Send className="w-4 h-4 mr-2" />
            Enviar Solicitação
          </Button>
        </form>
      </CardContent>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        showConfirmButton={false}
      />
    </Card>
  );
};