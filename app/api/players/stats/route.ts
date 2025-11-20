import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sportParam = (searchParams.get('sport') || 'CFB').toUpperCase()
    const teamId = searchParams.get('teamId') || undefined
    const playerId = searchParams.get('playerId') || undefined

    if (!isValidSportType(sportParam)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    const sport = sportParam as SportType
    // Always use current season (2025) for now, regardless of query string
    const seasonYear = 2025

    const stats = await mongoSportsAPI.getPlayerSeasonStatsFromMongo(sport, {
      seasonYear,
      teamId: teamId || undefined,
      playerId: playerId || undefined
    })

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Player stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player stats' },
      { status: 500 }
    )
  }
}


