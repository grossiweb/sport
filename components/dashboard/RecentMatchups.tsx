'use client'

import { Game } from '@/types'
import { TrophyIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSport } from '@/contexts/SportContext'
import { useRecentMatchups } from '@/hooks/useOptimizedMatchups'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { format } from 'date-fns'

export function RecentMatchups() {
  const { currentSport, currentSportData } = useSport()

  const { data: matchups, isLoading, error } = useRecentMatchups(currentSport, 3)
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
          Error loading recent games
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Unable to load recent {currentSportData.displayName} games.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent {currentSportData.displayName} Matchups
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Latest completed games with final scores
          </p>
        </div>
        <Link 
          href={`/sport/${currentSport.toLowerCase()}/matchups`}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
        >
          View All Results
        </Link>
      </div>

      {/* Recent Games Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <RecentGameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No recent games
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No recent {currentSportData.displayName} games found.
          </p>
        </div>
      )}
    </div>
  )
}

function RecentGameCard({ game }: { game: Game }) {
  const homeWon = (game.homeScore ?? 0) > (game.awayScore ?? 0)
  const awayWon = (game.awayScore ?? 0) > (game.homeScore ?? 0)
  
  return (
    <Link href={`/sport/${game.league.toLowerCase()}/matchups/${game.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 group-hover:border-primary-300 dark:group-hover:border-primary-600">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
            <TrophyIcon className="w-3 h-3 mr-1" />
            FINAL
          </span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-3 h-3 mr-1" />
            {format(new Date(game.gameDate), 'MMM d')}
          </div>
        </div>

        <div className="space-y-3">
          {/* Away Team */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            awayWon 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-gray-50 dark:bg-gray-900/20'
          }`}>
            <div className="flex items-center space-x-3">
              <TeamLogo 
                team={game.awayTeam}
                size="sm"
                className="flex-shrink-0"
              />
              <div>
                <div className={`font-medium ${awayWon ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
                  {game.awayTeam.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.awayTeam.abbreviation}
                </div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${awayWon ? 'text-green-900 dark:text-green-100' : 'text-gray-600 dark:text-gray-400'}`}>
              {game.awayScore ?? 0}
            </div>
          </div>

          {/* Home Team */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            homeWon 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-gray-50 dark:bg-gray-900/20'
          }`}>
            <div className="flex items-center space-x-3">
              <TeamLogo 
                team={game.homeTeam}
                size="sm"
                className="flex-shrink-0"
              />
              <div>
                <div className={`font-medium ${homeWon ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
                  {game.homeTeam.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.homeTeam.abbreviation}
                </div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${homeWon ? 'text-green-900 dark:text-green-100' : 'text-gray-600 dark:text-gray-400'}`}>
              {game.homeScore ?? 0}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{game.venue || 'TBD'}</span>
            <span className="flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              {format(new Date(game.gameDate), 'h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
