'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { SportType, Matchup } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { format } from 'date-fns'
import { 
  ClockIcon, 
  MapPinIcon, 
  TrophyIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const fetchMatchupDetails = async (sport: SportType, gameId: string): Promise<Matchup> => {
  const response = await fetch(`/api/matchups/${gameId}/details?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch matchup details')
  const result = await response.json()
  return result.data
}

export default function MatchupDetailsPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const gameId = params.gameId as string

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const sport = validSport || currentSport

  const { data: matchup, isLoading, error } = useQuery(
    ['matchupDetails', sport, gameId],
    () => fetchMatchupDetails(sport, gameId),
    { enabled: !!sport && !!gameId }
  )

  if (contextLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!validSport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Sport
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The sport "{params.sport}" is not supported.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Matchup Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested matchup could not be found or may no longer be available.
          </p>
          <Link
            href={`/sport/${sport.toLowerCase()}/matchups`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Matchups
          </Link>
        </div>
      </div>
    )
  }

  if (!matchup) {
    return null
  }

  const { game, predictions } = matchup
  const confidenceColor = predictions.confidence >= 0.8 ? 'text-green-600' : 
                         predictions.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/sport/${sport.toLowerCase()}/matchups`}
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Matchups
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {game.awayTeam.name} vs {game.homeTeam.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {currentSportData.displayName} • {format(new Date(game.gameDate), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Game Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                game.status === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                game.status === 'final' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {game.status.toUpperCase()}
              </span>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-5 w-5 mr-2" />
                {format(new Date(game.gameDate), 'h:mm a')}
              </div>
            </div>

            {/* Teams Display */}
            <div className="grid grid-cols-2 gap-8">
              {/* Away Team */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {game.awayTeam.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {game.awayTeam.city}
                </p>
                {game.awayScore !== undefined ? (
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {game.awayScore}
                  </div>
                ) : (
                  <div className="text-2xl font-medium text-gray-500 dark:text-gray-400">
                    Away
                  </div>
                )}
              </div>

              {/* Home Team */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {game.homeTeam.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {game.homeTeam.city}
                </p>
                {game.homeScore !== undefined ? (
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {game.homeScore}
                  </div>
                ) : (
                  <div className="text-2xl font-medium text-gray-500 dark:text-gray-400">
                    Home
                  </div>
                )}
              </div>
            </div>

            {/* Venue */}
            {game.venue && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  {game.venue}
                </div>
              </div>
            )}
          </div>

          {/* AI Prediction Card */}
          {predictions && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Prediction
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Predicted Winner</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {predictions.predictedWinner}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Confidence Level</p>
                  <p className={`text-xl font-semibold ${confidenceColor}`}>
                    {(predictions.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Predicted Score</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {predictions.predictedScore.away} - {predictions.predictedScore.home}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Key Factors</p>
                  <div className="space-y-1">
                    {predictions.keyFactors.slice(0, 3).map((factor, index) => (
                      <span key={index} className="inline-block bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {predictions.aiAnalysis && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI Analysis</p>
                  <p className="text-gray-900 dark:text-white">
                    {predictions.aiAnalysis}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">League</span>
                <span className="font-medium text-gray-900 dark:text-white">{game.league}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Game ID</span>
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{game.id}</span>
              </div>
              {game.quarter && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quarter</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.quarter}</span>
                </div>
              )}
              {game.timeRemaining && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time Remaining</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.timeRemaining}</span>
                </div>
              )}
            </div>
          </div>

          {/* Weather (if available) */}
          {game.weather && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weather Conditions
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.weather.temperature}°F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Condition</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.weather.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wind</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {game.weather.windSpeed} mph {game.weather.windDirection}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={`/sport/${sport.toLowerCase()}/matchups`}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <TrophyIcon className="h-4 w-4 mr-2" />
              View All Matchups
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
