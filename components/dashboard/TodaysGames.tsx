'use client'

import { useState, useEffect } from 'react'
import { Game } from '@/types'
import { format } from 'date-fns'
import { TrophyIcon, ClockIcon } from '@heroicons/react/24/outline'

// Mock College Football data - replace with actual API calls
const mockGames: Game[] = [
  {
    id: '1',
    homeTeam: { id: '1', name: 'Crimson Tide', city: 'Alabama', abbreviation: 'ALA', league: 'CFB' },
    awayTeam: { id: '2', name: 'Tigers', city: 'Auburn', abbreviation: 'AUB', league: 'CFB' },
    league: 'CFB',
    gameDate: new Date(),
    status: 'scheduled',
    venue: 'Bryant-Denny Stadium'
  },
  {
    id: '2',
    homeTeam: { id: '3', name: 'Wolverines', city: 'Michigan', abbreviation: 'MICH', league: 'CFB' },
    awayTeam: { id: '4', name: 'Buckeyes', city: 'Ohio State', abbreviation: 'OSU', league: 'CFB' },
    league: 'CFB',
    gameDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'scheduled',
    venue: 'Michigan Stadium'
  },
  {
    id: '3',
    homeTeam: { id: '5', name: 'Fighting Irish', city: 'Notre Dame', abbreviation: 'ND', league: 'CFB' },
    awayTeam: { id: '6', name: 'Trojans', city: 'USC', abbreviation: 'USC', league: 'CFB' },
    league: 'CFB',
    gameDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    status: 'scheduled',
    venue: 'Notre Dame Stadium'
  }
]

export function TodaysGames() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call to /api/games
    setTimeout(() => {
      setGames(mockGames)
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Today's College Football Games
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {games.length} games scheduled
        </div>
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

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
          College Football
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
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
          {game.awayScore !== undefined && (
            <span className="text-lg font-bold">{game.awayScore}</span>
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
          {game.homeScore !== undefined && (
            <span className="text-lg font-bold">{game.homeScore}</span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{format(game.gameDate, 'h:mm a')}</span>
          </div>
          {game.venue && (
            <span className="truncate">{game.venue}</span>
          )}
        </div>
      </div>
    </div>
  )
}