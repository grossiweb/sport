'use client'

import { useState, useMemo } from 'react'
import { Team, TeamStats, SportType, FilterOptions, SortOptions } from '@/types'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface TeamStatsTableProps {
  teams: Team[]
  teamStats: TeamStats[]
  sport: SportType
  filters: FilterOptions
  sortOptions: SortOptions
}

export function TeamStatsTable({
  teams,
  teamStats,
  sport,
  filters,
  sortOptions
}: TeamStatsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Merge teams and stats data
  const mergedData = useMemo(() => {
    return teams.map(team => {
      const stats = teamStats.find(stat => stat.teamId === team.id)
      return { team, stats }
    }).filter(({ stats }) => {
      if (!stats) return false
      if (filters.minGames && stats.games < filters.minGames) return false
      return true
    })
  }, [teams, teamStats, filters])

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

  const toggleRowExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId)
    } else {
      newExpanded.add(teamId)
    }
    setExpandedRows(newExpanded)
  }

  const getColumns = () => {
    const baseColumns = [
      { key: 'rank', label: '#', width: 'w-12' },
      { key: 'team', label: 'Team', width: 'w-48' },
      { key: 'games', label: 'G', width: 'w-16' },
      { key: 'wins', label: 'W', width: 'w-16' },
      { key: 'losses', label: 'L', width: 'w-16' },
      { key: 'winPercentage', label: 'Win %', width: 'w-20' }
    ]

    switch (sport) {
      case 'CFB':
        return [
          ...baseColumns,
          { key: 'pointsFor', label: 'PF', width: 'w-16' },
          { key: 'pointsAgainst', label: 'PA', width: 'w-16' },
          { key: 'yardsFor', label: 'YDS', width: 'w-20' },
          { key: 'yardsAgainst', label: 'YDS A', width: 'w-20' },
          { key: 'turnoverDifferential', label: 'TO Diff', width: 'w-20' }
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
            {sortedData.map(({ team, stats }, index) => (
              <TeamStatsRow
                key={team.id}
                team={team}
                stats={stats}
                rank={index + 1}
                columns={columns}
                sport={sport}
                isExpanded={expandedRows.has(team.id)}
                onToggleExpansion={() => toggleRowExpansion(team.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No team data available for the selected filters.
          </p>
        </div>
      )}
    </div>
  )
}

interface TeamStatsRowProps {
  team: Team
  stats: TeamStats | undefined
  rank: number
  columns: Array<{ key: string; label: string; width: string }>
  sport: SportType
  isExpanded: boolean
  onToggleExpansion: () => void
}

function TeamStatsRow({
  team,
  stats,
  rank,
  columns,
  sport,
  isExpanded,
  onToggleExpansion
}: TeamStatsRowProps) {
  const getCellValue = (key: string) => {
    switch (key) {
      case 'rank':
        return rank
      case 'team':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{team.abbreviation}</span>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {team.city} {team.name}
              </div>
            </div>
          </div>
        )
      case 'winPercentage':
        return stats?.[key] ? (stats[key] * 100).toFixed(1) + '%' : '-'
      case 'battingAverage':
      case 'onBasePercentage':
      case 'sluggingPercentage':
      case 'ops':
      case 'era':
      case 'whip':
      case 'fip':
      case 'fieldGoalPercentage':
      case 'threePointPercentage':
      case 'freeThrowPercentage':
        const value = stats?.[key as keyof TeamStats]
        return typeof value === 'number' ? value.toFixed(3) : '-'
      case 'pointsPerGame':
      case 'pointsAllowedPerGame':
      case 'reboundsPerGame':
      case 'assistsPerGame':
        const perGameValue = stats?.[key as keyof TeamStats]
        return typeof perGameValue === 'number' ? perGameValue.toFixed(1) : '-'
      default:
        const defaultValue = stats?.[key as keyof TeamStats]
        return defaultValue !== undefined ? defaultValue : '-'
    }
  }

  const getPerformanceClass = (key: string, value: any) => {
    if (typeof value !== 'number') return ''
    
    // Performance-based coloring logic
    switch (key) {
      case 'winPercentage':
        if (value >= 0.7) return 'performance-excellent'
        if (value >= 0.6) return 'performance-good'
        if (value >= 0.4) return 'performance-average'
        return 'performance-poor'
      case 'era':
        if (value <= 3.0) return 'performance-excellent'
        if (value <= 4.0) return 'performance-good'
        if (value <= 5.0) return 'performance-average'
        return 'performance-poor'
      case 'ops':
        if (value >= 0.8) return 'performance-excellent'
        if (value >= 0.75) return 'performance-good'
        if (value >= 0.7) return 'performance-average'
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
              {column.key === 'team' ? (
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
            <TeamDetailView team={team} stats={stats} sport={sport} />
          </td>
        </tr>
      )}
    </>
  )
}

function TeamDetailView({ team, stats, sport }: { team: Team; stats?: TeamStats; sport: SportType }) {
  if (!stats) return <p>No detailed stats available</p>

  const getDetailStats = () => {
    switch (sport) {
      case 'CFB':
        return [
          { label: 'Total Yards', value: stats.yardsFor },
          { label: 'Yards Allowed', value: stats.yardsAgainst },
          { label: 'Turnovers', value: stats.turnovers },
        ]
      default:
        return []
    }
  }

  const detailStats = getDetailStats()

  return (
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
        Additional Statistics
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {detailStats.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
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

function getSortValue(stats: TeamStats | undefined, field: string): number | null {
  if (!stats) return null
  return stats[field as keyof TeamStats] as number || null
}