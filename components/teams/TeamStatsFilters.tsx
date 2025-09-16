'use client'

import { SportType, TeamFiltersState } from '@/types'

interface TeamStatsFiltersProps {
  sport: SportType
  filters: TeamFiltersState
  sortOptions: {
    field: string
    direction: 'asc' | 'desc'
  }
  onFiltersChange: (filters: TeamFiltersState) => void
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Team Name Filter */}
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={filters.teamName || ''}
            onChange={(e) => onFiltersChange({ ...filters, teamName: e.target.value })}
            placeholder="Search teams..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Subdivision Filter (CFB specific) */}
        {sport === 'CFB' && (
          <div>
            <label htmlFor="subdivision" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subdivision
            </label>
            <select
              id="subdivision"
              value={filters.subdivision || ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                subdivision: e.target.value ? e.target.value as 'FBS (I-A)' | 'FCS (I-AA)' : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Subdivisions</option>
              <option value="FBS (I-A)">FBS (I-A)</option>
              <option value="FCS (I-AA)">FCS (I-AA)</option>
            </select>
          </div>
        )}

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
              <option value="NFC West">NFC West</option>
              <option value="NFC South">NFC South</option>
              <option value="AFC North">AFC North</option>
              <option value="AFC East">AFC East</option>
              <option value="NFC North">NFC North</option>
              <option value="NFC East">NFC East</option>
              <option value="AFC West">AFC West</option>
              <option value="AFC South">AFC South</option>
            </select>
          </div>
        )}

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
            onChange={(e) => onSortChange({ ...sortOptions, direction: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>
      </div>
    </div>
  )
}