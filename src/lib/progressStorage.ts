import {
  UserProgress,
  DayProgress,
  SessionState,
  StorageResult,
  StorageError,
  STORAGE_KEYS,
  DEFAULT_PROGRESS,
  DEFAULT_DAY_PROGRESS
} from '@/shared/progressTypes'
import { db, dbUtils, initializeDatabase, transactionWithRetry } from './db'
import { syncService, SyncService } from './sync'
import { dataMigration } from './migration'
import type { Session } from '@supabase/supabase-js'

// Types for sync functionality
export interface SyncResult {
  success: boolean
  message?: string
  progress?: UserProgress
  conflicts?: any[]
}

export interface SyncOptions {
  forceSync?: boolean
  resolutionStrategy?: 'local_wins' | 'remote_wins' | 'merge'
}

export interface AuthState {
  isAuthenticated: boolean
  user?: any
  token?: string
}

// Extended StorageError types
declare module '@/shared/progressTypes' {
  interface StorageError {
    code: 'QUOTA_EXCEEDED' | 'ACCESS_DENIED' | 'DATA_CORRUPTED' | 'UNKNOWN' | 'UNAUTHORIZED' | 'API_ERROR' | 'NETWORK_ERROR'
  }
}

class ProgressStorage {
  // Sync and authentication state
  private authState: AuthState = { isAuthenticated: false }
  private syncQueue: Array<{ action: string; data: any }> = []
  private isInitialized: boolean = false
  private session?: Session | null
  public isSyncing: boolean = false

  constructor() {
    // Initialize database when constructed
    this.initialize()
  }

  // Initialize database and check for migration
  private async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return

