// Progress tracking interfaces
export interface DayProgress {
  completedSections: string[]
  quizScores: Record<string, number>
  currentSlide: number
  lastAccessed: string // ISO timestamp
  completionPercentage: number
}

export interface UserProgress {
  currentDay: number | null
  days: {
    [dayId: number]: DayProgress
  }
  overallProgress: {
    totalDaysCompleted: number
    totalQuizzesCompleted: number
    lastAccessed: string
  }
}

export interface SessionState {
  showLoginModal: boolean
  currentDay: number | null
  navigationHistory: number[]
}

// Storage utility types
export interface StorageError {
  message: string
  code: 'QUOTA_EXCEEDED' | 'ACCESS_DENIED' | 'DATA_CORRUPTED' | 'UNKNOWN' | 'UNAUTHORIZED' | 'API_ERROR' | 'NETWORK_ERROR'
}

export type StorageResult<T> =
  | { success: true; data: T }
  | { success: false; error: StorageError }

// Constants
export const STORAGE_KEYS = {
  USER_PROGRESS: 'ai4designers_progress',
  SESSION_STATE: 'ai4designers_session',
  LAST_SEEN_DAY: 'lastSeenDay'
} as const

export const DEFAULT_PROGRESS: UserProgress = {
  currentDay: null,
  days: {},
  overallProgress: {
    totalDaysCompleted: 0,
    totalQuizzesCompleted: 0,
    lastAccessed: new Date().toISOString()
  }
}

export const DEFAULT_DAY_PROGRESS: Omit<DayProgress, 'lastAccessed'> = {
  completedSections: [],
  quizScores: {},
  currentSlide: 0,
  completionPercentage: 0
}