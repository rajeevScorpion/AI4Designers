import Dexie, { Table } from 'dexie'
import type { UserProgress, DayProgress, SessionState } from '@/shared/progressTypes'

// Generate unique client ID for this device/browser
export const CLIENT_ID = typeof window !== 'undefined'
  ? localStorage.getItem('ai4designers_client_id') || (() => {
      const id = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('ai4designers_client_id', id)
      return id
    })()
  : 'server'

// Base syncable entity interface
export interface SyncableEntity {
  id?: number
  data: any
  updated_at: Date
  deleted: boolean
  dirty: boolean
  client_id: string
  sync_version: number
}

// User progress entity with day-specific data
export interface UserProgressEntity extends SyncableEntity {
  dayId: number
}

// Session state entity
export interface SessionEntity extends SyncableEntity {
  key: string
}

// Sync queue item
export interface SyncQueueItem {
  id?: number
  action: string
  data: any
  timestamp: number
  retries: number
  last_attempt?: Date
}

// Database version history
const DB_VERSION = 1
const DB_NAME = 'AI4DesignersDB'

export class AppDatabase extends Dexie {
  userProgress!: Table<UserProgressEntity>
  sessionState!: Table<SessionEntity>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super(DB_NAME)

    // Define database schema
    this.version(DB_VERSION).stores({
      // User progress store - tracks progress for each day
      userProgress: '++id, dayId, updated_at, dirty, deleted, client_id, sync_version',

      // Session state store - tracks UI session data
      sessionState: '++id, key, updated_at, dirty, deleted, client_id',

      // Sync queue store - tracks pending sync actions
      syncQueue: '++id, action, timestamp, retries'
    })

    // Upgrade hooks for future migrations
    this.version(2).stores({
      // Future stores can be added here
    }).upgrade(tx => {
      // Migration logic for version 2 can be added here
      console.log('Upgrading to database version 2')
    })
  }

  // Helper methods for bulk operations
  async bulkUpsertProgress(entities: UserProgressEntity[]): Promise<void> {
    await this.transaction('rw', this.userProgress, async () => {
      for (const entity of entities) {
        await this.userProgress.put(entity)
      }
    })
  }

  // Get all dirty records that need syncing
  async getDirtyRecords(): Promise<{
    progress: UserProgressEntity[]
    sessions: SessionEntity[]
  }> {
    const [progress, sessions] = await Promise.all([
      this.userProgress.where('dirty').equals(1).toArray(),
      this.sessionState.where('dirty').equals(1).toArray()
    ])

    return { progress, sessions }
  }

  // Clean up old sync queue items
  async cleanupSyncQueue(olderThanDays = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    const deleted = await this.syncQueue
      .where('timestamp')
      .below(cutoffDate.getTime())
      .delete()
    return deleted
  }

  // Get queue statistics
  async getQueueStats(): Promise<{
    totalItems: number
    pendingItems: number
    failedItems: number
    oldestItem?: Date
  }> {
    const [totalItems, pendingItems, failedItems, oldestItem] = await Promise.all([
      this.syncQueue.count(),
      this.syncQueue.where('retries').equals(0).count(),
      this.syncQueue.where('retries').above(0).count(),
      this.syncQueue.orderBy('timestamp').first()
    ])

    return {
      totalItems,
      pendingItems,
      failedItems,
      oldestItem: oldestItem ? new Date(oldestItem.timestamp) : undefined
    }
  }

  // Clear all data (for logout or reset)
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.userProgress.clear(),
      this.sessionState.clear(),
      this.syncQueue.clear()
    ])
  }

  // Export data for backup
  async exportData(): Promise<{
    userProgress: UserProgressEntity[]
    sessionState: SessionEntity[]
    syncQueue: SyncQueueItem[]
    exportDate: Date
    version: number
  }> {
    const [userProgress, sessionState, syncQueue] = await Promise.all([
      this.userProgress.toArray(),
      this.sessionState.toArray(),
      this.syncQueue.toArray()
    ])

    return {
      userProgress,
      sessionState,
      syncQueue,
      exportDate: new Date(),
      version: DB_VERSION
    }
  }

  // Import data from backup
  async importData(data: {
    userProgress: UserProgressEntity[]
    sessionState: SessionEntity[]
    syncQueue: SyncQueueItem[]
  }): Promise<void> {
    await this.transaction('rw', [this.userProgress, this.sessionState, this.syncQueue], async () => {
      await this.clearAllData()

      await Promise.all([
        this.userProgress.bulkAdd(data.userProgress),
        this.sessionState.bulkAdd(data.sessionState),
        this.syncQueue.bulkAdd(data.syncQueue)
      ])
    })
  }
}

// Export singleton instance
export const db = new AppDatabase()

// Database utility functions
export const dbUtils = {
  // Convert UserProgress to UserProgressEntity
  toProgressEntity: (progress: UserProgress, dayId: number): UserProgressEntity => ({
    data: progress,
    dayId,
    updated_at: new Date(),
    deleted: false,
    dirty: true,
    client_id: CLIENT_ID,
    sync_version: 1
  }),

  // Convert UserProgressEntity back to UserProgress
  fromProgressEntity: (entity: UserProgressEntity): UserProgress => ({
    ...entity.data,
    // Ensure all required fields are present
    currentDay: entity.data.currentDay || null,
    days: entity.data.days || {},
    overallProgress: entity.data.overallProgress || {
      totalDaysCompleted: 0,
      totalQuizzesCompleted: 0,
      lastAccessed: new Date().toISOString()
    }
  }),

  // Convert SessionState to SessionEntity
  toSessionEntity: (state: SessionState, key: string): SessionEntity => ({
    data: state,
    key,
    updated_at: new Date(),
    deleted: false,
    dirty: true,
    client_id: CLIENT_ID,
    sync_version: 1
  }),

  // Convert SessionEntity back to SessionState
  fromSessionEntity: (entity: SessionEntity): SessionState => ({
    ...entity.data,
    // Ensure all required fields are present
    showLoginModal: entity.data.showLoginModal || false,
    currentDay: entity.data.currentDay || null,
    navigationHistory: entity.data.navigationHistory || []
  })
}

// Database initialization helper
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection
    await db.userProgress.count()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)

    // If database is corrupted, delete and recreate
    if (error instanceof Error && (error.name === 'DatabaseClosedError' || error.name === 'VersionError')) {
      console.log('Deleting corrupted database...')
      await Dexie.delete(DB_NAME)
      console.log('Database recreated')
    }

    throw error
  }
}

// Helper for transaction with retry
export async function transactionWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
    }
  }

  throw lastError!
}

// Types are already exported above