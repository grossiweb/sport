'use client'

import { TrophyIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSport } from '@/contexts/SportContext'
import { useWeekBasedUpcomingMatchups } from '@/hooks/useOptimizedMatchups'
import { ModernMatchupCard } from '@/components/matchups/ModernMatchupCard'

export function UpcomingMatchups() {
  const { currentSport, currentSportData } = useSport()

  const { data: matchups, isLoading, error } = useWeekBasedUpcomingMatchups(currentSport, 3)
  const upcomingMatchups = matchups ?? []

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
      {upcomingMatchups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingMatchups.map((matchup: any) => (
            <ModernMatchupCard
              key={matchup.game.id}
              matchup={matchup}
              sport={currentSport}
            />
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
