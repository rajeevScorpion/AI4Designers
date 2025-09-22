import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/db'
import { users } from '@/shared/schema'
import { eq } from 'drizzle-orm'

// Demo mode - authentication is disabled
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      profession,
      courseType,
      stream,
      fieldOfWork,
      designation,
      organization,
      dateOfBirth
    } = body

    // Check if user exists and get current profile status
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user data to check if profile is locked
    const currentUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)

    if (currentUser.length > 0 && (currentUser[0] as any).profileLocked) {
      return NextResponse.json(
        { error: 'Profile is locked and cannot be modified' },
        { status: 400 }
      )
    }

    // Validate email matches the authenticated user's email
    if (email !== session.user.email) {
      return NextResponse.json(
        { error: 'Email cannot be changed' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = {
      fullName,
      email,
      phone,
      profession,
      organization,
      dateOfBirth
    }

    if (profession === 'student') {
      if (!courseType || !stream) {
        return NextResponse.json(
          { error: 'Course type and stream are required for students' },
          { status: 400 }
        )
      }
    } else {
      if (!fieldOfWork || !designation) {
        return NextResponse.json(
          { error: 'Field of work and designation are required for working professionals' },
          { status: 400 }
        )
      }
    }

    // Check if all required fields are provided
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Update or create user profile
    const updateData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      profession: profession.trim(),
      courseType: profession === 'student' ? courseType.trim() : null,
      stream: profession === 'student' ? stream.trim() : null,
      fieldOfWork: profession === 'working' ? fieldOfWork.trim() : null,
      designation: profession === 'working' ? designation.trim() : null,
      organization: organization.trim(),
      dateOfBirth: dateOfBirth.trim(),
      profileLocked: true,
      isProfileComplete: true,
      updatedAt: new Date()
    }

    let result
    if (currentUser.length > 0) {
      // Update existing user
      result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.email, session.user.email))
        .returning()
    } else {
      // Create new user record
      result = await db
        .insert(users)
        .values({
          ...updateData,
          id: session.user.id,
          createdAt: new Date()
        })
        .returning()
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: result[0]
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
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile data
    const userProfile = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)

    if (userProfile.length === 0) {
      // Return basic user info if no profile exists yet
      return NextResponse.json({
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || '',
          profileLocked: false,
          isProfileComplete: false,
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