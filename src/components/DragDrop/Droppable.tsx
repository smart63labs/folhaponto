import React, { ReactNode, useEffect, useState, useCallback } from 'react';
import { useDragDrop, DragDropItem } from '../../contexts/DragDropContext';
import { cn } from '../../lib/utils';

interface DroppableProps {
  id: string;
  children: ReactNode;
  className?: string;
  acceptedTypes?: string[];
  onDrop?: (item: DragDropItem) => void;
  placeholder?: ReactNode;
  disabled?: boolean;
}

export const Droppable: React.FC<DroppableProps> = ({
  id,
  children,
  className,
  acceptedTypes = [],
  onDrop,
  placeholder,
  disabled = false,
}) => {
  const { draggedItem, registerDropZone, unregisterDropZone, onDrop: globalOnDrop } = useDragDrop();
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);

  useEffect(() => {
    if (!disabled) {
      registerDropZone(id);
    }
    return () => unregisterDropZone(id);
  }, [id, disabled, registerDropZone, unregisterDropZone]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (!isOver) {
      setIsOver(true);
    }

    // Verificar se o tipo é aceito
    if (draggedItem) {
      const typeAccepted = acceptedTypes.length === 0 || acceptedTypes.includes(draggedItem.type);
      setCanDrop(typeAccepted);
    }
  }, [disabled, isOver, draggedItem, acceptedTypes]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    // Verificar se realmente saiu da área (não apenas mudou para um filho)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOver(false);
      setCanDrop(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsOver(false);
    setCanDrop(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      const item: DragDropItem = JSON.parse(data);
      
      // Verificar se o tipo é aceito
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(item.type)) {
        return;
      }

      // Chamar callback local se fornecido
      if (onDrop) {
        onDrop(item);
      }

      // Chamar callback global
      globalOnDrop(item, id);
    } catch (error) {
      console.error('Erro ao processar drop:', error);
    }
  }, [disabled, acceptedTypes, onDrop, globalOnDrop, id]);

  const showPlaceholder = placeholder && isOver && canDrop;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'transition-all duration-200',
        {
          'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50': isOver && canDrop && !disabled,
          'ring-2 ring-red-400 ring-opacity-50 bg-red-50': isOver && !canDrop && !disabled,
          'opacity-60': disabled,
        },
        className
      )}
      data-droppable-id={id}
      data-droppable-types={acceptedTypes.join(',')}
    >
      {showPlaceholder ? placeholder : children}
    </div>
  );
};