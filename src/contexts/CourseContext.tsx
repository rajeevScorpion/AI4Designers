'use client'

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { UserProgress, DayProgress, SessionState } from '@/shared/progressTypes'
import progressStorage, { AuthState, SyncResult } from '@/lib/progressStorage'
import { syncService } from '@/lib/sync'
import { useAutoMigration } from '@/lib/migration'
import type { Session } from '@supabase/supabase-js'

interface CourseContextType {
  // Current day state
  currentDay: number | null
  setCurrentDay: (day: number | null) => void

  // Progress management
  userProgress: UserProgress | null
  updateSectionCompletion: (dayId: number, sectionId: string, completed: boolean) => Promise<void>
  updateQuizScore: (dayId: number, quizId: string, score: number) => Promise<void>
  updateCurrentSlide: (dayId: number, slideIndex: number) => Promise<void>
  getDayProgress: (dayId: number) => Promise<DayProgress | null>

  // Session management
  sessionState: SessionState
  updateSessionState: (updates: Partial<SessionState>) => Promise<void>

  // Authentication state
  authState: AuthState
  setAuthState: (authState: AuthState) => void
  setSession: (session: Session | null) => void

  // Sync functionality
  syncProgress: (options?: { forceFullSync?: boolean; resolutionStrategy?: 'local_wins' | 'remote_wins' | 'merge' }) => Promise<SyncResult>
  loadRemoteProgress: () => Promise<void>
  getSyncStatus: () => {
    isSyncing: boolean
    isOnline: boolean
    isAuthenticated: boolean
    queueLength: number
    lastSyncTime?: Date
  }

  // Utility functions
  resetDayProgress: (dayId: number) => Promise<void>
  clearAllProgress: () => Promise<void>
  exportProgress: () => Promise<string | null>
  importProgress: (jsonData: string) => Promise<boolean>
  isLoading: boolean
  migrationStatus: {
    isMigrated: boolean
    isMigrating: boolean
    error?: string
  }
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [currentDay, setCurrentDay] = useState<number | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>({
    showLoginModal: false,
    currentDay: null,
    navigationHistory: []
  })
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(true)

  // Handle migration
  const migrationStatus = useAutoMigration()

  // Load progress from IndexedDB
  const loadProgress = useCallback(async () => {
    try {
      const progressResult = await progressStorage.getUserProgress()
      if (progressResult.success) {
        setUserProgress(progressResult.data)
        setCurrentDay(progressResult.data.currentDay)
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }, [])

  // Load session state from IndexedDB
  const loadSessionState = useCallback(async () => {
    try {
      const sessionResult = await progressStorage.getSessionState()
      if (sessionResult.success) {
        setSessionState(sessionResult.data)
      }
    } catch (error) {
      console.error('Failed to load session state:', error)
    }
  }, [])

  // Load remote progress function
  const loadRemoteProgress = useCallback(async (): Promise<void> => {
    if (!authState.isAuthenticated) return

    setIsLoading(true)
    try {
      const result = await progressStorage.loadRemoteProgress()
      if (result.success && result.data) {
        setUserProgress(result.data)
        setCurrentDay(result.data.currentDay)
      }
    } catch (error) {
      console.error('Failed to load remote progress:', error)
    } finally {
      setIsLoading(false)
    }
  }, [authState.isAuthenticated])

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true)

      // Wait for migration to complete
      if (migrationStatus.isMigrating) {
        return
      }

      // Load data from IndexedDB
      await Promise.all([
        loadProgress(),
        loadSessionState()
      ])

      setIsLoading(false)
    }

