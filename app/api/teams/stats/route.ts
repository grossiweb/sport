import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'

    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    console.log(`${sport} team stats API called`)
    const teamStats = await sportsAPI.getTeamStats(sport as SportType)
    console.log(`${sport} team stats API returning ${teamStats.length} team stats`)

    return NextResponse.json({
      success: true,
      data: teamStats
    })
  } catch (error) {
    console.error(`${sport} Team stats API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} team stats` },
      { status: 500 }
    )
  }
}