// public/sw.js

const CACHE_NAME = 'sonicwave-v2';
// Lista de archivos para cachear. 
// Es importante actualizar esto si agregas nuevas páginas o assets principales.
const urlsToCache = [
  '/',
  '/index.html',
  // Es importante tener cuidado con los assets que genera Vite con hash en el nombre.
  // Una estrategia más avanzada (workbox) se encargaría de esto automáticamente.
  // Por ahora, cacheamos los puntos de entrada principales.
];

// Evento de instalación: se dispara cuando el SW se instala.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalado');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activa el SW inmediatamente
  );
});

// Evento de activación: se dispara cuando el SW se activa.
// Aquí se suelen limpiar cachés antiguas.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpiando caché antigua', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Toma el control de las páginas abiertas
});

// Evento fetch: se dispara para cada petición de la página.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // No interceptar las peticiones a la API
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // ESTRATEGIA: Network-First para el HTML (página principal)
  // Esto asegura que siempre se busque la última versión en GitHub antes de usar la caché.
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si hay red, actualizamos la caché y devolvemos la respuesta
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si no hay red, usamos lo que tengamos en caché
          return caches.match(event.request);
        })
    );
    return;
  }

  // ESTRATEGIA: Cache-First para el resto de recursos (JS, CSS, Imágenes)
  // Como Vite genera nombres con hash (ej: index-D3f4g5.js), si el HTML cambia,
  // pedirá archivos nuevos que no estarán en caché y se bajarán de la red.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          // Opcionalmente podrías cachear aquí recursos nuevos detectados
          return fetchResponse;
        });
      })
  );
});
