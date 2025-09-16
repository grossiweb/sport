'use client'

import { useState } from 'react'
import { DetailedTeamStat } from '@/types'
import { ChartBarIcon, TrophyIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { filterAndSortStats, STAT_CATEGORIES } from '@/lib/constants/team-stats-config'
import { TeamLogo } from '@/components/ui/TeamLogo'

interface TeamDetailedStatsProps {
  homeTeamStats: DetailedTeamStat[]
  awayTeamStats: DetailedTeamStat[]
  homeTeamName: string
  awayTeamName: string
  homeTeam?: any // Full team object for logo
  awayTeam?: any // Full team object for logo
  isLoading?: boolean
  sport?: 'CFB' | 'NFL'
}

export function TeamDetailedStats({ 
  homeTeamStats, 
  awayTeamStats, 
  homeTeamName, 
  awayTeamName, 
  homeTeam,
  awayTeam,
  isLoading,
  sport = 'CFB'
}: TeamDetailedStatsProps) {
  const [activeView, setActiveView] = useState<'comparison' | 'home' | 'away'>('comparison')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter and sort stats using the configuration
  const filteredHomeStats = filterAndSortStats(homeTeamStats, sport)
  const filteredAwayStats = filterAndSortStats(awayTeamStats, sport)

  // Create a combined view for head-to-head comparison
  const createComparisonData = () => {
    const comparisonMap = new Map()
    
    // Add home team stats
    filteredHomeStats.forEach(stat => {
      const key = stat.stat?.abbreviation || stat.stat?.name
      if (key) {
        comparisonMap.set(key, {
          ...stat,
          homeValue: stat.display_value || stat.value,
          homeRank: stat.rank_display_value || stat.rank,
          awayValue: null,
          awayRank: null
        })
      }
    })
    
    // Add away team stats
    filteredAwayStats.forEach(stat => {
      const key = stat.stat?.abbreviation || stat.stat?.name
      if (key) {
        const existing = comparisonMap.get(key)
        if (existing) {
          existing.awayValue = stat.display_value || stat.value
          existing.awayRank = stat.rank_display_value || stat.rank
        } else {
          comparisonMap.set(key, {
            ...stat,
            homeValue: null,
            homeRank: null,
            awayValue: stat.display_value || stat.value,
            awayRank: stat.rank_display_value || stat.rank
          })
        }
      }
    })
    
    return Array.from(comparisonMap.values())
  }

  const comparisonData = createComparisonData()

  // Get unique categories
  const categories = ['all', ...new Set(comparisonData.map(stat => stat.stat?.category).filter(Boolean))]

  // Filter by category
  const filteredData = selectedCategory === 'all' 
    ? comparisonData 
    : comparisonData.filter(stat => stat.stat?.category === selectedCategory)

  // Helper function to compare values and determine winner
  const getWinnerIndicator = (homeValue: any, awayValue: any, statName: string) => {
    if (!homeValue || !awayValue) return null
    
    const homeNum = parseFloat(String(homeValue).replace(/[^0-9.-]/g, ''))
    const awayNum = parseFloat(String(awayValue).replace(/[^0-9.-]/g, ''))
    
    if (isNaN(homeNum) || isNaN(awayNum)) return null
    
    // For some stats, lower is better (like turnovers, penalties)
    const lowerIsBetter = ['TO', 'TPEN', 'TPY', 'INT_THROWN'].includes(statName)
    
    if (lowerIsBetter) {
      return homeNum < awayNum ? 'home' : awayNum < homeNum ? 'away' : null
    } else {
      return homeNum > awayNum ? 'home' : awayNum > homeNum ? 'away' : null
    }
  }

  const ViewToggle = () => (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
      {[
        { id: 'comparison', name: 'Head-to-Head', icon: ChartBarIcon },
        { id: 'home', name: homeTeamName, icon: TrophyIcon },
        { id: 'away', name: awayTeamName, icon: TrophyIcon }
      ].map((view) => {
        const Icon = view.icon
        return (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id as any)}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeView === view.id
                ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {view.name}
          </button>
        )
      })}
    </div>
  )

  const CategoryFilter = () => (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category === 'all' ? 'All Stats' : category}
          </button>
        ))}
      </div>
    </div>
  )

  const ComparisonView = () => (
    <div className="space-y-4">
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No statistics available for comparison.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg font-semibold text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              {homeTeam && <TeamLogo team={homeTeam} size="xs" className="mr-2" />}
              {homeTeamName}
            </div>
            <div className="text-center">Stat</div>
            <div className="text-center">Winner</div>
            <div className="text-center">Stat</div>
            <div className="flex items-center justify-end">
              {awayTeam && <TeamLogo team={awayTeam} size="xs" className="mr-2" />}
              {awayTeamName}
            </div>
          </div>

          {/* Stats Rows */}
          {filteredData.map((stat, index) => {
            const winner = getWinnerIndicator(stat.homeValue, stat.awayValue, stat.stat?.abbreviation)
            
            return (
              <div
                key={`${stat.stat?.id}-${index}`}
                className="grid grid-cols-5 gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
              >
                {/* Home Value */}
                <div className={`text-right font-semibold ${
                  winner === 'home' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {stat.homeValue || '-'}
                  {stat.homeRank && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      (#{stat.homeRank})
                    </span>
                  )}
                </div>

                {/* Stat Name */}
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {stat.stat?.abbreviation || stat.stat?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.stat?.display_name}
                  </div>
                </div>

                {/* Winner Indicator */}
                <div className="flex justify-center">
                  {winner === 'home' && (
                    <ArrowUpIcon className="h-5 w-5 text-green-500 transform -rotate-45" />
                  )}
                  {winner === 'away' && (
                    <ArrowUpIcon className="h-5 w-5 text-green-500 transform rotate-45" />
                  )}
                  {!winner && stat.homeValue && stat.awayValue && (
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  )}
                </div>

                {/* Away Value */}
                <div className={`text-left font-semibold ${
                  winner === 'away' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {stat.awayValue || '-'}
                  {stat.awayRank && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      (#{stat.awayRank})
                    </span>
                  )}
                </div>

                {/* Placeholder for alignment */}
                <div></div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )

  const TeamView = ({ stats, teamName, team }: { stats: DetailedTeamStat[], teamName: string, team?: any }) => {
    const filteredStats = filterAndSortStats(stats, sport)
    const categoryStats = selectedCategory === 'all' 
      ? filteredStats 
      : filteredStats.filter(stat => stat.stat?.category === selectedCategory)

    return (
      <div className="space-y-4">
        {/* Team Header */}
        <div className="flex items-center mb-6">
          {team && <TeamLogo team={team} size="md" className="mr-3" />}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{teamName}</h3>
        </div>

        {categoryStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No statistics available for {teamName}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((stat, index) => (
              <div
                key={`${stat.team_id}-${stat.stat_id}-${index}`}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stat.display_value || stat.value}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {stat.stat?.display_name || stat.stat?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {stat.stat?.abbreviation}
                  </div>
                  {stat.rank_display_value && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Rank: #{stat.rank_display_value}
                    </div>
                  )}
                  {stat.per_game_display_value && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Per Game: {stat.per_game_display_value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team Statistics Comparison
          </h2>
        </div>

        <ViewToggle />
        <CategoryFilter />

        {activeView === 'comparison' && <ComparisonView />}
        {activeView === 'home' && (
          <TeamView stats={homeTeamStats} teamName={homeTeamName} team={homeTeam} />
        )}
        {activeView === 'away' && (
          <TeamView stats={awayTeamStats} teamName={awayTeamName} team={awayTeam} />
        )}
      </div>
    </div>
  )
}