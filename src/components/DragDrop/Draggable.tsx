import React, { ReactNode, useState } from 'react';
import { useDragDrop, DragDropItem } from '../../contexts/DragDropContext';
import { cn } from '../../lib/utils';

interface DraggableProps {
  id: string;
  type: string;
  content: any;
  children: ReactNode;
  className?: string;
  dragPreview?: ReactNode;
  disabled?: boolean;
}

export const Draggable: React.FC<DraggableProps> = ({
  id,
  type,
  content,
  children,
  className,
  dragPreview,
  disabled = false,
}) => {
  const { setDraggedItem } = useDragDrop();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) return;
    
    const item: DragDropItem = { id, type, content };
    setDraggedItem(item);
    setIsDragging(true);

    // Configurar dados de transferência
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';

    // Configurar preview personalizado se fornecido
    if (dragPreview) {
      const previewElement = document.createElement('div');
      previewElement.innerHTML = dragPreview.toString();
      previewElement.style.position = 'absolute';
      previewElement.style.top = '-1000px';
      document.body.appendChild(previewElement);
      e.dataTransfer.setDragImage(previewElement, 0, 0);
      setTimeout(() => document.body.removeChild(previewElement), 0);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'cursor-grab transition-all duration-200',
        {
          'opacity-50 cursor-grabbing': isDragging,
          'cursor-not-allowed opacity-60': disabled,
          'hover:shadow-md': !disabled && !isDragging,
        },
        className
      )}
      data-draggable-id={id}
      data-draggable-type={type}
    >
      {children}
    </div>
  );
};