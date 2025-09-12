'use client'

import { SportType } from '@/types'

interface TeamStatsFiltersProps {
  sport: SportType
  filters: any
  sortOptions: {
    field: string
    direction: 'asc' | 'desc'
  }
  onFiltersChange: (filters: any) => void
  onSortChange: (sortOptions: any) => void
}

export function TeamStatsFilters({
  sport,
  filters,
  sortOptions,
  onFiltersChange,
  onSortChange
}: TeamStatsFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Filters & Sorting
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sort Field */}
        <div>
          <label htmlFor="sortField" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            id="sortField"
            value={sortOptions.field}
            onChange={(e) => onSortChange({ ...sortOptions, field: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="winPercentage">Win Percentage</option>
            <option value="wins">Wins</option>
            <option value="losses">Losses</option>
            {sport === 'CFB' && (
              <>
                <option value="pointsFor">Points For</option>
                <option value="pointsAgainst">Points Against</option>
                <option value="yardsFor">Yards For</option>
                <option value="yardsAgainst">Yards Against</option>
              </>
            )}
            {sport === 'NFL' && (
              <>
                <option value="pointsFor">Points For</option>
                <option value="pointsAgainst">Points Against</option>
                <option value="yardsFor">Total Yards</option>
                <option value="turnoverDifferential">Turnover Differential</option>
              </>
            )}
          </select>
        </div>

        {/* Sort Direction */}
        <div>
          <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Direction
          </label>
          <select
            id="sortDirection"
            value={sortOptions.direction}
            onChange={(e) => onSortChange({ ...sortOptions, direction: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="desc">Highest to Lowest</option>
            <option value="asc">Lowest to Highest</option>
          </select>
        </div>

        {/* Division filtering is now automatic for CFB - only shows FBS and FCS teams */}

        

        {/* Division Filter (NFL specific) */}
        {sport === 'NFL' && (
          <div>
            <label htmlFor="division" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Division
            </label>
            <select
              id="division"
              value={filters.division || ''}
              onChange={(e) => onFiltersChange({ ...filters, division: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Divisions</option>
              <option value="AFC East">AFC East</option>
              <option value="AFC North">AFC North</option>
              <option value="AFC South">AFC South</option>
              <option value="AFC West">AFC West</option>
              <option value="NFC East">NFC East</option>
              <option value="NFC North">NFC North</option>
              <option value="NFC South">NFC South</option>
              <option value="NFC West">NFC West</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}