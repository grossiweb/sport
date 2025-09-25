import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(request: NextRequest) {
  let sport: string | undefined
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'
    const team = searchParams.get('team')
    
    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }
    
    console.log(`${sport} Players API called with team:`, team)
    
    const players = await mongoSportsAPI.getPlayers(sport as SportType, team || undefined)

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
    const sport = new URL(request.url).searchParams.get('sport')?.toUpperCase() || 'CFB'
    console.error(`${sport} Players API error:`, error)
    return NextResponse.json(
      { error: `Failed to fetch ${sport} players` },
      { status: 500 }
    )
  }
}