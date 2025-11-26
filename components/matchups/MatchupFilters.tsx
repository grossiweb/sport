'use client'

import { SportType } from '@/types'
import { WeekSelector } from './WeekSelector'
import { NcaabDatePicker } from './NcaabDatePicker'
import { NbaDatePicker } from './NbaDatePicker'
import { WeekInfo, getCurrentSeasonWeekForSport } from '@/lib/utils/week-utils'
import { format } from 'date-fns'

interface MatchupFiltersProps {
  sport: SportType
  selectedWeek?: WeekInfo
  selectedDate?: Date
  filters: any
  onWeekChange?: (week: WeekInfo) => void
  onDateChange?: (date: Date) => void
  onFiltersChange: (filters: any) => void
}

export function MatchupFilters({
  sport,
  selectedWeek,
  selectedDate,
  filters,
  onWeekChange,
  onDateChange,
  onFiltersChange
}: MatchupFiltersProps) {
	const isNcaab = sport === 'NCAAB'
  const isNba = sport === 'NBA'
  const isDaily = isNcaab || isNba

  return (
    <div>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        {isDaily ? 'Date Selection & Filters' : 'Week Selection & Filters'}
      </h3>
      
		{/* Responsive: Row 1 = Week/Date; Row 2 = Search (left) + Status (right) */}
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			{/* Row 1: Week Selector or Date Picker */}
			<div className="relative z-10">
				{isNcaab && selectedDate && onDateChange ? (
					<NcaabDatePicker
						selectedDate={selectedDate}
						onDateChange={onDateChange}
						className="w-full"
					/>
				) : isNba && selectedDate && onDateChange ? (
          <NbaDatePicker
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            className="w-full"
          />
        ) : selectedWeek && onWeekChange ? (
					<WeekSelector
						currentWeek={selectedWeek}
						onWeekChange={onWeekChange}
						className="w-full"
					/>
				) : null}
			</div>

			{/* Row 2: Search + Status */}
			<div className="flex items-stretch sm:items-center gap-3 sm:flex-1">
				{/* Search (left) */}
				<div className="flex-1 min-w-0">
					<input
						id="search"
						type="text"
						placeholder="Search (team, abbreviation, weekday)"
						value={filters.search || ''}
						onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				{/* Status (right) */}
				<div className="flex-none w-40">
					<select
						id="status"
						value={filters.status || ''}
						onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
					>
						<option value="">All Games</option>
						<option value="scheduled">Scheduled</option>
						<option value="final">Final</option>
					</select>
				</div>
			</div>
		</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isDaily && selectedDate ? (
            <>Showing {sport} matchups for {format(selectedDate, 'MMMM d, yyyy')}</>
          ) : selectedWeek ? (
            <>Showing {sport} matchups for {selectedWeek.dateRange}</>
          ) : null}
        </div>
        {isNcaab && onDateChange ? (
          <button
            onClick={() => onDateChange(new Date())}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Today
          </button>
        ) : onWeekChange ? (
          <button
            onClick={() => onWeekChange(getCurrentSeasonWeekForSport(sport))}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Current Week
          </button>
        ) : null}
      </div>
    </div>
  )
}