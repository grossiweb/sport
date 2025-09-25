import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { Matchup, GamePrediction, TrendData, InjuryReport, SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { format } from 'date-fns'
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
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
    const endDate = searchParams.get('endDate') // New parameter for week-based date ranges
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
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
      (limit !== 10 ? `_limit_${limit}` : '') +
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
      // For recent/past games, fetch from the last few days
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7) // Last 7 days
      fetchDate = format(pastDate, 'yyyy-MM-dd')
      fetchEndDate = undefined // Clear end date for past range
    } else if (dateRange === 'future') {
      // For upcoming games, fetch from tomorrow onwards
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1) // Starting from tomorrow
      fetchDate = format(futureDate, 'yyyy-MM-dd')
      fetchEndDate = undefined // Clear end date for future range
    }
    
    // Get games for the specified sport (division filtering is now handled at API level for CFB)
    const games = await mongoSportsAPI.getGames(sport as SportType, fetchDate, limit, fetchEndDate)
    // console.log('Games fetched for date:', fetchDate, 'Total games:', games.length)
    
    // Generate matchup data for each game with real betting data
    const matchups: Matchup[] = await Promise.all(
      games.map(async (game) => {
        // Generate basic AI predictions (no API calls)
        const predictions = generateAIPrediction(game)
        
        // Generate basic trends and injury data (no API calls)
        const trends = generateTrends(game.id)
        const injuries = generateInjuries(game.id)
        
        // Fetch real betting data
        let bettingData = null
        try {
          bettingData = await mongoSportsAPI.getBettingData(sport as SportType, game.id)
        } catch (error) {
          console.warn(`Failed to fetch betting data for game ${game.id}:`, error)
        }
        
        return {
          game,
          predictions,
          bettingData,
          trends,
          keyPlayers: [], // Will be loaded on demand
          injuries,
          matchupAnalysis: null, // Will be loaded on demand
          headToHead: [], // Will be loaded on demand
          teamStats: null // Will be loaded on demand
        }
      })
    )

    // Filter by status if specified
    let filteredMatchups = matchups
    if (status) {
      filteredMatchups = matchups.filter(m => m.game.status === status)
    }
    
    // Filter by date range if specified
    if (dateRange === 'past') {
      const now = new Date()
      filteredMatchups = filteredMatchups.filter(m => 
        new Date(m.game.gameDate) < now && m.game.status === 'final'
      )
    } else if (dateRange === 'future') {
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
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
    filteredMatchups = filteredMatchups.slice(0, limit)

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