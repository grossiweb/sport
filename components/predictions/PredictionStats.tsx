'use client'

import { 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  ArrowTrendingDownIcon as TrendingDownIcon, 
  CheckBadgeIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline'

interface PredictionStatsProps {
  stats: {
    totalPredictions: number
    correctPredictions: number
    accuracy: number
    highConfidenceAccuracy: number
    avgConfidence: number
    bestSport: string
    weeklyTrend: number
  }
}

export function PredictionStats({ stats }: PredictionStatsProps) {
  const {
    totalPredictions,
    correctPredictions,
    accuracy,
    highConfidenceAccuracy,
    avgConfidence,
    bestSport,
    weeklyTrend
  } = stats

  const statCards = [
    {
      label: 'Overall Accuracy',
      value: `${Math.round(accuracy * 100)}%`,
      subValue: `${correctPredictions}/${totalPredictions}`,
      icon: CheckBadgeIcon,
      color: accuracy >= 0.6 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400',
      bgColor: accuracy >= 0.6 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      label: 'High Confidence',
      value: `${Math.round(highConfidenceAccuracy * 100)}%`,
      subValue: '80%+ confidence picks',
      icon: BoltIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Average Confidence',
      value: `${Math.round(avgConfidence * 100)}%`,
      subValue: 'All predictions',
      icon: TrendingUpIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Weekly Trend',
      value: `${weeklyTrend > 0 ? '+' : ''}${weeklyTrend.toFixed(1)}%`,
      subValue: 'vs last week',
      icon: weeklyTrend >= 0 ? TrendingUpIcon : TrendingDownIcon,
      color: weeklyTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: weeklyTrend >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Performance Metrics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time tracking of prediction accuracy and model performance
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">Best Sport</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {bestSport}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            
            <div className="mt-4">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stat.subValue}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-1">
              Model Reliability
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Our AI model shows {accuracy >= 0.65 ? 'strong' : accuracy >= 0.55 ? 'moderate' : 'developing'} 
              {' '}predictive accuracy across all sports with continuous learning improvements.
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-1">
              Confidence Correlation
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              High confidence predictions (80%+) maintain {Math.round(highConfidenceAccuracy * 100)}% accuracy, 
              validating our confidence scoring system.
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-1">
              Continuous Improvement
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Weekly performance tracking shows {weeklyTrend >= 0 ? 'positive' : 'negative'} trend 
              with ongoing model refinements and data integration.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}