import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sportParam = (searchParams.get('sport') || 'CFB').toUpperCase()
    const teamId = searchParams.get('teamId') || undefined
    const season = searchParams.get('season') || '2025'

    if (!isValidSportType(sportParam)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    const sport = sportParam as SportType
    const seasonYear = parseInt(season, 10) || 2025
    const playerId = params.playerId

    const detailedStats = await mongoSportsAPI.getPlayerDetailedSeasonStatsFromMongo(sport, {
      seasonYear,
      teamId: teamId || undefined,
      playerId
    })

    return NextResponse.json({
      success: true,
      data: detailedStats
    })
  } catch (error) {
    console.error('Player detailed stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch detailed player stats' },
      { status: 500 }
    )
  }
}


