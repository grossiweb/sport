'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  ArrowTrendingDownIcon as TrendingDownIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline'

interface StatItem {
  id: string
  label: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  sport: string
}

const mockStats: StatItem[] = [
  {
    id: '1',
    label: 'Top Team OPS',
    value: '.892',
    change: 2.3,
    changeType: 'increase',
    sport: 'MLB'
  },
  {
    id: '2',
    label: 'Best Team ERA',
    value: '2.84',
    change: -0.12,
    changeType: 'decrease',
    sport: 'MLB'
  },
  {
    id: '3',
    label: 'Highest Scoring Offense',
    value: '34.2 PPG',
    change: 3.1,
    changeType: 'increase',
    sport: 'NFL'
  },
  {
    id: '4',
    label: 'Best Defense',
    value: '12.8 PPG',
    change: -1.4,
    changeType: 'decrease',
    sport: 'NFL'
  },
]

export function KeyStats() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats)
      setIsLoading(false)
    }, 800)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <KeyStatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )
}

function KeyStatCard({ stat }: { stat: StatItem }) {
  const isPositiveChange = 
    (stat.changeType === 'increase' && stat.change > 0) ||
    (stat.changeType === 'decrease' && stat.change < 0)

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="stat-label">{stat.label}</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {stat.sport}
            </span>
          </div>
          <p className="stat-value">{stat.value}</p>
          <div className="flex items-center mt-2">
            {isPositiveChange ? (
              <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {Math.abs(stat.change)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              vs last week
            </span>
          </div>
        </div>
        <div className="ml-4">
          <ChartBarIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </div>
  )
}