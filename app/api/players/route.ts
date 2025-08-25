import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')
    
    console.log('Players API called with team:', team)
    
    const players = await sportsAPI.getPlayers(team || undefined)

    console.log('Players found:', players.length)
    
    // Debug: Show first few players and their team IDs
    if (players.length > 0) {
      console.log('First 3 players:')
      players.slice(0, 3).forEach(player => {
        console.log(`- ${player.name} (Team: ${player.teamId}, Position: ${player.position})`)
      })
    }
    
    // If team is specified, verify filtering worked
    if (team && players.length > 10) {
      console.log('WARNING: Team filtering may not be working - expected ~5 players, got', players.length)
    }

    return NextResponse.json({
      success: true,
      data: players
    })
  } catch (error) {
    console.error('College Football Players API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college football players' },
      { status: 500 }
    )
  }
}