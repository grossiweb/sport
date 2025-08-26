'use client'

import { 
  AdjustmentsHorizontalIcon, 
  ArrowPathIcon,
  FunnelIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface MatchupFiltersProps {
  selectedSport: 'CFB' | 'ALL'
  selectedDate: string
  showOnlyPremium: boolean
  onSportChange: (sport: 'CFB' | 'ALL') => void
  onDateChange: (date: string) => void
  onPremiumToggle: (premium: boolean) => void
  onRefresh: () => void
}

export function MatchupFilters({
  selectedSport,
  selectedDate,
  showOnlyPremium,
  onSportChange,
  onDateChange,
  onPremiumToggle,
  onRefresh
}: MatchupFiltersProps) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Football Matchups
          </h3>
        </div>
        
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sport Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sport
          </label>
          <select
            value={selectedSport}
            onChange={(e) => onSportChange(e.target.value as 'CFB' | 'ALL')}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Sports</option>
            <option value="CFB">College Football</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => onDateChange(today)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedDate === today
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => onDateChange(tomorrow)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedDate === tomorrow
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>
        </div>

        {/* Premium Filter */}
        {/* 
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Premium Picks
          </label>
          <button
            onClick={() => onPremiumToggle(!showOnlyPremium)}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showOnlyPremium
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700'
                : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <StarIcon className="h-4 w-4" />
            <span>{showOnlyPremium ? 'Premium Only' : 'All Games'}</span>
          </button>
        </div>*/}

        {/* Quick Stats */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick View
          </label>
          <div className="space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Live updates every 5 minutes
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Real-time data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      {/*
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Filters
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
            High Total Games (O/U 45+)
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
            Close Spreads (±3)
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
            Rivalry Games
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors">
            Weather Impact
          </button>
        </div>
      </div>*/}
    </div>
  )
}