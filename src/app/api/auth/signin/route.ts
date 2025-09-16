import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Sign in successful',
      user: data.user,
      session: data.session
    })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { message: 'Failed to sign in' },
      { status: 500 }
    )
  }
}