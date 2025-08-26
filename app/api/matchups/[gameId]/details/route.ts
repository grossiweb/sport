import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params
    const { searchParams } = new URL(request.url)
    const homeTeamId = searchParams.get('homeTeamId')
    const awayTeamId = searchParams.get('awayTeamId')
    
    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required', success: false },
        { status: 400 }
      )
    }

    // Get detailed data for specific game - only if team IDs are provided
    const promises = []
    
    // Always try to get betting data
    promises.push(sportsAPI.getBettingData(gameId))
    
    if (homeTeamId && awayTeamId) {
      promises.push(
        sportsAPI.getPlayers(homeTeamId),
        sportsAPI.getPlayers(awayTeamId), 
        sportsAPI.getTeamSeasonStats(homeTeamId),
        sportsAPI.getTeamSeasonStats(awayTeamId)
      )
    }

    const results = await Promise.allSettled(promises)
    
    // Extract results safely
    const bettingData = results[0].status === 'fulfilled' ? results[0].value : null
    
    let homePlayers = []
    let awayPlayers = []
    let homeStats = null
    let awayStats = null
    
    if (homeTeamId && awayTeamId && results.length > 1) {
      homePlayers = results[1].status === 'fulfilled' ? results[1].value.slice(0, 2) : []
      awayPlayers = results[2].status === 'fulfilled' ? results[2].value.slice(0, 2) : []
      homeStats = results[3].status === 'fulfilled' ? results[3].value : null
      awayStats = results[4].status === 'fulfilled' ? results[4].value : null
    }

    // Generate matchup analysis if we have team stats
    let matchupAnalysis = null
    if (homeTeamId && awayTeamId && homeStats && awayStats) {
      try {
        matchupAnalysis = await sportsAPI.getMatchupAnalysis(homeTeamId, awayTeamId)
      } catch (error) {
        // console.error('Error generating matchup analysis:', error)
      }
    }

    // Get head-to-head history
    let headToHead = []
    if (homeTeamId && awayTeamId) {
      try {
        headToHead = await sportsAPI.getHeadToHeadHistory(homeTeamId, awayTeamId)
      } catch (error) {
        // console.error('Error fetching H2H history:', error)
      }
    }

    const detailedData = {
      bettingData,
      keyPlayers: [...homePlayers, ...awayPlayers],
      teamStats: {
        home: homeStats,
        away: awayStats
      },
      matchupAnalysis,
      headToHead
    }

    return NextResponse.json({
      success: true,
      data: detailedData
    })

  } catch (error) {
    // console.error('Detailed analysis API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch detailed analysis',
        success: false 
      },
      { status: 500 }
    )
  }
}
