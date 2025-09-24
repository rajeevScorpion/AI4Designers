import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { apiResponse, handleOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleOptions(request)
  if (corsResponse) return corsResponse

  try {
    const supabase = createServiceClient()

    // Test basic database connection
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      console.error('Database connection error:', error)
      return apiResponse({
        success: false,
        error: 'Database connection failed',
        details: error.message
      }, 500)
    }

    // Test table structure
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    return apiResponse({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount: data?.length || 0,
        tables: ['users', 'user_progress', 'user_badges', 'user_certificates', 'sessions'],
        testQuery: data,
        tableStructure: tables ? 'Accessible' : 'Error',
        tablesError: tablesError?.message
      }
    })
  } catch (error) {
    console.error('Server error:', error)
    return apiResponse({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
}