import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'
    const homeTeamId = searchParams.get('homeTeamId')
    const awayTeamId = searchParams.get('awayTeamId')
    const homeTeamName = searchParams.get('homeTeamName')
    const awayTeamName = searchParams.get('awayTeamName')

    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    if (!homeTeamId || !awayTeamId) {
      return NextResponse.json(
        { error: 'Missing team IDs' },
        { status: 400 }
      )
    }

    console.log(`[CoversSummary] Fetching for ${sport}: ${homeTeamName} vs ${awayTeamName}`)
    const startTime = Date.now()

    const coversSummary = await mongoSportsAPI.buildMatchupCoversSummary(
      sport as SportType,
      homeTeamId,
      awayTeamId,
      homeTeamName || undefined,
      awayTeamName || undefined
    )

    console.log(`[CoversSummary] Computed in ${Date.now() - startTime}ms`)

    const response = NextResponse.json({
      success: true,
      data: coversSummary
    })

    // Cache for 5 minutes since ATS data doesn't change frequently
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response

  } catch (error) {
    console.error('Covers summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch covers summary' },
      { status: 500 }
    )
  }
}

