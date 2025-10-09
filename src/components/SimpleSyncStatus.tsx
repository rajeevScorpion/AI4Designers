'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SimpleSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<string>('Idle')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    // Check authentication status first
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session?.user)
        return !!session?.user
      } catch {
        setIsAuthenticated(false)
        return false
      }
    }

    // Simple sync status that only runs for authenticated users
    const checkSyncStatus = async () => {
      // Don't check sync status if user is not authenticated
      const isAuth = await checkAuth()
      if (!isAuth) {
        setSyncStatus('Not authenticated')
        return
      }

      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          setSyncStatus('No token')
          return
        }

        const response = await fetch('/api/progress/sync/status', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
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
        } else if (response.status === 401) {
          setSyncStatus('Unauthorized')
        }
      } catch (error) {
        console.error('Failed to check sync status:', error)
        setSyncStatus('Offline')
      }
    }

    // Initial check
    checkSyncStatus()

    // Only set up interval if user is authenticated
    let interval: NodeJS.Timeout | null = null
    if (isAuthenticated) {
      interval = setInterval(checkSyncStatus, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAuthenticated])

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