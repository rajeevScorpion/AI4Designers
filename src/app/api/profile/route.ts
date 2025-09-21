import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/shared/schema'
import { eq } from 'drizzle-orm'
import { createServiceClient } from '@/lib/supabase/service'

export async function PUT(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the token and get user
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get profile data from request body
    const body = await request.json()
    const {
      fullName,
      phone,
      profession,
      courseType,
      stream,
      fieldOfWork,
      designation,
      organization,
      dateOfBirth
    } = body

    // Validate required fields based on profession
    if (!fullName || !phone || !profession || !organization || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (profession === 'student' && (!courseType || !stream)) {
      return NextResponse.json(
        { error: 'Course type and stream are required for students' },
        { status: 400 }
      )
    }

    if (profession === 'working' && (!fieldOfWork || !designation)) {
      return NextResponse.json(
        { error: 'Field of work and designation are required for working professionals' },
        { status: 400 }
      )
    }

    // Check if user exists first
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    let updatedUser

    if (existingUser.length === 0) {
      // Create user record if it doesn't exist
      updatedUser = await db
        .insert(users)
        .values({
          id: user.id,
          email: user.email || '',
          fullName,
          phone,
          profession,
          courseType,
          stream,
          fieldOfWork,
          designation,
          organization,
          dateOfBirth,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
    } else {
      // Update existing user profile
      updatedUser = await db
        .update(users)
        .set({
          fullName,
          phone,
          profession,
          courseType,
          stream,
          fieldOfWork,
          designation,
          organization,
          dateOfBirth,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id))
        .returning()
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify the token and get user
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get user profile
    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (userProfile.length === 0) {
      // Return user data from auth if no profile exists
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          phone: '',
          profession: 'student',
          courseType: '',
          stream: '',
          fieldOfWork: '',
          designation: '',
          organization: '',
          dateOfBirth: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: userProfile[0]
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}