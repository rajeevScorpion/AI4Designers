import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// Helper function to get user from JWT token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const supabase = createClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return null
    }
    return user
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

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

    // Get user from JWT token
    const user = await getUserFromToken(request)
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user data to check if profile is locked
    const supabase = createClient()
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

  
    if (currentUser?.profilelocked) {
      return NextResponse.json(
        { error: 'Profile is locked and cannot be modified' },
        { status: 400 }
      )
    }

    // Validate email matches the authenticated user's email
    if (email !== user.email) {
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
      fullname: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      profession: profession.trim(),
      coursetype: profession === 'student' ? courseType.trim() : null,
      stream: profession === 'student' ? stream.trim() : null,
      fieldofwork: profession === 'working' ? fieldOfWork.trim() : null,
      designation: profession === 'working' ? designation.trim() : null,
      organization: organization.trim(),
      dateofbirth: dateOfBirth.trim(),
      profilelocked: true,
      isprofilecomplete: true,
      updatedat: new Date().toISOString()
    }

    let result
    if (currentUser) {
      // Update existing user
      result = await supabase
        .from('users')
        .update(updateData)
        .eq('email', user.email)
        .select()
        .single()
    } else {
            // Create new user record
      result = await supabase
        .from('users')
        .insert({
          ...updateData,
          id: user.id,
          createdat: new Date().toISOString()
        })
        .select()
        .single()
    }

    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.data
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
    // Get user from JWT token
    const user = await getUserFromToken(request)

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile data
    const supabase = createClient()
    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()


    if (fetchError && fetchError.code === 'PGRST116') {
      // Return basic user info if no profile exists yet
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullname: user.user_metadata?.full_name || '',
          profilelocked: false,
          isprofilecomplete: false,
          createdat: new Date(),
          updatedat: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: userProfile
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}