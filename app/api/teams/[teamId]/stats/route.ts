import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'
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
    const teamId = params.teamId

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

    console.log(`${sport} Team ${teamId} detailed stats API called`)
    const detailedStats = await sportsAPI.getDetailedTeamStats(sport as SportType, teamId)
    console.log(`${sport} Team ${teamId} detailed stats API returning ${detailedStats.length} stats`)

    return NextResponse.json({
      success: true,
      data: detailedStats
    })
  } catch (error) {
    const sport = new URL(request.url).searchParams.get('sport')?.toUpperCase() || 'CFB'
    const teamId = params?.teamId || 'unknown'
    console.error(`${sport} Team ${teamId} detailed stats API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} team ${teamId} detailed stats` },
      { status: 500 }
    )
  }
}
