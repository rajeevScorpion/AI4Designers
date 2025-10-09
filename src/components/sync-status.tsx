'use client'

import { useEffect, useState } from 'react'
import { useSync } from '@/lib/sync'
import { useAuth } from '@/contexts/AuthContext'
import { Wifi, WifiOff, Sync, CheckCircle, AlertCircle } from 'lucide-react'

export function SyncStatus() {
  const { user } = useAuth()
  const { syncStats, isSyncing, isOnline } = useSync()
  const [showStatus, setShowStatus] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    if (syncStats.lastSyncTime) {
      setLastSync(new Date(syncStats.lastSyncTime))
    }
  }, [syncStats.lastSyncTime])

  // Don't show if user is not authenticated
  if (!user) {
    return null
  }

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Sync Status Button */}
      <button
        onClick={() => setShowStatus(!showStatus)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-colors ${
          !isOnline
            ? 'bg-red-500 text-white'
            : isSyncing
            ? 'bg-blue-500 text-white'
            : syncStats.pendingItems > 0
            ? 'bg-yellow-500 text-white'
            : 'bg-green-500 text-white'
        }`}
      >
        {/* Status Icon */}
        {!isOnline ? (
          <WifiOff className="w-4 h-4" />
        ) : isSyncing ? (
          <Sync className="w-4 h-4 animate-spin" />
        ) : syncStats.pendingItems > 0 ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}

        {/* Status Text */}
        <span className="text-sm font-medium">
          {!isOnline
            ? 'Offline'
            : isSyncing
            ? 'Syncing...'
            : syncStats.pendingItems > 0
            ? `${syncStats.pendingItems} pending`
            : 'Synced'
          }
        </span>
      </button>

      {/* Status Panel */}
      {showStatus && (
        <div className="absolute bottom-16 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">Sync Status</h3>

          {/* Connection Status */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Last Sync */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Last sync</span>
            <span className="text-xs text-gray-500">{formatLastSync(lastSync)}</span>
          </div>

          {/* Pending Items */}
          {syncStats.pendingItems > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending items</span>
              <span className="text-xs text-yellow-500 font-medium">{syncStats.pendingItems}</span>
            </div>
          )}

          {/* Total Synced */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total synced</span>
            <span className="text-xs text-gray-500">{syncStats.totalSynced}</span>
          </div>

          {/* Action Button */}
          {isOnline && !isSyncing && syncStats.pendingItems > 0 && (
            <button
              onClick={() => {
                // Trigger sync
                window.dispatchEvent(new CustomEvent('triggerManualSync'))
              }}
              className="w-full mt-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Sync Now
            </button>
          )}
        </div>
      )}
    </div>
  )
}