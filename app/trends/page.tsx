'use client'

import { useState, useEffect } from 'react'
import { TrendCard } from '@/components/trends/TrendCard'
import { TrendFilters } from '@/components/trends/TrendFilters'
import { TrendChart } from '@/components/trends/TrendChart'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { TrendData, SportType } from '@/types'
import { useQuery } from 'react-query'
import axios from 'axios'

const fetchTrends = async (
  sport?: SportType,
  category?: string,
  timeframe?: string
): Promise<TrendData[]> => {
  const params = new URLSearchParams()
  if (sport) params.append('sport', sport)
  if (category) params.append('category', category)
  if (timeframe) params.append('timeframe', timeframe)
  
  const response = await axios.get(`/api/trends?${params.toString()}`)
  return response.data.data
}

export default function TrendsPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'ALL'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'betting' | 'performance' | 'weather'>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '15d' | '30d' | 'season'>('15d')
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards')

  const { data: trends, isLoading, refetch } = useQuery(
    ['trends', selectedSport, selectedCategory, selectedTimeframe],
    () => fetchTrends(
      selectedSport === 'ALL' ? undefined : selectedSport,
      selectedCategory === 'all' ? undefined : selectedCategory,
      selectedTimeframe
    ),
    {
      refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    }
  )

  const groupedTrends = trends?.reduce((acc, trend) => {
    const category = trend.type
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(trend)
    return acc
  }, {} as Record<string, TrendData[]>) || {}

  const sortedTrends = trends?.sort((a, b) => {
    // Sort by impact (high > medium > low) then by value
    const impactOrder = { high: 3, medium: 2, low: 1 }
    const aImpact = impactOrder[a.impact]
    const bImpact = impactOrder[b.impact]
    
    if (aImpact !== bImpact) {
      return bImpact - aImpact
    }
    return b.value - a.value
  }) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Market Trends & Patterns
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover betting trends, performance patterns, and market movements across all sports
        </p>
      </div>

      <TrendFilters
        selectedSport={selectedSport}
        selectedCategory={selectedCategory}
        selectedTimeframe={selectedTimeframe}
        viewMode={viewMode}
        onSportChange={setSelectedSport}
        onCategoryChange={setSelectedCategory}
        onTimeframeChange={setSelectedTimeframe}
        onViewModeChange={setViewMode}
        onRefresh={() => refetch()}
        totalTrends={trends?.length || 0}
        highImpactTrends={trends?.filter(t => t.impact === 'high').length || 0}
      />

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="mt-8">
          {viewMode === 'chart' ? (
            <div className="space-y-8">
              <TrendChart trends={sortedTrends} />
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {trends?.filter(t => t.impact === 'high').length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">High Impact Trends</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {trends?.filter(t => t.type === 'betting').length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Betting Trends</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round((trends?.reduce((sum, t) => sum + t.value, 0) || 0) / (trends?.length || 1))}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Trend Strength</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {selectedTimeframe.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Timeframe</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTrends).map(([category, categoryTrends]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {category} Trends
                    </h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                      {categoryTrends.length} {categoryTrends.length === 1 ? 'Trend' : 'Trends'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryTrends.map((trend) => (
                      <TrendCard key={trend.id} trend={trend} />
                    ))}
                  </div>
                </div>
              ))}

              {sortedTrends.length === 0 && !isLoading && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">No trends found</h3>
                    <p>
                      No trends match your current filters. Try adjusting the sport, category, or timeframe.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}