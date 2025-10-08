import { useState, useEffect } from 'react'
import { db, dbUtils, initializeDatabase } from './db'
import type { UserProgress, DayProgress, SessionState } from '@/shared/progressTypes'
import { STORAGE_KEYS, DEFAULT_PROGRESS } from '@/shared/progressTypes'

export interface MigrationResult {
  success: boolean
  message: string
  progressMigrated?: boolean
  sessionMigrated?: boolean
  error?: string
  stats?: {
    daysMigrated: number
    sectionsMigrated: number
    quizzesMigrated: number
  }
}

export interface MigrationBackup {
  localStorage: {
    progress?: UserProgress
    session?: SessionState
  }
  timestamp: Date
  version: string
}

// Migration helper class
export class DataMigration {
  private static instance: DataMigration
  private isMigrated: boolean = false
  private migrationKey = 'ai4designers_migration_v2'

  private constructor() {}

  static getInstance(): DataMigration {
    if (!DataMigration.instance) {
      DataMigration.instance = new DataMigration()
    }
    return DataMigration.instance
  }

  // Check if migration has already been done
  hasMigrated(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(this.migrationKey) === 'completed'
  }

  // Mark migration as complete
  private markMigrationComplete(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.migrationKey, 'completed')
    this.isMigrated = true
  }

  // Create backup before migration
  private createBackup(): MigrationBackup {
    const backup: MigrationBackup = {
      localStorage: {},
      timestamp: new Date(),
      version: '2.0.0'
    }

    try {
      // Backup user progress
      const progressData = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)
      if (progressData) {
        backup.localStorage.progress = JSON.parse(progressData)
      }

      // Backup session state
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION_STATE)
      if (sessionData) {
        backup.localStorage.session = JSON.parse(sessionData)
      }

      // Save backup to localStorage
      localStorage.setItem('ai4designers_backup_v2', JSON.stringify(backup))

      console.log('Migration backup created successfully')
      return backup
    } catch (error) {
      console.error('Failed to create migration backup:', error)
      throw error
    }
  }

  // Main migration function
  async migrate(): Promise<MigrationResult> {
    if (this.hasMigrated()) {
      return {
        success: true,
        message: 'Migration already completed'
      }
    }

    if (typeof window === 'undefined') {
      return {
        success: false,
        message: 'Migration can only run in browser'
      }
    }

    try {
      console.log('Starting data migration to IndexedDB...')

      // Initialize database
      await initializeDatabase()

      // Create backup before migration
      const backup = this.createBackup()

      // Migrate user progress
      const progressResult = await this.migrateUserProgress()

      // Migrate session state
      const sessionResult = await this.migrateSessionState()

      // Mark migration as complete
      this.markMigrationComplete()

      console.log('Migration completed successfully')

      return {
        success: true,
        message: 'Migration completed successfully',
        progressMigrated: progressResult.migrated,
        sessionMigrated: sessionResult.migrated,
        stats: progressResult.stats
      }
    } catch (error) {
      console.error('Migration failed:', error)
      return {
        success: false,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Migrate user progress from localStorage to IndexedDB
  private async migrateUserProgress(): Promise<{
    migrated: boolean
    stats: {
      daysMigrated: number
      sectionsMigrated: number
      quizzesMigrated: number
    }
  }> {
    const stats = {
      daysMigrated: 0,
      sectionsMigrated: 0,
      quizzesMigrated: 0
    }

    try {
      const progressData = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)
      if (!progressData) {
        console.log('No user progress found to migrate')
        return { migrated: false, stats }
      }

      const progress: UserProgress = JSON.parse(progressData)

      // Validate progress structure
      if (!progress.days || !progress.overallProgress) {
        console.warn('Invalid progress structure, using defaults')
        progress.days = {}
        progress.overallProgress = DEFAULT_PROGRESS.overallProgress
      }

      // Clear existing data in IndexedDB
      await db.userProgress.clear()

      // Migrate each day's progress
      const migrationPromises = Object.entries(progress.days).map(async ([dayIdStr, dayProgress]) => {
        const dayId = parseInt(dayIdStr)

        // Create complete UserProgress object for this day
        const dayFullProgress: UserProgress = {
          currentDay: dayId,
          days: {
            [dayId]: {
              ...dayProgress,
              lastAccessed: dayProgress.lastAccessed || new Date().toISOString()
            }
          },
          overallProgress: progress.overallProgress
        }

        // Convert to entity and store
        const entity = dbUtils.toProgressEntity(dayFullProgress, dayId)
        await db.userProgress.put(entity)

        // Update stats
        stats.daysMigrated++
        stats.sectionsMigrated += dayProgress.completedSections?.length || 0
        stats.quizzesMigrated += Object.keys(dayProgress.quizScores || {}).length
      })

      // Also store overall progress separately for quick access
      const overallEntity = dbUtils.toProgressEntity({
        currentDay: progress.currentDay,
        days: {},
        overallProgress: progress.overallProgress
      }, 0)
      await db.userProgress.put(overallEntity)

      await Promise.all(migrationPromises)

      console.log(`Migrated ${stats.daysMigrated} days, ${stats.sectionsMigrated} sections, ${stats.quizzesMigrated} quizzes`)
      return { migrated: true, stats }
    } catch (error) {
      console.error('Failed to migrate user progress:', error)
      throw error
    }
  }

  // Migrate session state from localStorage to IndexedDB
  private async migrateSessionState(): Promise<{ migrated: boolean }> {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION_STATE)
      if (!sessionData) {
        console.log('No session state found to migrate')
        return { migrated: false }
      }

      const sessionState: SessionState = JSON.parse(sessionData)

      // Validate session structure
      if (!sessionState.showLoginModal === undefined) {
        sessionState.showLoginModal = false
      }
      if (!sessionState.currentDay === undefined) {
        sessionState.currentDay = null
      }
      if (!Array.isArray(sessionState.navigationHistory)) {
        sessionState.navigationHistory = []
      }

      // Convert to entity and store
      const entity = dbUtils.toSessionEntity(sessionState, 'main')
      await db.sessionState.put(entity)

      console.log('Session state migrated successfully')
      return { migrated: true }
    } catch (error) {
      console.error('Failed to migrate session state:', error)
      throw error
    }
  }

  // Restore from backup (rollback)
  async restoreFromBackup(): Promise<MigrationResult> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        message: 'Restore can only run in browser'
      }
    }

    try {
      const backupData = localStorage.getItem('ai4designers_backup_v2')
      if (!backupData) {
        return {
          success: false,
          message: 'No backup found to restore'
        }
      }

      const backup: MigrationBackup = JSON.parse(backupData)

      // Restore localStorage
      if (backup.localStorage.progress) {
        localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(backup.localStorage.progress))
      }

      if (backup.localStorage.session) {
        localStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(backup.localStorage.session))
      }

      // Clear IndexedDB
      await db.clearAllData()

      // Clear migration flag
      localStorage.removeItem(this.migrationKey)

      console.log('Successfully restored from backup')
      return {
        success: true,
        message: 'Successfully restored from backup'
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return {
        success: false,
        message: 'Failed to restore from backup',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Clean up backup data
  cleanupBackup(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('ai4designers_backup_v2')
    console.log('Backup data cleaned up')
  }

  // Get migration status
  getMigrationStatus(): {
    isMigrated: boolean
    hasBackup: boolean
    backupDate?: Date
    localStorageData?: {
      hasProgress: boolean
      hasSession: boolean
    }
  } {
    const hasBackup = typeof window !== 'undefined' &&
                     !!localStorage.getItem('ai4designers_backup_v2')

    let backupDate: Date | undefined
    if (hasBackup) {
      const backupData = localStorage.getItem('ai4designers_backup_v2')
      if (backupData) {
        backupDate = new Date(JSON.parse(backupData).timestamp)
      }
    }

    const localStorageData = typeof window !== 'undefined' ? {
      hasProgress: !!localStorage.getItem(STORAGE_KEYS.USER_PROGRESS),
      hasSession: !!localStorage.getItem(STORAGE_KEYS.SESSION_STATE)
    } : undefined

    return {
      isMigrated: this.hasMigrated(),
      hasBackup,
      backupDate,
      localStorageData
    }
  }
}

// Export singleton instance
export const dataMigration = DataMigration.getInstance()

// Auto-migration hook for React
export function useAutoMigration() {
  const [migrationStatus, setMigrationStatus] = useState<{
    isMigrated: boolean
    isMigrating: boolean
    error?: string
  }>({
    isMigrated: false,
    isMigrating: false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkAndMigrate = async () => {
      if (dataMigration.hasMigrated()) {
        setMigrationStatus({
          isMigrated: true,
          isMigrating: false
        })
        return
      }

      setMigrationStatus(prev => ({ ...prev, isMigrating: true }))

      try {
        const result = await dataMigration.migrate()

        if (result.success) {
          setMigrationStatus({
            isMigrated: true,
            isMigrating: false
          })
        } else {
          setMigrationStatus({
            isMigrated: false,
            isMigrating: false,
            error: result.message
          })
        }
      } catch (error) {
        setMigrationStatus({
          isMigrated: false,
          isMigrating: false,
          error: error instanceof Error ? error.message : 'Migration failed'
        })
      }
    }

    checkAndMigrate()
  }, [])

  return {
    ...migrationStatus,
    migrationStatus: dataMigration.getMigrationStatus(),
    restoreBackup: () => dataMigration.restoreFromBackup(),
    cleanupBackup: () => dataMigration.cleanupBackup()
  }
}