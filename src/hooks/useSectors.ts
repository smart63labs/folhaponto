import { useState, useEffect } from 'react';
import { Sector } from '../types/sector';
import { SectorService } from '../services/sectorService';

export const useSectors = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SectorService.getAllSectors();
      setSectors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar setores');
    } finally {
      setLoading(false);
    }
  };

  const getSectorOptions = () => {
    return sectors
      .filter(sector => sector.active)
      .map(sector => ({
        value: sector.id,
        label: `${sector.name} (${sector.code})`
      }));
  };

  const getSectorName = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? `${sector.name} (${sector.code})` : 'Setor não encontrado';
  };

  return {
    sectors,
    loading,
    error,
    loadSectors,
    getSectorOptions,
    getSectorName
  };
};