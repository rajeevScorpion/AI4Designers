'use client'

import { useEffect, useState } from 'react'
import { getServiceWorkerManager, useServiceWorker } from '@/lib/service-worker'
import { getPWAInstallPrompt, usePWAInstall } from '@/lib/service-worker'
import { SimpleSyncStatus } from './SimpleSyncStatus'

export function ServiceWorkerManager() {
  const { status, applyUpdate, clearCaches, forceSync, getCacheStatus, checkForUpdate } = useServiceWorker()
  const { canInstall, isInstalled, install } = usePWAInstall()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [cacheStatus, setCacheStatus] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Show install prompt if available and not already installed
    if (canInstall && !isInstalled) {
      setShowInstallPrompt(true)
    }
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setShowInstallPrompt(false)
    }
  }

  const handleGetCacheStatus = async () => {
    try {
      const status = await getCacheStatus()
      setCacheStatus(status)
    } catch (error) {
      console.error('Failed to get cache status:', error)
    }
  }

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cached data? This may affect offline functionality.')) {
      try {
        await clearCaches()
        alert('Cache cleared successfully')
        setCacheStatus(null)
      } catch (error) {
        console.error('Failed to clear cache:', error)
        alert('Failed to clear cache')
      }
    }
  }

  // Don't show in production unless it's a dev user
  if (process.env.NODE_ENV === 'production' && isClient && !localStorage.getItem('showDevTools')) {
    return null
  }

  return (
    <>
      {/* Install Prompt Banner */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Install AI4Designers</h3>
              <p className="text-sm opacity-90">Install the app for offline access and better experience</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 rounded transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="px-3 py-1 text-sm bg-white text-blue-600 hover:bg-gray-100 rounded font-semibold transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Worker Status Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && status && (
        <div className="fixed top-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 text-xs">
          <h3 className="font-semibold mb-2 text-sm">Service Worker Status</h3>

          {/* Connection Status */}
          <div className="mb-2">
            <span className="font-medium">Connection:</span>{' '}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              status.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {status.enabled ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Update Status */}
          {status.updateAvailable && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-medium mb-1">Update Available!</p>
              <button
                onClick={applyUpdate}
                className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
              >
                Apply Update
              </button>
            </div>
          )}

          {/* Control Buttons */}
          <div className="space-y-1">
            <button
              onClick={checkForUpdate}
              className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Check for Updates
            </button>
            <button
              onClick={forceSync}
              className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Force Sync
            </button>
            <button
              onClick={handleGetCacheStatus}
              className="w-full px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
            >
              Cache Status
            </button>
            <button
              onClick={handleClearCache}
              className="w-full px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>

          {/* Cache Status Display */}
          {cacheStatus && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="font-medium mb-1">Cache Status:</p>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(cacheStatus, null, 2)}
              </pre>
            </div>
          )}

          {/* Debug Info */}
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <pre className="mt-1 text-xs overflow-auto max-h-32 bg-gray-50 p-1 rounded">
              {JSON.stringify(status, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Sync Status Component - Simple version that doesn't use CourseProvider */}
      {isClient && <SimpleSyncStatus />}
    </>
  )
}