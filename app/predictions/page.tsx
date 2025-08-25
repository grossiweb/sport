'use client'

import { useState, useEffect } from 'react'
import { PredictionCard } from '@/components/predictions/PredictionCard'
import { PredictionFilters } from '@/components/predictions/PredictionFilters'
import { PredictionStats } from '@/components/predictions/PredictionStats'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { GamePrediction, SportType } from '@/types'
import { useQuery } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'

const fetchPredictions = async (
  sport?: SportType, 
  date?: string, 
  minConfidence?: number
): Promise<GamePrediction[]> => {
  const params = new URLSearchParams()
  if (sport) params.append('sport', sport)
  if (date) params.append('date', date)
  if (minConfidence) params.append('minConfidence', minConfidence.toString())
  
  const response = await axios.get(`/api/predictions?${params.toString()}`)
  return response.data.data
}

const fetchPredictionStats = async (): Promise<any> => {
  const response = await axios.get('/api/predictions/stats')
  return response.data.data
}

export default function PredictionsPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'ALL'>('ALL')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [minConfidence, setMinConfidence] = useState(0.5)
  const [viewMode, setViewMode] = useState<'today' | 'upcoming' | 'results'>('today')

  const { data: predictions, isLoading: predictionsLoading, refetch } = useQuery(
    ['predictions', selectedSport, selectedDate, minConfidence],
    () => fetchPredictions(
      selectedSport === 'ALL' ? undefined : selectedSport,
      selectedDate,
      minConfidence
    ),
    {
      refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    }
  )

  const { data: stats, isLoading: statsLoading } = useQuery(
    ['predictionStats'],
    fetchPredictionStats,
    {
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    }
  )

  const filteredPredictions = predictions?.filter(prediction => {
    return prediction.confidence >= minConfidence
  }) || []

  const groupedPredictions = filteredPredictions.reduce((acc, prediction) => {
    // Note: In a real app, you'd need to get the sport from the game data
    const sport = 'MLB' // This would come from joining with game data
    if (!acc[sport]) {
      acc[sport] = []
    }
    acc[sport].push(prediction)
    return acc
  }, {} as Record<string, GamePrediction[]>)

  const isLoading = predictionsLoading || statsLoading

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Predictions & Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Machine learning powered game predictions with confidence ratings and detailed analysis
        </p>
      </div>

      {/* Prediction Stats Overview */}
      {!statsLoading && stats && (
        <div className="mb-8">
          <PredictionStats stats={stats} />
        </div>
      )}

      <PredictionFilters
        selectedSport={selectedSport}
        selectedDate={selectedDate}
        minConfidence={minConfidence}
        viewMode={viewMode}
        onSportChange={setSelectedSport}
        onDateChange={setSelectedDate}
        onConfidenceChange={setMinConfidence}
        onViewModeChange={setViewMode}
        onRefresh={() => refetch()}
      />

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(groupedPredictions).map(([sport, sportPredictions]) => (
            <div key={sport}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sport} Predictions
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Confidence: {Math.round(
                      sportPredictions.reduce((sum, p) => sum + p.confidence, 0) / 
                      sportPredictions.length * 100
                    )}%
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                    {sportPredictions.length} {sportPredictions.length === 1 ? 'Game' : 'Games'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sportPredictions.map((prediction) => (
                  <PredictionCard key={prediction.gameId} prediction={prediction} />
                ))}
              </div>
            </div>
          ))}

          {filteredPredictions.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No predictions found</h3>
                <p>
                  No games meet your current confidence threshold of {Math.round(minConfidence * 100)}% 
                  for {format(new Date(selectedDate), 'MMMM do, yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}