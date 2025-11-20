import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sportParam = (searchParams.get('sport') || 'CFB').toUpperCase()

    if (!isValidSportType(sportParam)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    const sport = sportParam as SportType

    const insights = await mongoSportsAPI.getPlayerInsights(sport)

    return NextResponse.json({
      success: true,
      data: insights
    })
  } catch (error) {
    console.error('Player insights API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player insights' },
      { status: 500 }
    )
  }
}


