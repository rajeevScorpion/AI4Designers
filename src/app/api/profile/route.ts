import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { authenticateRequest, apiResponse, handleOptions } from '@/lib/auth'


export async function PUT(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleOptions(request)
  if (corsResponse) return corsResponse

  try {
    const authResult = await authenticateRequest(request, {
      allowServiceRole: false // Require proper authentication for production
    })

    if (!authResult.success || !authResult.user) {
      return apiResponse({ error: authResult.error || 'Unauthorized' }, 401)
    }

    const userId = authResult.user.id
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

    // Get current user data to check if profile is locked
    const supabase = createServiceClient()
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

  
    if (currentUser?.profilelocked) {
      return apiResponse({ error: 'Profile is locked and cannot be modified' }, 400)
    }

    // Validate email matches the authenticated user's email
    if (email !== authResult.user.email) {
      return apiResponse({ error: 'Email cannot be changed' }, 400)
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
        return apiResponse(
          { error: 'Course type and stream are required for students' },
          400
        )
      }
    } else {
      if (!fieldOfWork || !designation) {
        return apiResponse(
          { error: 'Field of work and designation are required for working professionals' },
          400
        )
      }
    }

    // Check if all required fields are provided
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === '') {
        return apiResponse({ error: `${field} is required` }, 400)
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
        .eq('id', userId)
        .select()
        .single()
    } else {
            // Create new user record
      result = await supabase
        .from('users')
        .insert({
          ...updateData,
          id: userId,
          createdat: new Date().toISOString()
        })
        .select()
        .single()
    }


    return apiResponse({
      success: true,
      message: 'Profile updated successfully',
      user: result.data
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return apiResponse(
      { error: 'Internal server error' },
      500
    )
  }
}

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleOptions(request)
  if (corsResponse) return corsResponse

  try {
    const authResult = await authenticateRequest(request, {
      allowServiceRole: false // Require proper authentication for production
    })

    if (!authResult.success || !authResult.user) {
      return apiResponse({ error: authResult.error || 'Unauthorized' }, 401)
    }

    const userId = authResult.user.id

    // Get user profile data
    const supabase = createServiceClient()
    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()


    if (fetchError && fetchError.code === 'PGRST116') {
      // Return basic user info if no profile exists yet
      return apiResponse({
        success: true,
        user: {
          id: userId,
          email: authResult.user.email,
          fullname: authResult.user.user_metadata?.full_name || '',
          profilelocked: false,
          isprofilecomplete: false,
          createdat: new Date(),
          updatedat: new Date()
        }
      })
    }

    return apiResponse({
      success: true,
      user: userProfile
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return apiResponse(
      { error: 'Internal server error' },
      500
    )
  }
}