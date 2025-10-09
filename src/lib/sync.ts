import { useState, useEffect } from 'react'
import { db, dbUtils, type UserProgressEntity, type SessionEntity } from './db'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProgress } from '@/shared/progressTypes'

export interface SyncOptions {
  forceFullSync?: boolean
  resolutionStrategy?: 'local_wins' | 'remote_wins' | 'merge'
  batchSize?: number
  skipConflictCheck?: boolean
}

export interface SyncResult {
  success: boolean
  message: string
  syncedItems?: number
  conflicts?: any[]
  errors?: string[]
  lastSyncTime?: Date
}

export interface SyncStats {
  isOnline: boolean
  lastSyncTime?: Date
  pendingItems: number
  failedItems: number
  totalSynced: number
  conflictsResolved: number
}

// Conflict resolution strategies
export enum ConflictResolution {
  LOCAL_WINS = 'local_wins',
  REMOTE_WINS = 'remote_wins',
  MERGE = 'merge'
}

// Sync service class
export class SyncService {
  private static instance: SyncService
  private isOnline: boolean = true
  private isSyncing: boolean = false
  private syncInterval?: NodeJS.Timeout
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private session?: Session | null
  private user?: User | null
  private syncStats: SyncStats = {
    isOnline: true,
    pendingItems: 0,
    failedItems: 0,
    totalSynced: 0,
    conflictsResolved: 0
  }

  private constructor() {
    this.setupEventListeners()
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  // Initialize sync service with user session
  async initialize(session: Session | null): Promise<void> {
    this.session = session
    this.user = session?.user || null

    if (this.user) {
      // Start auto-sync for authenticated users
      this.startAutoSync()

      // Trigger initial sync to load remote progress
      try {
        await this.syncProgress({ forceFullSync: true })
        console.log('Initial sync completed')
      } catch (error) {
        console.error('Initial sync failed:', error)
      }
    } else {
      // Stop sync if user is not authenticated
      this.stopAutoSync()
    }
  }

  // Setup event listeners for online/offline detection
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      this.isOnline = true
      this.syncStats.isOnline = true
      this.emit('online', { isOnline: true })
      // Trigger immediate sync when coming back online
      if (this.user) {
        this.syncProgress({ forceFullSync: false })
      }
    }

    const handleOffline = () => {
      this.isOnline = false
      this.syncStats.isOnline = false
      this.emit('offline', { isOnline: false })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial online status
    this.isOnline = navigator.onLine
    this.syncStats.isOnline = this.isOnline
  }

  // Start automatic background sync
  private startAutoSync(intervalMs: number = 30000): void {
    this.stopAutoSync()

    this.syncInterval = setInterval(async () => {
      if (this.isOnline && this.user && !this.isSyncing) {
        try {
          await this.syncProgress()
        } catch (error) {
          // Auto-sync failed
        }
      }
    }, intervalMs)
  }

