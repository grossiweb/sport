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
  const { game, predictions, bettingData, trends, injuries } = matchup
  const [isHovered, setIsHovered] = useState(false)

  const confidenceColor = predictions.confidence >= 0.8 ? 'text-green-600' : 
                         predictions.confidence >= 0.6 ? 'text-amber-600' : 'text-red-600'

  const confidenceBg = predictions.confidence >= 0.8 ? 'bg-green-50 border-green-200' : 
                       predictions.confidence >= 0.6 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  const gameTime = format(new Date(game.gameDate), 'h:mm a')
  const gameDate = format(new Date(game.gameDate), 'MMM d')

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Status and Time */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              game.status === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
              game.status === 'final' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {game.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>}
              {game.status.toUpperCase()}
            </span>
            {game.venue && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {game.venue}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {gameTime}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {gameDate}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Teams Section */}
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TeamLogo team={game.awayTeam} size="lg" />
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {game.awayTeam.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {game.awayTeam.abbreviation}
                  {game.awayTeam.record && ` (${game.awayTeam.record})`}
                </div>
              </div>
            </div>
            <div className="text-right">
              {game.awayScore !== undefined ? (
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {game.awayScore}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  AWAY
                </div>
              )}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            <div className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
              VS
            </div>
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TeamLogo team={game.homeTeam} size="lg" />
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {game.homeTeam.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {game.homeTeam.abbreviation}
                  {game.homeTeam.record && ` (${game.homeTeam.record})`}
                </div>
              </div>
            </div>
            <div className="text-right">
              {game.homeScore !== undefined ? (
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {game.homeScore}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  HOME
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Prediction */}
        {predictions && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${confidenceBg}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  AI Prediction
                </span>
              </div>
              <span className={`text-sm font-bold ${confidenceColor}`}>
                {(predictions.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                {predictions.predictedWinner}
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {predictions.predictedScore.away} - {predictions.predictedScore.home}
              </span>
            </div>
            {predictions.keyFactors && predictions.keyFactors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {predictions.keyFactors.slice(0, 3).map((factor, index) => (
                  <span
                    key={index}
                    className="inline-block bg-white/70 dark:bg-gray-800/70 text-xs px-2 py-1 rounded text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Betting Lines */}
        {bettingData && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center mb-3">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Betting Lines
              </span>
              {bettingData.sportsbook && (
                <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                  {bettingData.sportsbook.name}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Spread */}
              <div className="text-center">
                <div className="text-green-700 dark:text-green-300 font-semibold mb-1 text-sm">Spread</div>
                <div className="text-gray-900 dark:text-white font-bold text-lg">
                  {bettingData.spread.home > 0 ? '+' : ''}{bettingData.spread.home}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  ({bettingData.spread.juice > 0 ? '+' : ''}{bettingData.spread.juice})
                </div>
              </div>

              {/* Total */}
              <div className="text-center">
                <div className="text-green-700 dark:text-green-300 font-semibold mb-1 text-sm">Total</div>
                <div className="text-gray-900 dark:text-white font-bold text-lg">
                  {bettingData.total.points}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  O{bettingData.total.over} / U{bettingData.total.under}
                </div>
              </div>

              {/* Money Line */}
              <div className="text-center">
                <div className="text-green-700 dark:text-green-300 font-semibold mb-1 text-sm">
                  Money Line
                </div>
                <div className="space-y-1 text-xs">
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
        <div className="mt-6">
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
