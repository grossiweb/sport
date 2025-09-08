'use client'

import { 
  AdjustmentsHorizontalIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface BettingFiltersProps {
  selectedSport: 'CFB' | 'ALL'
  selectedDate: string
  showOnlyRLM: boolean
  onSportChange: (sport: 'CFB' | 'ALL') => void
  onDateChange: (date: string) => void
  onRLMToggle: (rlm: boolean) => void
  onRefresh: () => void
  totalGames: number
  rlmGames: number
}

export function BettingFilters({
  selectedSport,
  selectedDate,
  showOnlyRLM,
  onSportChange,
  onDateChange,
  onRLMToggle,
  onRefresh,
  totalGames,
  rlmGames
}: BettingFiltersProps) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Football Betting Markets
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {totalGames} games
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {rlmGames} RLM alerts
              </span>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh Lines</span>
          </button>
        </div>
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
            <option value="CFB">NCAAF</option>
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

        {/* RLM Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Special Filters
          </label>
          <button
            onClick={() => onRLMToggle(!showOnlyRLM)}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showOnlyRLM
                ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
                : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{showOnlyRLM ? 'RLM Only' : 'All Games'}</span>
          </button>
        </div>

        {/* Live Updates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Live Data
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                Live Updates
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Lines refresh every 2 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {totalGames}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Active Games</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {rlmGames}
            </div>
            <div className="text-gray-600 dark:text-gray-400">RLM Alerts</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              Live
            </div>
            <div className="text-gray-600 dark:text-gray-400">Market Status</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              2min
            </div>
            <div className="text-gray-600 dark:text-gray-400">Update Frequency</div>
          </div>
        </div>
      </div>
    </div>
  )
}