import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
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

    const { fullName, courseId, completionDate } = await request.json()

    // Create PDF certificate
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Set background
    pdf.setFillColor(245, 245, 250)
    pdf.rect(0, 0, 297, 210, 'F')

    // Add border
    pdf.setDrawColor(100, 100, 200)
    pdf.setLineWidth(2)
    pdf.rect(10, 10, 277, 190)

    // Add title
    pdf.setFontSize(28)
    pdf.setTextColor(50, 50, 100)
    pdf.text('Certificate of Completion', 148.5, 50, { align: 'center' })

    // Add course name
    pdf.setFontSize(36)
    pdf.setTextColor(0, 0, 0)
    pdf.text('AI Fundamentals for Designers', 148.5, 80, { align: 'center' })

    // Add "This is to certify that"
    pdf.setFontSize(16)
    pdf.setTextColor(80, 80, 80)
    pdf.text('This is to certify that', 148.5, 105, { align: 'center' })

    // Add recipient name
    pdf.setFontSize(24)
    pdf.setTextColor(100, 100, 200)
    pdf.text(fullName, 148.5, 125, { align: 'center' })

    // Add completion text
    pdf.setFontSize(16)
    pdf.setTextColor(80, 80, 80)
    pdf.text('has successfully completed the 5-day crash course on', 148.5, 145, { align: 'center' })
    pdf.setFontSize(20)
    pdf.text('AI Fundamentals for Designers', 148.5, 160, { align: 'center' })

    // Add completion date
    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Completed on ${new Date(completionDate).toLocaleDateString()}`, 148.5, 180, { align: 'center' })

    // Add course ID
    pdf.setFontSize(10)
    pdf.text(`Course ID: ${courseId}`, 20, 190)

    // Add signature line
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.5)
    pdf.line(220, 170, 270, 170)
    pdf.setFontSize(10)
    pdf.text('Authorized Signature', 245, 180, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer')

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AI-Fundamentals-Certificate-${fullName.replace(/\s+/g, '-')}.pdf"`
      }
    })
  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}