const CACHE_NAME = 'ponto-sefaz-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/assets/logo-sefaz-to.png',
  '/assets/logo-governo.png'
];

// Cache dinâmico para assets do Vite
const DYNAMIC_CACHE = 'ponto-sefaz-dynamic-v2';

// Instalar o service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para APIs externas
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone a resposta para cache
            const responseToCache = response.clone();

            // Cache dinâmico para assets JS/CSS
            if (event.request.url.includes('/assets/') || 
                event.request.url.includes('.js') || 
                event.request.url.includes('.css')) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            } else {
              // Cache estático para outras requisições
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        ).catch(() => {
          // Se estiver offline, tentar servir página offline para navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Atualizar o service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar controle imediatamente
      return self.clients.claim();
    })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  console.log('Sincronização em background executada');
  
  return new Promise((resolve) => {
    // Recuperar dados offline do localStorage
    try {
      const offlineQueue = localStorage.getItem('offline_queue');
      if (offlineQueue) {
        const data = JSON.parse(offlineQueue);
        const unsyncedItems = data.filter(item => !item.synced);
        
        console.log(`Encontrados ${unsyncedItems.length} itens para sincronizar`);
        
        // Aqui implementaremos a sincronização real com o backend
        // Por enquanto, apenas logamos os dados
        unsyncedItems.forEach(item => {
          console.log(`Sincronizando ${item.type}:`, item.data);
        });
      }
    } catch (error) {
      console.error('Erro na sincronização em background:', error);
    }
    
    resolve();
  });
}

// Notificações push (para implementação futura)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do sistema de ponto',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };

  event.waitUntil(
    self.registration.showNotification('Sistema de Ponto SEFAZ-TO', options)
  );
});