// AI4Designers Service Worker - Simplified version
const CACHE_NAME = 'ai4designers-v2.0.0'
const STATIC_CACHE = 'ai4designers-static-v2.0.0'
const API_CACHE = 'ai4designers-api-v2.0.0'
const RUNTIME_CACHE = 'ai4designers-runtime-v2.0.0'

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/logo.svg',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/offline.html'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2.0.0')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.0.0')
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE &&
                     cacheName !== API_CACHE &&
                     cacheName !== RUNTIME_CACHE &&
                     cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      self.clients.claim()
    ])
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different request types
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
  } else if (url.origin === self.location.origin) {
    event.respondWith(handleStaticRequest(request))
  } else {
    event.respondWith(fetch(request))
  }
})

// Handle static asset requests (cache-first)
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
  } catch (error) {
    console.error('[SW] Cache match error:', error)
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
  } catch (error) {
    console.error('[SW] Network failed for:', request.url, error)
  }

  // Return offline fallback for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineResponse = await caches.match('/offline.html')
    if (offlineResponse) {
      return offlineResponse
    }
  }

  return new Response('Offline - No network connection', {
    status: 503,
    statusText: 'Service Unavailable'
  })
}

// Handle API requests (network-first)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] API request failed:', request.url, error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event)

  const options = {
    body: event.data?.text() || 'You have new updates',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    tag: 'ai4designers-update',
    renotify: true,
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification('AI4Designers', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)
  event.notification.close()

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message event for communication with client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received from client:', event.data)

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: '2.0.0' })
      break
    case 'CLEAR_CACHE':
      event.waitUntil(
        Promise.all([
          caches.delete(STATIC_CACHE),
          caches.delete(API_CACHE),
          caches.delete(RUNTIME_CACHE)
        ]).then(() => {
          event.ports[0].postMessage({ success: true })
        })
      )
      break
    default:
      console.log('[SW] Unknown message type:', event.data.type)
  }
})