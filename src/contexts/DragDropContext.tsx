import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface DragDropItem {
  id: string;
  type: string;
  content: any;
  position?: { x: number; y: number };
}

export interface DragDropContextType {
  draggedItem: DragDropItem | null;
  setDraggedItem: (item: DragDropItem | null) => void;
  dropZones: string[];
  registerDropZone: (id: string) => void;
  unregisterDropZone: (id: string) => void;
  onDrop: (item: DragDropItem, targetZone: string) => void;
  setOnDrop: (callback: (item: DragDropItem, targetZone: string) => void) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop deve ser usado dentro de um DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: ReactNode;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [dropZones, setDropZones] = useState<string[]>([]);
  const [onDropCallback, setOnDropCallback] = useState<(item: DragDropItem, targetZone: string) => void>(() => () => {});

  const registerDropZone = useCallback((id: string) => {
    setDropZones(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const unregisterDropZone = useCallback((id: string) => {
    setDropZones(prev => prev.filter(zone => zone !== id));
  }, []);

  const onDrop = useCallback((item: DragDropItem, targetZone: string) => {
    onDropCallback(item, targetZone);
    setDraggedItem(null);
  }, [onDropCallback]);

  const setOnDrop = useCallback((callback: (item: DragDropItem, targetZone: string) => void) => {
    setOnDropCallback(() => callback);
  }, []);

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        setDraggedItem,
        dropZones,
        registerDropZone,
        unregisterDropZone,
        onDrop,
        setOnDrop,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};