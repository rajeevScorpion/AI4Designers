import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const results = {
    tests: [] as any[],
    success: false,
    error: null as string | null
  }

  try {
    // Test 1: Check environment variables
    results.tests.push({
      name: 'Environment Variables',
      status: 'Testing...',
      details: {}
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    results.tests[0].details = {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing'
    }
    results.tests[0].status = 'Completed'

    // Test 2: Supabase service client connection test
    results.tests.push({
      name: 'Supabase Service Client Connection',
      status: 'Testing...',
      details: {}
    })

    try {
      const supabase = createServiceClient()
      const start = Date.now()
      const { data, error } = await supabase.from('users').select('id').limit(1)
      const end = Date.now()

      if (error) {
        throw error
      }

      results.tests[1].details = {
        success: true,
        responseTime: `${end - start}ms`,
        queryReturned: data ? true : false
      }
      results.tests[1].status = 'Success'
    } catch (error) {
      results.tests[1].details = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      results.tests[1].status = 'Failed'
    }

    // Test 3: User count test
    results.tests.push({
      name: 'User Count Test',
      status: 'Testing...',
      details: {}
    })

    try {
      const supabase = createServiceClient()
      const start = Date.now()
      const { data, error, count } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const end = Date.now()

      if (error) {
        throw error
      }

      results.tests[2].details = {
        success: true,
        userCount: count || 0,
        responseTime: `${end - start}ms`
      }
      results.tests[2].status = 'Success'
    } catch (error) {
      results.tests[2].details = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      results.tests[2].status = 'Failed'
    }

    // Test 4: Schema validation test
    results.tests.push({
      name: 'Schema Validation',
      status: 'Testing...',
      details: {}
    })

    try {
      const supabase = createServiceClient()
      const tablesInfo = {
        users: 'Checking...',
        userProgress: 'Checking...',
        userBadges: 'Checking...',
        sessions: 'Checking...'
      }

      // Test users table
      try {
        await supabase.from('users').select('id').limit(1)
        tablesInfo.users = 'Accessible'
      } catch (error) {
        tablesInfo.users = `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      }

      // Test userProgress table
      try {
        await supabase.from('userProgress').select('id').limit(1)
        tablesInfo.userProgress = 'Accessible'
      } catch (error) {
        tablesInfo.userProgress = `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      }

      // Test userBadges table
      try {
        await supabase.from('userBadges').select('id').limit(1)
        tablesInfo.userBadges = 'Accessible'
      } catch (error) {
        tablesInfo.userBadges = `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      }

      // Test sessions table
      try {
        await supabase.from('sessions').select('id').limit(1)
        tablesInfo.sessions = 'Accessible'
      } catch (error) {
        tablesInfo.sessions = `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      }

      results.tests[3].details = { tables: tablesInfo }
      results.tests[3].status = 'Completed'
    } catch (error) {
      results.tests[3].details = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      results.tests[3].status = 'Failed'
    }

    // Test 5: Auth service test
    results.tests.push({
      name: 'Auth Service',
      status: 'Testing...',
      details: {}
    })

    try {
      const supabase = createServiceClient()
      const start = Date.now()
      // Test if we can access auth service
      const { data, error } = await supabase.auth.getUser('dummy_token')
      const end = Date.now()

      // We expect this to fail, but we check if the service responds
      results.tests[4].details = {
        success: error !== null && error.message === 'Invalid token',
        responseTime: `${end - start}ms`,
        serviceResponding: true
      }
      results.tests[4].status = 'Success'
    } catch (error) {
      results.tests[4].details = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      results.tests[4].status = 'Failed'
    }

    // Determine overall success
    results.success = results.tests.filter(t => t.status === 'Success').length >= 3

  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(results)
}