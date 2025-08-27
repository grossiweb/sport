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

    const teams = await sportsAPI.getTeams(sport as SportType)

    return NextResponse.json({
      success: true,
      data: teams
    })
  } catch (error) {
    console.error(`${sport} Teams API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} teams` },
      { status: 500 }
    )
  }
}