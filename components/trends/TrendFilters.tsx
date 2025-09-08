'use client'

import { 
  AdjustmentsHorizontalIcon, 
  ArrowPathIcon,
  ChartBarIcon,
  Squares2X2Icon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface TrendFiltersProps {
  selectedSport: 'CFB' | 'ALL'
  selectedCategory: 'all' | 'betting' | 'performance' | 'weather'
  selectedTimeframe: '7d' | '15d' | '30d' | 'season'
  viewMode: 'cards' | 'chart'
  onSportChange: (sport: 'CFB' | 'ALL') => void
  onCategoryChange: (category: 'all' | 'betting' | 'performance' | 'weather') => void
  onTimeframeChange: (timeframe: '7d' | '15d' | '30d' | 'season') => void
  onViewModeChange: (mode: 'cards' | 'chart') => void
  onRefresh: () => void
  totalTrends: number
  highImpactTrends: number
}

const categories = [
  { value: 'all', label: 'All Categories', icon: '📊' },
  { value: 'betting', label: 'Betting', icon: '💰' },
  { value: 'performance', label: 'Performance', icon: '🏆' },
  { value: 'weather', label: 'Weather', icon: '🌤️' }
]

const timeframes = [
  { value: '7d', label: '7 Days' },
  { value: '15d', label: '15 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'season', label: 'Season' }
]

export function TrendFilters({
  selectedSport,
  selectedCategory,
  selectedTimeframe,
  viewMode,
  onSportChange,
  onCategoryChange,
  onTimeframeChange,
  onViewModeChange,
  onRefresh,
  totalTrends,
  highImpactTrends
}: TrendFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Football Trend Analysis
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalTrends} trends • {highImpactTrends} high impact
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
          <button
            onClick={() => onViewModeChange('cards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Squares2X2Icon className="h-4 w-4" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => onViewModeChange('chart')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Chart</span>
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

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as any)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeframe
          </label>
          <select
            value={selectedTimeframe}
            onChange={(e) => onTimeframeChange(e.target.value as any)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {timeframes.map(timeframe => (
              <option key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </option>
            ))}
          </select>
        </div>

        {/* Impact Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Impact Level
          </label>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm rounded-md bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              🔥 High Impact Only
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing trends with significant market influence
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Popular Trends
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
            Home Underdogs
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
            Over/Under Patterns
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
            Division Rivalries
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors">
            Weather Impacts
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors">
            Line Movement
          </button>
          <button className="px-3 py-1 text-xs rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/30 transition-colors">
            Public vs Sharp
          </button>
        </div>
      </div>
    </div>
  )
}