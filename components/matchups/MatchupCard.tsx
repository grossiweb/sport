'use client'

import { useState } from 'react'
import { Matchup, SportType } from '@/types'
import { formatToEasternTime } from '@/lib/utils/time'
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
import { formatSpread, formatTotal, formatOdds } from '@/lib/utils/betting-format'

interface MatchupCardProps {
  matchup: Matchup
  sport: SportType
}

export function MatchupCard({ matchup, sport }: MatchupCardProps) {
  const { game, predictions, trends, injuries, bettingData } = matchup
  const [showDetails, setShowDetails] = useState(false)
  const confidenceColor = predictions.confidence >= 0.8 ? 'text-green-600' : 
                         predictions.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
          game.status === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
          game.status === 'final' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {game.status.toUpperCase()}
        </span>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-3.5 w-3.5 mr-1" />
          {formatToEasternTime(game.gameDate)}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {game.awayTeam.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {game.awayTeam.abbreviation}
              </div>
            </div>
          </div>
          {game.awayScore !== undefined ? (
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {game.awayScore}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              @ {game.homeTeam.abbreviation}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {game.homeTeam.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {game.homeTeam.abbreviation}
              </div>
            </div>
          </div>
          {game.homeScore !== undefined ? (
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {game.homeScore}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              HOME
            </div>
          )}
        </div>
      </div>

      {/* Prediction */}
      {predictions && (
        <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              AI Prediction
            </span>
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {(predictions.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {predictions.predictedWinner}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {predictions.predictedScore.away} - {predictions.predictedScore.home}
            </span>
          </div>
        </div>
      )}

      {/* Betting Lines */}
      {bettingData && (
        <div className="mt-3 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-2.5">
            <CurrencyDollarIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              Betting Lines
            </span>
            {bettingData.sportsbook && (
              <span className="ml-auto text-[11px] text-green-600 dark:text-green-400">
                {bettingData.sportsbook.name}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2.5 text-[11px]">
            {/* Spread */}
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 font-medium mb-1">Spread</div>
              <div className="text-gray-900 dark:text-white font-semibold text-xs">
                {game.homeTeam.abbreviation} {formatSpread(bettingData.spread.home)}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                ({formatOdds(bettingData.spread.juice)})
              </div>
            </div>

            {/* Total */}
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 font-medium mb-1">Total</div>
              <div className="text-gray-900 dark:text-white font-semibold text-xs">
                {formatTotal(bettingData.total.points)}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                O{formatOdds(bettingData.total.over)} / U{formatOdds(bettingData.total.under)}
              </div>
            </div>

            {/* Money Line */}
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 font-medium mb-1">
                ML
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="text-gray-900 dark:text-white text-xs">
                  {game.homeTeam.abbreviation}: {formatOdds(bettingData.moneyLine.home)}
                </div>
                <div className="text-gray-900 dark:text-white text-xs">
                  {game.awayTeam.abbreviation}: {formatOdds(bettingData.moneyLine.away)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Venue */}
      {game.venue && (
        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <MapPinIcon className="h-3.5 w-3.5 mr-1" />
          {game.venue}
        </div>
      )}

      {/* Detailed Analysis Toggle */}
      <div className="mt-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center px-3.5 py-2 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-md transition-colors"
        >
          <ChartBarIcon className="h-3.5 w-3.5 mr-2" />
          Detailed Analysis
          {showDetails ? (
            <ChevronUpIcon className="h-3.5 w-3.5 ml-2" />
          ) : (
            <ChevronDownIcon className="h-3.5 w-3.5 ml-2" />
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Key Factors */}
          <div>
            <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <FireIcon className="h-3.5 w-3.5 mr-1 text-orange-500" />
              Key Factors
            </h4>
            <div className="flex flex-wrap gap-1">
              {predictions.keyFactors.slice(0, 5).map((factor, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-[11px] px-2 py-0.5 rounded text-gray-700 dark:text-gray-300"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>

          {/* Trends */}
          {trends && trends.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <ChartBarIcon className="h-3.5 w-3.5 mr-1 text-blue-500" />
                Trends ({trends.length})
              </h4>
              <div className="space-y-1">
                {trends.slice(0, 3).map((trend, index) => (
                  <div key={index} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center">
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
              <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1 text-red-500" />
                Injury Reports ({injuries.length})
              </h4>
              <div className="space-y-1">
                {injuries.slice(0, 3).map((injury, index) => (
                  <div key={index} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] mr-2 ${
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
          {/* <div>
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
          </div>*/}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href={`/sport/${sport.toLowerCase()}/matchups/${game.id}`}
          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          <TrophyIcon className="h-3.5 w-3.5 mr-1" />
          Full Details
        </Link>
        {/*}
        <button
          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => 
        >
          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
          Betting
        </button>*/}
      </div>
    </div>
  )
}