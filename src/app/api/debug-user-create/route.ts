import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testUser } = body

    const supabase = createServiceClient()

    console.log('Attempting to create user with data:', testUser)

    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error,
        userData: testUser
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}