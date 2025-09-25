'use client'

import { useState } from 'react'
import { Matchup, SportType } from '@/types'
import { format } from 'date-fns'
import { 
  ClockIcon, 
  MapPinIcon, 
  TrophyIcon, 
  ChevronRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TeamLogo } from '@/components/ui/TeamLogo'

interface ModernMatchupCardProps {
  matchup: Matchup
  sport: SportType
}

export function ModernMatchupCard({ matchup, sport }: ModernMatchupCardProps) {
  const { game, predictions, bettingData } = matchup
  const [isHovered, setIsHovered] = useState(false)

  const gameTime = format(new Date(game.gameDate), 'h:mm a')
  const gameDate = format(new Date(game.gameDate), 'MMM d, yyyy')
  const gameDayOfWeek = format(new Date(game.gameDate), 'EEEE')

  // Calculate win probabilities for AI predictions
  const homeWinPercentage = predictions.predictedWinner === game.homeTeam.name ? 
    (predictions.confidence * 100) : (100 - predictions.confidence * 100)
  const awayWinPercentage = 100 - homeWinPercentage

  // Color functions for percentages
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dark Header with Team Names */}
      <div className="px-6 py-4 bg-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {game.awayTeam.name} @ {game.homeTeam.name}
          </h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            game.status === 'live' ? 'bg-red-500 text-white' :
            game.status === 'final' ? 'bg-gray-600 text-gray-200' :
            'bg-blue-500 text-white'
          }`}>
            {game.status === 'live' && <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>}
            {game.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Teams Side by Side with Date in Center */}
        <div className="grid grid-cols-3 gap-4 items-center mb-6">
          {/* Away Team */}
          <div className="text-center">
            <TeamLogo team={game.awayTeam} size="xl" className="mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {game.awayTeam.abbreviation}
            </div>
            {game.awayTeam.record && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {game.awayTeam.record}
              </div>
            )}
            {game.awayScore !== undefined && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {game.awayScore}
              </div>
            )}
          </div>

          {/* Game Date & Time in Center */}
          <div className="text-center border-l border-r border-gray-200 dark:border-gray-700 px-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {gameDayOfWeek}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {gameDate}
            </div>
            <div className="text-md font-semibold text-blue-600 dark:text-blue-400">
              {gameTime}
            </div>
            {game.venue && (
              <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {game.venue}
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="text-center">
            <TeamLogo team={game.homeTeam} size="xl" className="mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {game.homeTeam.abbreviation}
            </div>
            {game.homeTeam.record && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {game.homeTeam.record}
              </div>
            )}
            {game.homeScore !== undefined && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {game.homeScore}
              </div>
            )}
          </div>
        </div>

        {/* AI Prediction with Colored Percentages */}
        {predictions && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                AI Prediction
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {game.awayTeam.abbreviation}
                </div>
                <div className={`text-2xl font-bold ${getPercentageColor(awayWinPercentage)}`}>
                  {awayWinPercentage.toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {game.homeTeam.abbreviation}
                </div>
                <div className={`text-2xl font-bold ${getPercentageColor(homeWinPercentage)}`}>
                  {homeWinPercentage.toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
              Predicted Score: {predictions.predictedScore.away} - {predictions.predictedScore.home}
            </div>
          </div>
        )}

        {/* Improved Betting Lines */}
        {bettingData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Betting Lines
                </span>
              </div>
              {bettingData.sportsbook && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {bettingData.sportsbook.name}
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Spread */}
              <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spread</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {game.homeTeam.abbreviation} {bettingData.spread.home > 0 ? '+' : ''}{bettingData.spread.home}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ({bettingData.spread.juice > 0 ? '+' : ''}{bettingData.spread.juice})
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {bettingData.total.points}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    O{bettingData.total.over} / U{bettingData.total.under}
                  </div>
                </div>
              </div>

              {/* Money Line */}
              <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Money Line</span>
                <div className="text-right text-xs space-y-1">
                  <div className="text-gray-900 dark:text-white font-semibold">
                    {game.homeTeam.abbreviation}: {bettingData.moneyLine.home > 0 ? '+' : ''}{bettingData.moneyLine.home}
                  </div>
                  <div className="text-gray-900 dark:text-white font-semibold">
                    {game.awayTeam.abbreviation}: {bettingData.moneyLine.away > 0 ? '+' : ''}{bettingData.moneyLine.away}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          <Link
            href={`/sport/${sport.toLowerCase()}/matchups/${game.id}`}
            className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform ${isHovered ? 'scale-105' : 'scale-100'}`}
          >
            <TrophyIcon className="h-5 w-5 mr-2" />
            View Full Analysis
            <ChevronRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}
