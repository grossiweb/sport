import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID parameter is required' },
        { status: 400 }
      )
    }

    const bettingData = await sportsAPI.getBettingData(eventId)

    return NextResponse.json({
      success: true,
      data: bettingData
    })
  } catch (error) {
    console.error('Betting API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch betting data' },
      { status: 500 }
    )
  }
}