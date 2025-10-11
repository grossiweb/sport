'use client'

import { BettingData, Game } from '@/types'
import { 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { formatToEasternTime } from '@/lib/utils/time'
import { formatSpread, formatTotal, formatOdds } from '@/lib/utils/betting-format'

interface BettingCardProps {
  bettingData: BettingData
  game?: Game
}

export function BettingCard({ bettingData, game }: BettingCardProps) {
  // Use real game data if provided, otherwise fall back to mock data
  const gameData = game || {
    homeTeam: { name: 'Home Team', city: 'City', abbreviation: 'HOM' },
    awayTeam: { name: 'Away Team', city: 'City', abbreviation: 'AWY' },
    gameDate: new Date(),
    status: 'scheduled' as const
  }

  const formatGameTime = (date: Date | string) => {
    return formatToEasternTime(date)
  }

  const getPublicSentiment = () => {
    const publicDiff = Math.abs(bettingData.publicBets.homePercentage - bettingData.publicBets.awayPercentage)
    if (publicDiff >= 20) return 'Heavy'
    if (publicDiff >= 10) return 'Moderate'
    return 'Balanced'
  }

  const getSharpAction = () => {
    const publicHomePercent = bettingData.publicBets.homePercentage
    const handleHomePercent = bettingData.handle.homePercentage
    
    // If handle is significantly different from public bets, there's sharp action
    const diff = Math.abs(publicHomePercent - handleHomePercent)
    if (diff >= 15) return 'Strong Sharp Action'
    if (diff >= 8) return 'Moderate Sharp Action'
    return 'Follows Public'
  }

  const hasValueBet = () => {
    const publicHomePercent = bettingData.publicBets.homePercentage
    const handleHomePercent = bettingData.handle.homePercentage
    
    // Value when public is heavy on one side but handle is on the other
    return Math.abs(publicHomePercent - handleHomePercent) >= 15
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header with RLM Alert */}
      <div className={clsx(
        'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
        bettingData.reverseLineMovement && 'bg-red-50 dark:bg-red-900/20'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {gameData.awayTeam.name} @ {gameData.homeTeam.name}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatGameTime(gameData.gameDate)} • {gameData.status}
            </div>
          </div>
          
          {bettingData.reverseLineMovement && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-medium">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>RLM Alert</span>
            </div>
          )}
        </div>
      </div>

      {/* Betting Lines */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Spread */}
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spread</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {formatSpread(bettingData.spread.home)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              ({formatOdds(bettingData.spread.juice)})
            </div>
          </div>

          {/* Total */}
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {formatTotal(bettingData.total.points)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              O {formatOdds(bettingData.total.over)} / U {formatOdds(bettingData.total.under)}
            </div>
          </div>

          {/* Money Line */}
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Money Line</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {formatOdds(bettingData.moneyLine.home)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Away: {formatOdds(bettingData.moneyLine.away)}
            </div>
          </div>
        </div>

        {/* Public vs Sharp Money */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <UsersIcon className="h-4 w-4" />
              <span>Public Betting</span>
            </h4>
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              getPublicSentiment() === 'Heavy' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
              getPublicSentiment() === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            )}>
              {getPublicSentiment()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {gameData.homeTeam.abbreviation} (Home)
                </span>
                <span className="text-sm font-medium">
                  {bettingData.publicBets.homePercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${bettingData.publicBets.homePercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {gameData.awayTeam.abbreviation} (Away)
                </span>
                <span className="text-sm font-medium">
                  {bettingData.publicBets.awayPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${bettingData.publicBets.awayPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Handle Distribution */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>Money Handle</span>
            </h4>
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              getSharpAction().includes('Strong') ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
              getSharpAction().includes('Moderate') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            )}>
              {getSharpAction()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Home Handle</span>
                <span className="text-sm font-medium">
                  {bettingData.handle.homePercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${bettingData.handle.homePercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Away Handle</span>
                <span className="text-sm font-medium">
                  {bettingData.handle.awayPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${bettingData.handle.awayPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Value Indicator */}
        {hasValueBet() && (
          <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-800 dark:text-green-400">
                Potential Value Bet Detected
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Sharp money and public betting are moving in opposite directions.
            </p>
          </div>
        )}

        {/* Sportsbook Information */}
        {bettingData.sportsbook && (
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Lines from: {bettingData.sportsbook.name}
                </span>
              </div>
              {bettingData.sportsbook.url && (
                <a 
                  href={bettingData.sportsbook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Visit Sportsbook
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Track Lines
            </button>
            {/*}<button className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
              View History
            </button>*/}
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}