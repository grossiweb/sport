import { NextRequest, NextResponse } from 'next/server'
import { BettingData, SportType } from '@/types'

// Mock betting data generator
function generateMockBettingData(sport?: SportType, date?: string): BettingData[] {
  const bettingData: BettingData[] = []
  const sports = sport ? [sport] : ['MLB', 'NFL', 'NBA', 'CFB', 'CBB'] as SportType[]
  
  sports.forEach((currentSport) => {
    const gamesPerSport = Math.floor(Math.random() * 6) + 2 // 2-7 games per sport
    
    for (let i = 0; i < gamesPerSport; i++) {
      const gameId = `${currentSport.toLowerCase()}-betting-${i}-${date}`
      
      // Generate realistic betting line data
      const homeSpread = (Math.random() - 0.5) * 14 // -7 to +7 spread
      const totalPoints = Math.floor(Math.random() * 40) + 40 // 40-80 total points
      const homeMoneyLine = homeSpread > 0 ? 
        Math.floor(Math.random() * 200) + 100 : // Underdog +100 to +300
        -(Math.floor(Math.random() * 200) + 110) // Favorite -110 to -310
      
      const awayMoneyLine = homeSpread > 0 ?
        -(Math.floor(Math.random() * 200) + 110) :
        Math.floor(Math.random() * 200) + 100

      // Generate public betting percentages (usually favor favorites and overs)
      const homePublicPercent = Math.floor(Math.random() * 60) + 20 // 20-80%
      const awayPublicPercent = 100 - homePublicPercent

      // Generate handle percentages (sharp money can be different from public)
      const isSharpAction = Math.random() > 0.7 // 30% chance of sharp action
      let homeHandlePercent: number
      let awayHandlePercent: number

      if (isSharpAction) {
        // Sharp money goes against public
        const sharpDirection = Math.random() > 0.5 ? 1 : -1
        const adjustment = (Math.random() * 20 + 10) * sharpDirection // ±10-30%
        homeHandlePercent = Math.max(10, Math.min(90, homePublicPercent + adjustment))
        awayHandlePercent = 100 - homeHandlePercent
      } else {
        // Handle follows public with minor variance
        const variance = (Math.random() - 0.5) * 10 // ±5%
        homeHandlePercent = Math.max(10, Math.min(90, homePublicPercent + variance))
        awayHandlePercent = 100 - homeHandlePercent
      }

      // Detect reverse line movement
      const hasRLM = Math.random() > 0.85 // 15% chance of RLM

      bettingData.push({
        gameId,
        spread: {
          home: parseFloat(homeSpread.toFixed(1)),
          away: parseFloat((-homeSpread).toFixed(1)),
          juice: -110
        },
        moneyLine: {
          home: homeMoneyLine,
          away: awayMoneyLine
        },
        total: {
          over: -110,
          under: -110,
          points: totalPoints
        },
        publicBets: {
          homePercentage: homePublicPercent,
          awayPercentage: awayPublicPercent
        },
        handle: {
          homePercentage: Math.round(homeHandlePercent),
          awayPercentage: Math.round(awayHandlePercent)
        },
        reverseLineMovement: hasRLM
      })
    }
  })

  // Sort by reverse line movement first, then by largest public/handle discrepancy
  return bettingData.sort((a, b) => {
    if (a.reverseLineMovement && !b.reverseLineMovement) return -1
    if (!a.reverseLineMovement && b.reverseLineMovement) return 1
    
    const aDiscrepancy = Math.abs(a.publicBets.homePercentage - a.handle.homePercentage)
    const bDiscrepancy = Math.abs(b.publicBets.homePercentage - b.handle.homePercentage)
    
    return bDiscrepancy - aDiscrepancy
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport') as SportType
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const bettingData = generateMockBettingData(sport, date)

    return NextResponse.json({
      success: true,
      data: bettingData,
      meta: {
        sport: sport || 'ALL',
        date,
        totalGames: bettingData.length,
        reverseLineMovementGames: bettingData.filter(d => d.reverseLineMovement).length,
        sharpActionGames: bettingData.filter(d => 
          Math.abs(d.publicBets.homePercentage - d.handle.homePercentage) >= 15
        ).length,
        lastUpdated: new Date()
      }
    })
  } catch (error) {
    console.error('Betting data API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch betting data',
        success: false 
      },
      { status: 500 }
    )
  }
}