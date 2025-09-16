import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/shared/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const profile = await db.getUser(userId)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id
    const body = await request.json()

    const profile = await db.updateUser(userId, body)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}