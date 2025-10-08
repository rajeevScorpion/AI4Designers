// AI4Designers Service Worker v2.0
// Offline-First PWA implementation with caching and background sync

const CACHE_NAME = 'ai4designers-v2.0.0'
const STATIC_CACHE = 'ai4designers-static-v2.0.0'
const API_CACHE = 'ai4designers-api-v2.0.0'
const RUNTIME_CACHE = 'ai4designers-runtime-v2.0.0'

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/page.css',
  '/images/logo.svg',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/fonts/inter-var.woff2',
  '/offline.html'
]

// API routes that should be cached with network-first strategy
const API_ROUTES = [
  '/api/progress',
  '/api/progress/sync',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/profile'
]

// Background sync queue
let syncQueue = []
let isSyncing = false

// Install event - cache static assets
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

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.0.0')

  event.waitUntil(
    Promise.all([
      // Clean up old caches
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
      // Take control of all pages
      self.clients.claim()
    ])
  )
})

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests in most cases
  if (request.method !== 'GET' && !API_ROUTES.some(route => url.pathname.startsWith(route))) {
    return
  }

  // Handle different request types
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(handleApiRequest(request))
  } else if (url.origin === self.location.origin) {
    // Same-origin requests - cache first with network fallback
    event.respondWith(handleStaticRequest(request))
  } else {
    // External requests (e.g., Supabase) - network only
    event.respondWith(handleExternalRequest(request))
  }
})

// Handle static asset requests (cache-first)
async function handleStaticRequest(request) {
  const url = new URL(request.url)

  // Try cache first
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url)
      return cachedResponse
    }
  } catch (error) {
    console.error('[SW] Cache match error:', error)
  }

  // Try network
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
      console.log('[SW] Cached new resource:', request.url)
      return networkResponse
    }
  } catch (error) {
    console.error('[SW] Network failed for:', request.url, error)
  }

  // Return offline fallback for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineResponse = await caches.match('/offline.html')
    if (offlineResponse) {
      console.log('[SW] Serving offline page')
      return offlineResponse
    }
  }

  // Return error as last resort
  return new Response('Offline - No network connection', {
    status: 503,
    statusText: 'Service Unavailable'
  })
}

// Handle API requests (network-first)
async function handleApiRequest(request) {
  const url = new URL(request.url)

  // Check if online
  if (!navigator.onLine) {
    // Try to serve from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('[SW] Serving API from cache (offline):', request.url)
      return cachedResponse
    }

    // Queue the request for background sync
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      console.log('[SW] Queuing API request for background sync:', request.url)
      await queueApiRequest(request)
    }

    return new Response('Offline - Request queued for sync', {
      status: 202,
      statusText: 'Accepted'
    })
  }

  // Try network first
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful GET responses
      if (request.method === 'GET') {
        const cache = await caches.open(API_CACHE)
        cache.put(request, networkResponse.clone())
        console.log('[SW] Cached API response:', request.url)
      }

      return networkResponse
    }
  } catch (error) {
    console.error('[SW] API request failed:', request.url, error)
  }

  // Try cache as fallback
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    console.log('[SW] Serving API from cache (fallback):', request.url)
    return cachedResponse
  }

  // Return error
  return new Response('Network error', {
    status: 503,
    statusText: 'Service Unavailable'
  })
}

// Handle external requests (network-only with potential caching)
async function handleExternalRequest(request) {
  const url = new URL(request.url)

  // Allow Supabase requests to be cached briefly
  if (url.hostname.includes('supabase.co')) {
    try {
      const networkResponse = await fetch(request)

      if (networkResponse.ok && request.method === 'GET') {
        // Cache for 5 minutes
        const cache = await caches.open(API_CACHE)
        const responseToCache = networkResponse.clone()
        cache.put(request, responseToCache)
      }

      return networkResponse
    } catch (error) {
      // Try cache on network failure
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      throw error
    }
  }

  // All other external requests - network only
  return fetch(request)
}

// Queue API request for background sync
async function queueApiRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  }

  // Store in IndexedDB through a message to the client
  const allClients = await self.clients.matchAll()
  for (const client of allClients) {
    client.postMessage({
      type: 'QUEUE_API_REQUEST',
      data: requestData
    })
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync())
  }
})

// Process background sync queue
async function processBackgroundSync() {
  if (isSyncing) {
    console.log('[SW] Sync already in progress')
    return
  }

  isSyncing = true
  console.log('[SW] Processing background sync queue')

  try {
    // Get queued requests from IndexedDB (through client)
    const allClients = await self.clients.matchAll()
    const syncResults = []

    for (const client of allClients) {
      // Request sync queue from client
      client.postMessage({
        type: 'GET_SYNC_QUEUE'
      })
    }

    // Wait for client to send queue data
    await new Promise(resolve => {
      const handleMessage = (event) => {
        if (event.data.type === 'SYNC_QUEUE_DATA') {
          self.removeEventListener('message', handleMessage)
          resolve(event.data.queue)
        }
      }
      self.addEventListener('message', handleMessage)

      // Timeout after 5 seconds
      setTimeout(() => {
        self.removeEventListener('message', handleMessage)
        resolve([])
      }, 5000)
    })

    console.log('[SW] Background sync completed')
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  } finally {
    isSyncing = false
  }
})

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event)

  const options = {
    body: event.data?.text() || 'You have new updates',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    tag: 'ai4designers-update',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
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

    case 'GET_CACHE_STATUS':
      event.waitUntil(
        getCacheStatus().then((cacheInfo) => {
          event.ports[0].postMessage(cacheInfo)
        })
      )
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

    case 'FORCE_SYNC':
      console.log('[SW] Force sync requested')
      // Trigger background sync if registered
      if ('sync' in self.registration) {
        self.registration.sync.register('background-sync')
      }
      break

    default:
      console.log('[SW] Unknown message type:', event.data.type)
  }
})

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync triggered:', event.tag)

    if (event.tag === 'periodic-sync') {
      event.waitUntil(processBackgroundSync())
    }
  })
}

// Helper function to check cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const cacheInfo = {}

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    cacheInfo[cacheName] = {
      count: keys.length,
      keys: keys.map(request => request.url)
    }
  }

  return cacheInfo
}

// Cleanup old runtime cache periodically
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEANUP_RUNTIME_CACHE') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => {
          return cache.keys()
        })
        .then((requests) => {
          // Delete items older than 7 days
          const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000)
          const deletePromises = []

          for (const request of requests) {
            // Check if we have timestamp info (you'd need to store this during caching)
            // For now, just keep the cache under a reasonable size
            if (requests.length > 100) {
              // Delete oldest entries if cache is too large
              deletePromises.push(cache.delete(request))
            }
          }

          return Promise.all(deletePromises)
        })
        .then(() => {
          event.ports[0].postMessage({ success: true })
        })
    )
  }
})