'use client'

import { TrendData } from '@/types'
import { 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  ArrowTrendingDownIcon as TrendingDownIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface TrendCardProps {
  trend: TrendData
}

export function TrendCard({ trend }: TrendCardProps) {
  const getImpactIcon = () => {
    switch (trend.impact) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'medium':
        return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getImpactColor = () => {
    switch (trend.impact) {
      case 'high':
        return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    }
  }

  const getTrendIcon = () => {
    if (trend.value > 0) {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />
    } else {
      return <TrendingDownIcon className="h-4 w-4 text-red-500" />
    }
  }

  const getTypeEmoji = () => {
    switch (trend.type) {
      case 'betting':
        return '💰'
      case 'team':
        return '🏈'
      case 'player':
        return '👤'
      case 'weather':
        return '🌤️'
      default:
        return '📊'
    }
  }

  const getTimeframeText = () => {
    switch (trend.timeframe) {
      case '7d':
        return '7 days'
      case '15d':
        return '15 days'
      case '30d':
        return '30 days'
      case 'season':
        return 'season'
      default:
        return 'recent'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTypeEmoji()}</div>
          <div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImpactColor()}`}>
              {getImpactIcon()}
              <span className="ml-1 capitalize">{trend.impact} Impact</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={clsx(
              'text-lg font-bold',
              trend.value > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {trend.value > 0 ? '+' : ''}{Math.round(trend.value)}%
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getTimeframeText()}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-white font-medium mb-2">
          {trend.description}
        </p>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Trend Strength</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={clsx(
                  'h-2 rounded-full',
                  Math.abs(trend.value) >= 70 ? 'bg-red-500' :
                  Math.abs(trend.value) >= 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                )}
                style={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.abs(trend.value)}%
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Category</span>
          <span className="font-medium text-gray-900 dark:text-white capitalize">
            {trend.type}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Timeframe</span>
          <span className="font-medium text-gray-900 dark:text-white">
            Last {getTimeframeText()}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
            View Details
          </button>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <button className="text-xs font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
            Track Trend
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className={clsx(
            'w-2 h-2 rounded-full',
            trend.impact === 'high' ? 'bg-red-500' :
            trend.impact === 'medium' ? 'bg-yellow-500' :
            'bg-green-500'
          )}></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Active
          </span>
        </div>
      </div>

      {/* Additional Context */}
      {trend.impact === 'high' && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                High Impact Alert
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                This trend shows significant market influence and may affect betting lines.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}