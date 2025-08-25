import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const games = await sportsAPI.getGames(date || undefined)

    return NextResponse.json({
      success: true,
      data: games
    })
  } catch (error) {
    console.error('College Football Games API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college football games' },
      { status: 500 }
    )
  }
}