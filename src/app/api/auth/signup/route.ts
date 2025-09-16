import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name } = body

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          profile_image_url: null
        }
      }
    })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Sign up successful',
      user: data.user
    })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { message: 'Failed to sign up' },
      { status: 500 }
    )
  }
}