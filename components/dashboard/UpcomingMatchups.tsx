'use client'

import { Game } from '@/types'
import { TrophyIcon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSport } from '@/contexts/SportContext'
import { useWeekBasedUpcomingMatchups } from '@/hooks/useOptimizedMatchups'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { format, isToday, isTomorrow } from 'date-fns'
import { formatToEasternTime, formatToEasternDate } from '@/lib/utils/time'

export function UpcomingMatchups() {
  const { currentSport, currentSportData } = useSport()

  const { data: matchups, isLoading, error } = useWeekBasedUpcomingMatchups(currentSport, 3)
  const games = matchups?.map((matchup: any) => matchup.game) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mx-auto"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Error loading upcoming games
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Unable to load upcoming {currentSportData.displayName} games.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upcoming {currentSportData.displayName} Matchups
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Scheduled games in the next 7 days
          </p>
        </div>
        <Link 
          href={`/sport/${currentSport.toLowerCase()}/matchups`}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
        >
          View All Upcoming
        </Link>
      </div>

      {/* Upcoming Games Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <UpcomingGameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No upcoming games
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No scheduled {currentSportData.displayName} games in the next 7 days.
          </p>
        </div>
      )}
    </div>
  )
}

function UpcomingGameCard({ game }: { game: Game }) {
  const gameDate = new Date(game.gameDate)
  const isUpcomingToday = isToday(gameDate)
  const isUpcomingTomorrow = isTomorrow(gameDate)
  
  const getDateLabel = () => {
    if (isUpcomingToday) return 'Today'
    if (isUpcomingTomorrow) return 'Tomorrow'
    return format(gameDate, 'MMM d')
  }

  const getStatusColor = () => {
    if (isUpcomingToday) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    if (isUpcomingTomorrow) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }
  
  return (
    <Link href={`/sport/${game.league.toLowerCase()}/matchups/${game.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 group-hover:border-primary-300 dark:group-hover:border-primary-600">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            <CalendarIcon className="w-3 h-3 mr-1" />
            {getDateLabel()}
          </span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            {formatToEasternTime(game.gameDate)}
          </div>
        </div>

        <div className="space-y-3">
          {/* Away Team */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <TeamLogo 
                team={game.awayTeam}
                size="sm"
                className="flex-shrink-0"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {game.awayTeam.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.awayTeam.abbreviation}
                  {game.awayTeam.record && (
                    <span className="ml-2">({game.awayTeam.record})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              @
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex justify-center">
            <span className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
              VS
            </span>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <TeamLogo 
                team={game.homeTeam}
                size="sm"
                className="flex-shrink-0"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {game.homeTeam.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.homeTeam.abbreviation}
                  {game.homeTeam.record && (
                    <span className="ml-2">({game.homeTeam.record})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              HOME
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span className="truncate">{game.venue || 'TBD'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
