import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(request: NextRequest) {
  try {
    const teams = await sportsAPI.getTeams()

    return NextResponse.json({
      success: true,
      data: teams
    })
  } catch (error) {
    console.error('College Football Teams API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college football teams' },
      { status: 500 }
    )
  }
}