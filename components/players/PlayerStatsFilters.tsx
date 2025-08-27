'use client'

import { SportType } from '@/types'

interface PlayerStatsFiltersProps {
  sport: SportType
  selectedSeason: string
  selectedTeam: string
  filters: any
  sortOptions: {
    field: string
    direction: 'asc' | 'desc'
  }
  onSeasonChange: (season: string) => void
  onTeamChange: (team: string) => void
  onFiltersChange: (filters: any) => void
  onSortChange: (sortOptions: any) => void
}

export function PlayerStatsFilters({
  sport,
  selectedSeason,
  selectedTeam,
  filters,
  sortOptions,
  onSeasonChange,
  onTeamChange,
  onFiltersChange,
  onSortChange
}: PlayerStatsFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Filters & Sorting
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Season */}
        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Season
          </label>
          <select
            id="season"
            value={selectedSeason}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        {/* Team */}
        <div>
          <label htmlFor="team" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team
          </label>
          <select
            id="team"
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Teams</option>
            {/* Teams would be loaded dynamically */}
          </select>
        </div>

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
            {sport === 'CFB' || sport === 'NFL' ? (
              <>
                <option value="passingYards">Passing Yards</option>
                <option value="passingTouchdowns">Passing TDs</option>
                <option value="rushingYards">Rushing Yards</option>
                <option value="rushingTouchdowns">Rushing TDs</option>
                <option value="receivingYards">Receiving Yards</option>
                <option value="receivingTouchdowns">Receiving TDs</option>
                <option value="receptions">Receptions</option>
              </>
            ) : (
              <option value="points">Points</option>
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
      </div>

      {/* Position Filter */}
      <div className="mt-4">
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Position
        </label>
        <select
          id="position"
          value={filters.position || ''}
          onChange={(e) => onFiltersChange({ ...filters, position: e.target.value })}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Positions</option>
          {sport === 'CFB' || sport === 'NFL' ? (
            <>
              <option value="QB">Quarterback</option>
              <option value="RB">Running Back</option>
              <option value="WR">Wide Receiver</option>
              <option value="TE">Tight End</option>
              <option value="K">Kicker</option>
              <option value="DEF">Defense</option>
            </>
          ) : null}
        </select>
      </div>
    </div>
  )
}