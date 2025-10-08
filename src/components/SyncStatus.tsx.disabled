'use client'

import { useCourse } from '@/contexts/CourseContext'
import { useEffect, useState } from 'react'

interface SyncStatusProps {
  className?: string
}

export function SyncStatus({ className = '' }: SyncStatusProps) {
  const { getSyncStatus, syncProgress, authState } = useCourse()
  const [syncStatus, setSyncStatus] = useState(getSyncStatus())
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [getSyncStatus])

  // Listen for sync events
  useEffect(() => {
    const handleSyncComplete = () => {
      setLastSyncTime(new Date())
    }

    window.addEventListener('syncComplete', handleSyncComplete)
    return () => window.removeEventListener('syncComplete', handleSyncComplete)
  }, [])

  const handleManualSync = async () => {
    if (!authState.isAuthenticated) return

    try {
      const result = await syncProgress()
      if (result.success) {
        setLastSyncTime(new Date())
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('syncComplete'))
      }
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  const getStatusIcon = () => {
    if (!syncStatus.isAuthenticated) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }

    if (!syncStatus.isOnline) {
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      )
    }

    if (syncStatus.isSyncing) {
      return (
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      )
    }

    if (syncStatus.queueLength > 0) {
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }

    return (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
    )
  }

  const getStatusText = () => {
    if (!authState.isAuthenticated) {
      return 'Sign in to sync'
    }

    if (!syncStatus.isOnline) {
      return 'Offline'
    }

    if (syncStatus.isSyncing) {
      return 'Syncing...'
    }

    if (syncStatus.queueLength > 0) {
      return `${syncStatus.queueLength} pending`
    }

    if (lastSyncTime) {
      const timeAgo = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000)
      if (timeAgo < 60) {
        return 'Synced'
      } else if (timeAgo < 3600) {
        return `Synced ${Math.floor(timeAgo / 60)}m ago`
      } else {
        return `Synced ${Math.floor(timeAgo / 3600)}h ago`
      }
    }

    return 'Synced'
  }

  if (!authState.isAuthenticated) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className="text-gray-600">
          {getStatusText()}
        </span>
      </div>

      {authState.isAuthenticated && syncStatus.isOnline && (
        <button
          onClick={handleManualSync}
          disabled={syncStatus.isSyncing}
          className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sync now"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  )
}