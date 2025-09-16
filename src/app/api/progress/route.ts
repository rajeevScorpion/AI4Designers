import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/shared/supabase'
import { courseData } from '@/shared/courseData'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const progress = await db.getAllUserProgress(userId)
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id
    const body = await request.json()
    const { dayId, slideId, completed } = body

    let progress = await db.getUserProgress(userId, dayId)

    if (!progress) {
      progress = await db.createUserProgress({
        user_id: userId,
        day_id: dayId,
        completed_sections: [],
        completed_slides: [],
        quiz_scores: {},
      })
    }

    const expectedSections = courseData[dayId]
    const validSectionIds = expectedSections ? expectedSections.map(s => s.id) : []

    const completedSections = [...(progress.completed_sections || [])]
    const completedSlides = [...(progress.completed_slides || [])]

    if (!validSectionIds.includes(slideId)) {
      return NextResponse.json({
        message: `Invalid section ID '${slideId}' for day ${dayId}`,
        validSections: validSectionIds
      }, { status: 400 })
    }

    if (completed && !completedSections.includes(slideId)) {
      completedSections.push(slideId)
    } else if (!completed) {
      const index = completedSections.indexOf(slideId)
      if (index > -1) {
        completedSections.splice(index, 1)
      }
    }

    const updatedProgress = await db.updateUserProgress(userId, dayId, {
      completed_sections: completedSections,
      completed_slides: completedSlides,
    })

    return NextResponse.json(updatedProgress)
  } catch (error) {
    console.error('Error updating progress:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to update progress' },
      { status: 500 }
    )
  }
}