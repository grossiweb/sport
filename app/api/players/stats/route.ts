import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || '2024'
    const playerId = searchParams.get('playerId')
    const teamId = searchParams.get('teamId')
    
    console.log('Player stats API called with:', { season, playerId, teamId })
    
    const playerStats = await sportsAPI.getPlayerStats(teamId || undefined, playerId || undefined)
    
    console.log(`Player stats API returning ${playerStats.length} player stats`)

    return NextResponse.json({
      success: true,
      data: playerStats
    })
  } catch (error) {
    console.error('College Football Player stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college football player stats' },
      { status: 500 }
    )
  }
}