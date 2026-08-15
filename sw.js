const STATIC_CACHE_NAME = 'bazar360-static-v3';
const IMAGE_CACHE_NAME = 'bazar360-images-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/auto_choice_logo_1781509565476.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE_NAME && name !== IMAGE_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  try {
    const url = new URL(event.request.url);

    // Bypass WebSockets, Firestore DB, Firebase Auth, identity toolkit, and chrome extensions
    if (
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('identitytoolkit.googleapis.com') ||
      url.hostname.includes('securetoken.googleapis.com') ||
      url.pathname.includes('chrome-extension') ||
      url.protocol === 'ws:' ||
      url.protocol === 'wss:'
    ) {
      return;
    }

    const isSameOrigin = url.origin === self.location.origin;
    const isImage =
      event.request.destination === 'image' ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico)(\?.*)?$/i) ||
      url.hostname.includes('googleusercontent.com') ||
      url.hostname.includes('cloudinary.com') ||
      url.hostname.includes('firebasestorage.googleapis.com') ||
      url.hostname.includes('unsplash.com') ||
      url.hostname.includes('jsdelivr.net');

    // Strategy 1: IMAGES -> Cache-First for instant loading and offline vehicle view
    if (isImage) {
      event.respondWith(
        caches.open(IMAGE_CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(event.request, { mode: 'cors', credentials: 'omit' })
              .then((networkResponse) => {
                if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                return cachedResponse || new Response('', { status: 408, statusText: 'Offline Image' });
              });
          });
        })
      );
      return;
    }

    // Strategy 2: STATIC ASSETS (JS, CSS, HTML, Fonts, Assets) -> Stale-While-Revalidate with Cache-First
    if (isSameOrigin || url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/i)) {
      event.respondWith(
        caches.open(STATIC_CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => cachedResponse);

            if (cachedResponse) {
              fetchPromise.catch(() => {});
              return cachedResponse;
            }

            return fetchPromise.catch(() => {
              if (event.request.mode === 'navigate') {
                return cache.match('/index.html');
              }
            });
          });
        })
      );
      return;
    }

    // Strategy 3: NAVIGATION REQUESTS -> Try Network, fallback to cached index.html
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match('/index.html');
        })
      );
      return;
    }
  } catch (err) {
    console.warn('[SW] Fetch handler warning:', err);
  }
});

