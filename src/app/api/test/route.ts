import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token', details: error?.message }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      message: 'Auth working'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}