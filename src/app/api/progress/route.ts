import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { authenticateRequest, apiResponse, handleOptions } from '@/lib/auth'

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
    const dayId = progress.day_id
    const dayProgress = {
      completedSections: progress.completed_sections || [],
      completedSlides: progress.completed_slides || [],
      quizScores: progress.quiz_scores || {},
      currentSlide: progress.current_slide || 0,
      lastAccessed: progress.updated_at || new Date().toISOString(),
      completionPercentage: progress.is_completed ? 100 : 0,
    }

    transformed.days[dayId] = dayProgress

    // Track latest accessed day
    const timestamp = new Date(progress.updated_at || progress.created_at).getTime()
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp
      latestDayId = dayId
    }

    if (progress.is_completed) {
      transformed.overallProgress.totalDaysCompleted++
    }

    // Count completed quizzes
    const quizCount = Object.keys(progress.quiz_scores || {}).length
    transformed.overallProgress.totalQuizzesCompleted += quizCount
  }

  transformed.currentDay = latestDayId || 1

  return transformed
}

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleOptions(request)
  if (corsResponse) return corsResponse

  const supabase = createServiceClient()

  try {
    // Authenticate with proper authentication
    const authResult = await authenticateRequest(request, {
      allowServiceRole: false // Disable service role for production
    })

    if (!authResult.success || !authResult.user) {
      return apiResponse({ error: authResult.error || 'Unauthorized' }, 401)
    }

    const userId = authResult.user.id

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
          email: authResult.user.email || '',
          fullname: authResult.user.user_metadata?.full_name || authResult.user.user_metadata?.fullName || 'Test User'
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
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)

    if (progressError) {
      console.error('Progress fetch error:', progressError)
      return apiResponse(
        { error: 'Failed to fetch progress', details: progressError.message },
        500
      )
    }

    console.log('Progress records found:', progress?.length || 0)

    // Transform to localStorage format
    const transformedProgress = transformToLocalStorageFormat(progress)

    return apiResponse(transformedProgress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return apiResponse(
      { error: 'Failed to fetch progress', details: error instanceof Error ? error.message : 'Unknown error' },
      500
    )
  }
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleOptions(request)
  if (corsResponse) return corsResponse

  const supabase = createServiceClient()

  try {
    const authResult = await authenticateRequest(request, {
      allowServiceRole: false // Require proper authentication for production
    })

    if (!authResult.success || !authResult.user) {
      return apiResponse({ error: authResult.error || 'Unauthorized' }, 401)
    }

    const userId = authResult.user.id
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
          .from('user_progress')
          .select('id')
          .eq('user_id', progressData.userId)
          .eq('day_id', progressData.dayId)
          .limit(1)

        if (existing && existing.length > 0) {
          // Update existing
          const { data: updated } = await supabase
            .from('user_progress')
            .update({
              completed_sections: progressData.completedSections,
              completed_slides: progressData.completedSlides,
              quiz_scores: progressData.quizScores,
              current_slide: progressData.currentSlide,
              is_completed: progressData.isCompleted,
              completed_at: progressData.completedAt,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', progressData.userId)
            .eq('day_id', progressData.dayId)
            .select()

          results.push(updated?.[0])
        } else {
          // Insert new
          const { data: inserted } = await supabase
            .from('user_progress')
            .insert([{
              user_id: progressData.userId,
              day_id: progressData.dayId,
              completed_sections: progressData.completedSections,
              completed_slides: progressData.completedSlides,
              quiz_scores: progressData.quizScores,
              current_slide: progressData.currentSlide,
              is_completed: progressData.isCompleted,
              completed_at: progressData.completedAt,
            }])
            .select()

          results.push(inserted?.[0])
        }
      }

      // Return the synced progress
      const transformedProgress = transformToLocalStorageFormat(results)
      return apiResponse({
        success: true,
        progress: transformedProgress,
        message: 'Progress synced successfully'
      })
    }

    // Handle individual progress update
    if (dayId === undefined || slideId === undefined || completed === undefined) {
      return apiResponse(
        { error: 'Missing required fields: dayId, slideId, completed' },
        400
      )
    }

    // Get existing progress or create new
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('day_id', dayId)
      .limit(1)

    let currentProgress
    if (existingProgress && existingProgress.length > 0) {
      currentProgress = existingProgress[0]
    } else {
      // Create new progress record
      const { data: newProgress, error: insertError } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          day_id: dayId,
          completed_sections: [],
          completed_slides: [],
          quiz_scores: {},
          current_slide: 0,
          is_completed: false,
        }])
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        return apiResponse(
          { error: 'Failed to create progress record', details: insertError.message },
          500
        )
      }

      currentProgress = newProgress?.[0]
    }

    if (!currentProgress) {
      return apiResponse(
        { error: 'Failed to create progress record' },
        500
      )
    }

    // Update progress
    const completedSections = [...(currentProgress?.completed_sections || [])]
    const completedSlides = [...(currentProgress?.completed_slides || [])]

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
      .from('user_progress')
      .update({
        completed_sections: completedSections,
        completed_slides: completedSlides,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('day_id', dayId)
      .select()

    return apiResponse({
      success: true,
      progress: updatedProgress?.[0],
      message: 'Progress updated successfully'
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return apiResponse(
      { error: 'Failed to update progress' },
      500
    )
  }
}