import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check user progress across all days
    const { data: progressData, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Progress check error:', error)
      return NextResponse.json(
        { error: 'Failed to check progress' },
        { status: 500 }
      )
    }

    // Check if all 5 days are completed
    const completedDays = progressData?.filter(p => {
      const completedSections = p.completed_sections || []
      const daySections = [1, 2, 3, 4, 5].map(i => `day-${i}-section-${i}`)
      return daySections.every(section => completedSections.includes(section))
    }).length || 0

    const isEligible = completedDays >= 5

    // Get user profile for full name
    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      eligible: isEligible,
      fullName: userData?.full_name || user.email || '',
      completionDate: progressData?.[0]?.updated_at || new Date().toISOString(),
      courseId: 'AI-FUND-DESIGN-001'
    })
  } catch (error) {
    console.error('Certificate eligibility check error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}