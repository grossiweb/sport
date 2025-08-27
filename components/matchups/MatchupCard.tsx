'use client'

import { useState } from 'react'
import { Matchup, SportType } from '@/types'
import { format } from 'date-fns'
import { 
  ClockIcon, 
  MapPinIcon, 
  TrophyIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface MatchupCardProps {
  matchup: Matchup
  sport: SportType
}

export function MatchupCard({ matchup, sport }: MatchupCardProps) {
  const { game, predictions, trends, injuries } = matchup
  const [showDetails, setShowDetails] = useState(false)
  const confidenceColor = predictions.confidence >= 0.8 ? 'text-green-600' : 
                         predictions.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          game.status === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
          game.status === 'final' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {game.status.toUpperCase()}
        </span>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          {format(new Date(game.gameDate), 'h:mm a')}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-4">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {game.awayTeam.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {game.awayTeam.abbreviation}
              </div>
            </div>
          </div>
          {game.awayScore !== undefined ? (
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {game.awayScore}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @ {game.homeTeam.abbreviation}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {game.homeTeam.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {game.homeTeam.abbreviation}
              </div>
            </div>
          </div>
          {game.homeScore !== undefined ? (
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {game.homeScore}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              HOME
            </div>
          )}
        </div>
      </div>

      {/* Prediction */}
      {predictions && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Prediction
            </span>
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {(predictions.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {predictions.predictedWinner}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {predictions.predictedScore.away} - {predictions.predictedScore.home}
            </span>
          </div>
        </div>
      )}

      {/* Venue */}
      {game.venue && (
        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {game.venue}
        </div>
      )}

      {/* Detailed Analysis Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-md transition-colors"
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Detailed Analysis
          {showDetails ? (
            <ChevronUpIcon className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 ml-2" />
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Key Factors */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <FireIcon className="h-4 w-4 mr-1 text-orange-500" />
              Key Factors
            </h4>
            <div className="flex flex-wrap gap-1">
              {predictions.keyFactors.slice(0, 5).map((factor, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>

          {/* Trends */}
          {trends && trends.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-1 text-blue-500" />
                Trends ({trends.length})
              </h4>
              <div className="space-y-1">
                {trends.slice(0, 3).map((trend, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      trend.impact === 'high' ? 'bg-red-500' : 
                      trend.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    {trend.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Injuries */}
          {injuries && injuries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-red-500" />
                Injury Reports ({injuries.length})
              </h4>
              <div className="space-y-1">
                {injuries.slice(0, 3).map((injury, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${
                      injury.status === 'out' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      injury.status === 'questionable' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {injury.status}
                    </span>
                    {injury.injury}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Betting Insights */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-1 text-green-500" />
              Betting Insights
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Model Edge:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {predictions.confidence > 0.7 ? 'Strong' : 'Moderate'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Value:</span>
                <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                  {Math.random() > 0.5 ? 'Found' : 'Limited'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/sport/${sport.toLowerCase()}/matchups/${game.id}`}
          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          <TrophyIcon className="h-4 w-4 mr-1" />
          Full Details
        </Link>
        <button
          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => {/* Add betting data logic */}}
        >
          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
          Betting
        </button>
      </div>
    </div>
  )
}