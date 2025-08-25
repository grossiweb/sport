'use client'

import { useState, useMemo } from 'react'
import { Player, PlayerStats, SportType, FilterOptions, SortOptions } from '@/types'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface PlayerStatsTableProps {
  players: Player[]
  playerStats: PlayerStats[]
  sport: SportType
  filters: FilterOptions
  sortOptions: SortOptions
}

export function PlayerStatsTable({
  players,
  playerStats,
  sport,
  filters,
  sortOptions
}: PlayerStatsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Merge players and stats data
  const mergedData = useMemo(() => {
    return players.map(player => {
      const stats = playerStats.find(stat => stat.playerId === player.id)
      return { player, stats }
    }).filter(({ player, stats }) => {
      if (!stats) return false
      if (filters.minGames && stats.games < filters.minGames) return false
      if (filters.position && filters.position !== 'All' && player.position !== filters.position) return false
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange.split('-').map(Number)
        if (player.age && (player.age < minAge || player.age > maxAge)) return false
      }
      return true
    })
  }, [players, playerStats, filters])

  // Sort data
  const sortedData = useMemo(() => {
    return [...mergedData].sort((a, b) => {
      const aValue = getSortValue(a.stats, sortOptions.field)
      const bValue = getSortValue(b.stats, sortOptions.field)
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      return sortOptions.direction === 'asc' ? comparison : -comparison
    })
  }, [mergedData, sortOptions])

  const toggleRowExpansion = (playerId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(playerId)) {
      newExpanded.delete(playerId)
    } else {
      newExpanded.add(playerId)
    }
    setExpandedRows(newExpanded)
  }

  const getColumns = () => {
    const baseColumns = [
      { key: 'rank', label: '#', width: 'w-12' },
      { key: 'player', label: 'Player', width: 'w-48' },
      { key: 'position', label: 'Pos', width: 'w-16' },
      { key: 'age', label: 'Age', width: 'w-16' },
      { key: 'games', label: 'G', width: 'w-16' }
    ]

    switch (sport) {
      case 'CFB':
        return [
          ...baseColumns,
          { key: 'passingYards', label: 'Pass Yds', width: 'w-20' },
          { key: 'passingTouchdowns', label: 'Pass TD', width: 'w-20' },
          { key: 'rushingYards', label: 'Rush Yds', width: 'w-20' },
          { key: 'rushingTouchdowns', label: 'Rush TD', width: 'w-20' },
          { key: 'receivingYards', label: 'Rec Yds', width: 'w-20' },
          { key: 'tackles', label: 'Tackles', width: 'w-20' }
        ]
      case 'NBA':
      case 'CBB':
        return [
          ...baseColumns,
          { key: 'points', label: 'PTS', width: 'w-16' },
          { key: 'rebounds', label: 'REB', width: 'w-16' },
          { key: 'assists', label: 'AST', width: 'w-16' },
          { key: 'steals', label: 'STL', width: 'w-16' },
          { key: 'blocks', label: 'BLK', width: 'w-16' },
          { key: 'fieldGoalPercentage', label: 'FG%', width: 'w-20' },
          { key: 'threePointPercentage', label: '3P%', width: 'w-20' }
        ]
      default:
        return baseColumns
    }
  }

  const columns = getColumns()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider',
                    column.width
                  )}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-3 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map(({ player, stats }, index) => (
              <PlayerStatsRow
                key={player.id}
                player={player}
                stats={stats}
                rank={index + 1}
                columns={columns}
                sport={sport}
                isExpanded={expandedRows.has(player.id)}
                onToggleExpansion={() => toggleRowExpansion(player.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No player data available for the selected filters.
          </p>
        </div>
      )}
    </div>
  )
}

interface PlayerStatsRowProps {
  player: Player
  stats: PlayerStats | undefined
  rank: number
  columns: Array<{ key: string; label: string; width: string }>
  sport: SportType
  isExpanded: boolean
  onToggleExpansion: () => void
}

