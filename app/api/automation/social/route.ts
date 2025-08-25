import { NextRequest, NextResponse } from 'next/server'
import { socialService } from '@/lib/automation/social-service'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'publish_daily':
        await socialService.publishDailySocialPosts()
        return NextResponse.json({
          success: true,
          message: 'Daily social posts published successfully'
        })

      case 'generate_preview':
        const posts = await socialService.generateDailySocialPosts()
        return NextResponse.json({
          success: true,
          data: posts
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Social automation error:', error)
    return NextResponse.json(
      { error: 'Failed to process social automation' },
      { status: 500 }
    )
  }
}