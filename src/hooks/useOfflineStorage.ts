import { useState, useEffect } from 'react';

interface OfflineData {
  id: string;
  type: 'registro_ponto' | 'solicitacao_ajuste' | 'justificativa';
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineStorage = () => {
  const [offlineQueue, setOfflineQueue] = useState<OfflineData[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Carregar dados offline do localStorage
    loadOfflineData();

    // Listeners para conectividade
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineQueue(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
    }
  };

  const saveOfflineData = (data: OfflineData[]) => {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(data));
      setOfflineQueue(data);
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error);
    }
  };

  const addToOfflineQueue = (type: OfflineData['type'], data: any) => {
    const offlineItem: OfflineData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    const newQueue = [...offlineQueue, offlineItem];
    saveOfflineData(newQueue);

    // Se estiver online, tentar sincronizar imediatamente
    if (isOnline) {
      syncOfflineData();
    }

    return offlineItem.id;
  };

  const syncOfflineData = async () => {
    if (!isOnline || offlineQueue.length === 0) return;

    const unsyncedItems = offlineQueue.filter(item => !item.synced);
    
    for (const item of unsyncedItems) {
      try {
        // Aqui implementaremos a sincronização com o backend
        await syncItem(item);
        
        // Marcar como sincronizado
        const updatedQueue = offlineQueue.map(queueItem =>
          queueItem.id === item.id ? { ...queueItem, synced: true } : queueItem
        );
        saveOfflineData(updatedQueue);
        
      } catch (error) {
        console.error('Erro ao sincronizar item:', item.id, error);
      }
    }

    // Remover itens sincronizados após 24 horas
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const filteredQueue = offlineQueue.filter(item => 
      !item.synced || item.timestamp > oneDayAgo
    );
    
    if (filteredQueue.length !== offlineQueue.length) {
      saveOfflineData(filteredQueue);
    }
  };

  const syncItem = async (item: OfflineData): Promise<void> => {
    // Simulação de sincronização - implementar com APIs reais
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Sincronizando ${item.type}:`, item.data);
        resolve();
      }, 1000);
    });
  };

  const clearOfflineQueue = () => {
    localStorage.removeItem('offline_queue');
    setOfflineQueue([]);
  };

  const getOfflineData = (type?: OfflineData['type']) => {
    if (type) {
      return offlineQueue.filter(item => item.type === type);
    }
    return offlineQueue;
  };

  const getPendingSyncCount = () => {
    return offlineQueue.filter(item => !item.synced).length;
  };

  return {
    isOnline,
    offlineQueue,
    addToOfflineQueue,
    syncOfflineData,
    clearOfflineQueue,
    getOfflineData,
    getPendingSyncCount,
  };
};