import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(request: NextRequest) {
  let sport: string | undefined
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'
    const date = searchParams.get('date')

    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    const games = await sportsAPI.getGames(sport as SportType, date || undefined)

    return NextResponse.json({
      success: true,
      data: games
    })
  } catch (error) {
    console.error(`${sport} Games API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} games` },
      { status: 500 }
    )
  }
}