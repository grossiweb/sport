import { NextRequest, NextResponse } from 'next/server'
import { sportsAPI } from '@/lib/api/sports-api'
import { Matchup, GamePrediction, TrendData, InjuryReport, SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'

// Mock AI prediction service
function generateDetailedAIPrediction(gameId: string): GamePrediction {
  const confidence = Math.random() * 0.4 + 0.6
  const homeAdvantage = 2
  
  const mockFactors = [
    'Home field advantage',
    'Recent form analysis',
    'Head-to-head history',
    'Injury reports impact',
    'Weather conditions',
    'Offensive efficiency',
    'Defensive strength',
    'Special teams performance',
    'Coaching experience',
    'Player matchups'
  ]
  
  const selectedFactors = mockFactors
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 3)

  const homeScore = Math.floor(Math.random() * 35) + 14 + homeAdvantage
  const awayScore = Math.floor(Math.random() * 35) + 14
  
  const predictedWinner = homeScore > awayScore ? 'Home Team' : 'Away Team'
  
  const aiAnalysis = `Based on comprehensive data analysis, this matchup presents ${
    confidence > 0.8 ? 'a clear advantage' : confidence > 0.6 ? 'moderate trends' : 'uncertain variables'
  } favoring the ${predictedWinner.toLowerCase()}. Key statistical indicators include recent offensive performance, defensive efficiency ratings, and historical performance in similar conditions. ${
    confidence > 0.7 ? 'Strong confidence' : 'Moderate confidence'
  } in this prediction based on ${selectedFactors.length} primary factors.`

  return {
    gameId,
    predictedWinner,
    confidence,
    predictedScore: {
      home: homeScore,
      away: awayScore
    },
    keyFactors: selectedFactors,
    aiAnalysis,
    createdAt: new Date()
  }
}

function generateDetailedTrends(gameId: string): TrendData[] {
  const trendTypes = ['team', 'player', 'betting', 'weather'] as const
  const trends: TrendData[] = []
  
  for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
    trends.push({
      id: `trend_${gameId}_${i}`,
      gameId,
      type: trendTypes[Math.floor(Math.random() * trendTypes.length)],
      description: [
        'Home team has won 7 of last 10 games',
        'Over/Under has hit OVER in 65% of recent games',
        'Away team averages 28.5 points per game',
        'Weather conditions favor passing offense',
        'Key player return from injury',
        'Defense allows 18.2 points per game at home',
        'Strong recent form in conference play'
      ][Math.floor(Math.random() * 7)],
      value: Math.random() * 100,
      impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      timeframe: ['7d', '15d', '30d', 'season'][Math.floor(Math.random() * 4)] as '7d' | '15d' | '30d' | 'season'
    })
  }
  
  return trends
}

function generateDetailedInjuries(gameId: string): InjuryReport[] {
  const injuries: InjuryReport[] = []
  const numInjuries = Math.floor(Math.random() * 4)
  
  const playerNames = [
    'John Smith', 'Mike Johnson', 'David Wilson', 'Chris Brown', 'Matt Davis',
    'Ryan Miller', 'Alex Thompson', 'Kevin Anderson', 'Jason Taylor', 'Tom Wilson'
  ]
  
  const injuryTypes = [
    'Knee injury', 'Shoulder sprain', 'Ankle twist', 'Hamstring strain',
    'Concussion protocol', 'Back strain', 'Wrist injury', 'Hip flexor'
  ]
  
  for (let i = 0; i < numInjuries; i++) {
    injuries.push({
      playerId: `player_${gameId}_${i}`,
      status: ['out', 'questionable', 'probable', 'day-to-day'][Math.floor(Math.random() * 4)] as any,
      injury: injuryTypes[Math.floor(Math.random() * injuryTypes.length)],
      expectedReturn: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
      lastUpdated: new Date()
    })
  }
  
  return injuries
}

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  let sport: string | undefined
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')?.toUpperCase() || 'CFB'
    const gameId = params.gameId

    if (!isValidSportType(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport parameter' },
        { status: 400 }
      )
    }

    // For now, we'll generate mock detailed data since we don't have real detailed endpoints
    // In production, you would fetch from your real API
    
    // Try to get basic game info
    const games = await sportsAPI.getGames(sport as SportType)
    const game = games.find(g => g.id === gameId)
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Generate detailed matchup analysis
    const detailedPredictions = generateDetailedAIPrediction(gameId)
    const detailedTrends = generateDetailedTrends(gameId)
    const detailedInjuries = generateDetailedInjuries(gameId)

    const detailedMatchup: Matchup = {
      game,
      predictions: detailedPredictions,
      bettingData: null, // Would fetch real betting data
      trends: detailedTrends,
      keyPlayers: [], // Would fetch key players
      injuries: detailedInjuries,
      matchupAnalysis: {
        offensiveMatchup: 'Strong passing offense vs. weak pass defense creates favorable conditions',
        defensiveMatchup: 'Elite run defense should limit opposing ground game effectively',
        specialTeams: 'Field goal accuracy could be deciding factor in close game',
        coaching: 'Experience advantage in high-pressure situations',
        intangibles: 'Home crowd factor and recent momentum trends favor home team'
      },
      headToHead: [
        {
          date: '2023-11-15',
          homeScore: 28,
          awayScore: 21,
          result: 'Home win'
        },
        {
          date: '2022-10-20',
          homeScore: 14,
          awayScore: 24,
          result: 'Away win'
        }
      ],
      teamStats: {
        home: {
          averagePoints: Math.floor(Math.random() * 15) + 20,
          averageYards: Math.floor(Math.random() * 100) + 350,
          turnoverDifferential: Math.floor(Math.random() * 21) - 10
        },
        away: {
          averagePoints: Math.floor(Math.random() * 15) + 20,
          averageYards: Math.floor(Math.random() * 100) + 350,
          turnoverDifferential: Math.floor(Math.random() * 21) - 10
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: detailedMatchup
    })
  } catch (error) {
    console.error('Matchup details API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matchup details' },
      { status: 500 }
    )
  }
}