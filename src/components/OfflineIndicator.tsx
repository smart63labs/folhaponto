import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, getPendingSyncCount } = useOfflineStorage();
  const pendingCount = getPendingSyncCount();

  if (isOnline && pendingCount === 0) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }

  if (isOnline && pendingCount > 0) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Sincronizando ({pendingCount})
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
      <WifiOff className="h-3 w-3 mr-1" />
      Offline {pendingCount > 0 && `(${pendingCount} pendentes)`}
    </Badge>
  );
};