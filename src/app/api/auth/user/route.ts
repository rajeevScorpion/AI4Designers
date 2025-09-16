import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/shared/supabase'

export async function GET(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({
      req: request,
      res
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data: userDetails } = await supabase.auth.getUser()

    return NextResponse.json(userDetails)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({
      req: request,
      res
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { first_name, last_name, profile_image_url } = body

    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name,
        last_name,
        profile_image_url
      }
    })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json(data.user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    )
  }
}