'use client'

import { SportType } from '@/types'
import { format } from 'date-fns'

interface MatchupFiltersProps {
  sport: SportType
  selectedDate: string
  filters: any
  onDateChange: (date: string) => void
  onFiltersChange: (filters: any) => void
}

export function MatchupFilters({
  sport,
  selectedDate,
  filters,
  onDateChange,
  onFiltersChange
}: MatchupFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Filters
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Selector */}
        <div>
          <label htmlFor="gameDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Game Date
          </label>
          <input
            type="date"
            id="gameDate"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Game Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Game Status
          </label>
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

        {/* Division Filter (CFB only) */}
        {sport === 'CFB' && (
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
              <option value="FBS (I-A)">FBS (I-A)</option>
              <option value="FCS (I-AA)">FCS (I-AA)</option>
              <option value="NCAA Division II">NCAA Division II</option>
              <option value="NCAA Division III">NCAA Division III</option>
            </select>
          </div>
        )}

        {/* Confidence Filter */}
        <div>
          <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prediction Confidence
          </label>
          <select
            id="confidence"
            value={filters.confidence || ''}
            onChange={(e) => onFiltersChange({ ...filters, confidence: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Confidence Levels</option>
            <option value="high">High Confidence (&gt;80%)</option>
            <option value="medium">Medium Confidence (60-80%)</option>
            <option value="low">Low Confidence (&lt;60%)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sport} matchups for {format(new Date(selectedDate), 'MMMM d, yyyy')}
        </div>
        <button
          onClick={() => onDateChange(format(new Date(), 'yyyy-MM-dd'))}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          Today's Games
        </button>
      </div>
    </div>
  )
}