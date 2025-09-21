import { NextRequest, NextResponse } from 'next/server'

// Demo mode - authentication is disabled
export async function PUT(request: NextRequest) {
  try {
    // In demo mode, return mock success response
    const body = await request.json()

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully (demo mode)',
      user: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // In demo mode, return mock user data
    return NextResponse.json({
      success: true,
      user: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        fullName: 'Demo Student',
        firstName: 'Demo',
        lastName: 'Student',
        phone: '+1 234 567 8900',
        profession: 'student',
        courseType: 'Design',
        stream: 'UI/UX Design',
        fieldOfWork: '',
        designation: '',
        organization: 'Design University',
        dateOfBirth: '2000-01-01',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}