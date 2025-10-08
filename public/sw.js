// Minimal service worker to prevent 404 errors
// This file exists to satisfy browser requests for /sw.js
// It doesn't cache anything or interfere with the app

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', () => {
  self.clients.claim()
})

// Do nothing for fetch events - let the browser handle everything normally
self.addEventListener('fetch', () => {
  // Intentionally empty - no caching or interception
})