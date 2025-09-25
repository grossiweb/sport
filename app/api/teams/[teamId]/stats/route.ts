import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  let sport: string | undefined
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

    console.log(`${sport} individual team stats API called for team ${teamId}`)
    
    // Get detailed team stats
    const detailedStats = await mongoSportsAPI.getDetailedTeamStats(sport as SportType, teamId)
    
    // Also get basic team stats
    const basicStats = await mongoSportsAPI.getTeamStatsByTeamId(sport as SportType, teamId)

    return NextResponse.json({
      success: true,
      data: detailedStats  // Return detailed stats directly for the component
    })
  } catch (error) {
    const sport = new URL(request.url).searchParams.get('sport')?.toUpperCase() || 'CFB'
    console.error(`${sport} Individual team stats API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} team stats for team ${params.teamId}` },
      { status: 500 }
    )
  }
}