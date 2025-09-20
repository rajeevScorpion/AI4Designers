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

class ProgressStorage {
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
    const totalSections = 6 // Approximate sections per day
    const completedSections = updatedDayProgress.completedSections.length
    const completedQuizzes = Object.keys(updatedDayProgress.quizScores).length
    updatedDayProgress.completionPercentage = Math.round(
      ((completedSections + completedQuizzes) / (totalSections + 2)) * 100
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

    return this.saveDayProgress(dayId, { completedSections })
  }

  updateQuizScore(dayId: number, quizId: string, score: number): StorageResult<void> {
    const dayResult = this.getDayProgress(dayId)
    if (!dayResult.success) {
      return dayResult
    }

    const dayProgress = dayResult.data || DEFAULT_DAY_PROGRESS
    const quizScores = { ...dayProgress.quizScores, [quizId]: score }

    return this.saveDayProgress(dayId, { quizScores })
  }

  updateCurrentSlide(dayId: number, slideIndex: number): StorageResult<void> {
    return this.saveDayProgress(dayId, { currentSlide: slideIndex })
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
}

// Export singleton instance
export const progressStorage = new ProgressStorage()
export default progressStorage