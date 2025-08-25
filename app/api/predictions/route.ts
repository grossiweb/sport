import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const predictions = await sportsAPI.getPredictions(date || undefined)

    return NextResponse.json({
      success: true,
      data: predictions
    })
  } catch (error) {
    console.error('College Football Predictions API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college football predictions' },
      { status: 500 }
    )
  }
}