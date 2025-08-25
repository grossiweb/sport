import { NextRequest, NextResponse } from 'next/server'

// Mock prediction performance stats
function generatePredictionStats() {
  const totalPredictions = Math.floor(Math.random() * 500) + 200 // 200-700 predictions
  const correctPredictions = Math.floor(totalPredictions * (0.55 + Math.random() * 0.20)) // 55-75% accuracy
  const accuracy = correctPredictions / totalPredictions
  
  // High confidence predictions typically perform better
  const highConfidencePredictions = Math.floor(totalPredictions * 0.3) // 30% are high confidence
  const highConfidenceCorrect = Math.floor(highConfidencePredictions * (0.70 + Math.random() * 0.20)) // 70-90%
  const highConfidenceAccuracy = highConfidenceCorrect / highConfidencePredictions
  
  const avgConfidence = 0.68 + Math.random() * 0.15 // 68-83% average
  
  const sports = ['CFB']
  const sportAccuracies = sports.map(sport => ({
    sport,
    accuracy: 0.50 + Math.random() * 0.30
  }))
  
  const bestSport = sportAccuracies.reduce((best, current) => 
    current.accuracy > best.accuracy ? current : best
  ).sport
  
  // Weekly trend (positive or negative change)
  const weeklyTrend = (Math.random() - 0.5) * 10 // -5% to +5% change
  
  return {
    totalPredictions,
    correctPredictions,
    accuracy,
    highConfidenceAccuracy,
    avgConfidence,
    bestSport,
    weeklyTrend,
    sportBreakdown: sportAccuracies,
    lastUpdated: new Date()
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = generatePredictionStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Prediction stats API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch prediction stats',
        success: false 
      },
      { status: 500 }
    )
  }
}