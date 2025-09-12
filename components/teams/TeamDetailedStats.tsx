'use client'

import { useState } from 'react'
import { DetailedTeamStat } from '@/types'
import { ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface TeamDetailedStatsProps {
  homeTeamStats: DetailedTeamStat[]
  awayTeamStats: DetailedTeamStat[]
  homeTeamName: string
  awayTeamName: string
  isLoading?: boolean
  sport?: 'CFB' | 'NFL'
}

// Define the exact order and ONLY allowed stats for CFB matchup detail pages
// ONLY these stats will be displayed - all other stats will be filtered out
const PREFERRED_STAT_ORDER = [
  'SACKS', 'SCKYDS', 'STF', 'AVG', 'KB', 'TFL', 'GP', 'INT', 'YDS', 'TD', 
  'FUM', 'FF', 'FR', 'FTD', 'GP', 'FGM', 'FGA', 'PCT', 'LONG', 'FGA 1-19', 
  'FGA 20-29', 'FGA 30-39', 'FGA 40-49', 'FGA 50+', 'XPM', 'XPA', 'XP%', 
  'FGM 1-19', 'FGM 20-29', 'FGM 30-39', 'FGM 40-49', '50+', 'PTS', 'GP', 
  'KR', 'FDPEN', '3RDC', '3RDA', '3RDC%', '4THC', 'FDA', '4THC%', 'TPEN', 
  'TPY', 'POSS', 'RZFG%', 'RZ%', 'CMP', 'RZTD%', 'TT', 'TGV', 'DIFF', 'NO', 
  'YDS', 'In 20', 'TB', 'FC', 'YDS', 'AVG', 'GP', 'NO', 'YDS', 'AVG', 'TD', 
  'FC', 'KRFL', 'PRFL', 'GP', 'TD', 'TD', 'RET', 'TD', 'FG', '2PT', 'PTS', 
  'TP/G', 'PAT'
]

// Define preferred NFL stats to show (most relevant for matchup analysis)
const NFL_PREFERRED_STATS = [
  'PTS', 'YDS', 'PYDS', 'RYDS', 'TO', 'SACKS', 'INT', 'FUM', 'TD', 'FGM', 'FGA',
  '3RDC', '3RDA', '3RDC%', 'RZ%', 'TPEN', 'TPY', 'POSS', 'DIFF'
]

export function TeamDetailedStats({ 
  homeTeamStats, 
  awayTeamStats, 
  homeTeamName, 
  awayTeamName, 
  isLoading,
  sport = 'CFB'
}: TeamDetailedStatsProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home')

  // Function to sort stats based on preferred order from Excel file
  const sortStatsByPreferredOrder = (stats: DetailedTeamStat[]) => {
    return stats.sort((a, b) => {
      if (sport === 'NFL') {
        // For NFL, prioritize by NFL_PREFERRED_STATS order
        const aIndex = NFL_PREFERRED_STATS.indexOf(a.stat.abbreviation)
        const bIndex = NFL_PREFERRED_STATS.indexOf(b.stat.abbreviation)
        
        // If both stats are in preferred order, sort by their order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }
        
        // If only one is in preferred order, prioritize it
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
        
        // If neither is in preferred order, sort alphabetically by display name
        return a.stat.display_name.localeCompare(b.stat.display_name)
      } else {
        // For CFB, use the existing logic
        const aIndex = PREFERRED_STAT_ORDER.indexOf(a.stat.abbreviation)
        const bIndex = PREFERRED_STAT_ORDER.indexOf(b.stat.abbreviation)
        
        // If both stats are in preferred order, sort by their order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }
        
        // If only one is in preferred order, prioritize it
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
        
        // If neither is in preferred order, sort by stat_id
        return a.stat_id - b.stat_id
      }
    })
  }

  // Function to deduplicate stats by multiple criteria, keeping the first occurrence
  const deduplicateStats = (stats: DetailedTeamStat[]) => {
    const seen = new Set<string>()
    return stats.filter(stat => {
      // Create a unique key using both abbreviation and display name to catch different types of duplicates
      const key = `${stat.stat.abbreviation}|${stat.stat.display_name}|${stat.stat.name}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  // Function to filter stats - For CFB, use preferred order; for NFL, show preferred NFL stats (deduplicated)
  const filterStatsFromExcel = (stats: DetailedTeamStat[]) => {
    if (sport === 'NFL') {
      // For NFL, show preferred NFL stats but deduplicated
      const filteredStats = stats.filter(stat => 
        NFL_PREFERRED_STATS.includes(stat.stat.abbreviation) ||
        stat.stat.display_name.toLowerCase().includes('points') ||
        stat.stat.display_name.toLowerCase().includes('yards') ||
        stat.stat.display_name.toLowerCase().includes('touchdown') ||
        stat.stat.display_name.toLowerCase().includes('sack') ||
        stat.stat.display_name.toLowerCase().includes('interception') ||
        stat.stat.display_name.toLowerCase().includes('fumble')
      )
      return deduplicateStats(filteredStats)
    }
    // For CFB, ONLY include stats that are in the PREFERRED_STAT_ORDER list (also deduplicated)
    const filteredStats = stats.filter(stat => 
      PREFERRED_STAT_ORDER.includes(stat.stat.abbreviation)
    )
    return deduplicateStats(filteredStats)
  }

  const getRankColor = (rank?: number) => {
    if (!rank) return 'text-gray-500 dark:text-gray-400'
    if (rank <= 10) return 'text-green-600 dark:text-green-400'
    if (rank <= 25) return 'text-blue-600 dark:text-blue-400'
    if (rank <= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const currentStats = activeTab === 'home' ? homeTeamStats : awayTeamStats
  const currentTeamName = activeTab === 'home' ? homeTeamName : awayTeamName
  
  // Filter and sort stats based on Excel file
  const filteredAndSortedStats = currentStats ? 
    sortStatsByPreferredOrder(filterStatsFromExcel(currentStats)) : []

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex space-x-4 mb-6">
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if ((!homeTeamStats || homeTeamStats.length === 0) && (!awayTeamStats || awayTeamStats.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Detailed Stats Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {sport === 'CFB' 
              ? 'Detailed statistics are only available for FBS (I-A) and FCS (I-AA) teams.'
              : 'No detailed statistics available for these teams.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header with Tabs */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrophyIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Statistics Comparison
            </h3>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          <button
            onClick={() => setActiveTab('away')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'away'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {awayTeamName} (Away)
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'home'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {homeTeamName} (Home)
          </button>
        </div>
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statistic
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Per Game
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedStats.map((stat, index) => (
              <tr 
                key={`${stat.stat_id}-${stat.team_id}`}
                className={`${
                  index % 2 === 0 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-gray-50 dark:bg-gray-750'
                } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stat.stat.display_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.stat.abbreviation}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {stat.display_value}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {stat.per_game_display_value || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {stat.rank ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankColor(stat.rank)} bg-gray-100 dark:bg-gray-700`}>
                      #{stat.rank}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    {stat.stat.description || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {filteredAndSortedStats.length} statistics for {currentTeamName}
          </div>
          <div>
            {filteredAndSortedStats.length > 0 && (
              <>Season: {filteredAndSortedStats[0]?.season_year} | Type: {filteredAndSortedStats[0]?.season_type_name}</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
