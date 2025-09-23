import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Try a simple user query first
    const { data: userRecord, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .limit(1)

    if (queryError) {
      return NextResponse.json({
        error: 'Database query failed',
        details: queryError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userFound: userRecord && userRecord.length > 0,
      userId: user.id,
      userRecord: userRecord?.[0] || null
    })
  } catch (catchError) {
    return NextResponse.json({
      error: 'Database query failed',
      details: catchError instanceof Error ? catchError.message : 'Unknown error'
    }, { status: 500 })
  }
}