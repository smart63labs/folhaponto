import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onDismiss }) => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    await installApp();
    onDismiss?.();
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-blue-200 bg-blue-50 z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-sm text-blue-900">Instalar App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          Instale o Sistema de Ponto SEFAZ-TO para acesso rápido e funcionalidade offline.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100"
            size="sm"
          >
            Agora não
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};