    initializeApp()
  }, [migrationStatus.isMigrating, loadProgress, loadSessionState])

  // Set session for sync when auth state changes
  const setSession = useCallback((session: Session | null) => {
    progressStorage.setSession(session)

    if (session?.user) {
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user: session.user,
        token: session.access_token
      }
      setAuthState(newAuthState)
    } else {
      setAuthState({ isAuthenticated: false })
    }
  }, [])

  // Load remote progress when user authenticates
  useEffect(() => {
    if (authState.isAuthenticated && !migrationStatus.isMigrating) {
      loadRemoteProgress()
    }
  }, [authState.isAuthenticated, loadRemoteProgress, migrationStatus.isMigrating])

  // Update storage auth state when auth state changes
  useEffect(() => {
    progressStorage.setAuthState(authState)
  }, [authState])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      if (authState.isAuthenticated) {
        syncProgress()
      }
    }

    const handleOffline = () => {
      console.log('App is offline - changes will be queued for sync')
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [authState.isAuthenticated])

  // Update progress when it changes
  const updateProgress = useCallback(async (newProgress: UserProgress) => {
    setUserProgress(newProgress)
    await progressStorage.saveUserProgress(newProgress)
  }, [])

  // Progress management methods (now async)
  const updateSectionCompletion = useCallback(async (dayId: number, sectionId: string, completed: boolean) => {
    const result = await progressStorage.updateSectionCompletion(dayId, sectionId, completed)
    if (result.success) {
      await loadProgress()
    }
  }, [loadProgress])

  const updateQuizScore = useCallback(async (dayId: number, quizId: string, score: number) => {
    const result = await progressStorage.updateQuizScore(dayId, quizId, score)
    if (result.success) {
      await loadProgress()
    }
  }, [loadProgress])

  const updateCurrentSlide = useCallback(async (dayId: number, slideIndex: number) => {
    const result = await progressStorage.updateCurrentSlide(dayId, slideIndex)
    if (result.success) {
      await loadProgress()
    }
  }, [loadProgress])

  const getDayProgress = useCallback(async (dayId: number): Promise<DayProgress | null> => {
    const result = await progressStorage.getDayProgress(dayId)
    return result.success ? result.data : null
  }, [])

  // Session management (now async)
  const updateSessionState = useCallback(async (updates: Partial<SessionState>) => {
    const newState = { ...sessionState, ...updates }
    setSessionState(newState)
    await progressStorage.saveSessionState(newState)
  }, [sessionState])

  // Sync functionality
  const syncProgress = useCallback(async (options?: {
    forceFullSync?: boolean
    resolutionStrategy?: 'local_wins' | 'remote_wins' | 'merge'
  }): Promise<SyncResult> => {
    const result = await progressStorage.syncProgress(options)

    // Reload progress after sync
    if (result.success) {
      await loadProgress()
    }

    return result
  }, [loadProgress])

  // Utility functions (now async)
  const resetDayProgress = useCallback(async (dayId: number) => {
    if (!userProgress) return

    const newProgress = { ...userProgress }
    newProgress.days[dayId] = {
      completedSections: [],
      quizScores: {},
      currentSlide: 0,
      lastAccessed: new Date().toISOString(),
      completionPercentage: 0
    }

    await updateProgress(newProgress)
  }, [userProgress, updateProgress])

  const clearAllProgress = useCallback(async () => {
    await progressStorage.clearAllProgress()
    setUserProgress(null)
    setCurrentDay(null)
    setSessionState({
      showLoginModal: false,
      currentDay: null,
      navigationHistory: []
    })
  }, [])

  const exportProgress = useCallback(async (): Promise<string | null> => {
    const result = await progressStorage.exportProgress()
    return result.success ? result.data : null
  }, [])

  const importProgress = useCallback(async (jsonData: string): Promise<boolean> => {
    const result = await progressStorage.importProgress(jsonData)
    if (result.success) {
      await loadProgress()
    }
    return result.success
  }, [loadProgress])

  // Get sync status
  const getSyncStatus = useCallback(() => {
    return progressStorage.getSyncStatus()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      progressStorage.destroy()
    }
  }, [])

  const value: CourseContextType = {
    // Current day state
    currentDay,
    setCurrentDay,

    // Progress management
    userProgress,
    updateSectionCompletion,
    updateQuizScore,
    updateCurrentSlide,
    getDayProgress,

    // Session management
    sessionState,
    updateSessionState,

    // Authentication state
    authState,
    setAuthState,
    setSession,

    // Sync functionality
    syncProgress,
    loadRemoteProgress,
    getSyncStatus,

    // Utility functions
    resetDayProgress,
    clearAllProgress,
    exportProgress,
    importProgress,
    isLoading,
    migrationStatus: {
      isMigrated: migrationStatus.isMigrated,
      isMigrating: migrationStatus.isMigrating,
      error: migrationStatus.error
    }
  }

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

export function useCourse() {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider')
  }
  return context
}

// Also export the sync service hook for direct access
export { useSync } from '@/lib/sync'