'use client'

import { 
  AdjustmentsHorizontalIcon, 
  ArrowPathIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface PredictionFiltersProps {
  selectedSport: 'CFB' | 'ALL'
  selectedDate: string
  minConfidence: number
  viewMode: 'today' | 'upcoming' | 'results'
  onSportChange: (sport: 'CFB' | 'ALL') => void
  onDateChange: (date: string) => void
  onConfidenceChange: (confidence: number) => void
  onViewModeChange: (mode: 'today' | 'upcoming' | 'results') => void
  onRefresh: () => void
}

const confidenceOptions = [
  { value: 0.5, label: '50%+', color: 'bg-gray-100 text-gray-800' },
  { value: 0.65, label: '65%+', color: 'bg-blue-100 text-blue-800' },
  { value: 0.8, label: '80%+', color: 'bg-green-100 text-green-800' },
  { value: 0.9, label: '90%+', color: 'bg-purple-100 text-purple-800' }
]

const viewModes = [
  { value: 'today', label: "Today's Games", icon: '📅' },
  { value: 'upcoming', label: 'Upcoming', icon: '⏰' },
  { value: 'results', label: 'Results', icon: '📊' }
]

export function PredictionFilters({
  selectedSport,
  selectedDate,
  minConfidence,
  viewMode,
  onSportChange,
  onDateChange,
  onConfidenceChange,
  onViewModeChange,
  onRefresh
}: PredictionFiltersProps) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Football Predictions
          </h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live AI Analysis</span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          View Mode
        </label>
        <div className="flex space-x-2">
          {viewModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onViewModeChange(mode.value as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
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
            <div className="flex space-x-1">
              <button
                onClick={() => onDateChange(yesterday)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedDate === yesterday
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => onDateChange(today)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedDate === today
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => onDateChange(tomorrow)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
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

        {/* Confidence Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Confidence
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={minConfidence}
                onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                {Math.round(minConfidence * 100)}%
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {confidenceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onConfidenceChange(option.value)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    minConfidence === option.value
                      ? 'bg-primary-600 text-white'
                      : `${option.color} hover:bg-opacity-80`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Model
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <ChartBarIcon className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                StatsPro ML v2.1
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Updated: Real-time<br />
              Features: 150+ variables<br />
              Training: 10K+ games
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Advanced Filters
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
            High Value Bets
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
            Upset Alerts
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
            Prime Time Games
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors">
            Model Consensus
          </button>
        </div>
      </div>
    </div>
  )
}