  // Stop automatic sync
  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  // Main sync function with retry logic
  async syncProgress(options: SyncOptions = {}): Promise<SyncResult> {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (!this.user || !this.isOnline) {
        return {
          success: false,
          message: this.user ? 'Offline - cannot sync' : 'User not authenticated'
        }
      }

      if (this.isSyncing && !options.forceFullSync) {
        return {
          success: false,
          message: 'Sync already in progress'
        }
      }

      this.isSyncing = true
      this.emit('syncStart', { status: 'syncing', attempt })

      try {
        const { dirtyRecords } = await this.getDirtyRecords()

        if (dirtyRecords.length === 0 && !options.forceFullSync) {
          // Pull latest changes from server
          const pullResult = await this.pullLatestChanges()
          return {
            success: true,
            message: 'No changes to sync',
            syncedItems: 0,
            lastSyncTime: new Date()
          }
        }

        // Push local changes to server
        const pushResult = await this.pushLocalChanges(dirtyRecords, options)

        // Pull latest changes from server
        const pullResult = await this.pullLatestChanges()

        // Clean up sync queue
        await this.cleanupSyncQueue()

        // Update stats
        this.syncStats.lastSyncTime = new Date()
        this.syncStats.totalSynced += pushResult.syncedItems || 0
        this.syncStats.conflictsResolved += pushResult.conflicts?.length || 0

        const result: SyncResult = {
          success: true,
          message: `Synced ${pushResult.syncedItems} items successfully`,
          syncedItems: pushResult.syncedItems,
          conflicts: pushResult.conflicts,
          errors: pushResult.errors,
          lastSyncTime: new Date()
        }

        this.emit('syncComplete', result)
        return result
      } catch (error) {
        lastError = error as Error
        console.error(`Sync attempt ${attempt} failed:`, error)

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          console.log(`Retrying sync in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      } finally {
        this.isSyncing = false
      }
    }

    // All retries failed
    const result: SyncResult = {
      success: false,
      message: lastError instanceof Error ? lastError.message : 'Sync failed after multiple attempts',
      errors: [lastError instanceof Error ? lastError.message : 'Unknown error']
    }
    this.emit('syncError', result)
    return result
  }

  // Get dirty records that need to be synced
  private async getDirtyRecords(): Promise<{
    dirtyRecords: (UserProgressEntity | SessionEntity)[]
  }> {
    const { progress, sessions } = await db.getDirtyRecords()
    const dirtyRecords = [...progress, ...sessions]
    return { dirtyRecords }
  }

  // Push local changes to server
  private async pushLocalChanges(
    records: (UserProgressEntity | SessionEntity)[],
    options: SyncOptions
  ): Promise<SyncResult> {
    let syncedItems = 0
    const conflicts: any[] = []
    const errors: string[] = []

    try {
      // Process progress records
      const progressRecords = records.filter(r => 'dayId' in r) as UserProgressEntity[]
      if (progressRecords.length > 0) {
        // Prepare data for sync API
        const localProgress: UserProgress = {
          currentDay: null,
          days: {},
          overallProgress: {
            totalDaysCompleted: 0,
            totalQuizzesCompleted: 0,
            lastAccessed: new Date().toISOString()
          }
        }

        // Combine all progress into single object
        progressRecords.forEach(record => {
          const progress = dbUtils.fromProgressEntity(record)
          if (record.dayId === 0) {
            // Overall progress record
            localProgress.currentDay = progress.currentDay
            localProgress.overallProgress = progress.overallProgress
          } else {
            // Day-specific progress
            localProgress.days[record.dayId] = progress.days[record.dayId] || {
              completedSections: [],
              quizScores: {},
              currentSlide: 0,
              lastAccessed: new Date().toISOString(),
              completionPercentage: 0
            }
          }
        })

        // Get current session to ensure fresh token
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          throw new Error('No valid authentication token')
        }

        // Call sync API
        const response = await fetch('/api/progress/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            localProgress,
            forceSync: options.forceFullSync || false,
            resolutionStrategy: options.resolutionStrategy || ConflictResolution.MERGE
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Sync failed')
        }

        if (data.success) {
          // Update local records with resolved data
          await this.updateLocalRecords(data.progress, progressRecords)
          syncedItems += progressRecords.length

          if (data.conflicts && data.conflicts.length > 0) {
            conflicts.push(...data.conflicts)
          }
        }
      }

      // Process session records if needed (usually sessions aren't synced to server)
      const sessionRecords = records.filter(r => 'key' in r) as SessionEntity[]
      for (const record of sessionRecords) {
        // Mark session records as synced (dirty = false)
        record.dirty = false
        await db.sessionState.put(record)
        syncedItems++
      }

      return {
        success: true,
        message: `Pushed ${syncedItems} items to server`,
        syncedItems,
        conflicts,
        errors
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error')
      return {
        success: false,
        message: 'Failed to push changes',
        syncedItems,
        conflicts,
        errors
      }
    }
  }

  // Pull latest changes from server
  private async pullLatestChanges(): Promise<SyncResult> {
    let pulledItems = 0

    try {
      // Get current session to ensure fresh token
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('No valid authentication token')
      }

      // Get last sync time
      const lastSyncTime = await this.getLastSyncTime()

      // Use regular client - auth headers are automatically included
      const serviceSupabase = createClient()

      const { data: remoteProgress, error } = await serviceSupabase
        .from('user_progress')
        .select('*')
        .eq('user_id', this.user!.id)
        .gte('updated_at', lastSyncTime.toISOString())
        .order('updated_at', { ascending: true })

      if (error) {
        throw error
      }

      if (remoteProgress && remoteProgress.length > 0) {
        // Convert remote progress to local format
        const localProgress = this.transformRemoteToLocal(remoteProgress)

        // Update IndexedDB with remote changes
        for (const [dayId, dayProgress] of Object.entries(localProgress.days)) {
          const dayNum = parseInt(dayId)
          const existingRecord = await db.userProgress
            .where('dayId')
            .equals(dayNum)
            .first()

          if (existingRecord) {
            // Merge with existing local changes if any
            const mergedProgress = this.mergeProgress(
              dbUtils.fromProgressEntity(existingRecord),
              { days: { [dayNum]: dayProgress } } as UserProgress
            )

            const entity = dbUtils.toProgressEntity(mergedProgress, dayNum)
            entity.dirty = false // Remote data is clean
            entity.sync_version = remoteProgress.find(p => p.day_id === dayNum)?.sync_version || 1
            await db.userProgress.put(entity)
          } else {
            // New record from server
            const entity = dbUtils.toProgressEntity(
              { days: { [dayNum]: dayProgress } } as UserProgress,
              dayNum
            )
            entity.dirty = false
            entity.sync_version = remoteProgress.find(p => p.day_id === dayNum)?.sync_version || 1
            await db.userProgress.put(entity)
          }

          pulledItems++
        }

        // Update last sync time
        await this.setLastSyncTime(new Date())
      }

      return {
        success: true,
        message: `Pulled ${pulledItems} updates from server`,
        syncedItems: pulledItems
      }
    } catch (error) {
      console.error('Failed to pull changes:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to pull changes'
      }
    }
  }

  // Transform remote progress format to local format
  private transformRemoteToLocal(remoteData: any[]): UserProgress {
    const localProgress: UserProgress = {
      currentDay: null,
      days: {},
      overallProgress: {
        totalDaysCompleted: 0,
        totalQuizzesCompleted: 0,
        lastAccessed: new Date().toISOString()
      }
    }

    let latestDayId = 0
    let latestTimestamp = 0

    remoteData.forEach(progress => {
      // Handle both day_id and dayId field names
      const dayId = progress.day_id || progress.dayId
      const dayProgress = {
        completedSections: progress.completed_sections || [],
        completedSlides: progress.completed_slides || [],
        quizScores: progress.quiz_scores || {},
        currentSlide: progress.current_slide || 0,
        lastAccessed: progress.updated_at || new Date().toISOString(),
        completionPercentage: progress.is_completed ? 100 : 0
      }

      localProgress.days[dayId] = dayProgress

      // Track latest accessed day
      const timestamp = new Date(progress.updated_at || progress.created_at).getTime()
      if (timestamp > latestTimestamp) {
        latestTimestamp = timestamp
        latestDayId = dayId
      }

      if (progress.is_completed) {
        localProgress.overallProgress.totalDaysCompleted++
      }

      // Count completed quizzes
      const quizCount = Object.keys(progress.quiz_scores || {}).length
      localProgress.overallProgress.totalQuizzesCompleted += quizCount
    })

    localProgress.currentDay = latestDayId || 1

    return localProgress
  }

  // Update local records with synced data from server
  private async updateLocalRecords(
    remoteProgress: UserProgress,
    localRecords: UserProgressEntity[]
  ): Promise<void> {
    for (const record of localRecords) {
      if (record.dayId === 0) {
        // Update overall progress
        const entity = dbUtils.toProgressEntity(remoteProgress, 0)
        entity.id = record.id
        entity.dirty = false
        entity.sync_version = remoteProgress.days ? 1 : record.sync_version
        await db.userProgress.put(entity)
      } else if (remoteProgress.days[record.dayId]) {
        // Update day-specific progress
        const dayProgress = remoteProgress.days[record.dayId]
        const entity = dbUtils.toProgressEntity(
          { days: { [record.dayId]: dayProgress } } as UserProgress,
          record.dayId
        )
        entity.id = record.id
        entity.dirty = false
        entity.sync_version = 1
        await db.userProgress.put(entity)
      }
    }
  }

  // Merge local and remote progress
  private mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
    const merged: UserProgress = {
      currentDay: Math.max(local.currentDay || 1, remote.currentDay || 1),
      days: { ...remote.days },
      overallProgress: {
        totalDaysCompleted: Math.max(
          local.overallProgress.totalDaysCompleted,
          remote.overallProgress.totalDaysCompleted
        ),
        totalQuizzesCompleted: Math.max(
          local.overallProgress.totalQuizzesCompleted,
          remote.overallProgress.totalQuizzesCompleted
        ),
        lastAccessed: new Date().toISOString()
      }
    }

    // Merge day progress
    for (const [dayId, localDay] of Object.entries(local.days)) {
      const dayNum = parseInt(dayId)
      const remoteDay = remote.days[dayNum]

      if (remoteDay) {
        // Merge arrays (union)
        const mergedSections = Array.from(
          new Set([...localDay.completedSections, ...remoteDay.completedSections])
        )

        // Merge objects (local wins for conflicts)
        const mergedQuizScores = { ...remoteDay.quizScores, ...localDay.quizScores }

        merged.days[dayNum] = {
          completedSections: mergedSections,
          quizScores: mergedQuizScores,
          currentSlide: Math.max(localDay.currentSlide, remoteDay.currentSlide),
          lastAccessed: new Date().toISOString(),
          completionPercentage: Math.max(localDay.completionPercentage, remoteDay.completionPercentage)
        }
      } else {
        merged.days[dayNum] = localDay
      }
    }

    return merged
  }

  // Get last sync time from IndexedDB
  private async getLastSyncTime(): Promise<Date> {
    try {
      const record = await db.sessionState.where('key').equals('last_sync_time').first()
      if (record) {
        return new Date(record.data.timestamp)
      }
      return new Date(0) // Return epoch time if no sync has occurred
    } catch (error) {
      console.error('Failed to get last sync time from IndexedDB:', error)
      // Fallback to localStorage if IndexedDB fails
      const lastSync = localStorage.getItem('ai4designers_last_sync')
      if (lastSync) {
        return new Date(lastSync)
      }
      return new Date(0)
    }
  }

  // Set last sync time
  private async setLastSyncTime(time: Date): Promise<void> {
    try {
      const entity = {
        key: 'last_sync_time',
        data: { timestamp: time.toISOString() },
        updated_at: time,
        deleted: false,
        dirty: false,
        client_id: this.user?.id || 'unknown',
        sync_version: 1
      }
      await db.sessionState.put(entity)
    } catch (error) {
      console.error('Failed to save last sync time to IndexedDB:', error)
      // Fallback to localStorage if IndexedDB fails
      localStorage.setItem('ai4designers_last_sync', time.toISOString())
    }
  }

  // Clean up sync queue and old records
  private async cleanupSyncQueue(): Promise<void> {
    await db.cleanupSyncQueue(7) // Clean items older than 7 days
  }

  // Queue action for background sync
  async queueAction(action: string, data: any): Promise<void> {
    const queueItem = {
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    }

    await db.syncQueue.put(queueItem)
    this.syncStats.pendingItems++

    // Trigger sync if online
    if (this.isOnline && this.user) {
      setTimeout(() => this.syncProgress(), 1000)
    }
  }

  // Event emitter methods
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }

  // Get sync statistics
  getSyncStats(): SyncStats {
    return { ...this.syncStats }
  }

  // Check if service is online
  isServiceOnline(): boolean {
    return this.isOnline
  }

  // Force immediate sync
  async forceSync(options: SyncOptions = { forceFullSync: true }): Promise<SyncResult> {
    return this.syncProgress(options)
  }

  // Clear all sync data (for logout)
  async clearSyncData(): Promise<void> {
    this.stopAutoSync()
    await db.clearAllData()
    // Clear localStorage items
    localStorage.removeItem('ai4designers_last_sync')
    localStorage.removeItem('ai4designers_client_id')
    this.syncStats = {
      isOnline: this.isOnline,
      pendingItems: 0,
      failedItems: 0,
      totalSynced: 0,
      conflictsResolved: 0
    }
  }

  // Cleanup method
  destroy(): void {
    this.stopAutoSync()
    this.eventListeners.clear()
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance()

// React hook for sync status
export function useSync() {
  const [syncStats, setSyncStats] = useState<SyncStats>(syncService.getSyncStats())
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const handleSyncStart = () => setIsSyncing(true)
    const handleSyncComplete = (result: SyncResult) => {
      setIsSyncing(false)
      setSyncStats(syncService.getSyncStats())
    }
    const handleSyncError = () => setIsSyncing(false)
    const handleOnline = () => setSyncStats(syncService.getSyncStats())
    const handleOffline = () => setSyncStats(syncService.getSyncStats())

    syncService.on('syncStart', handleSyncStart)
    syncService.on('syncComplete', handleSyncComplete)
    syncService.on('syncError', handleSyncError)
    syncService.on('online', handleOnline)
    syncService.on('offline', handleOffline)

    return () => {
      syncService.off('syncStart', handleSyncStart)
      syncService.off('syncComplete', handleSyncComplete)
      syncService.off('syncError', handleSyncError)
      syncService.off('online', handleOnline)
      syncService.off('offline', handleOffline)
    }
  }, [])

  return {
    syncStats,
    isSyncing,
    isOnline: syncService.isServiceOnline(),
    sync: (options?: SyncOptions) => syncService.syncProgress(options),
    forceSync: () => syncService.forceSync(),
    queueAction: (action: string, data: any) => syncService.queueAction(action, data)
  }
}