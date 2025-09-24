import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const results = {}

    // Test different table name variations
    const tableVariations = [
      'users',
      'userprogress',
      'userProgress',
      'user_badges',
      'userbadges',
      'userBadges',
      'sessions',
      'user_progress'
    ]

    for (const tableName of tableVariations) {
      try {
        const { data, error } = await supabase.from(tableName).select('id').limit(1)
        results[tableName] = {
          accessible: !error,
          error: error?.message,
          hasData: data && data.length > 0
        }
      } catch (err) {
        results[tableName] = {
          accessible: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}