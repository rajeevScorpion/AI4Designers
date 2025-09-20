'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { UserProgress, DayProgress, SessionState } from '@/shared/progressTypes'
import progressStorage from '@/lib/progressStorage'

interface CourseContextType {
  // Current day state
  currentDay: number | null
  setCurrentDay: (day: number | null) => void

  // Progress management
  userProgress: UserProgress | null
  updateSectionCompletion: (dayId: number, sectionId: string, completed: boolean) => void
  updateQuizScore: (dayId: number, quizId: string, score: number) => void
  updateCurrentSlide: (dayId: number, slideIndex: number) => void
  getDayProgress: (dayId: number) => DayProgress | null

  // Session management
  sessionState: SessionState
  updateSessionState: (updates: Partial<SessionState>) => void

  // Utility functions
  resetDayProgress: (dayId: number) => void
  clearAllProgress: () => void
  exportProgress: () => string | null
  importProgress: (jsonData: string) => boolean
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(true)

  // Load progress on mount
  useEffect(() => {
    const loadProgress = () => {
      // Load user progress
      const progressResult = progressStorage.getUserProgress()
      if (progressResult.success) {
        setUserProgress(progressResult.data)
        setCurrentDay(progressResult.data.currentDay)
      }

      // Load session state
      const sessionResult = progressStorage.getSessionState()
      if (sessionResult.success) {
        setSessionState(sessionResult.data)
      }

      setIsLoading(false)
    }

    loadProgress()
  }, [])

  // Update progress when it changes
  const updateProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress)
    progressStorage.saveUserProgress(newProgress)
  }

  const updateSectionCompletion = (dayId: number, sectionId: string, completed: boolean) => {
    const result = progressStorage.updateSectionCompletion(dayId, sectionId, completed)
    if (result.success) {
      const progressResult = progressStorage.getUserProgress()
      if (progressResult.success) {
        updateProgress(progressResult.data)
      }
    }
  }

  const updateQuizScore = (dayId: number, quizId: string, score: number) => {
    const result = progressStorage.updateQuizScore(dayId, quizId, score)
    if (result.success) {
      const progressResult = progressStorage.getUserProgress()
      if (progressResult.success) {
        updateProgress(progressResult.data)
      }
    }
  }

  const updateCurrentSlide = (dayId: number, slideIndex: number) => {
    const result = progressStorage.updateCurrentSlide(dayId, slideIndex)
    if (result.success) {
      const progressResult = progressStorage.getUserProgress()
      if (progressResult.success) {
        updateProgress(progressResult.data)
      }
    }
  }

  const getDayProgress = (dayId: number): DayProgress | null => {
    if (!userProgress) return null
    return userProgress.days[dayId] || null
  }

  const updateSessionState = (updates: Partial<SessionState>) => {
    const newSessionState = { ...sessionState, ...updates }
    setSessionState(newSessionState)
    progressStorage.saveSessionState(newSessionState)
  }

  const resetDayProgress = (dayId: number) => {
    if (userProgress) {
      const newProgress = { ...userProgress }
      if (newProgress.days[dayId]) {
        delete newProgress.days[dayId]
        updateProgress(newProgress)
      }
    }
  }

  const clearAllProgress = () => {
    progressStorage.clearAllProgress()
    setUserProgress(null)
    setCurrentDay(null)
  }

  const exportProgress = (): string | null => {
    const result = progressStorage.exportProgress()
    return result.success ? result.data : null
  }

  const importProgress = (jsonData: string): boolean => {
    const result = progressStorage.importProgress(jsonData)
    if (result.success) {
      const progressResult = progressStorage.getUserProgress()
      if (progressResult.success) {
        updateProgress(progressResult.data)
        setCurrentDay(progressResult.data.currentDay)
        return true
      }
    }
    return false
  }

  const value: CourseContextType = {
    currentDay,
    setCurrentDay: (day: number | null) => {
      setCurrentDay(day)
      if (userProgress) {
        const newProgress = { ...userProgress, currentDay: day }
        updateProgress(newProgress)
      }
    },
    userProgress,
    updateSectionCompletion,
    updateQuizScore,
    updateCurrentSlide,
    getDayProgress,
    sessionState,
    updateSessionState,
    resetDayProgress,
    clearAllProgress,
    exportProgress,
    importProgress,
    isLoading
  }

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

export const useCourse = () => {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider')
  }
  return context
}