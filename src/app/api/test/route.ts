import { supabase } from '@/shared/supabase'

export async function GET() {
  try {
    // Test basic connectivity
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })

    if (error) {
      console.error('[Test] Supabase connection error:', error)
      return Response.json({
        success: false,
        error: error.message,
        details: 'Failed to connect to Supabase'
      }, { status: 500 })
    }

    // Test auth configuration
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    return Response.json({
      success: true,
      message: 'Supabase connection successful',
      data: {
        userCount: data,
        hasAuthSession: !!session,
        authError: authError?.message
      }
    })
  } catch (error) {
    console.error('[Test] Unexpected error:', error)
    return Response.json({
      success: false,
      error: 'Unexpected error occurred'
    }, { status: 500 })
  }
}