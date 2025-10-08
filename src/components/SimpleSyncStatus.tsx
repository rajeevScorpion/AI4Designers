'use client'

import { useState, useEffect } from 'react'

export function SimpleSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<string>('Idle')

  useEffect(() => {
    // Simple sync status that doesn't depend on CourseProvider
    const checkSyncStatus = async () => {
      try {
        const response = await fetch('/api/progress/sync/status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const queueLength = data.status?.queueLength || 0
            if (queueLength > 0) {
              setSyncStatus(`Syncing ${queueLength} items...`)
            } else {
              setSyncStatus('Synced')
            }
          }
        }
      } catch (error) {
        console.error('Failed to check sync status:', error)
        setSyncStatus('Offline')
      }
    }

    // Check status every 5 seconds
    checkSyncStatus()
    const interval = setInterval(checkSyncStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm z-50">
      Sync: {syncStatus}
    </div>
  )
}