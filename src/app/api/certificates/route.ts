import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/shared/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const certificates = await db.getUserCertificates(userId)
    return NextResponse.json(certificates)
  } catch (error) {
    console.error('Error fetching certificates:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id
    const body = await request.json()
    const { course_id, certificate_data } = body

    // Check if user already has a certificate for this course
    const hasCertificate = await db.hasCertificate(userId, course_id)
    if (hasCertificate) {
      return NextResponse.json(
        { message: 'Certificate already issued for this course' },
        { status: 400 }
      )
    }

    const certificate = await db.createUserCertificate({
      user_id: userId,
      course_id,
      certificate_data: {
        ...certificate_data,
        issued_at: new Date().toISOString()
      }
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Error creating certificate:', error)
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to create certificate' },
      { status: 500 }
    )
  }
}