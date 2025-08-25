import { NextRequest, NextResponse } from 'next/server'
import { TrendData, SportType } from '@/types'

// Mock trend data generator
function generateMockTrends(sport?: SportType, category?: string, timeframe?: string): TrendData[] {
  const trends: TrendData[] = []
  const sports = sport ? [sport] : ['MLB', 'NFL', 'NBA', 'CFB', 'CBB'] as SportType[]
  
  const trendTemplates = {
    betting: [
      'Home underdogs are {value}% more profitable in division games',
      'Public betting favors overs {value}% more in primetime games',
      'Line movement of 3+ points shows {value}% correlation with outcomes',
      'Reverse line movement scenarios hit at {value}% rate',
      'Sharp money early shows {value}% success rate this season',
      'Public dogs getting less than 40% of bets win {value}% more often',
      'Totals moving down 2+ points show under hitting {value}% of the time',
      'Teams getting 70%+ public money lose ATS {value}% more often'
    ],
    team: [
      'Teams on back-to-back road games underperform by {value}%',
      'Home teams with 3+ days rest outperform spread by {value}%',
      'Teams coming off divisional losses cover {value}% less often',
      'Conference leaders struggle ATS in {value}% of non-conference games',
      'Teams with winning records as road dogs perform {value}% better',
      'Short road favorites perform {value}% worse than expected',
      'Teams playing 3rd game in 5 days underperform by {value}%',
      'Home teams in revenge spots cover {value}% more often'
    ],
    player: [
      'Star players returning from injury show {value}% performance dip initially',
      'Backup quarterbacks perform {value}% better than Vegas expectations',
      'Players in contract years exceed projections by {value}%',
      'Rookie performances improve {value}% after bye weeks',
      'Veterans over 30 show {value}% decline in back-to-back games',
      'Players facing former teams perform {value}% above season averages',
      'Key injuries force game script changes resulting in {value}% total variance',
      'Suspended players returning show {value}% rust factor in first game'
    ],
    weather: [
      'Wind speeds over 15mph decrease total scoring by {value}%',
      'Rain conditions favor under bets by {value}% historically',
      'Cold weather games see {value}% more rushing attempts',
      'Dome teams playing outdoors underperform by {value}%',
      'Temperature swings of 20+ degrees affect performance by {value}%',
      'Snow games go under the total {value}% of the time',
      'Extreme heat reduces offensive efficiency by {value}%',
      'Indoor teams in outdoor cold weather struggle {value}% more'
    ]
  }

  const categories = category && category !== 'all' ? [category] : Object.keys(trendTemplates)
  
  categories.forEach((cat) => {
    const templates = trendTemplates[cat as keyof typeof trendTemplates]
    const numTrends = Math.floor(Math.random() * 6) + 3 // 3-8 trends per category
    
    for (let i = 0; i < numTrends; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)]
      const value = Math.floor(Math.random() * 60) + 10 // 10-70% impact
      const isNegative = Math.random() > 0.6 // 40% chance of negative trend
      const finalValue = isNegative ? -value : value
      
      const impact = Math.abs(finalValue) >= 50 ? 'high' : 
                    Math.abs(finalValue) >= 30 ? 'medium' : 'low'
      
      const sportSuffix = sports.length > 1 ? 
        ` (${sports[Math.floor(Math.random() * sports.length)]})` : ''
      
      trends.push({
        id: `trend-${cat}-${i}-${Date.now()}`,
        gameId: 'general-trend',
        type: cat as any,
        description: template.replace('{value}', Math.abs(finalValue).toString()) + sportSuffix,
        value: finalValue,
        impact: impact as any,
        timeframe: (timeframe as any) || '15d'
      })
    }
  })

  // Sort by impact and then by absolute value
  return trends.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 }
    const aImpact = impactOrder[a.impact]
    const bImpact = impactOrder[b.impact]
    
    if (aImpact !== bImpact) {
      return bImpact - aImpact
    }
    return Math.abs(b.value) - Math.abs(a.value)
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport') as SportType
    const category = searchParams.get('category')
    const timeframe = searchParams.get('timeframe')

    const trends = generateMockTrends(sport, category, timeframe)

    return NextResponse.json({
      success: true,
      data: trends,
      meta: {
        sport: sport || 'ALL',
        category: category || 'all',
        timeframe: timeframe || '15d',
        totalTrends: trends.length,
        highImpactTrends: trends.filter(t => t.impact === 'high').length,
        categories: Array.from(new Set(trends.map(t => t.type))),
        avgImpactValue: Math.round(
          trends.reduce((sum, t) => sum + Math.abs(t.value), 0) / trends.length
        )
      }
    })
  } catch (error) {
    console.error('Trends API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch trends',
        success: false 
      },
      { status: 500 }
    )
  }
}