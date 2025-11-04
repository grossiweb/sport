import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'
    const { teamId } = params

    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    console.log(`${sport} opponent stats API called for team ${teamId}`)
    
    // Calculate opponent and defensive stats based on sport
    if (sport === 'NBA') {
      const nbaOpponentStats = await mongoSportsAPI.calculateNBAOpponentStats(sport as SportType, teamId)
      return NextResponse.json({
        success: true,
        data: nbaOpponentStats
      })
    }
    
    // For CFB/NFL, use existing methods
    const [opponentStats, defensiveStats] = await Promise.all([
      mongoSportsAPI.calculateOpponentStats(sport as SportType, teamId),
      mongoSportsAPI.calculateDefensiveStats(sport as SportType, teamId)
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...opponentStats,
        ...defensiveStats
      }
    })
  } catch (error) {
    const sport = new URL(request.url).searchParams.get('sport')?.toUpperCase() || 'CFB'
    console.error(`${sport} Opponent stats API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} opponent stats for team ${params.teamId}` },
      { status: 500 }
    )
  }
}

