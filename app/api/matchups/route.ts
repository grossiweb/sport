import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { Matchup, GamePrediction, TrendData, InjuryReport, SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { addDays, format, subDays } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { DEFAULT_TIME_ZONE } from '@/lib/utils/time'
import { apiCache, cacheKeys, cacheTTL } from '@/lib/cache'

// AI prediction service - generates basic predictions for demo purposes
// In production, this would integrate with a real ML model or prediction API
function generateAIPrediction(game: any): GamePrediction {
  const confidence = Math.random() * 0.4 + 0.6 // Random confidence between 0.6-1.0
  const homeAdvantage = 3 // Points for home field advantage
  
  // Basic prediction logic considering home field advantage
  const homePredictedScore = Math.floor(Math.random() * 20) + 20 + homeAdvantage
  const awayPredictedScore = Math.floor(Math.random() * 20) + 18
  
  const keyFactors = [
    'Home field advantage',
    'Recent form',
    'Head-to-head record',
    'Weather conditions',
    'Team statistics'
  ].slice(0, Math.floor(Math.random() * 3) + 2)

  return {
    gameId: game.id,
    predictedWinner: homePredictedScore > awayPredictedScore ? game.homeTeam.id : game.awayTeam.id,
    confidence,
    predictedScore: {
      home: homePredictedScore,
      away: awayPredictedScore
    },
    keyFactors,
    aiAnalysis: generateAIAnalysis(game, confidence),
    createdAt: new Date()
  }
}

function generateAIAnalysis(game: any, confidence: number): string {
  const analyses = [
    `${game.homeTeam.name} holds a slight edge with home field advantage and superior recent form. The weather conditions favor their playing style.`,
    `This matchup features two evenly matched teams. ${game.awayTeam.name}'s strong road record could be the difference maker in a close contest.`,
    `${game.homeTeam.name}'s defensive strength should contain ${game.awayTeam.name}'s offensive threats. Expect a lower-scoring, grinding game.`,
    `Key injuries on both sides make this game unpredictable. The team that adapts better to their lineup changes will likely prevail.`,
    `${game.awayTeam.name} has the statistical advantage, but ${game.homeTeam.name}'s home crowd and familiarity with conditions level the playing field.`
  ]
  
  return analyses[Math.floor(Math.random() * analyses.length)]
}

// Demo trend data - in production, this would come from historical analysis
function generateTrends(gameId: string): TrendData[] {
  const trendTypes = [
    { description: 'Home team is 7-2 ATS in last 9 games', impact: 'high' as const },
    { description: 'Under has hit in 6 of last 8 matchups', impact: 'medium' as const },
    { description: 'Away team averages 28% more yards on road', impact: 'high' as const },
    { description: 'Teams combined for 65+ points in 3 straight meetings', impact: 'medium' as const },
    { description: 'Home team QB has 8 TDs, 1 INT in last 3 home games', impact: 'high' as const }
  ]
  
  // Return 2-3 trends for consistency
  return trendTypes
    .slice(0, 3)
    .map((trend, index) => ({
      id: `${gameId}-trend-${index}`,
      gameId,
      type: 'team' as const,
      description: trend.description,
      value: trend.impact === 'high' ? 85 : 65, // More consistent values
      impact: trend.impact,
      timeframe: '15d' as const
    }))
}

// Demo injury data - in production, this would come from official injury reports
function generateInjuries(gameId: string): InjuryReport[] {
  // Return minimal injury data for demo - most games won't have significant injuries shown
  const hasInjuries = Math.random() > 0.8 // Only 20% of games show injury reports
  
  if (hasInjuries) {
    return [{
      playerId: `player-${gameId}-1`,
      status: 'questionable' as any,
      injury: 'Upper body',
      lastUpdated: new Date()
    }]
  }
  
  return []
}

export async function GET(request: NextRequest) {
  let sport: string | undefined
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'

    // Always treat "today" and date ranges in Eastern Time, since all sports we cover are EST-centric.
    const nowUtc = new Date()
    const nowET = utcToZonedTime(nowUtc, DEFAULT_TIME_ZONE)

    const dateParam = searchParams.get('date')
    const date = dateParam || format(nowET, 'yyyy-MM-dd')
    const endDate = searchParams.get('endDate') // New parameter for week-based date ranges
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : endDate ? undefined : 10
    const status = searchParams.get('status') // New status filter parameter
    const dateRange = searchParams.get('dateRange') // New date range parameter (past/future)

    
    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    // Check cache first - include status, dateRange, and endDate in cache key
    const cacheKey = cacheKeys.matchups(sport, date) + 
      (endDate ? `_end_${endDate}` : '') +
      (typeof limit === 'number' && (!limitParam || limitParam !== '10') ? `_limit_${limit}` : '') +
      (status ? `_status_${status}` : '') +
      (dateRange ? `_range_${dateRange}` : '')
    const cachedData = apiCache.get<any>(cacheKey)
    
    if (cachedData) {
      console.log(`Cache hit for matchups: ${cacheKey}`)
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheTimestamp: new Date().toISOString()
      })
    }

    console.log(`Cache miss for matchups: ${cacheKey}, fetching fresh data...`)
    
    // Determine date range for fetching games
    let fetchDate = date
    let fetchEndDate = endDate
    
    if (dateRange === 'past') {
      // For recent/past games, fetch from the last few days (in EST)
      const pastDateET = subDays(nowET, 7) // Last 7 days in Eastern
      fetchDate = format(pastDateET, 'yyyy-MM-dd')
      fetchEndDate = undefined // Clear end date for past range
    } else if (dateRange === 'future') {
      // For upcoming games, fetch from tomorrow onwards (in EST)
      const futureDateET = addDays(nowET, 1) // Starting from tomorrow in Eastern
      fetchDate = format(futureDateET, 'yyyy-MM-dd')
      fetchEndDate = undefined // Clear end date for future range
    }
    
    // Get games for the specified sport (division filtering is now handled at API level for CFB)
    const games = await mongoSportsAPI.getGames(
      sport as SportType,
      fetchDate,
      fetchEndDate ? undefined : limit,
      fetchEndDate
    )
    // console.log('Games fetched for date:', fetchDate, 'Total games:', games.length)
    
    // Precompute covers summaries for unique team pairs to avoid repeated heavy work
    const pairKey = (h: string, a: string) => `${h}_${a}`
    const uniquePairs = Array.from(new Set(games.map(g => pairKey(g.homeTeam.id, g.awayTeam.id))))
    const coversByPair = new Map<string, any>()
    await Promise.all(uniquePairs.map(async (key) => {
      const [homeId, awayId] = key.split('_')
      try {
        const summary = await mongoSportsAPI.buildMatchupCoversSummary(
          sport as SportType,
          homeId,
          awayId,
          undefined,
          undefined
        )
        coversByPair.set(key, summary)
      } catch (e) {
        coversByPair.set(key, null)
      }
    }))

    // Preload closing moneylines for all games and compute implied probabilities (finals preferred)
    const allEventIds = games.map(g => g.id)
    const bulkBetting = await (mongoSportsAPI as any).getBettingSummariesForEvents(allEventIds)

    // Generate matchup data for each game
    const matchups: Matchup[] = await Promise.all(
      games.map(async (game) => {
        // Generate basic AI predictions (no API calls)
        const predictions = generateAIPrediction(game)
        
        // Generate basic trends and injury data (no API calls)
        const trends = generateTrends(game.id)
        const injuries = generateInjuries(game.id)
        
        // Use precomputed covers summary for this pair
        const coversSummary = coversByPair.get(pairKey(game.homeTeam.id, game.awayTeam.id)) || null

        // Use closing moneylines consensus to compute win probabilities
        const betting = bulkBetting.get(game.id)
        const probs = betting ? mongoSportsAPI.computeWinProbFromMoneylines(betting.moneylineHome, betting.moneylineAway) : { winProbHome: null, winProbAway: null }

        const item: Matchup = {
          game,
          predictions,
          bettingData: null,
          trends,
          keyPlayers: [], // Will be loaded on demand
          injuries,
          matchupAnalysis: null, // Will be loaded on demand
          headToHead: [], // Will be loaded on demand
          teamStats: null, // Will be loaded on demand
          coversSummary: coversSummary ?? undefined,
          closingConsensus: probs
        }
        return item
      })
    )

    // Filter by status if specified
    let filteredMatchups = matchups
    if (status) {
      filteredMatchups = matchups.filter(m => m.game.status === status)
    }
    
    // Filter by date range if specified
    if (dateRange === 'past') {
      const now = nowET
      filteredMatchups = filteredMatchups.filter(m => 
        new Date(m.game.gameDate) < now && m.game.status === 'final'
      )
    } else if (dateRange === 'future') {
      const today = utcToZonedTime(new Date(), DEFAULT_TIME_ZONE)
      today.setHours(23, 59, 59, 999) // End of today in Eastern
      filteredMatchups = filteredMatchups.filter(m => 
        new Date(m.game.gameDate) > today && m.game.status === 'scheduled'
      )
    }
    
    // Sort by game time (recent games in reverse chronological order, upcoming in chronological order)
    if (dateRange === 'past') {
      filteredMatchups.sort((a, b) => 
        new Date(b.game.gameDate).getTime() - new Date(a.game.gameDate).getTime()
      )
    } else {
      filteredMatchups.sort((a, b) => 
        new Date(a.game.gameDate).getTime() - new Date(b.game.gameDate).getTime()
      )
    }
    
    // Apply limit after filtering and sorting
    if (typeof limit === 'number') {
      filteredMatchups = filteredMatchups.slice(0, limit)
    }
    console.log(`fetch date: ${fetchDate}`)
    const response = {
      success: true,
      data: filteredMatchups,
      meta: {
        date: fetchDate,
        sport,
        status,
        dateRange,
        totalGames: filteredMatchups.length,
        highConfidenceGames: filteredMatchups.filter(m => m.predictions.confidence >= 0.8).length
      },
      cached: false,
      timestamp: new Date().toISOString()
    }

    // Cache the results
    apiCache.set(cacheKey, response, cacheTTL.matchups)
    console.log(`Cached matchups data: ${cacheKey} (${filteredMatchups.length} items)`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Matchups API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch matchups',
        success: false 
      },
      { status: 500 }
    )
  }
}