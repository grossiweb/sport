'use client'

import { SportType } from '@/types'
import { format } from 'date-fns'
import { WeekSelector } from './WeekSelector'
import { WeekInfo, getCurrentWeek, getWeekDateRange } from '@/lib/utils/week-utils'

interface MatchupFiltersProps {
  sport: SportType
  selectedWeek: WeekInfo
  filters: any
  onWeekChange: (week: WeekInfo) => void
  onFiltersChange: (filters: any) => void
}

export function MatchupFilters({
  sport,
  selectedWeek,
  filters,
  onWeekChange,
  onFiltersChange
}: MatchupFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Week Selection & Filters
      </h3>
      
		{/* All Filters in One Line (scrolls horizontally on small screens) */}
		<div className="flex flex-row items-center gap-3 md:gap-4 overflow-x-auto whitespace-nowrap">
        {/* Week Selector */}
			<div className="flex-shrink-0 min-w-[160px]">
          <WeekSelector
            currentWeek={selectedWeek}
            onWeekChange={onWeekChange}
          />
        </div>
        
			{/* Vertical Divider */}
			<div className="hidden md:block w-px h-12 bg-gray-200 dark:bg-gray-600"></div>
        
			{/* Other Filters */}
			<div className="flex flex-row items-center gap-3 md:gap-4 flex-1 min-w-0">
			{/* Search Filter first */}
			<div className="min-w-0 sm:min-w-[200px] flex-1">
				<input
					id="search"
					type="text"
					placeholder="Search (team, abbreviation, weekday)"
					value={filters.search || ''}
					onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
					className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			{/* Game Status Filter second */}
			<div className="min-w-[130px] flex-none">
				<select
					id="status"
					value={filters.status || ''}
					onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
					className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
				>
					<option value="">All Games</option>
					<option value="scheduled">Scheduled</option>
					<option value="live">Live</option>
					<option value="final">Final</option>
					<option value="postponed">Postponed</option>
				</select>
			</div>
		</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sport} matchups for {selectedWeek.label} ({selectedWeek.dateRange})
        </div>
        <button
          onClick={() => onWeekChange(getCurrentWeek())}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          Current Week
        </button>
      </div>
    </div>
  )
}