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

export async function GET(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const dayId = parseInt(params.dayId)

    if (isNaN(dayId)) {
      return NextResponse.json(
        { error: 'Invalid day ID' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('day_id', dayId)
      .limit(1)

    return NextResponse.json(progress?.[0] || null)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const dayId = parseInt(params.dayId)

    if (isNaN(dayId)) {
      return NextResponse.json(
        { error: 'Invalid day ID' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'complete') {
      // Mark day as complete
      const supabase = createServiceClient()
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('day_id', dayId)
        .limit(1)

      if (!progress || progress.length === 0) {
        return NextResponse.json(
          { error: 'No progress found for this day' },
          { status: 400 }
        )
      }

      const currentProgress = progress[0]

      // Check if all sections are completed
      if (!currentProgress.completed_sections || currentProgress.completed_sections.length === 0) {
        return NextResponse.json(
          { error: 'Day cannot be completed. No sections completed.' },
          { status: 400 }
        )
      }

      // Update progress
      const { data: updatedProgress } = await supabase
        .from('user_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('day_id', dayId)
        .select()

      // Award badge if not already awarded
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', 'day_complete')
        .limit(1)

      if (!existingBadge || existingBadge.length === 0) {
        await supabase.from('user_badges').insert([{
          user_id: userId,
          badge_id: 'day_complete',
          badge_name: `Day ${dayId} Complete`,
          badge_description: `Completed all activities for Day ${dayId}`,
          badge_icon: 'check-circle',
        }])
      }

      return NextResponse.json({
        success: true,
        progress: updatedProgress?.[0],
        message: `Day ${dayId} marked as complete`
      })
    }

    // Handle other progress updates
    const body = await request.json()
    const { slideId, completed, quizScores, currentSlide } = body

    // Get existing progress or create new
    const supabase = createServiceClient()
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
      const { data: newProgress } = await supabase
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

      currentProgress = newProgress?.[0]
    }

    if (!currentProgress) {
      return NextResponse.json(
        { error: 'Failed to create progress record' },
        { status: 500 }
      )
    }

    // Update progress data
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (slideId !== undefined && completed !== undefined) {
      const completedSections = [...(currentProgress.completed_sections || [])]
      const completedSlides = [...(currentProgress.completed_slides || [])]

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

      updates.completedSections = completedSections
      updates.completedSlides = completedSlides
    }

    if (quizScores !== undefined) {
      updates.quiz_scores = {
        ...(currentProgress.quiz_scores || {}),
        ...quizScores,
      }
    }

    if (currentSlide !== undefined) {
      updates.current_slide = currentSlide
    }

    const { data: updatedProgress } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('day_id', dayId)
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