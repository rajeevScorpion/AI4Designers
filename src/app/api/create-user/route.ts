import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Try to create user record
    try {
      const supabase = createServiceClient()
      const { data, error } = await supabase.from('users').upsert([{
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.fullName || ''
      }], { onConflict: 'id' }).select()

      if (error) {
        return NextResponse.json({
          error: 'Failed to create user',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: data?.[0]
      })
    } catch (insertError) {
      return NextResponse.json({
        error: 'Failed to create user',
        details: insertError instanceof Error ? insertError.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}