'use client'

import { FilterOptions, SortOptions } from '@/types'
import {
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface TeamStatsFiltersProps {
  selectedSeason: string
  filters: FilterOptions
  sortOptions: SortOptions
  onSeasonChange: (season: string) => void
  onFiltersChange: (filters: FilterOptions) => void
  onSortChange: (sortOptions: SortOptions) => void
}

const seasons = ['2024', '2023', '2022', '2021']

// College Football specific sort fields
const sortFields = [
  { field: 'winPercentage', label: 'Win %' },
  { field: 'pointsFor', label: 'Points For' },
  { field: 'pointsAgainst', label: 'Points Against' },
  { field: 'yardsFor', label: 'Total Yards' },
  { field: 'yardsAgainst', label: 'Yards Allowed' },
  { field: 'turnoverDifferential', label: 'Turnover Diff' }
]

export function TeamStatsFilters({
  selectedSeason,
  filters,
  sortOptions,
  onSeasonChange,
  onFiltersChange,
  onSortChange
}: TeamStatsFiltersProps) {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Football Team Stats
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  )
}