import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  GripVertical, 
  Edit, 
  Trash2, 
  Users, 
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Sector } from '@/types/sector';

interface SectorHierarchyBuilderProps {
  sectors: Sector[];
  onSave: (sectors: Sector[]) => void;
  onCreateSector: (sector: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSector: (id: string, sector: Partial<Sector>) => void;
  onDeleteSector: (id: string) => void;
  isLoading?: boolean;
}

interface SectorNodeProps {
  sector: Sector;
  onDragStart: (e: React.DragEvent, sector: Sector) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetSector: Sector) => void;
  onToggleExpand: (sectorId: string) => void;
  expandedSectors: Set<string>;
  onEdit: (sector: Sector) => void;
  onDelete: (sectorId: string) => void;
  level?: number;
}

const SectorNode: React.FC<SectorNodeProps> = ({
  sector,
  onDragStart,
  onDragOver,
  onDrop,
  onToggleExpand,
  expandedSectors,
  onEdit,
  onDelete,
  level = 0
}) => {
  const hasChildren = sector.children && sector.children.length > 0;
  const isExpanded = expandedSectors.has(sector.id);

  return (
    <div className="space-y-2">
      <Card 
        className="cursor-move hover:shadow-md transition-shadow"
        draggable
        onDragStart={(e) => onDragStart(e, sector)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, sector)}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpand(sector.id)}
                  className="p-0 h-auto"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <div>
                  <h4 className="font-semibold">{sector.name}</h4>
                  <p className="text-sm text-muted-foreground">{sector.code}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{sector.employeeCount || 0}</span>
              </div>
              
              <Badge variant={sector.active ? 'default' : 'secondary'}>
                {sector.active ? 'ativo' : 'inativo'}
              </Badge>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(sector)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(sector.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            <span>Responsável: {sector.responsavel}</span>
            {sector.orcamento && (
              <span className="ml-4">
                Orçamento: {sector.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {sector.children!.map((child) => (
            <SectorNode
              key={child.id}
              sector={child}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onToggleExpand={onToggleExpand}
              expandedSectors={expandedSectors}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SectorHierarchyBuilder: React.FC<SectorHierarchyBuilderProps> = ({
  sectors,
  onSave,
  onCreateSector,
  onUpdateSector,
  onDeleteSector,
  isLoading = false
}) => {
  const [hierarchySectors, setHierarchySectors] = useState<Sector[]>(() => {
    return buildHierarchy(sectors);
  });
  
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [draggedSector, setDraggedSector] = useState<Sector | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  // Função para construir a hierarquia a partir de uma lista plana
  function buildHierarchy(flatSectors: Sector[]): Sector[] {
    const sectorMap = new Map<string, Sector>();
    const rootSectors: Sector[] = [];

    // Criar mapa de setores
    flatSectors.forEach(sector => {
      sectorMap.set(sector.id, { ...sector, children: [] });
    });

    // Construir hierarquia
    sectorMap.forEach(sector => {
      if (sector.parentId && sectorMap.has(sector.parentId)) {
        const parent = sectorMap.get(sector.parentId)!;
        parent.children!.push(sector);
      } else {
        rootSectors.push(sector);
      }
    });

    return rootSectors;
  }

  // Função para achatar a hierarquia
  function flattenHierarchy(hierarchySectors: Sector[]): Sector[] {
    const result: Sector[] = [];
    
    function traverse(sectors: Sector[], parentId?: string) {
      sectors.forEach(sector => {
        const flatSector = { ...sector, parentId };
        delete flatSector.children;
        result.push(flatSector);
        
        if (sector.children && sector.children.length > 0) {
          traverse(sector.children, sector.id);
        }
      });
    }
    
    traverse(hierarchySectors);
    return result;
  }

  const handleDragStart = useCallback((e: React.DragEvent, sector: Sector) => {
    setDraggedSector(sector);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSector: Sector) => {
    e.preventDefault();
    
    if (!draggedSector || draggedSector.id === targetSector.id) {
      return;
    }

    // Verificar se não está tentando mover um setor para dentro de si mesmo
    function isDescendant(parent: Sector, childId: string): boolean {
      if (parent.id === childId) return true;
      if (parent.children) {
        return parent.children.some(child => isDescendant(child, childId));
      }
      return false;
    }

    if (isDescendant(draggedSector, targetSector.id)) {
      alert('Não é possível mover um setor para dentro de si mesmo ou de seus descendentes.');
      return;
    }

    // Remover o setor da posição atual
    function removeSector(sectors: Sector[], sectorId: string): Sector[] {
      return sectors.reduce((acc: Sector[], sector) => {
        if (sector.id === sectorId) {
          return acc;
        }
        
        const newSector = { ...sector };
        if (newSector.children) {
          newSector.children = removeSector(newSector.children, sectorId);
        }
        acc.push(newSector);
        return acc;
      }, []);
    }

    // Adicionar o setor como filho do target
    function addSectorAsChild(sectors: Sector[], targetId: string, sectorToAdd: Sector): Sector[] {
      return sectors.map(sector => {
        if (sector.id === targetId) {
          return {
            ...sector,
            children: [...(sector.children || []), sectorToAdd]
          };
        }
        
        if (sector.children) {
          return {
            ...sector,
            children: addSectorAsChild(sector.children, targetId, sectorToAdd)
          };
        }
        
        return sector;
      });
    }

    let newHierarchy = removeSector(hierarchySectors, draggedSector.id);
    newHierarchy = addSectorAsChild(newHierarchy, targetSector.id, draggedSector);
    
    setHierarchySectors(newHierarchy);
    setDraggedSector(null);
  }, [draggedSector, hierarchySectors]);

  const handleToggleExpand = useCallback((sectorId: string) => {
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

  const handleSave = () => {
    const flatSectors = flattenHierarchy(hierarchySectors);
    onSave(flatSectors);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Hierarquia de Setores</h3>
          <p className="text-sm text-muted-foreground">
            Arraste e solte os setores para reorganizar a hierarquia
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleSave} variant="outline">
            Salvar Hierarquia
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {hierarchySectors.map((sector) => (
          <SectorNode
            key={sector.id}
            sector={sector}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onToggleExpand={handleToggleExpand}
            expandedSectors={expandedSectors}
            onEdit={setEditingSector}
            onDelete={onDeleteSector}
          />
        ))}
      </div>

      {hierarchySectors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum setor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Vá para a aba "Gestão" para criar setores
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog para edição */}
      {editingSector && (
        <Dialog open={!!editingSector} onOpenChange={() => setEditingSector(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Setor</DialogTitle>
            </DialogHeader>
            <SectorForm
              sector={editingSector}
              onSubmit={(data) => {
                onUpdateSector(editingSector.id, data);
                setEditingSector(null);
              }}
              onCancel={() => setEditingSector(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Componente de formulário para criar/editar setores
interface SectorFormProps {
  sector?: Sector;
  onSubmit: (data: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const SectorForm: React.FC<SectorFormProps> = ({ sector, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: sector?.name || '',
    code: sector?.code || '',
    description: sector?.description || '',
    parentId: sector?.parentId || '',
    active: sector?.active ?? true,
    level: sector?.level || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Setor</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {sector ? 'Atualizar' : 'Criar'} Setor
        </Button>
      </div>
    </form>
  );
};

export default SectorHierarchyBuilder;