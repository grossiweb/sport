import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(request: NextRequest) {
  let sport: string | undefined
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID parameter is required' },
        { status: 400 }
      )
    }

    const bettingData = await sportsAPI.getBettingData(sport as SportType,eventId)

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