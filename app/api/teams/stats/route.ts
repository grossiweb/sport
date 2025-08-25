import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(request: NextRequest) {
  try {
    console.log('Team stats API called')
    const teamStats = await sportsAPI.getTeamStats()
    console.log(`Team stats API returning ${teamStats.length} team stats`)

    return NextResponse.json({
      success: true,
      data: teamStats
    })
  } catch (error) {
    console.error('College Football Team stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college football team stats' },
      { status: 500 }
    )
  }
}