const CACHE_NAME = 'daily-growth-triads-v2-4-9';
const ASSETS_TO_CACHE = [
  '/daily/app/',
  '/daily/app/index.html',
  '/daily/app/manifest.json',
  '/daily/app/version.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always network for API
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network First for HTML, navigation, and version requests
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || event.request.url.includes('index.html') || event.request.url.includes('version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/daily/app/index.html');
          });
        })
    );
    return;
  }

  // Stale-while-revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      const fetchPromise = fetch(event.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkRes;
      }).catch(() => {});
      return cachedRes || fetchPromise;
    })
  );
});

// Push notification receiver
self.addEventListener('push', (event) => {
  let data = { title: 'Триады Роста // Дейлики', body: 'Напоминание о дейлике в вашей тройке!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/daily/app/assets/logo-app-icon-192.png',
    badge: '/daily/app/assets/logo-app-icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/daily/app/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/daily/app') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/daily/app/');
      }
    })
  );
});