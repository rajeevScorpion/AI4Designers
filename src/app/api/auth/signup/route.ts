import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/shared/schema'
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
          await db.insert(users).values({
            id: result.user.id,
            email: email,
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`
          })
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