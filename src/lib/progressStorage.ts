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
  private isSyncing = false
  private syncInterval?: NodeJS.Timeout

  constructor() {
    // Initialize sync interval for authenticated users
    this.initAutoSync()
  }

  // Authentication state management
  setAuthState(authState: AuthState): void {
    this.authState = authState
    if (authState.isAuthenticated) {
      this.initAutoSync()
      // Trigger immediate sync when user authenticates
      this.syncProgress()
    } else {
      this.clearAutoSync()
    }
  }

  getAuthState(): AuthState {
    return { ...this.authState }
  }

  // Auto-sync functionality
  private initAutoSync(): void {
    this.clearAutoSync()
    if (this.authState.isAuthenticated && typeof window !== 'undefined') {
      this.syncInterval = setInterval(() => {
        this.syncProgress()
      }, 30000) // Sync every 30 seconds
    }
  }

  private clearAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  // Generic storage helpers
  private storageGet<T>(key: string, defaultValue: T): StorageResult<T> {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return { success: true, data: defaultValue }
      }

      const parsed = JSON.parse(item)
      return { success: true, data: parsed }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to get storage item',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  private storageSet<T>(key: string, data: T): StorageResult<void> {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(key, serialized)
      return { success: true, data: undefined }
    } catch (error) {
      let code: StorageError['code'] = 'UNKNOWN'

      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          code = 'QUOTA_EXCEEDED'
        } else if (error.name === 'SecurityError') {
          code = 'ACCESS_DENIED'
        }
      }

      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to set storage item',
        code
      }
      return { success: false, error: storageError }
    }
  }

  private storageRemove(key: string): StorageResult<void> {
    try {
      localStorage.removeItem(key)
      return { success: true, data: undefined }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to remove storage item',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  // Progress specific methods
  getUserProgress(): StorageResult<UserProgress> {
    return this.storageGet(STORAGE_KEYS.USER_PROGRESS, DEFAULT_PROGRESS)
  }

  saveUserProgress(progress: UserProgress): StorageResult<void> {
    return this.storageSet(STORAGE_KEYS.USER_PROGRESS, progress)
  }

  getDayProgress(dayId: number): StorageResult<DayProgress | null> {
    const result = this.getUserProgress()
    if (!result.success) {
      return result
    }

    const dayProgress = result.data.days[dayId]
    if (!dayProgress) {
      return { success: true, data: null }
    }

    return { success: true, data: dayProgress }
  }

  saveDayProgress(dayId: number, progress: Partial<DayProgress>): StorageResult<void> {
    const userProgressResult = this.getUserProgress()
    if (!userProgressResult.success) {
      return userProgressResult
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
    // Each day has 5 sections (content + activities)
    const totalSections = 5
    const completedSections = updatedDayProgress.completedSections.length
    // Note: completedSections includes all completed items including the quiz
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

    return this.saveUserProgress(userProgress)
  }

  updateSectionCompletion(dayId: number, sectionId: string, completed: boolean): StorageResult<void> {
    const dayResult = this.getDayProgress(dayId)
    if (!dayResult.success) {
      return dayResult
    }

    const dayProgress = dayResult.data || DEFAULT_DAY_PROGRESS
    let completedSections = [...dayProgress.completedSections]

    if (completed && !completedSections.includes(sectionId)) {
      completedSections.push(sectionId)
    } else if (!completed && completedSections.includes(sectionId)) {
      completedSections = completedSections.filter(id => id !== sectionId)
    }

    const result = this.saveDayProgress(dayId, { completedSections })
    // Trigger sync after progress update, especially for quiz completion
    if (result.success && this.authState.isAuthenticated) {
      this.queueSync('update_section_completion', { dayId, sectionId, completed })
      // Immediate sync for section completion
      setTimeout(() => {
        this.syncProgress()
      }, 500)
    }
    return result
  }

  updateQuizScore(dayId: number, quizId: string, score: number): StorageResult<void> {
    const dayResult = this.getDayProgress(dayId)
    if (!dayResult.success) {
      return dayResult
    }

    const dayProgress = dayResult.data || DEFAULT_DAY_PROGRESS
    const quizScores = { ...dayProgress.quizScores, [quizId]: score }

    const result = this.saveDayProgress(dayId, { quizScores })
    // Trigger sync immediately after quiz completion
    if (result.success && this.authState.isAuthenticated) {
      this.queueSync('update_quiz_score', { dayId, quizId, score })
      // Immediate sync for quiz completion
      setTimeout(() => {
        this.syncProgress()
      }, 500)
    }
    return result
  }

  updateCurrentSlide(dayId: number, slideIndex: number): StorageResult<void> {
    const result = this.saveDayProgress(dayId, { currentSlide: slideIndex })
    // Trigger sync after progress update
    if (result.success && this.authState.isAuthenticated) {
      this.queueSync('update_current_slide', { dayId, slideIndex })
    }
    return result
  }

  clearAllProgress(): StorageResult<void> {
    return this.storageRemove(STORAGE_KEYS.USER_PROGRESS)
  }

  // Session storage methods
  getSessionState(): StorageResult<SessionState> {
    try {
      const item = sessionStorage.getItem(STORAGE_KEYS.SESSION_STATE)
      if (item === null) {
        return {
          success: true,
          data: {
            showLoginModal: false,
            currentDay: null,
            navigationHistory: []
          }
        }
      }
      const parsed = JSON.parse(item)
      return { success: true, data: parsed }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to get session state',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  saveSessionState(state: SessionState): StorageResult<void> {
    try {
      const serialized = JSON.stringify(state)
      sessionStorage.setItem(STORAGE_KEYS.SESSION_STATE, serialized)
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
  exportProgress(): StorageResult<string> {
    const result = this.getUserProgress()
    if (!result.success) {
      return result
    }

    try {
      const exportData = {
        progress: result.data,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      return { success: true, data: JSON.stringify(exportData, null, 2) }
    } catch (error) {
      const storageError: StorageError = {
        message: error instanceof Error ? error.message : 'Failed to export progress',
        code: 'UNKNOWN'
      }
      return { success: false, error: storageError }
    }
  }

  importProgress(jsonData: string): StorageResult<void> {
    try {
      const importData = JSON.parse(jsonData)

      if (!importData.progress || !importData.version) {
        throw new Error('Invalid import data format')
      }

      // Validate the imported data structure
      const { progress } = importData
      if (!progress.days || !progress.overallProgress) {
        throw new Error('Invalid progress data structure')
      }

      return this.saveUserProgress(progress)
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

    // Debounce sync to avoid too many API calls
    if (!this.isSyncing) {
      setTimeout(() => {
        this.processSyncQueue()
      }, 1000) // Wait 1 second before processing queue
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) return

    this.isSyncing = true
    try {
      await this.syncProgress()
      this.syncQueue = []
    } catch (error) {
      console.error('Error processing sync queue:', error)
    } finally {
      this.isSyncing = false
    }
  }

  // Main sync functionality
  async syncProgress(options?: SyncOptions): Promise<SyncResult> {
    if (!this.authState.isAuthenticated || !this.authState.token) {
      return { success: false, message: 'User not authenticated' }
    }

    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' }
    }

    this.isSyncing = true
    try {
      const localProgressResult = this.getUserProgress()
      if (!localProgressResult.success) {
        return { success: false, message: 'Failed to get local progress' }
      }

      const response = await fetch('/api/progress/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authState.token}`
        },
        body: JSON.stringify({
          localProgress: localProgressResult.data,
          forceSync: options?.forceSync || false,
          resolutionStrategy: options?.resolutionStrategy || 'merge'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, message: errorData.error || 'Sync failed' }
      }

      const syncData = await response.json()

      // Update localStorage with synced data from server
      if (syncData.progress) {
        this.saveUserProgress(syncData.progress)
      }

      return {
        success: true,
        message: syncData.message || 'Sync completed successfully',
        progress: syncData.progress,
        conflicts: syncData.conflicts
      }
    } catch (error) {
      console.error('Sync error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      }
    } finally {
      this.isSyncing = false
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

      // Merge with local progress
      const localProgressResult = this.getUserProgress()
      if (localProgressResult.success && localProgressResult.data) {
        // Merge local and remote progress
        const merged = this.mergeProgress(localProgressResult.data, remoteProgress)
        this.saveUserProgress(merged)
        return { success: true, data: merged }
      } else {
        // Use remote progress as is
        this.saveUserProgress(remoteProgress)
        return { success: true, data: remoteProgress }
      }
    } catch (error) {
      console.error('Error loading remote progress:', error)
      return { success: false, error: { message: error instanceof Error ? error.message : 'Network error', code: 'NETWORK_ERROR' } }
    }
  }

  // Progress merging logic
  private mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
    const merged: UserProgress = {
      currentDay: Math.max(local.currentDay || 1, remote.currentDay || 1),
      days: { ...remote.days },
      overallProgress: {
        totalDaysCompleted: Math.max(local.overallProgress.totalDaysCompleted, remote.overallProgress.totalDaysCompleted),
        totalQuizzesCompleted: Math.max(local.overallProgress.totalQuizzesCompleted, remote.overallProgress.totalQuizzesCompleted),
        lastAccessed: new Date().toISOString()
      }
    }

    // Merge day progress
    for (const [dayId, localDay] of Object.entries(local.days)) {
      const remoteDay = remote.days[parseInt(dayId)]

      if (remoteDay) {
        const mergedSections = Array.from(new Set([...localDay.completedSections, ...remoteDay.completedSections]));

        merged.days[parseInt(dayId)] = {
          completedSections: mergedSections,
          quizScores: { ...remoteDay.quizScores, ...localDay.quizScores },
          currentSlide: Math.max(localDay.currentSlide, remoteDay.currentSlide),
          lastAccessed: new Date().toISOString(),
          completionPercentage: Math.max(localDay.completionPercentage, remoteDay.completionPercentage)
        }
      } else {
        merged.days[parseInt(dayId)] = localDay
      }
    }

    return merged
  }

  // Get sync status
  getSyncStatus(): {
    isSyncing: boolean
    isOnline: boolean
    isAuthenticated: boolean
    queueLength: number
  } {
    return {
      isSyncing: this.isSyncing,
      isOnline: typeof window !== 'undefined' && navigator.onLine,
      isAuthenticated: this.authState.isAuthenticated,
      queueLength: this.syncQueue.length
    }
  }

  // Cleanup
  destroy(): void {
    this.clearAutoSync()
    this.syncQueue = []
    this.isSyncing = false
  }
}

// Export singleton instance
export const progressStorage = new ProgressStorage()
export default progressStorage