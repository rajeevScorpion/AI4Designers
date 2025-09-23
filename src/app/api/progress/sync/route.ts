import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Helper function to authenticate user from request
async function authenticateUser(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Conflict resolution strategies
enum ConflictResolution {
  LOCAL_WINS = 'local_wins',
  REMOTE_WINS = 'remote_wins',
  MERGE = 'merge'
}

// Merge conflict resolution for arrays
function mergeArrays(localArray: string[], remoteArray: string[]): string[] {
  const merged = new Set([...localArray, ...remoteArray])
  return Array.from(merged)
}

// Merge conflict resolution for objects (quiz scores)
function mergeObjects(localObj: Record<string, number>, remoteObj: Record<string, number>): Record<string, number> {
  return { ...localObj, ...remoteObj }
}

// Resolve conflicts between local and remote progress
function resolveConflicts(localProgress: any, remoteProgress: any, strategy: ConflictResolution = ConflictResolution.MERGE) {
  const resolved = { ...remoteProgress }

  switch (strategy) {
    case ConflictResolution.LOCAL_WINS:
      // Local data overwrites remote
      return { ...remoteProgress, ...localProgress }

    case ConflictResolution.REMOTE_WINS:
      // Remote data stays as is
      return remoteProgress

    case ConflictResolution.MERGE:
    default:
      // Intelligent merge for different field types
      if (localProgress.completedSections || remoteProgress.completedSections) {
        resolved.completedSections = mergeArrays(
          localProgress.completedSections || [],
          remoteProgress.completedSections || []
        )
      }

      if (localProgress.completedSlides || remoteProgress.completedSlides) {
        resolved.completedSlides = mergeArrays(
          localProgress.completedSlides || [],
          remoteProgress.completedSlides || []
        )
      }

      if (localProgress.quizScores || remoteProgress.quizScores) {
        resolved.quizScores = mergeObjects(
          localProgress.quizScores || {},
          remoteProgress.quizScores || {}
        )
      }

      // For scalar fields, use the most recent based on timestamps
      if (localProgress.currentSlide !== undefined && remoteProgress.currentSlide !== undefined) {
        const localTimestamp = new Date(localProgress.updatedAt || localProgress.createdAt || 0).getTime()
        const remoteTimestamp = new Date(remoteProgress.updatedAt || remoteProgress.createdAt || 0).getTime()
        resolved.currentSlide = localTimestamp > remoteTimestamp ? localProgress.currentSlide : remoteProgress.currentSlide
      } else if (localProgress.currentSlide !== undefined) {
        resolved.currentSlide = localProgress.currentSlide
      }

      // Handle completion status
      if (localProgress.isCompleted !== undefined && remoteProgress.isCompleted !== undefined) {
        resolved.isCompleted = localProgress.isCompleted || remoteProgress.isCompleted
        if (resolved.isCompleted) {
          resolved.completedAt = remoteProgress.completedAt || new Date()
        }
      }

      return resolved
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Check if user exists in database, create if not
    try {
      const supabase = createServiceClient()
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .limit(1)

      if (!userRecord || userRecord.length === 0) {
        // Create user record if it doesn't exist
        await supabase.from('users').upsert([{
          id: userId,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.fullName || ''
        }], { onConflict: 'id' })
      }
    } catch (userError) {
      console.error('User record creation error:', userError)
      // Continue with sync if user creation fails
    }
    const body = await request.json()
    const { localProgress, forceSync = false, resolutionStrategy = ConflictResolution.MERGE } = body

    if (!localProgress) {
      return NextResponse.json(
        { error: 'Local progress data is required' },
        { status: 400 }
      )
    }

    // Get current remote progress for all days
    const supabase = createServiceClient()
    const { data: remoteProgressList } = await supabase
      .from('userProgress')
      .select('*')
      .eq('userId', userId)

    // Convert remote progress to a map for easier lookup
    const remoteProgressMap = new Map()
    for (const progress of remoteProgressList || []) {
      remoteProgressMap.set(progress.dayId, progress)
    }

    const syncResults = []
    const conflicts = []

    // Process each day's progress from localStorage
    for (const [dayIdStr, dayLocalProgress] of Object.entries(localProgress.days || {})) {
      const dayId = parseInt(dayIdStr)
      const remoteProgress = remoteProgressMap.get(dayId)

      if (!remoteProgress) {
        // No remote progress exists, create new record
        const newProgress = {
          userId,
          dayId,
          completedSections: (dayLocalProgress as any).completedSections || [],
          completedSlides: (dayLocalProgress as any).completedSlides || [],
          quizScores: (dayLocalProgress as any).quizScores || {},
          currentSlide: (dayLocalProgress as any).currentSlide || 0,
          isCompleted: (dayLocalProgress as any).completionPercentage === 100 || false,
          completedAt: (dayLocalProgress as any).completionPercentage === 100 ? new Date() : null,
        }

        const { data: inserted } = await supabase
          .from('userProgress')
          .insert([newProgress])
          .select()

        syncResults.push({
          dayId,
          action: 'created',
          success: true,
          progress: inserted?.[0]
        })
        continue
      }

      // Check if there are conflicts
      const hasConflicts = forceSync || (
        JSON.stringify((dayLocalProgress as any).completedSections || []) !== JSON.stringify(remoteProgress.completedSections || []) ||
        JSON.stringify((dayLocalProgress as any).completedSlides || []) !== JSON.stringify(remoteProgress.completedSlides || []) ||
        JSON.stringify((dayLocalProgress as any).quizScores || {}) !== JSON.stringify(remoteProgress.quizScores || {}) ||
        ((dayLocalProgress as any).currentSlide || 0) !== (remoteProgress.currentSlide || 0)
      )

      if (hasConflicts) {
        const resolvedProgress = resolveConflicts(dayLocalProgress, remoteProgress, resolutionStrategy)

        // Update the remote progress with resolved data
        const { data: updated } = await supabase
          .from('userProgress')
          .update({
            completedSections: resolvedProgress.completedSections,
            completedSlides: resolvedProgress.completedSlides,
            quizScores: resolvedProgress.quizScores,
            currentSlide: resolvedProgress.currentSlide,
            isCompleted: resolvedProgress.isCompleted,
            completedAt: resolvedProgress.completedAt,
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', userId)
          .eq('dayId', dayId)
          .select()

        syncResults.push({
          dayId,
          action: 'updated',
          success: true,
          hadConflicts: true,
          progress: updated?.[0]
        })

        conflicts.push({
          dayId,
          localData: dayLocalProgress,
          remoteData: remoteProgress,
          resolvedData: resolvedProgress
        })
      } else {
        // No conflicts, no update needed
        syncResults.push({
          dayId,
          action: 'no_change',
          success: true,
          progress: remoteProgress
        })
      }
    }

    // Return the complete synced progress from database
    const { data: finalProgressList } = await supabase
      .from('userProgress')
      .select('*')
      .eq('userId', userId)

    // Transform to localStorage format for client
    const transformedProgress = {
      currentDay: null as number | null,
      days: {} as any,
      overallProgress: {
        totalDaysCompleted: 0,
        totalQuizzesCompleted: 0,
        lastAccessed: new Date().toISOString(),
      }
    }

    let latestDayId = 0
    let latestTimestamp = 0

    for (const progress of finalProgressList || []) {
      const dayId = progress.dayId
      const dayProgress = {
        completedSections: progress.completedSections || [],
        completedSlides: progress.completedSlides || [],
        quizScores: progress.quizScores || {},
        currentSlide: progress.currentSlide || 0,
        lastAccessed: progress.updatedAt || new Date().toISOString(),
        completionPercentage: progress.isCompleted ? 100 : 0,
      }

      transformedProgress.days[dayId] = dayProgress

      // Track latest accessed day
      const timestamp = new Date(progress.updatedAt || progress.createdAt || Date.now()).getTime()
      if (timestamp > latestTimestamp) {
        latestTimestamp = timestamp
        latestDayId = dayId
      }

      if (progress.isCompleted) {
        transformedProgress.overallProgress.totalDaysCompleted++
      }

      // Count completed quizzes
      const quizCount = Object.keys(progress.quizScores || {}).length
      transformedProgress.overallProgress.totalQuizzesCompleted += quizCount
    }

    transformedProgress.currentDay = latestDayId || 1

    return NextResponse.json({
      success: true,
      syncResults,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      progress: transformedProgress,
      message: `Synced ${syncResults.length} days, ${conflicts.length} conflicts resolved`
    })

  } catch (error) {
    console.error('Error syncing progress:', error)
    return NextResponse.json(
      { error: 'Failed to sync progress' },
      { status: 500 }
    )
  }
}