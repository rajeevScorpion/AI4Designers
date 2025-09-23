import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Simple in-memory storage for demo purposes
// In production, this would be replaced with a proper database
const userProgressStorage = new Map<string, any>()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get progress from in-memory storage
    const progress = userProgressStorage.get(user.id) || {
      currentDay: 1,
      days: {},
      overallProgress: {
        totalDaysCompleted: 0,
        totalQuizzesCompleted: 0,
        lastAccessed: new Date().toISOString(),
      }
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { progress, action } = body

    if (action === 'sync') {
      // Store the complete progress object
      userProgressStorage.set(user.id, progress)

      return NextResponse.json({
        success: true,
        message: 'Progress synced successfully',
        progress: progress
      })
    }

    // Handle individual progress updates
    const { dayId, slideId, completed } = body

    if (dayId !== undefined && slideId !== undefined && completed !== undefined) {
      const currentProgress = userProgressStorage.get(user.id) || {
        currentDay: 1,
        days: {},
        overallProgress: {
          totalDaysCompleted: 0,
          totalQuizzesCompleted: 0,
          lastAccessed: new Date().toISOString(),
        }
      }

      // Initialize day progress if not exists
      if (!currentProgress.days[dayId]) {
        currentProgress.days[dayId] = {
          completedSections: [],
          completedSlides: [],
          quizScores: {},
          currentSlide: 0,
          completionPercentage: 0,
          lastAccessed: new Date().toISOString(),
        }
      }

      const dayProgress = currentProgress.days[dayId]

      // Update progress
      if (completed && !dayProgress.completedSlides.includes(slideId)) {
        dayProgress.completedSlides.push(slideId)
      } else if (!completed && dayProgress.completedSlides.includes(slideId)) {
        dayProgress.completedSlides = dayProgress.completedSlides.filter((id: string) => id !== slideId)
      }

      // Update completion percentage
      const totalSlides = 10 // This should be dynamic based on actual content
      dayProgress.completionPercentage = Math.round((dayProgress.completedSlides.length / totalSlides) * 100)

      // Update overall progress
      currentProgress.overallProgress.lastAccessed = new Date().toISOString()
      currentProgress.currentDay = dayId

      // Save updated progress
      userProgressStorage.set(user.id, currentProgress)

      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
        progress: currentProgress
      })
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}