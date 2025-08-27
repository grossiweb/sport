import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(request: NextRequest) {
  let sport: string | undefined
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'
    const season = searchParams.get('season') || '2024'
    const playerId = searchParams.get('playerId')
    const teamId = searchParams.get('teamId')
    
    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }
    
    console.log(`${sport} Player stats API called with:`, { season, playerId, teamId })
    
    const playerStats = await sportsAPI.getPlayerStats(sport as SportType, teamId || undefined, playerId || undefined)
    
    console.log(`${sport} Player stats API returning ${playerStats.length} player stats`)

    return NextResponse.json({
      success: true,
      data: playerStats
    })
  } catch (error) {
    const sport = new URL(request.url).searchParams.get('sport')?.toUpperCase() || 'CFB'
    console.error(`${sport} Player stats API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} player stats` },
      { status: 500 }
    )
  }
}