import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

type StatKey = 'passing' | 'rushing' | 'receiving' | 'tackles' | 'sacks' | 'interceptions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sportParam = (searchParams.get('sport') || 'CFB').toUpperCase()
    const statParam = (searchParams.get('stat') || 'passing').toLowerCase() as StatKey
    const limit = parseInt(searchParams.get('limit') || '50', 10) || 50

    if (!isValidSportType(sportParam)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    const allowedStats: StatKey[] = ['passing', 'rushing', 'receiving', 'tackles', 'sacks', 'interceptions']
    if (!allowedStats.includes(statParam)) {
      return NextResponse.json(
        { error: 'Invalid stat parameter' },
        { status: 400 }
      )
    }

    const sport = sportParam as SportType

    const leaders = await mongoSportsAPI.getPlayerLeadersByStat(sport, statParam, { limit })

    return NextResponse.json({
      success: true,
      data: leaders
    })
  } catch (error) {
    console.error('Player leaders API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player leaders' },
      { status: 500 }
    )
  }
}


