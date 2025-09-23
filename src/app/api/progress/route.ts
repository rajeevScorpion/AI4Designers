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

// Transform localStorage UserProgress to database format
function transformToDatabaseFormat(localProgress: any, userId: string) {
  const transformed = []

  // Transform each day's progress
  for (const [dayId, dayProgress] of Object.entries(localProgress.days || {})) {
    transformed.push({
      userId: userId,
      dayId: parseInt(dayId),
      completedSections: (dayProgress as any).completedSections || [],
      completedSlides: (dayProgress as any).completedSlides || [],
      quizScores: (dayProgress as any).quizScores || {},
      currentSlide: (dayProgress as any).currentSlide || 0,
      isCompleted: (dayProgress as any).completionPercentage === 100,
      completedAt: (dayProgress as any).completionPercentage === 100 ? new Date() : null,
    })
  }

  return transformed
}

// Transform database format to localStorage format
function transformToLocalStorageFormat(dbProgress: any[]) {
  const transformed = {
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

  for (const progress of dbProgress) {
    const dayId = progress.dayId
    const dayProgress = {
      completedSections: progress.completedSections || [],
      completedSlides: progress.completedSlides || [],
      quizScores: progress.quizScores || {},
      currentSlide: progress.currentSlide || 0,
      lastAccessed: progress.updatedAt || new Date().toISOString(),
      completionPercentage: progress.isCompleted ? 100 : 0,
    }

    transformed.days[dayId] = dayProgress

    // Track latest accessed day
    const timestamp = new Date(progress.updatedAt || progress.createdAt).getTime()
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp
      latestDayId = dayId
    }

    if (progress.isCompleted) {
      transformed.overallProgress.totalDaysCompleted++
    }

    // Count completed quizzes
    const quizCount = Object.keys(progress.quizScores || {}).length
    transformed.overallProgress.totalQuizzesCompleted += quizCount
  }

  transformed.currentDay = latestDayId || 1

  return transformed
}

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()

  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Check if user exists in database, create if not
    try {
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .limit(1)
      console.log('User record check:', userRecord && userRecord.length > 0 ? 'Found' : 'Not found')

      if (!userRecord || userRecord.length === 0) {
        console.log('Creating user record...')
        // Create user record if it doesn't exist
        await supabase.from('users').upsert([{
          id: userId,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.fullName || ''
        }], { onConflict: 'id' })
        console.log('User record created')
      }
    } catch (userError) {
      console.error('User record creation error:', userError)
      // Continue with empty progress if user creation fails
    }

    // Get all progress for user
    console.log('Fetching progress for user:', userId)
    const { data: progress, error: progressError } = await supabase
      .from('userProgress')
      .select('*')
      .eq('userId', userId)

    if (progressError) {
      console.error('Progress fetch error:', progressError)
      return NextResponse.json(
        { error: 'Failed to fetch progress', details: progressError.message },
        { status: 500 }
      )
    }

    console.log('Progress records found:', progress?.length || 0)

    // Transform to localStorage format
    const transformedProgress = transformToLocalStorageFormat(progress)

    return NextResponse.json(transformedProgress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    const { dayId, slideId, completed, action } = body

    if (action === 'sync') {
      // Handle full sync from localStorage
      const { localProgress } = body
      const dbProgress = transformToDatabaseFormat(localProgress, userId)

      // Upsert each day's progress
      const results = []
      for (const progressData of dbProgress) {
        const { data: existing } = await supabase
          .from('userProgress')
          .select('id')
          .eq('userId', progressData.userId)
          .eq('dayId', progressData.dayId)
          .limit(1)

        if (existing && existing.length > 0) {
          // Update existing
          const { data: updated } = await supabase
            .from('userProgress')
            .update({
              completedSections: progressData.completedSections,
              completedSlides: progressData.completedSlides,
              quizScores: progressData.quizScores,
              currentSlide: progressData.currentSlide,
              isCompleted: progressData.isCompleted,
              completedAt: progressData.completedAt,
              updatedAt: new Date().toISOString(),
            })
            .eq('userId', progressData.userId)
            .eq('dayId', progressData.dayId)
            .select()

          results.push(updated?.[0])
        } else {
          // Insert new
          const { data: inserted } = await supabase
            .from('userProgress')
            .insert([progressData])
            .select()

          results.push(inserted?.[0])
        }
      }

      // Return the synced progress
      const transformedProgress = transformToLocalStorageFormat(results)
      return NextResponse.json({
        success: true,
        progress: transformedProgress,
        message: 'Progress synced successfully'
      })
    }

    // Handle individual progress update
    if (dayId === undefined || slideId === undefined || completed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: dayId, slideId, completed' },
        { status: 400 }
      )
    }

    // Get existing progress or create new
    const { data: existingProgress } = await supabase
      .from('userProgress')
      .select('*')
      .eq('userId', userId)
      .eq('dayId', dayId)
      .limit(1)

    let currentProgress
    if (existingProgress && existingProgress.length > 0) {
      currentProgress = existingProgress[0]
    } else {
      // Create new progress record
      const { data: newProgress } = await supabase
        .from('userProgress')
        .insert([{
          userId,
          dayId,
          completedSections: [],
          completedSlides: [],
          quizScores: {},
          currentSlide: 0,
          isCompleted: false,
        }])
        .select()

      currentProgress = newProgress?.[0]
    }

    if (!currentProgress) {
      return NextResponse.json(
        { error: 'Failed to create progress record' },
        { status: 500 }
      )
    }

    // Update progress
    const completedSections = [...(currentProgress.completedSections || [])]
    const completedSlides = [...(currentProgress.completedSlides || [])]

    if (completed && !completedSections.includes(slideId)) {
      completedSections.push(slideId)
    } else if (!completed && completedSections.includes(slideId)) {
      const index = completedSections.indexOf(slideId)
      completedSections.splice(index, 1)
    }

    if (completed && !completedSlides.includes(slideId)) {
      completedSlides.push(slideId)
    } else if (!completed && completedSlides.includes(slideId)) {
      const index = completedSlides.indexOf(slideId)
      completedSlides.splice(index, 1)
    }

    const { data: updatedProgress } = await supabase
      .from('userProgress')
      .update({
        completedSections,
        completedSlides,
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', userId)
      .eq('dayId', dayId)
      .select()

    return NextResponse.json({
      success: true,
      progress: updatedProgress?.[0],
      message: 'Progress updated successfully'
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}