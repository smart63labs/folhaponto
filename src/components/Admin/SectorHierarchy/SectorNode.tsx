import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Sector } from '../../../types/sector';
import { FiUsers, FiEdit, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';

interface SectorNodeProps {
  sector: Sector;
  index: number;
  children?: Sector[];
  isExpanded: boolean;
  onToggleExpand: (sectorId: string) => void;
  onEdit: (sector: Sector) => void;
  onDelete: (sectorId: string) => void;
  level: number;
  isDragDisabled?: boolean;
}

export const SectorNode: React.FC<SectorNodeProps> = ({
  sector,
  index,
  children = [],
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  level,
  isDragDisabled = false
}) => {
  const hasChildren = children.length > 0;
  const indentWidth = level * 20;

  return (
    <div className="sector-node">
      <Draggable 
        draggableId={`sector-${sector.id}`} 
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
              sector-item 
              ${snapshot.isDragging ? 'dragging' : ''}
              ${!sector.active ? 'inactive' : ''}
            `}
            style={{
              ...provided.draggableProps.style,
              marginLeft: `${indentWidth}px`,
            }}
          >
            <div className="sector-content">
              {/* Botão de expandir/recolher */}
              <button
                className="expand-button"
                onClick={() => onToggleExpand(sector.id)}
                disabled={!hasChildren}
              >
                {hasChildren ? (
                  isExpanded ? <FiChevronDown /> : <FiChevronRight />
                ) : (
                  <div className="no-children-indicator" />
                )}
              </button>

              {/* Informações do setor */}
              <div className="sector-info">
                <div className="sector-header">
                  <h4 className="sector-name">{sector.name}</h4>
                  <span className="sector-code">({sector.code})</span>
                  {!sector.active && <span className="inactive-badge">Inativo</span>}
                </div>
                
                <div className="sector-details">
                  {sector.managerName && (
                    <span className="manager-info">
                      Chefe: {sector.managerName}
                    </span>
                  )}
                  
                  <span className="employee-count">
                    <FiUsers size={14} />
                    {sector.employeeCount || 0} funcionários
                  </span>
                </div>

                {sector.description && (
                  <p className="sector-description">{sector.description}</p>
                )}
              </div>

              {/* Ações */}
              <div className="sector-actions">
                <button
                  className="action-button edit"
                  onClick={() => onEdit(sector)}
                  title="Editar setor"
                >
                  <FiEdit size={16} />
                </button>
                
                <button
                  className="action-button delete"
                  onClick={() => onDelete(sector.id)}
                  title="Excluir setor"
                  disabled={hasChildren}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* Área de drop para filhos */}
      {isExpanded && (
        <Droppable droppableId={`children-${sector.id}`} type="SECTOR">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                children-container 
                ${snapshot.isDraggingOver ? 'drag-over' : ''}
              `}
              style={{ marginLeft: `${indentWidth + 20}px` }}
            >
              {children.map((child, childIndex) => (
                <SectorNode
                  key={child.id}
                  sector={child}
                  index={childIndex}
                  children={child.children}
                  isExpanded={isExpanded}
                  onToggleExpand={onToggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  level={level + 1}
                  isDragDisabled={isDragDisabled}
                />
              ))}
              {provided.placeholder}
              
              {/* Indicador de área de drop vazia */}
              {children.length === 0 && snapshot.isDraggingOver && (
                <div className="empty-drop-zone">
                  Solte aqui para adicionar como subsetor
                </div>
              )}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
};