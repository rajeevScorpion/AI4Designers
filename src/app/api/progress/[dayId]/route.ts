import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/shared/supabase'
import { courseData } from '@/shared/courseData'

interface RouteParams {
  params: Promise<{ dayId: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireAuth()
    const userId = user.id
    const { dayId } = await context.params
    const dayIdNum = parseInt(dayId)

    const progress = await db.getUserProgress(userId, dayIdNum)
    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireAuth()
    const userId = user.id
    const { dayId } = await context.params
    const dayIdNum = parseInt(dayId)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'complete') {
      const expectedSections = courseData[dayIdNum]
      if (!expectedSections) {
        return NextResponse.json({ message: 'Invalid day ID' }, { status: 400 })
      }

      let progress = await db.getUserProgress(userId, dayIdNum)
      if (!progress) {
        return NextResponse.json({
          message: 'No progress found for this day. Please complete some sections first.'
        }, { status: 400 })
      }

      const completedSections = progress.completed_sections || []
      const expectedSectionIds = expectedSections.map(section => section.id)
      const allSectionsCompleted = expectedSectionIds.every(sectionId =>
        completedSections.includes(sectionId)
      )

      if (!allSectionsCompleted) {
        const missingSections = expectedSectionIds.filter(sectionId =>
          !completedSections.includes(sectionId)
        )
        return NextResponse.json({
          message: `Day cannot be completed. Missing sections: ${missingSections.join(', ')}`,
          completedSections: completedSections.length,
          totalSections: expectedSectionIds.length,
          missingSections
        }, { status: 400 })
      }

      const updatedProgress = await db.updateUserProgress(userId, dayIdNum, {
        is_completed: true,
        completed_at: new Date().toISOString(),
      })

      const hasBadge = await db.hasBadge(userId, 'day_complete')
      if (!hasBadge) {
        await db.createUserBadge({
          user_id: userId,
          badge_type: 'day_complete',
          badge_data: {
            dayId: dayIdNum,
            title: `Day ${dayIdNum} Complete`,
            description: `Completed all activities for Day ${dayIdNum}`,
            iconName: 'check-circle',
            color: 'green',
          },
        })
      }

      return NextResponse.json(updatedProgress)
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
  } catch (error) {
    console.error('Error handling progress:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to handle progress request' },
      { status: 500 }
    )
  }
}