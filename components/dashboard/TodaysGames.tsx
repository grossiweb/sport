'use client'

import { Game } from '@/types'
import { TrophyIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useBackgroundMatchups } from '@/hooks/useOptimizedMatchups'
import { format } from 'date-fns'

export function TodaysGames() {
  // Use CFB as default sport for today's games, or make this configurable
  const { data: matchups, isLoading, error } = useBackgroundMatchups('CFB')
  const games = matchups?.map((matchup: any) => matchup.game) || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <TrophyIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-red-900 dark:text-red-400">
          Unable to load games
        </h3>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
          {String(error)}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Today's College Football Games
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {games.length} games scheduled for {format(new Date(), 'MMMM d, yyyy')}
          </div>
        </div>
        <Link 
          href="/matchups"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
        >
          View All Matchups
        </Link>
      </div>

      {/* Games Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No games today
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no college football games scheduled for today.
          </p>
          <Link 
            href="/matchups"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
          >
            Browse Upcoming Games
          </Link>
        </div>
      )}
    </div>
  )
}

function GameCard({ game }: { game: Game }) {
  const getStatusColor = (status: Game['status']) => {
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

  const isLive = game.status === 'live'
  const isFinal = game.status === 'final'

  return (
    <Link href="/matchups" className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 group-hover:border-primary-300 dark:group-hover:border-primary-600">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
            College Football
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
            {isLive && (
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
            )}
            {game.status.toUpperCase()}
          </span>
        </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {game.awayTeam.abbreviation}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {game.awayTeam.city} {game.awayTeam.name}
            </span>
          </div>
          {(isFinal || isLive) && game.awayScore !== undefined && (
            <span className="text-lg font-bold text-gray-900 dark:text-white">{game.awayScore}</span>
          )}
        </div>

        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
          <span className="text-sm">vs</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {game.homeTeam.abbreviation}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {game.homeTeam.city} {game.homeTeam.name}
            </span>
          </div>
          {(isFinal || isLive) && game.homeScore !== undefined && (
            <span className="text-lg font-bold text-gray-900 dark:text-white">{game.homeScore}</span>
          )}
        </div>
      </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>
                {isLive ? 'Live Now' : isFinal ? 'Final' : format(new Date(game.gameDate), 'h:mm a')}
              </span>
            </div>
            {game.venue && (
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span className="truncate max-w-32">{game.venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="mt-3 text-center">
          <span className="text-xs text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Click for detailed analysis
          </span>
        </div>
      </div>
    </Link>
  )
}