function PlayerStatsRow({
  player,
  stats,
  rank,
  columns,
  sport,
  isExpanded,
  onToggleExpansion
}: PlayerStatsRowProps) {
  const getCellValue = (key: string) => {
    switch (key) {
      case 'rank':
        return rank
      case 'player':
        return (
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {player.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                #{player.jerseyNumber !== undefined && player.jerseyNumber !== null ? player.jerseyNumber : 'N/A'}
              </div>
            </div>
          </div>
        )
      case 'position':
        return player.position
      case 'age':
        return player.age || '-'
      case 'battingAverage':
      case 'onBasePercentage':
      case 'sluggingPercentage':
      case 'ops':
      case 'era':
      case 'whip':
      case 'fip':
        const battingValue = stats?.[key as keyof PlayerStats]
        return typeof battingValue === 'number' ? battingValue.toFixed(3) : '-'
      case 'fieldGoalPercentage':
      case 'threePointPercentage':
      case 'freeThrowPercentage':
        const percentageValue = stats?.[key as keyof PlayerStats]
        return typeof percentageValue === 'number' ? (percentageValue * 100).toFixed(1) + '%' : '-'
      default:
        const defaultValue = stats?.[key as keyof PlayerStats]
        return defaultValue !== undefined ? defaultValue : '-'
    }
  }

  const getPerformanceClass = (key: string, value: any) => {
    if (typeof value !== 'number') return ''
    
    // Performance-based coloring logic
    switch (key) {
      case 'battingAverage':
        if (value >= 0.300) return 'performance-excellent'
        if (value >= 0.275) return 'performance-good'
        if (value >= 0.250) return 'performance-average'
        return 'performance-poor'
      case 'era':
        if (value <= 3.00) return 'performance-excellent'
        if (value <= 4.00) return 'performance-good'
        if (value <= 5.00) return 'performance-average'
        return 'performance-poor'
      case 'ops':
        if (value >= 0.9) return 'performance-excellent'
        if (value >= 0.8) return 'performance-good'
        if (value >= 0.7) return 'performance-average'
        return 'performance-poor'
      case 'fieldGoalPercentage':
        if (value >= 50) return 'performance-excellent'
        if (value >= 45) return 'performance-good'
        if (value >= 40) return 'performance-average'
        return 'performance-poor'
      default:
        return ''
    }
  }

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        {columns.map((column) => {
          const value = getSortValue(stats, column.key)
          const displayValue = getCellValue(column.key)
          const performanceClass = getPerformanceClass(column.key, value)
          
          return (
            <td
              key={column.key}
              className={clsx(
                'table-cell',
                performanceClass && 'px-2 py-1 rounded text-center font-medium'
              )}
            >
              {column.key === 'player' ? (
                <div className="flex items-center justify-between">
                  {displayValue}
                </div>
              ) : (
                <span className={performanceClass}>{displayValue}</span>
              )}
            </td>
          )
        })}
        <td className="table-cell">
          <button
            onClick={onToggleExpansion}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        </td>
      </tr>
      
      {isExpanded && (
        <tr className="bg-gray-50 dark:bg-gray-700">
          <td colSpan={columns.length + 1} className="px-6 py-4">
            <PlayerDetailView player={player} stats={stats} sport={sport} />
          </td>
        </tr>
      )}
    </>
  )
}

function PlayerDetailView({ player, stats, sport }: { player: Player; stats?: PlayerStats; sport: SportType }) {
  if (!stats) return <p>No detailed stats available</p>

  const getDetailStats = () => {
    switch (sport) {
      case 'CFB':
        return [
          { label: 'Interceptions', value: stats.interceptions },
          { label: 'Receptions', value: stats.receptions },
          { label: 'Sacks', value: stats.sacks },
          { label: 'Fumbles', value: stats.fumbles },
        ]
      case 'NBA':
      case 'CBB':
        return [
          { label: 'Turnovers', value: stats.turnovers },
          { label: 'Minutes', value: stats.minutesPlayed?.toFixed(1) },
          { label: 'FT%', value: stats.freeThrowPercentage ? (stats.freeThrowPercentage * 100).toFixed(1) + '%' : '-' },
        ]
      default:
        return []
    }
  }

  const detailStats = getDetailStats()

  return (
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
        Player Details
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {player.height || 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Height
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {player.weight || 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Weight
          </div>
        </div>
        {detailStats.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {value || '-'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getSortValue(stats: PlayerStats | undefined, field: string): number | null {
  if (!stats) return null
  return stats[field as keyof PlayerStats] as number || null
}