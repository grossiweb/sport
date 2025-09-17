'use client'

import { Game } from '@/types'
import { TrophyIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSport } from '@/contexts/SportContext'
import { useTodaysMatchups } from '@/hooks/useOptimizedMatchups'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { format } from 'date-fns'

export function DailyMatchups() {
  const { currentSport, currentSportData } = useSport()

  const { data: matchups, isLoading } = useTodaysMatchups(currentSport, 3)
  const games = matchups?.map((matchup: any) => matchup.game) || []

  if (isLoading) {
    return (
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
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Today's Featured {currentSportData.displayName} Matchups
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {games.length} games scheduled for {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
        <Link 
          href={`/sport/${currentSport.toLowerCase()}/matchups`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
        >
          View All Matchups
        </Link>
      </div>

      {/* Featured Games Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <FeaturedGameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No games today
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no {currentSportData.displayName} games scheduled for today.
          </p>
          <Link 
            href={`/sport/${currentSport.toLowerCase()}/matchups`}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
          >
            Browse Upcoming Games
          </Link>
        </div>
      )}
    </div>
  )
}

function FeaturedGameCard({ game }: { game: Game }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {game.status}
        </span>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          {format(new Date(game.gameDate), 'h:mm a')}
        </div>
      </div>

      <div className="space-y-4">
        {/* Away Team */}
        <div className="flex items-center space-x-3">
          <TeamLogo team={game.awayTeam} size="md" />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">
              {game.awayTeam.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {game.awayTeam.abbreviation}
              {game.awayTeam.record && ` (${game.awayTeam.record})`}
            </div>
          </div>
          {game.awayScore !== undefined && (
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {game.awayScore}
            </div>
          )}
        </div>

        <div className="text-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            VS
          </span>
        </div>

        {/* Home Team */}
        <div className="flex items-center space-x-3">
          <TeamLogo team={game.homeTeam} size="md" />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">
              {game.homeTeam.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {game.homeTeam.abbreviation}
              {game.homeTeam.record && ` (${game.homeTeam.record})`}
            </div>
          </div>
          {game.homeScore !== undefined && (
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {game.homeScore}
            </div>
          )}
        </div>
      </div>

      {game.venue && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {game.venue}
          </div>
        </div>
      )}
    </div>
  )
}
