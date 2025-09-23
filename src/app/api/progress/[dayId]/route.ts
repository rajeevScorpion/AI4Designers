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
      .from('userProgress')
      .select('*')
      .eq('userId', userId)
      .eq('dayId', dayId)
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
        .from('userProgress')
        .select('*')
        .eq('userId', userId)
        .eq('dayId', dayId)
        .limit(1)

      if (!progress || progress.length === 0) {
        return NextResponse.json(
          { error: 'No progress found for this day' },
          { status: 400 }
        )
      }

      const currentProgress = progress[0]

      // Check if all sections are completed
      if (!currentProgress.completedSections || currentProgress.completedSections.length === 0) {
        return NextResponse.json(
          { error: 'Day cannot be completed. No sections completed.' },
          { status: 400 }
        )
      }

      // Update progress
      const { data: updatedProgress } = await supabase
        .from('userProgress')
        .update({
          isCompleted: true,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('userId', userId)
        .eq('dayId', dayId)
        .select()

      // Award badge if not already awarded
      const { data: existingBadge } = await supabase
        .from('userBadges')
        .select('id')
        .eq('userId', userId)
        .eq('badgeType', 'day_complete')
        .limit(1)

      if (!existingBadge || existingBadge.length === 0) {
        await supabase.from('userBadges').insert([{
          userId,
          badgeType: 'day_complete',
          badgeData: {
            dayId: dayId,
            title: `Day ${dayId} Complete`,
            description: `Completed all activities for Day ${dayId}`,
            iconName: 'check-circle',
            color: 'green',
          },
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

    // Update progress data
    const updates: any = {
      updatedAt: new Date().toISOString(),
    }

    if (slideId !== undefined && completed !== undefined) {
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

      updates.completedSections = completedSections
      updates.completedSlides = completedSlides
    }

    if (quizScores !== undefined) {
      updates.quizScores = {
        ...(currentProgress.quizScores || {}),
        ...quizScores,
      }
    }

    if (currentSlide !== undefined) {
      updates.currentSlide = currentSlide
    }

    const { data: updatedProgress } = await supabase
      .from('userProgress')
      .update(updates)
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