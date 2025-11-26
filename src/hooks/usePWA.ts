import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    installPrompt: null,
  });

  useEffect(() => {
    // Registrar service worker apenas em produção.
    // Em desenvolvimento, garantir que qualquer SW anterior seja desregistrado
    if ('serviceWorker' in navigator) {
      if (import.meta.env.PROD) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('SW registrado com sucesso: ', registration);
            })
            .catch((registrationError) => {
              console.log('SW falhou ao registrar: ', registrationError);
            });
        });
      } else {
        // Dev: remover qualquer SW para evitar interferência com Vite HMR/WebSocket
        navigator.serviceWorker.getRegistrations()
          .then((registrations) => {
            registrations.forEach((reg) => {
              console.log('Desregistrando SW em desenvolvimento:', reg);
              reg.unregister();
            });
          })
          .catch(() => {});
        // Também tentar desativar controle imediato se algum SW ainda estiver pronto
        navigator.serviceWorker.ready
          .then((reg) => {
            console.log('Desregistrando SW pronto em desenvolvimento:', reg);
            reg.unregister();
          })
          .catch(() => {});
      }
    }

    // Verificar se já está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');

    setPwaState(prev => ({ ...prev, isInstalled }));

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: installEvent,
      }));
    };

    // Listener para mudanças de conectividade
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    // Adicionar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (pwaState.installPrompt) {
      pwaState.installPrompt.prompt();
      const { outcome } = await pwaState.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));
      }
    }
  };

  return {
    ...pwaState,
    installApp,
  };
};