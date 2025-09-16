import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/shared/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const badges = await db.getUserBadges(userId)
    return NextResponse.json(badges)
  } catch (error) {
    console.error('Error fetching badges:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id
    const body = await request.json()
    const { badge_type, badge_data } = body

    // Check if user already has this badge
    const hasBadge = await db.hasBadge(userId, badge_type)
    if (hasBadge) {
      return NextResponse.json({ message: 'Badge already earned' }, { status: 400 })
    }

    const badge = await db.createUserBadge({
      user_id: userId,
      badge_type,
      badge_data: {
        ...badge_data,
        earned_at: new Date().toISOString()
      }
    })

    return NextResponse.json(badge)
  } catch (error) {
    console.error('Error creating badge:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to create badge' },
      { status: 500 }
    )
  }
}