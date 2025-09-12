import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'
import { Matchup, GamePrediction, TrendData, InjuryReport, SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { format } from 'date-fns'
import { apiCache, cacheKeys, cacheTTL } from '@/lib/cache'

// Mock AI prediction service - in production, this would be a real ML model
function generateAIPrediction(game: any): GamePrediction {
  const confidence = Math.random() * 0.4 + 0.6 // Random confidence between 0.6-1.0
  const homeAdvantage = 2 // Points for home field advantage
  
  // Simple prediction logic based on team stats (mock)
  const homePredictedScore = Math.floor(Math.random() * 20) + 20 + homeAdvantage
  const awayPredictedScore = Math.floor(Math.random() * 20) + 18
  
  const keyFactors = [
    'Home field advantage',
    'Recent form',
    'Head-to-head record',
    'Weather conditions',
    'Injury report'
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

function generateTrends(gameId: string): TrendData[] {
  const trendTypes = [
    { description: 'Home team is 7-2 ATS in last 9 games', impact: 'high' as const },
    { description: 'Under has hit in 6 of last 8 matchups', impact: 'medium' as const },
    { description: 'Away team averages 28% more yards on road', impact: 'high' as const },
    { description: 'Teams combined for 65+ points in 3 straight meetings', impact: 'medium' as const },
    { description: 'Home team QB has 8 TDs, 1 INT in last 3 home games', impact: 'high' as const }
  ]
  
  return trendTypes
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 2)
    .map((trend, index) => ({
      id: `${gameId}-trend-${index}`,
      gameId,
      type: 'team' as const,
      description: trend.description,
      value: Math.random() * 100,
      impact: trend.impact,
      timeframe: '15d' as const
    }))
}

function generateInjuries(gameId: string): InjuryReport[] {
  const injuries = []
  const shouldHaveInjuries = Math.random() > 0.6
  
  if (shouldHaveInjuries) {
    const numInjuries = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numInjuries; i++) {
      injuries.push({
        playerId: `player-${gameId}-${i}`,
        status: ['out', 'questionable', 'probable'][Math.floor(Math.random() * 3)] as any,
        injury: ['Knee', 'Shoulder', 'Ankle', 'Hamstring'][Math.floor(Math.random() * 4)],
        lastUpdated: new Date()
      })
    }
  }
  
  return injuries
}

export async function GET(request: NextRequest) {
  let sport: string | undefined
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    
    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = cacheKeys.matchups(sport, date) + (limit !== 10 ? `_limit_${limit}` : '')
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
    
    // Get games for the specified sport (filtering is now handled in sportsAPI.getGames)
    const games = await sportsAPI.getGames(sport as SportType, date, limit)
      // console.log('Games fetched for date:', date, 'Total games:', games.length)
    
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
          bettingData = await sportsAPI.getBettingData(sport as SportType, game.id)
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

    // Sort by game time
    matchups.sort((a, b) => 
      new Date(a.game.gameDate).getTime() - new Date(b.game.gameDate).getTime()
    )

    const response = {
      success: true,
      data: matchups,
      meta: {
        date,
        sport,
        totalGames: matchups.length,
        highConfidenceGames: matchups.filter(m => m.predictions.confidence >= 0.8).length
      },
      cached: false,
      timestamp: new Date().toISOString()
    }

    // Cache the results
    apiCache.set(cacheKey, response, cacheTTL.matchups)
    console.log(`Cached matchups data: ${cacheKey} (${matchups.length} items)`)

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