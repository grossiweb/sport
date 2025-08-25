import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/automation/email-service'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'send_daily':
        await emailService.sendDailyEmail()
        return NextResponse.json({
          success: true,
          message: 'Daily email sent successfully'
        })

      case 'generate_preview':
        const emailContent = await emailService.generateDailyEmail()
        return NextResponse.json({
          success: true,
          data: emailContent
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Email automation error:', error)
    return NextResponse.json(
      { error: 'Failed to process email automation' },
      { status: 500 }
    )
  }
}