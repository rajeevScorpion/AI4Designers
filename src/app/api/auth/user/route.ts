import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/shared/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const { data: userDetails } = await supabaseAdmin.auth.admin.getUserById(userId)

    return NextResponse.json(userDetails)
  } catch (error) {
    console.error('Error fetching user:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id
    const body = await request.json()
    const { first_name, last_name, profile_image_url } = body

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          first_name,
          last_name,
          profile_image_url
        }
      }
    )

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json(data.user)
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    )
  }
}