import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { authenticateRequest, apiResponse, handleOptions, AuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleOptions(request)
  if (corsResponse) return corsResponse

  try {
    // Authenticate with proper authentication
    const authResult = await authenticateRequest(request, {
      allowServiceRole: false // Require proper authentication for production
    })

    if (!authResult.success || !authResult.user) {
      return apiResponse({ error: authResult.error || 'Unauthorized' }, 401)
    }

    const supabase = createServiceClient()
    const body = await request.json()

    // Extract user data from request or use authenticated user
    const userId = authResult.isServiceRole && body.user_id ? body.user_id : authResult.user.id
    const email = authResult.isServiceRole && body.email ? body.email : authResult.user.email || body.email
    const fullname = body.fullname || authResult.user.user_metadata?.full_name || authResult.user.user_metadata?.fullName || 'Test User'

    // Create user record
    const { data, error } = await supabase.from('users').upsert([{
      id: userId,
      email: email || `user-${Date.now()}@ai4designers.local`,
      fullname: fullname,
      phone: body.phone || null,
      profession: body.profession || 'student',
      organization: body.organization || null
    }], { onConflict: 'id' }).select()

    if (error) {
      console.error('User creation error:', error)
      return apiResponse({
        error: 'Failed to create user',
        details: error.message
      }, 500)
    }

    return apiResponse({
      success: true,
      message: 'User created successfully',
      user: data?.[0]
    })
  } catch (error) {
    console.error('Create user error:', error)
    return apiResponse({
      error: 'Request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
}