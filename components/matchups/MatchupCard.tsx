'use client'

import { useState } from 'react'
import { Matchup } from '@/types'
import { format } from 'date-fns'
import {
  ClockIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface MatchupCardProps {
  matchup: Matchup
}

export function MatchupCard({ matchup }: MatchupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { game, predictions, bettingData, trends, keyPlayers, injuries, matchupAnalysis, headToHead, teamStats } = matchup

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.65) return 'text-yellow-600 dark:text-yellow-400'
    if (confidence >= 0.5) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence'
    if (confidence >= 0.65) return 'Medium-High'
    if (confidence >= 0.5) return 'Medium'
    return 'Low Confidence'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'final':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
              {game.league}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
              {game.status.toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {predictions.confidence >= 0.8 && (
              <StarIcon className="h-5 w-5 text-yellow-500" />
            )}
            <span className={`text-sm font-medium ${getConfidenceColor(predictions.confidence)}`}>
              {Math.round(predictions.confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{game.awayTeam.abbreviation}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {game.awayTeam.city} {game.awayTeam.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Away</div>
              </div>
            </div>
            {game.awayScore !== undefined && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {game.awayScore}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              vs
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{game.homeTeam.abbreviation}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {game.homeTeam.city} {game.homeTeam.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Home</div>
              </div>
            </div>
            {game.homeScore !== undefined && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {game.homeScore}
              </div>
            )}
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{format(new Date(game.gameDate), 'h:mm a')}</span>
              </div>
              {game.venue && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="truncate max-w-32">{game.venue}</span>
                </div>
              )}
            </div>
            
            {game.weather && (
              <div className="flex items-center space-x-1">
                <CloudIcon className="h-4 w-4" />
                <span>{game.weather.temperature}°F</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Prediction
            </div>
            <div className={`text-sm ${getConfidenceColor(predictions.confidence)}`}>
              {getConfidenceText(predictions.confidence)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {predictions.predictedScore.away} - {predictions.predictedScore.home}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Predicted Score
            </div>
          </div>
        </div>

        {bettingData && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Spread</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {bettingData.spread.home > 0 ? '+' : ''}{bettingData.spread.home}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {bettingData.total.points}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">ML</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {bettingData.moneyLine.home > 0 ? '+' : ''}{bettingData.moneyLine.home}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <div className="px-6 py-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span>Detailed Analysis</span>
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-6">
            {/* AI Analysis */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <BoltIcon className="h-4 w-4" />
                <span>AI Analysis</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {predictions.aiAnalysis}
              </p>
              <div className="mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Key Factors:</div>
                <div className="flex flex-wrap gap-1">
                  {predictions.keyFactors.map((factor, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Betting Insights */}
            {bettingData && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>Betting Insights</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Public Bets</div>
                    <div className="text-gray-900 dark:text-white">
                      Home: {bettingData.publicBets.homePercentage}% | Away: {bettingData.publicBets.awayPercentage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Handle</div>
                    <div className="text-gray-900 dark:text-white">
                      Home: {bettingData.handle.homePercentage}% | Away: {bettingData.handle.awayPercentage}%
                    </div>
                  </div>
                </div>
                {bettingData.reverseLineMovement && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <div className="text-xs font-medium text-yellow-800 dark:text-yellow-400">
                      ⚠️ Reverse Line Movement Detected
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Players */}
            {keyPlayers.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Key Players to Watch
                </h4>
                <div className="space-y-2">
                  {keyPlayers.slice(0, 4).map((player) => (
                    <div key={player.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">{player.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{player.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Injury Report */}
            {injuries.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Injury Report
                </h4>
                <div className="space-y-2">
                  {injuries.map((injury) => (
                    <div key={injury.playerId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">
                        Player #{injury.playerId}
                      </span>
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        injury.status === 'out' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        injury.status === 'questionable' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      )}>
                        {injury.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Season Stats Comparison */}
            {teamStats && (teamStats.home || teamStats.away) && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Season Stats Comparison
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900 dark:text-white">Away</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-500 dark:text-gray-400">Stat</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900 dark:text-white">Home</div>
                  </div>
                  
                  {/* Points Per Game */}
                  <div className="text-center text-gray-900 dark:text-white">
                    {teamStats.away?.points_per_game || 'N/A'}
                  </div>
                  <div className="text-center text-gray-500 dark:text-gray-400">PPG</div>
                  <div className="text-center text-gray-900 dark:text-white">
                    {teamStats.home?.points_per_game || 'N/A'}
                  </div>
                  
                  {/* Total Yards */}
                  <div className="text-center text-gray-900 dark:text-white">
                    {teamStats.away?.total_yards_per_game || 'N/A'}
                  </div>
                  <div className="text-center text-gray-500 dark:text-gray-400">YPG</div>
                  <div className="text-center text-gray-900 dark:text-white">
                    {teamStats.home?.total_yards_per_game || 'N/A'}
                  </div>
                  
                  {/* Win Percentage */}
                  <div className="text-center text-gray-900 dark:text-white">
                    {teamStats.away?.win_percentage ? `${(teamStats.away.win_percentage * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-center text-gray-500 dark:text-gray-400">Win %</div>
                  <div className="text-center text-gray-900 dark:text-white">
                    {teamStats.home?.win_percentage ? `${(teamStats.home.win_percentage * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* Matchup Analysis */}
            {matchupAnalysis && matchupAnalysis.insights && matchupAnalysis.insights.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Matchup Analysis
                </h4>
                <div className="space-y-2">
                  {matchupAnalysis.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <p className="text-sm text-blue-800 dark:text-blue-300">{insight}</p>
                    </div>
                  ))}
                </div>
                
                {/* Key Matchups */}
                {matchupAnalysis.keyMatchups && matchupAnalysis.keyMatchups.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Key Matchups</h5>
                    <div className="space-y-2">
                      {matchupAnalysis.keyMatchups.map((matchup, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900 dark:text-white">{matchup.category}</span>
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            matchup.advantage === 'home' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            matchup.advantage === 'away' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          )}>
                            {matchup.advantage === 'home' ? 'Home Edge' : matchup.advantage === 'away' ? 'Away Edge' : 'Even'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Head-to-Head History */}
            {headToHead && headToHead.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Head-to-Head History
                </h4>
                <div className="space-y-2">
                  {headToHead.slice(0, 3).map((game, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-gray-900 dark:text-white">
                        {game.date || `Game ${index + 1}`}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {game.homeScore} - {game.awayScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Trends */}
            {trends.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Trends & Patterns
                </h4>
                <div className="space-y-2">
                  {trends.slice(0, 3).map((trend) => (
                    <div key={trend.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">{trend.description}</span>
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        trend.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        trend.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      )}>
                        {trend.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}