import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sector } from '../../../types/sector';
import { User } from '../../../types';
import { 
  FiX, 
  FiSave, 
  FiUser, 
  FiHome, 
  FiMapPin, 
  FiPhone, 
  FiGlobe 
} from 'react-icons/fi';
import './SectorForm.css';

interface SectorFormProps {
  sector?: Sector | null;
  sectors: Sector[];
  users?: User[];
  onSave: (sector: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'> | { id: string; changes: Partial<Sector> }) => Promise<void>;
  onCancel: () => void;
}

export const SectorForm: React.FC<SectorFormProps> = ({
  sector,
  sectors,
  users = [],
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parentId: '',
    managerId: '',
    description: '',
    active: true,
    // Campos de endereço e contato
    orgao: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    latitude: '',
    longitude: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Preencher formulário quando setor for selecionado para edição
  useEffect(() => {
    if (sector) {
      setFormData({
        name: sector.name,
        code: sector.code,
        parentId: sector.parentId || '',
        managerId: sector.managerId || '',
        description: sector.description || '',
        active: sector.active,
        orgao: sector.orgao || '',
        logradouro: sector.logradouro || '',
        numero: sector.numero || '',
        complemento: sector.complemento || '',
        bairro: sector.bairro || '',
        cidade: sector.cidade || '',
        estado: sector.estado || '',
        cep: sector.cep || '',
        telefone: sector.telefone || '',
        email: sector.email || '',
        latitude: sector.latitude?.toString() || '',
        longitude: sector.longitude?.toString() || ''
      });
    }
  }, [sector]);

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    } else {
      // Verificar se código já existe (exceto para o setor atual)
      const existingCode = (sectors || []).find(s => 
        s.code.toLowerCase() === formData.code.toLowerCase() && 
        s.id !== sector?.id
      );
      if (existingCode) {
        newErrors.code = 'Este código já está em uso';
      }
    }

    // Verificar se pai não é o próprio setor ou um descendente
    if (formData.parentId && sector) {
      if (formData.parentId === sector.id) {
        newErrors.parentId = 'Um setor não pode ser pai de si mesmo';
      } else {
        // Verificar se não está criando um ciclo
        const isDescendant = (parentId: string, childId: string): boolean => {
          const child = (sectors || []).find(s => s.id === childId);
          if (!child || !child.parentId) return false;
          if (child.parentId === parentId) return true;
          return isDescendant(parentId, child.parentId);
        };

        if (isDescendant(sector.id, formData.parentId)) {
          newErrors.parentId = 'Não é possível criar uma hierarquia circular';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const sectorData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        parentId: formData.parentId || null,
        managerId: formData.managerId || null,
        description: formData.description.trim() || null,
        active: formData.active,
        orgao: formData.orgao.trim() || null,
        logradouro: formData.logradouro.trim() || null,
        numero: formData.numero.trim() || null,
        complemento: formData.complemento.trim() || null,
        bairro: formData.bairro.trim() || null,
        cidade: formData.cidade.trim() || null,
        estado: formData.estado || null,
        cep: formData.cep.trim() || null,
        telefone: formData.telefone.trim() || null,
        email: formData.email.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (sector) {
        // Edição
        await onSave({ id: sector.id, changes: sectorData });
      } else {
        // Criação
        await onSave(sectorData);
      }

      onCancel();
    } catch (error) {
      console.error('Erro ao salvar setor:', error);
      alert('Erro ao salvar setor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Obter setores disponíveis como pais (excluindo o próprio setor e seus descendentes)
  const availableParents = (sectors || []).filter(s => {
    if (!sector) return true; // Para novo setor, todos são válidos
    if (s.id === sector.id) return false; // Não pode ser pai de si mesmo
    
    // Verificar se não é descendente
    const isDescendant = (parentId: string, childId: string): boolean => {
      const child = (sectors || []).find(sec => sec.id === childId);
      if (!child || !child.parentId) return false;
      if (child.parentId === parentId) return true;
      return isDescendant(parentId, child.parentId);
    };

    return !isDescendant(sector.id, s.id);
  });

  // Obter usuários disponíveis como chefes (role 'chefia' ou 'admin')
  const availableManagers = (users || []).filter(u => 
    u.role === 'chefia' || u.role === 'admin'
  );

  return createPortal(
    <div className="sector-form-modal">
      <div className="modal-overlay">
        <div className="modal-content sector-form" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{sector ? 'Editar Setor' : 'Novo Setor'}</h3>
            <button 
              className="close-button"
              onClick={onCancel}
              disabled={isLoading}
              type="button"
            >
              <FiX />
            </button>
          </div>

        <form onSubmit={handleSubmit} className={`form ${isLoading ? 'loading' : ''}`}>
          
          {/* Seção Principal */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="required">Nome do Setor</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'error' : ''}
                  disabled={isLoading}
                  placeholder="Ex: Diretoria de Tecnologia"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="code" className="required">Código</label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className={errors.code ? 'error' : ''}
                  disabled={isLoading}
                  placeholder="Ex: DITEC"
                  maxLength={10}
                />
                {errors.code && <span className="error-message">{errors.code}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="parentId">Setor Pai</label>
                <select
                  id="parentId"
                  value={formData.parentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                  className={errors.parentId ? 'error' : ''}
                  disabled={isLoading}
                >
                  <option value="">Nenhum (Setor raiz)</option>
                  {availableParents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                {errors.parentId && <span className="error-message">{errors.parentId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="managerId">Chefe do Setor</label>
                <select
                  id="managerId"
                  value={formData.managerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="">Selecionar chefe...</option>
                  {availableManagers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Descrição opcional do setor..."
                  rows={3}
                />
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    disabled={isLoading}
                  />
                  Setor ativo
                </label>
              </div>
            </div>
          </div>

          {/* Seção de Informações do Órgão */}
          <div className="form-section">
            <h4><FiHome /> Informações do Órgão</h4>
            <div className="form-row single">
              <div className="form-group">
                <label htmlFor="orgao">Órgão</label>
                <input
                  id="orgao"
                  type="text"
                  value={formData.orgao}
                  onChange={(e) => setFormData(prev => ({ ...prev, orgao: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: Secretaria da Fazenda"
                />
              </div>
            </div>
          </div>

          {/* Seção de Endereço */}
          <div className="form-section">
            <h4><FiMapPin /> Endereço</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="logradouro">Logradouro</label>
                <input
                  id="logradouro"
                  type="text"
                  value={formData.logradouro}
                  onChange={(e) => setFormData(prev => ({ ...prev, logradouro: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: Rua das Flores"
                />
              </div>

              <div className="form-group">
                <label htmlFor="numero">Número</label>
                <input
                  id="numero"
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: 123"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="complemento">Complemento</label>
                <input
                  id="complemento"
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: Sala 101"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bairro">Bairro</label>
                <input
                  id="bairro"
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: Centro"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cidade">Cidade</label>
                <input
                  id="cidade"
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: Palmas"
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="">Selecionar estado...</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cep">CEP</label>
                <input
                  id="cep"
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: 77001-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Seção de Contato */}
          <div className="form-section">
            <h4><FiPhone /> Contato</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: (63) 3218-1234"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: setor@sefaz.to.gov.br"
                />
              </div>
            </div>
          </div>

          {/* Seção de Localização */}
          <div className="form-section">
            <h4><FiGlobe /> Localização (GPS)</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: -10.184"
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Ex: -48.333"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn-save"
              disabled={isLoading}
            >
              <FiSave />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>,
    document.body
  );
};