import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { authenticateRequest, apiResponse, handleOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleOptions(request)
  if (corsResponse) return corsResponse

  const supabase = createServiceClient()

  try {
    // Authenticate with proper authentication
    const authResult = await authenticateRequest(request, {
      allowServiceRole: false // Require proper authentication for production
    })

    if (!authResult.success || !authResult.user) {
      return apiResponse({ error: authResult.error || 'Unauthorized' }, 401)
    }

    const userId = authResult.user.id

    // Check if user has completed all 5 days
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)

    if (progressError) {
      return apiResponse(
        { error: 'Failed to check progress', details: progressError.message },
        500
      )
    }

    const completedDays = progress?.filter(p => p.is_completed).length || 0
    if (completedDays < 5) {
      return apiResponse(
        { error: 'Certificate not available', details: 'Complete all 5 days to generate certificate' },
        400
      )
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('user_certificates')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (existingCert && existingCert.length > 0) {
      // Return existing certificate
      return apiResponse({
        success: true,
        certificate: existingCert[0],
        message: 'Certificate already exists'
      })
    }

    // Generate new certificate
    const { data: certificate, error: certError } = await supabase
      .from('user_certificates')
      .insert([{
        user_id: userId,
        certificate_url: `https://ai4designers.app/certificates/${userId}`,
        issued_at: new Date().toISOString(),
        expiry_date: null, // No expiry
        is_verified: true
      }])
      .select()

    if (certError) {
      return apiResponse(
        { error: 'Failed to generate certificate', details: certError.message },
        500
      )
    }

    return apiResponse({
      success: true,
      certificate: certificate?.[0],
      message: 'Certificate generated successfully'
    })
  } catch (error) {
    console.error('Certificate generation error:', error)
    return apiResponse(
      { error: 'Failed to generate certificate', details: error instanceof Error ? error.message : 'Unknown error' },
      500
    )
  }
}