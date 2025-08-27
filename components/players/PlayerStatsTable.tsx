'use client'

import { Player, PlayerStats, SportType } from '@/types'

interface PlayerStatsTableProps {
  players: Player[]
  playerStats: PlayerStats[]
  isLoading: boolean
  sport: SportType
  sortOptions: {
    field: string
    direction: 'asc' | 'desc'
  }
  onSortChange: (sortOptions: any) => void
}

export function PlayerStatsTable({
  players,
  playerStats,
  isLoading,
  sport,
  sortOptions,
  onSortChange
}: PlayerStatsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Combine players with their stats
  const playerStatsData = players.map(player => {
    const stats = playerStats.find(stat => stat.playerId === player.id)
    return { player, stats }
  }).filter(item => item.stats) // Only show players with stats

  // Sort the data
  const sortedData = [...playerStatsData].sort((a, b) => {
    const aValue = a.stats?.[sortOptions.field as keyof PlayerStats] || 0
    const bValue = b.stats?.[sortOptions.field as keyof PlayerStats] || 0
    
    if (sortOptions.direction === 'asc') {
      return Number(aValue) - Number(bValue)
    } else {
      return Number(bValue) - Number(aValue)
    }
  })

  const handleSort = (field: string) => {
    const direction = sortOptions.field === field && sortOptions.direction === 'desc' ? 'asc' : 'desc'
    onSortChange({ field, direction })
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortOptions.field !== field) {
      return <span className="text-gray-400">↕</span>
    }
    return sortOptions.direction === 'desc' ? <span>↓</span> : <span>↑</span>
  }

  const getColumnsForSport = () => {
    if (sport === 'CFB' || sport === 'NFL') {
      return [
        { key: 'passingYards', label: 'Pass Yds' },
        { key: 'passingTouchdowns', label: 'Pass TD' },
        { key: 'rushingYards', label: 'Rush Yds' },
        { key: 'rushingTouchdowns', label: 'Rush TD' },
        { key: 'receivingYards', label: 'Rec Yds' },
        { key: 'receivingTouchdowns', label: 'Rec TD' }
      ]
    }
    return []
  }

  const columns = getColumnsForSport()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {sport} Player Statistics
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {sortedData.length} players
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Position
              </th>
              {columns.map(column => (
                <th 
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label} <SortIcon field={column.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map(({ player, stats }) => (
              <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        #{player.jerseyNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {player.position}
                </td>
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {stats?.[column.key as keyof PlayerStats] || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No player statistics available for {sport}.
          </p>
        </div>
      )}
    </div>
  )
}