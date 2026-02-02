// Service Worker para Trilha 1A
const CACHE_NAME = 'trilha1a-v2.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/financeiro.html',
    '/rotina.html',
    '/tarefas.html',
    '/progresso.html',
    
    '/css/style.css',
    '/css/dashboard.css',
    '/css/responsive.css',
    
    '/js/app.js',
    '/js/financeiro.js',
    '/js/rotina.js',
    '/js/chart.js',
    '/js/auth.js',
    
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js',
    
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/favicon.ico'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    // Ignorar requisições não-GET e do Chrome Extension
    if (event.request.method !== 'GET' || 
        event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retorna resposta do cache
                if (response) {
                    return response;
                }
                
                // Clone da requisição porque ela só pode ser usada uma vez
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Verifica se recebemos uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone da resposta porque ela só pode ser usada uma vez
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(() => {
                    // Fallback para páginas offline
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/index.html');
                    }
                    
                    // Fallback para outros assets
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
            })
    );
});

// Mensagens do app principal
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Sincronização em background
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Aqui você implementaria a sincronização com um servidor
    console.log('Sincronizando dados em background...');
    
    try {
        // Exemplo de sincronização
        const pendingData = await getPendingData();
        
        for (const data of pendingData) {
            await sendToServer(data);
            await markAsSynced(data.id);
        }
        
        console.log('Sincronização concluída com sucesso!');
        
        // Enviar notificação para o app
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_COMPLETE',
                    data: { success: true }
                });
            });
        });
    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}

// Notificações push
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nova notificação do Trilha 1A',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir App'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Trilha 1A', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Funções auxiliares para sincronização
async function getPendingData() {
    // Obter dados pendentes do IndexedDB
    return new Promise((resolve) => {
        const request = indexedDB.open('Trilha1ASync', 1);
        
        request.onsuccess = event => {
            const db = event.target.result;
            const transaction = db.transaction(['pending'], 'readonly');
            const store = transaction.objectStore('pending');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
        };
    });
}

async function sendToServer(data) {
    // Implementar envio para servidor
    const response = await fetch('https://api.trilha1a.com/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Falha ao enviar dados');
    }
    
    return response.json();
}

async function markAsSynced(id) {
    // Marcar dados como sincronizados no IndexedDB
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('Trilha1ASync', 1);
        
        request.onsuccess = event => {
            const db = event.target.result;
            const transaction = db.transaction(['pending'], 'readwrite');
            const store = transaction.objectStore('pending');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}
