'use client'

import { useState } from 'react'
import { GamePrediction } from '@/types'
import { format } from 'date-fns'
import { formatToEasternTime } from '@/lib/utils/time'
import {
  BoltIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface PredictionCardProps {
  prediction: GamePrediction
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { level: 'Very High', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' }
    if (confidence >= 0.8) return { level: 'High', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' }
    if (confidence >= 0.65) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' }
    return { level: 'Low', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' }
  }

  const confidenceInfo = getConfidenceLevel(prediction.confidence)

  const getRecommendationBadge = () => {
    if (prediction.confidence >= 0.85) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <StarIcon className="h-3 w-3 mr-1" />
          Best Bet
        </div>
      )
    }
    if (prediction.confidence >= 0.75) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <TrophyIcon className="h-3 w-3 mr-1" />
          Strong Pick
        </div>
      )
    }
    if (prediction.confidence >= 0.6) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Lean
        </div>
      )
    }
    return null
  }

  // Mock game data - in real app this would come from joining prediction with game data
  const mockGame = {
    homeTeam: { name: 'Home Team', city: 'City', abbreviation: 'HOM' },
    awayTeam: { name: 'Away Team', city: 'City', abbreviation: 'AWY' },
    gameDate: new Date(),
    status: 'scheduled'
  }

  const predictedWinnerIsHome = prediction.predictedWinner === mockGame.homeTeam.name

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header with confidence indicator */}
      <div className={`px-6 py-4 ${confidenceInfo.bgColor} border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${confidenceInfo.bgColor}`}>
              <BoltIcon className={`h-5 w-5 ${confidenceInfo.color}`} />
            </div>
            <div>
              <div className={`text-lg font-bold ${confidenceInfo.color}`}>
                {Math.round(prediction.confidence * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {confidenceInfo.level} Confidence
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {getRecommendationBadge()}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Updated: {formatToEasternTime(prediction.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Game prediction details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Game Prediction
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4" />
            <span>{formatToEasternTime(mockGame.gameDate)}</span>
          </div>
        </div>

        {/* Team matchup */}
        <div className="space-y-4 mb-6">
          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            !predictedWinnerIsHome ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{mockGame.awayTeam.abbreviation}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {mockGame.awayTeam.city} {mockGame.awayTeam.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Away</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {prediction.predictedScore.away}
              </div>
              {!predictedWinnerIsHome && (
                <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            vs
          </div>

          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            predictedWinnerIsHome ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{mockGame.homeTeam.abbreviation}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {mockGame.homeTeam.city} {mockGame.homeTeam.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Home</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {prediction.predictedScore.home}
              </div>
              {predictedWinnerIsHome && (
                <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </div>
          </div>
        </div>

        {/* Key factors preview */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Key Factors
          </div>
          <div className="flex flex-wrap gap-1">
            {prediction.keyFactors.slice(0, 3).map((factor, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {factor}
              </span>
            ))}
            {prediction.keyFactors.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                +{prediction.keyFactors.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* AI Analysis preview */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Analysis
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {prediction.aiAnalysis}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          </button>

          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Track
            </button>
            <button className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
              View Lines
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Complete Analysis
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {prediction.aiAnalysis}
              </p>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                All Key Factors
              </div>
              <div className="flex flex-wrap gap-1">
                {prediction.keyFactors.map((factor, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model Confidence Breakdown
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Statistical Analysis</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Historical Trends</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current Form</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="font-medium text-gray-900 dark:text-white">Overall Confidence</span>
                  <span className={`font-bold ${confidenceInfo.color}`}>
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}