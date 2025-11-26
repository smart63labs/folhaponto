import React, { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Sector, HierarchyNode, HierarchyOperation } from '../../../types/sector';
import { SectorNode } from './SectorNode';
import { SectorForm } from './SectorForm';
import { HierarchyValidation } from './HierarchyValidation';
import { FiPlus, FiSave, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import './SectorHierarchy.css';

interface SectorHierarchyBuilderProps {
  sectors: Sector[];
  onSave: (operations: HierarchyOperation[]) => Promise<void>;
  onCreateSector: (sector: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateSector: (sectorId: string, changes: Partial<Sector>) => Promise<void>;
  onDeleteSector: (sectorId: string) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export const SectorHierarchyBuilder: React.FC<SectorHierarchyBuilderProps> = ({
  sectors = [],
  onSave,
  onCreateSector,
  onUpdateSector,
  onDeleteSector,
  isLoading = false,
  readOnly = false
}) => {
  const [localSectors, setLocalSectors] = useState<Sector[]>(sectors || []);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<HierarchyOperation[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Construir hierarquia a partir da lista plana de setores
  const hierarchy = useMemo(() => {
    if (!localSectors || localSectors.length === 0) {
      return [];
    }

    const buildHierarchy = (parentId?: string, level = 0): HierarchyNode[] => {
      return localSectors
        .filter(sector => sector.parentId === parentId)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map(sector => ({
          sector: {
            ...sector,
            children: localSectors.filter(child => child.parentId === sector.id)
          },
          children: buildHierarchy(sector.id, level + 1),
          depth: level,
          path: getPath(sector.id)
        }));
    };

    const getPath = (sectorId: string): string[] => {
      const path: string[] = [];
      let currentId: string | undefined = sectorId;
      
      while (currentId) {
        const sector = localSectors.find(s => s.id === currentId);
        if (sector) {
          path.unshift(currentId);
          currentId = sector.parentId;
        } else {
          break;
        }
      }
      
      return path;
    };

    return buildHierarchy();
  }, [localSectors]);

  // Validar hierarquia
  const validateHierarchy = useCallback(() => {
    const errors: string[] = [];
    
    // Verificar ciclos
    const checkCycles = (sectorId: string, visited: Set<string> = new Set()): boolean => {
      if (visited.has(sectorId)) return true;
      
      visited.add(sectorId);
      const sector = localSectors.find(s => s.id === sectorId);
      
      if (sector?.parentId) {
        return checkCycles(sector.parentId, visited);
      }
      
      return false;
    };

    localSectors.forEach(sector => {
      if (sector.parentId && checkCycles(sector.id)) {
        errors.push(`Ciclo detectado na hierarquia do setor: ${sector.name}`);
      }
    });

    // Verificar setores órfãos
    localSectors.forEach(sector => {
      if (sector.parentId && !localSectors.find(s => s.id === sector.parentId)) {
        errors.push(`Setor pai não encontrado para: ${sector.name}`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [localSectors]);

  // Manipular drag and drop
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination || readOnly) return;

    const { draggableId, destination } = result;
    
    // Extrair o ID real do setor removendo o prefixo
    const sectorId = draggableId.replace('sector-', '');
    
    // Determinar novo pai baseado no destino
    let newParentId: string | null = null;
    
    if (destination.droppableId !== 'root') {
      newParentId = destination.droppableId.replace('sector-', '');
    }

    // Atualizar hierarquia local
    const updatedSectors = localSectors.map(sector =>
      sector.id === sectorId
        ? { ...sector, parentId: newParentId, level: newParentId ? (localSectors.find(s => s.id === newParentId)?.level || 0) + 1 : 0 }
        : sector
    );

    setLocalSectors(updatedSectors);

    // Adicionar operação pendente
    const operation: HierarchyOperation = {
      type: 'move',
      sectorId,
      newParentId
    };

    setPendingOperations(prev => [...prev, operation]);
  }, [localSectors, readOnly]);

  // Expandir/recolher setor
  const toggleExpand = useCallback((sectorId: string) => {
    setExpandedSectors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectorId)) {
        newSet.delete(sectorId);
      } else {
        newSet.add(sectorId);
      }
      return newSet;
    });
  }, []);

  // Salvar alterações
  const handleSave = useCallback(async () => {
    if (!validateHierarchy()) {
      alert('Existem erros na hierarquia que precisam ser corrigidos antes de salvar.');
      return;
    }

    try {
      await onSave(pendingOperations);
      setPendingOperations([]);
    } catch (error) {
      console.error('Erro ao salvar hierarquia:', error);
      alert('Erro ao salvar alterações. Tente novamente.');
    }
  }, [pendingOperations, onSave, validateHierarchy]);

  // Resetar alterações
  const handleReset = useCallback(() => {
    setLocalSectors(sectors);
    setPendingOperations([]);
    setValidationErrors([]);
  }, [sectors]);

  return (
    <div className="sector-hierarchy-builder">
      {/* Cabeçalho */}
      <div className="hierarchy-header">
        <h2>Hierarquia de Setores</h2>
        
        <div className="hierarchy-actions">
          {!readOnly && (
            <>
              {pendingOperations.length > 0 && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={isLoading || validationErrors.length > 0}
                  >
                    <FiSave /> Salvar ({pendingOperations.length})
                  </button>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    <FiRefreshCw /> Resetar
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Validação */}
      {validationErrors.length > 0 && (
        <HierarchyValidation errors={validationErrors} />
      )}

      {/* Área de drag and drop */}
      <div className="hierarchy-container">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="root" type="SECTOR">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  hierarchy-root 
                  ${snapshot.isDraggingOver ? 'drag-over' : ''}
                  ${isLoading ? 'loading' : ''}
                `}
              >
                {hierarchy.length === 0 ? (
                  <div className="empty-hierarchy">
                    <p>Nenhum setor cadastrado.</p>
                  </div>
                ) : (
                  hierarchy.map((node, index) => (
                    <SectorNode
                      key={`sector-${node.sector.id}`}
                      sector={node.sector}
                      index={index}
                      children={node.children.map(child => child.sector)}
                      isExpanded={expandedSectors.has(node.sector.id)}
                      onToggleExpand={toggleExpand}
                      onEdit={setSelectedSector}
                      onDelete={onDeleteSector}
                      level={0}
                      isDragDisabled={readOnly || isLoading}
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Formulário de setor */}
      {showForm && (
        <SectorForm
          sector={selectedSector}
          sectors={localSectors}
          onSave={selectedSector ? onUpdateSector : onCreateSector}
          onCancel={() => {
            setShowForm(false);
            setSelectedSector(null);
          }}
        />
      )}
    </div>
  );
};