import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { authService } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use server-side auth service
    const result = await authService.signUp({
      firstName,
      lastName,
      email,
      password
    })

    if (result.success) {
      // Create user record in database
      if (result.user) {
        try {
          const supabase = createServiceClient()
          await supabase.from('users').upsert([{
            id: result.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }], { onConflict: 'id' })
        } catch (dbError) {
          console.error('Database user creation error:', dbError)
          // Don't fail the signup if database insert fails
        }
      }

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: result.user
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create user' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}