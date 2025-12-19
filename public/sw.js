// public/sw.js

const CACHE_NAME = 'sonicwave-v1';
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
// Implementa una estrategia "cache-first": si está en caché, lo sirve desde ahí.
// Si no, va a la red.
self.addEventListener('fetch', event => {
  // No interceptar las peticiones a la API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Servir desde la caché
          return response;
        }
        // Si no está en caché, ir a la red
        return fetch(event.request);
      }
    )
  );
});
