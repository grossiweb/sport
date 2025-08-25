'use client'

import { useState, useEffect } from 'react'
import { FilterOptions, SortOptions, Team } from '@/types'
import {
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'

interface PlayerStatsFiltersProps {
  selectedSeason: string
  selectedTeam: string
  filters: FilterOptions
  sortOptions: SortOptions
  onSeasonChange: (season: string) => void
  onTeamChange: (team: string) => void
  onFiltersChange: (filters: FilterOptions) => void
  onSortChange: (sortOptions: SortOptions) => void
}

const seasons = ['2024', '2023', '2022', '2021']

// College Football specific sort fields and positions
const sortFields = [
  { field: 'passingYards', label: 'Passing Yards' },
  { field: 'passingTouchdowns', label: 'Passing TDs' },
  { field: 'rushingYards', label: 'Rushing Yards' },
  { field: 'rushingTouchdowns', label: 'Rushing TDs' },
  { field: 'receivingYards', label: 'Receiving Yards' },
  { field: 'receivingTouchdowns', label: 'Receiving TDs' },
  { field: 'tackles', label: 'Tackles' },
  { field: 'sacks', label: 'Sacks' }
]

const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P']

export function PlayerStatsFilters({
  selectedSeason,
  selectedTeam,
  filters,
  sortOptions,
  onSeasonChange,
  onTeamChange,
  onFiltersChange,
  onSortChange
}: PlayerStatsFiltersProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams')
        setTeams(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch teams:', error)
        setTeams([])
      } finally {
        setTeamsLoading(false)
      }
    }

    fetchTeams()
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Football Player Stats
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Season Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            disabled={teamsLoading}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.abbreviation})
              </option>
            ))}
          </select>
          {teamsLoading && (
            <p className="text-xs text-gray-500 mt-1">Loading teams...</p>
          )}
        </div>

        {/* Sort Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={sortOptions.field}
            onChange={(e) => onSortChange({ ...sortOptions, field: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {sortFields.map(({ field, label }) => (
              <option key={field} value={field}>{label}</option>
            ))}
          </select>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Direction
          </label>
          <button
            onClick={() => onSortChange({
              ...sortOptions,
              direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
            })}
            className="w-full flex items-center justify-center space-x-2 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {sortOptions.direction === 'asc' ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            <span>{sortOptions.direction === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Filters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position
            </label>
            <select
              value={filters.position || 'All'}
              onChange={(e) => onFiltersChange({
                ...filters,
                position: e.target.value === 'All' ? undefined : e.target.value
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {positions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Games
            </label>
            <input
              type="number"
              min="0"
              value={filters.minGames || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                minGames: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="e.g., 10"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeframe
            </label>
            <select
              value={filters.timeframe || 'season'}
              onChange={(e) => onFiltersChange({
                ...filters,
                timeframe: e.target.value as FilterOptions['timeframe']
              })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="season">Season</option>
              <option value="30d">Last 30 Days</option>
              <option value="15d">Last 15 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Range
            </label>
            <input
              type="text"
              value={filters.ageRange || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                ageRange: e.target.value || undefined
              })}
              placeholder="e.g., 25-30"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}