    try {
      await initializeDatabase()

      // Run migration if needed
      const migrationStatus = dataMigration.getMigrationStatus()
      if (!migrationStatus.isMigrated && migrationStatus.localStorageData?.hasProgress) {
        // Running localStorage to IndexedDB migration...
        const migrationResult = await dataMigration.migrate()
        if (migrationResult.success) {
          // Migration completed successfully
        } else {
          // Migration failed
        }
      }

      this.isInitialized = true
    } catch (error) {
      // Failed to initialize progress storage
    }
  }

  // Ensure initialization before operations
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  // Authentication state management
  setAuthState(authState: AuthState): void {
    this.authState = authState

    // Initialize sync service when authenticated
    if (authState.isAuthenticated) {
      syncService.initialize(this.session || null)
    }
  }

  getAuthState(): AuthState {
    return { ...this.authState }
  }

  // Set session for sync
  setSession(session: Session | null): void {
    this.session = session
    if (session?.user) {
      this.authState = {
        isAuthenticated: true,
        user: session.user,
        token: session.access_token
      }
      syncService.initialize(session)
    } else {
      this.authState = { isAuthenticated: false }
      syncService.initialize(null)
    }
  }

  // Progress specific methods
  async getUserProgress(): Promise<StorageResult<UserProgress>> {
    await this.ensureInitialized()

    try {
      // Get all progress records from IndexedDB
      const records = await db.userProgress.toArray()

      if (records.length === 0) {
        return { success: true, data: DEFAULT_PROGRESS }
      }

      // Combine all records into single UserProgress object
      const combinedProgress: UserProgress = {
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

      for (const record of records) {
        const progress = dbUtils.fromProgressEntity(record)

        if (record.dayId === 0) {
          // Overall progress record
          combinedProgress.currentDay = progress.currentDay
          combinedProgress.overallProgress = progress.overallProgress
        } else {
          // Day-specific progress
          const dayProgress = progress.days[record.dayId] || {
            completedSections: [],
            quizScores: {},
            currentSlide: 0,
            lastAccessed: new Date().toISOString(),
            completionPercentage: 0
          }

          combinedProgress.days[record.dayId] = dayProgress

          // Track latest accessed day
          const timestamp = new Date(dayProgress.lastAccessed).getTime()
          if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp
            latestDayId = record.dayId
          }

          // Update overall stats
          if (dayProgress.completionPercentage >= 80) {
            combinedProgress.overallProgress.totalDaysCompleted++
          }
          combinedProgress.overallProgress.totalQuizzesCompleted +=
            Object.keys(dayProgress.quizScores || {}).length
        }
      }

      // Set current day if not already set
      if (!combinedProgress.currentDay && latestDayId > 0) {
        combinedProgress.currentDay = latestDayId
      }

      return { success: true, data: combinedProgress }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to get user progress',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  async saveUserProgress(progress: UserProgress): Promise<StorageResult<void>> {
    await this.ensureInitialized()

    try {
      await transactionWithRetry(async () => {
        // Clear existing progress records
        await db.userProgress.clear()

        // Save overall progress (dayId 0)
        const overallEntity = dbUtils.toProgressEntity({
          currentDay: progress.currentDay,
          days: {},
          overallProgress: progress.overallProgress
        }, 0)
        await db.userProgress.put(overallEntity)

        // Save each day's progress
        for (const [dayId, dayProgress] of Object.entries(progress.days)) {
          const dayNum = parseInt(dayId)
          const dayFullProgress: UserProgress = {
            currentDay: dayNum,
            days: { [dayNum]: dayProgress },
            overallProgress: {
              totalDaysCompleted: 0,
              totalQuizzesCompleted: 0,
              lastAccessed: new Date().toISOString()
            }
          }

          const entity = dbUtils.toProgressEntity(dayFullProgress, dayNum)
          entity.dirty = true // Mark for sync
          await db.userProgress.put(entity)
        }
      })

      // Trigger sync if authenticated
      if (this.authState.isAuthenticated) {
        this.queueSync('save_user_progress', { progress })
      }

      return { success: true, data: undefined }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to save user progress',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  async getDayProgress(dayId: number): Promise<StorageResult<DayProgress | null>> {
    const userProgressResult = await this.getUserProgress()
    if (!userProgressResult.success) {
      return userProgressResult as StorageResult<null>
    }

    const dayProgress = userProgressResult.data.days[dayId]
    if (!dayProgress) {
      return { success: true, data: null }
    }

    return { success: true, data: dayProgress }
  }

  async saveDayProgress(dayId: number, progress: Partial<DayProgress>): Promise<StorageResult<void>> {
    const userProgressResult = await this.getUserProgress()
    if (!userProgressResult.success) {
      return userProgressResult as StorageResult<void>
    }

    const userProgress = userProgressResult.data
    const existingDayProgress = userProgress.days[dayId]

    const updatedDayProgress: DayProgress = {
      ...DEFAULT_DAY_PROGRESS,
      ...existingDayProgress,
      ...progress,
      lastAccessed: new Date().toISOString()
    }

    // Calculate completion percentage
    const totalSections = 5
    const completedSections = updatedDayProgress.completedSections.length
    updatedDayProgress.completionPercentage = Math.round(
      (completedSections / totalSections) * 100
    )

    userProgress.days[dayId] = updatedDayProgress
    userProgress.currentDay = dayId
    userProgress.overallProgress.lastAccessed = new Date().toISOString()

    // Update overall stats
    let daysCompleted = 0
    let quizzesCompleted = 0
    for (const dayData of Object.values(userProgress.days)) {
      if (dayData.completionPercentage >= 80) {
        daysCompleted++
      }
      quizzesCompleted += Object.keys(dayData.quizScores).length
    }
    userProgress.overallProgress.totalDaysCompleted = daysCompleted
    userProgress.overallProgress.totalQuizzesCompleted = quizzesCompleted

    const result = await this.saveUserProgress(userProgress)

    // Trigger sync after progress update
    if (result.success && this.authState.isAuthenticated) {
      this.queueSync('update_day_progress', { dayId, progress })
    }

    return result
  }

  async updateSectionCompletion(dayId: number, sectionId: string, completed: boolean): Promise<StorageResult<void>> {
    const dayResult = await this.getDayProgress(dayId)
    if (!dayResult.success) {
      return dayResult as StorageResult<void>
    }

    const dayProgress = dayResult.data || DEFAULT_DAY_PROGRESS
    let completedSections = [...dayProgress.completedSections]

    if (completed && !completedSections.includes(sectionId)) {
      completedSections.push(sectionId)
    } else if (!completed && completedSections.includes(sectionId)) {
      completedSections = completedSections.filter(id => id !== sectionId)
    }

    const result = await this.saveDayProgress(dayId, { completedSections })

    // Trigger sync after progress update, especially for quiz completion
    if (result.success && this.authState.isAuthenticated) {
      this.queueSync('update_section_completion', { dayId, sectionId, completed })
    }

    return result
  }

  async updateQuizScore(dayId: number, quizId: string, score: number): Promise<StorageResult<void>> {
    const dayResult = await this.getDayProgress(dayId)
    if (!dayResult.success) {
      return dayResult as StorageResult<void>
    }

    const dayProgress = dayResult.data || DEFAULT_DAY_PROGRESS
    const quizScores = { ...dayProgress.quizScores, [quizId]: score }

    const result = await this.saveDayProgress(dayId, { quizScores })

    // Trigger sync immediately after quiz completion
    if (result.success && this.authState.isAuthenticated) {
      this.queueSync('update_quiz_score', { dayId, quizId, score })
    }

    return result
  }

  async updateCurrentSlide(dayId: number, slideIndex: number): Promise<StorageResult<void>> {
    const result = await this.saveDayProgress(dayId, { currentSlide: slideIndex })

    // Trigger sync after progress update
    if (result.success && this.authState.isAuthenticated) {
      this.queueSync('update_current_slide', { dayId, slideIndex })
    }

    return result
  }

  async clearAllProgress(): Promise<StorageResult<void>> {
    try {
      await db.userProgress.clear()

      // Clear localStorage keys as well
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS)
      }

      return { success: true, data: undefined }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to clear progress',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  // Session state methods
  async getSessionState(): Promise<StorageResult<SessionState>> {
    await this.ensureInitialized()

    try {
      const record = await db.sessionState.where('key').equals('main').first()

      if (!record) {
        return {
          success: true,
          data: {
            showLoginModal: false,
            currentDay: null,
            navigationHistory: []
          }
        }
      }

      return { success: true, data: dbUtils.fromSessionEntity(record) }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to get session state',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  async saveSessionState(state: SessionState): Promise<StorageResult<void>> {
    await this.ensureInitialized()

    try {
      const entity = dbUtils.toSessionEntity(state, 'main')
      await db.sessionState.put(entity)

      // Also save to sessionStorage for quick access
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(state))
      }

      return { success: true, data: undefined }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to save session state',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  // Legacy compatibility
  getLastSeenDay(): StorageResult<string | null> {
    if (typeof window === 'undefined') {
      return { success: true, data: null }
    }

    try {
      const lastSeen = sessionStorage.getItem(STORAGE_KEYS.LAST_SEEN_DAY)
      return { success: true, data: lastSeen }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to get last seen day',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  setLastSeenDay(dayId: string): StorageResult<void> {
    if (typeof window === 'undefined') {
      return { success: true, data: undefined }
    }

    try {
      sessionStorage.setItem(STORAGE_KEYS.LAST_SEEN_DAY, dayId)
      return { success: true, data: undefined }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to set last seen day',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  // Import/Export functionality
  async exportProgress(): Promise<StorageResult<string>> {
    try {
      const exportData = await db.exportData()
      return { success: true, data: JSON.stringify(exportData, null, 2) }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to export progress',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  async importProgress(jsonData: string): Promise<StorageResult<void>> {
    try {
      const importData = JSON.parse(jsonData)

      if (!importData.userProgress && !importData.progress) {
        throw new Error('Invalid import data format')
      }

      // If it's old format with progress property, convert it
      if (importData.progress) {
        return this.saveUserProgress(importData.progress)
      }

      // If it's new format with userProgress
      if (importData.userProgress) {
        await db.importData(importData)
        return { success: true, data: undefined }
      }

      throw new Error('No valid progress data found')
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to import progress',
        code: 'DATA_CORRUPTED'
      }
      return { success: false, error: storageError }
    }
  }

  // Sync queue management
  private queueSync(action: string, data: any): void {
    if (!this.authState.isAuthenticated) return

    this.syncQueue.push({ action, data })

    // Add to sync service queue
    syncService.queueAction(action, data)
  }

  // Main sync functionality
  async syncProgress(options?: SyncOptions): Promise<SyncResult> {
    if (!this.authState.isAuthenticated) {
      return { success: false, message: 'User not authenticated' }
    }

    try {
      const result = await syncService.syncProgress(options)

      // Clear sync queue on successful sync
      if (result.success) {
        this.syncQueue = []

        // Mark records as clean
        const dirtyRecords = await db.getDirtyRecords()
        for (const record of [...dirtyRecords.progress, ...dirtyRecords.sessions]) {
          record.dirty = false
          if ('dayId' in record) {
            await db.userProgress.put(record)
          } else {
            await db.sessionState.put(record)
          }
        }
      }

      return result
    } catch (error) {
      console.error('Sync error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  // Load progress from database (for initial load)
  async loadRemoteProgress(): Promise<StorageResult<UserProgress>> {
    if (!this.authState.isAuthenticated || !this.authState.token) {
      return { success: false, error: { message: 'User not authenticated', code: 'UNAUTHORIZED' } }
    }

    try {
      const response = await fetch('/api/progress', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authState.token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: { message: errorData.error || 'Failed to load remote progress', code: 'API_ERROR' } }
      }

      const remoteProgress = await response.json()

      // Save to IndexedDB
      await this.saveUserProgress(remoteProgress)

      return { success: true, data: remoteProgress }
    } catch (error) {
      console.error('Error loading remote progress:', error)
      return { success: false, error: { message: error instanceof Error ? error.message : 'Network error', code: 'NETWORK_ERROR' } }
    }
  }

  // Get sync status
  getSyncStatus(): {
    isSyncing: boolean
    isOnline: boolean
    isAuthenticated: boolean
    queueLength: number
    lastSyncTime?: Date
  } {
    const syncStats = syncService.getSyncStats()
    return {
      isSyncing: syncStats.isOnline && this.authState.isAuthenticated && this.isSyncing,
      isOnline: syncStats.isOnline,
      isAuthenticated: this.authState.isAuthenticated,
      queueLength: this.syncQueue.length,
      lastSyncTime: syncStats.lastSyncTime
    }
  }

  // Cleanup
  destroy(): void {
    this.syncQueue = []
    this.isSyncing = false
    syncService.destroy()
  }
}

// Export singleton instance
export const progressStorage = new ProgressStorage()
export default progressStorage