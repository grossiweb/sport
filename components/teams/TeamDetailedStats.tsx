'use client'

import { useState } from 'react'
import { DetailedTeamStat } from '@/types'
import { ChartBarIcon, TrophyIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { filterAndSortStats, STAT_CATEGORIES, mapCfbStatToCategory } from '@/lib/constants/team-stats-config'
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
  viewMode?: 'comparison' | 'single' // New prop to control view mode
}

export function TeamDetailedStats({ 
  homeTeamStats, 
  awayTeamStats, 
  homeTeamName, 
  awayTeamName, 
  homeTeam,
  awayTeam,
  isLoading,
  sport = 'CFB',
  viewMode = 'comparison'
}: TeamDetailedStatsProps) {
  const [activeView, setActiveView] = useState<'comparison' | 'home' | 'away'>(
    viewMode === 'single' ? 'home' : 'comparison'
  )
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Sanitize rank text by removing leading '#' and any 'Tied-' prefix
  const formatRankDisplay = (rank: string | number | undefined | null): string | null => {
    if (rank === undefined || rank === null) return null
    const raw = String(rank).trim()
    if (!raw) return null
    const noHash = raw.replace(/^#+\s*/, '')
    const noTied = noHash.replace(/tied[-\s]?/i, '')
    return noTied
  }

  // Parse a numeric value from display strings or numbers
  const getNumeric = (value: any): number | null => {
    if (value === null || value === undefined) return null
    if (typeof value === 'number') return isFinite(value) ? value : null
    const str = String(value)
    const num = parseFloat(str.replace(/[^0-9.-]/g, ''))
    return isNaN(num) ? null : num
  }

  // Deduplicate stats by display name (case-insensitive)
  // Preference order: has per_game_display_value > has rank > newer updated_at
  const deduplicateByDisplayName = (stats: DetailedTeamStat[]): DetailedTeamStat[] => {
    const toKey = (s: DetailedTeamStat) => (s.stat?.display_name || s.stat?.name || '').trim().toLowerCase()
    const choosePreferred = (a: DetailedTeamStat, b: DetailedTeamStat) => {
      const aPer = a.per_game_display_value != null
      const bPer = b.per_game_display_value != null
      if (aPer !== bPer) return aPer ? a : b

      const aRank = a.rank != null || (a as any).rank_display_value
      const bRank = b.rank != null || (b as any).rank_display_value
      if (aRank !== bRank) return aRank ? a : b

      const aTime = a.updated_at ? Date.parse(a.updated_at) : 0
      const bTime = b.updated_at ? Date.parse(b.updated_at) : 0
      if (aTime !== bTime) return aTime > bTime ? a : b

      return a
    }
    const map = new Map<string, DetailedTeamStat>()
    for (const s of stats) {
      const key = toKey(s)
      if (!key) continue
      const existing = map.get(key)
      if (!existing) {
        map.set(key, s)
      } else {
        map.set(key, choosePreferred(existing, s))
      }
    }
    return Array.from(map.values())
  }

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
  const filteredHomeStats = deduplicateByDisplayName(filterAndSortStats(homeTeamStats, sport))
  const filteredAwayStats = deduplicateByDisplayName(filterAndSortStats(awayTeamStats, sport))

  // Create a combined view for head-to-head comparison
  const createComparisonData = () => {
    const comparisonMap = new Map()
    
    // Add home team stats
    filteredHomeStats.forEach(stat => {
      const key = stat.stat?.display_name || stat.stat?.name
      if (key) {
        comparisonMap.set(key, {
          ...stat,
          homeValue: stat.display_value || stat.value,
          homePerGame: stat.per_game_display_value || null,
          homeRank: stat.rank_display_value || stat.rank,
          awayValue: null,
          awayPerGame: null,
          awayRank: undefined
        })
      }
    })
    
    // Add away team stats
    filteredAwayStats.forEach(stat => {
      const key = stat.stat?.display_name || stat.stat?.name
      if (key) {
        const existing = comparisonMap.get(key)
        if (existing) {
          existing.awayValue = stat.display_value || stat.value
          existing.awayPerGame = stat.per_game_display_value || null
          existing.awayRank = stat.rank_display_value || stat.rank
        } else {
          comparisonMap.set(key, {
            ...stat,
            homeValue: null,
            homePerGame: null,
            homeRank: undefined,
            awayValue: stat.display_value || stat.value,
            awayPerGame: stat.per_game_display_value || null,
            awayRank: stat.rank_display_value || stat.rank
          })
        }
      }
    })
    
    return Array.from(comparisonMap.values())
  }

  const comparisonData = createComparisonData()

  // Get unique categories (use CFB-specific mapping if applicable)
  const computedCategories = comparisonData.map(stat => (
    sport === 'CFB' ? mapCfbStatToCategory(stat) : (stat.stat?.category || STAT_CATEGORIES.OFFENSE)
  ))
  const categoryOrder = sport === 'CFB'
    ? [
        'all',
        STAT_CATEGORIES.KEY_FACTORS,
        STAT_CATEGORIES.OFFENSE,
        STAT_CATEGORIES.DEFENSIVE,
        STAT_CATEGORIES.SPECIAL_TEAMS,
        STAT_CATEGORIES.TURNOVERS_PENALTIES
      ]
    : ['all', ...Array.from(new Set(comparisonData.map(stat => stat.stat?.category).filter(Boolean)))]
  const categories = sport === 'CFB'
    ? categoryOrder.filter((c, idx) => idx === 0 || computedCategories.includes(c as any))
    : categoryOrder

  // Filter by category
  const filteredData = selectedCategory === 'all' 
    ? comparisonData 
    : comparisonData.filter(stat => (
        sport === 'CFB' 
          ? mapCfbStatToCategory(stat) === selectedCategory 
          : stat.stat?.category === selectedCategory
      ))

  // Helper function to compare values and determine winner
  const getWinnerIndicator = (homeValue: any, awayValue: any, statLabel: string) => {
    if (!homeValue || !awayValue) return null
    
    const homeNum = parseFloat(String(homeValue).replace(/[^0-9.-]/g, ''))
    const awayNum = parseFloat(String(awayValue).replace(/[^0-9.-]/g, ''))
    
    if (isNaN(homeNum) || isNaN(awayNum)) return null
    
    // For some stats, lower is better (turnovers, penalties, interceptions)
    const statLower = (statLabel || '').toLowerCase()
    const lowerIsBetter = ['penalt', 'turnover', 'interception', 'fumble'].some(k => statLower.includes(k))
    
    if (lowerIsBetter) {
      return homeNum < awayNum ? 'home' : awayNum < homeNum ? 'away' : null
    } else {
      return homeNum > awayNum ? 'home' : awayNum > homeNum ? 'away' : null
    }
  }

  // Format display value with integer rounding only; preserve percent sign if present
  const formatValueDisplay = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') {
      return String(Math.round(value))
    }
    const str = String(value).trim()
    if (!str) return '-'
    const hasPercent = str.includes('%')
    const numeric = parseFloat(str.replace(/%/g, '').replace(/,/g, ''))
    if (!isNaN(numeric)) {
      const rounded = String(Math.round(numeric))
      return hasPercent ? `${rounded}%` : rounded
    }
    return str
  }

  const ViewToggle = () => {
    if (viewMode === 'single') return null
    
    return (
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
  }

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
          {/* Compact header */}
          {/* Header: Stat | [logo] Away | [logo] Home */}
          <div className="grid grid-cols-3 gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-semibold text-xs text-gray-700 dark:text-gray-300">
            <div className="text-left">Stat</div>
            <div className="flex items-center justify-center">
              {awayTeam && <TeamLogo team={awayTeam} size="xs" className="mr-1" />}
              <span className="truncate">{awayTeamName}</span>
            </div>
            <div className="flex items-center justify-center">
              {homeTeam && <TeamLogo team={homeTeam} size="xs" className="mr-1" />}
              <span className="truncate">{homeTeamName}</span>
            </div>
          </div>

          {/* Stats Rows: Stat | Away (per game if available) | Home */}
          {filteredData.map((stat, index) => {
            const winner = getWinnerIndicator(stat.homePerGame || stat.homeValue, stat.awayPerGame || stat.awayValue, stat.stat?.display_name)
            const statLabel = stat.stat?.display_name || stat.stat?.name || '—'
            const statDesc = stat.stat?.description || ''
            const awayRaw = stat.awayPerGame ?? stat.awayValue
            const homeRaw = stat.homePerGame ?? stat.homeValue
            const awayDisplay = formatValueDisplay(awayRaw)
            const homeDisplay = formatValueDisplay(homeRaw)
            const awayRankText = formatRankDisplay(stat.awayRank)
            const homeRankText = formatRankDisplay(stat.homeRank)
            const awayNum = getNumeric(awayRaw)
            const homeNum = getNumeric(homeRaw)
            return (
              <div
                key={`${stat.stat?.id}-${index}`}
                className="grid grid-cols-3 gap-3 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                {/* Stat Name */}
                <div className="text-left" title={statDesc}>
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{statLabel}</div>
                </div>

                {/* Away Value */}
                <div className={`text-center font-semibold text-sm ${
                  winner === 'away' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                }`} title={statDesc}>
                  {awayDisplay}
                  {awayRankText && awayNum !== 0 && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400"> - {awayRankText}</span>
                  )}
                </div>

                {/* Home Value */}
                <div className={`text-center font-semibold text-sm ${
                  winner === 'home' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                }`} title={statDesc}>
                  {homeRankText && homeNum !== 0 ? (
                    <>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{homeRankText} - </span>
                      {homeDisplay}
                    </>
                  ) : homeDisplay}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )

  const TeamView = ({ stats, teamName, team }: { stats: DetailedTeamStat[], teamName: string, team?: any }) => {
    const filteredStats = filterAndSortStats(stats, sport)
    const categoryStatsRaw = selectedCategory === 'all' 
      ? filteredStats 
      : filteredStats.filter(stat => (
          sport === 'CFB' 
            ? mapCfbStatToCategory(stat) === selectedCategory 
            : stat.stat?.category === selectedCategory
        ))
    const categoryStats = deduplicateByDisplayName(categoryStatsRaw)

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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statistic
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Per Game
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {categoryStats.map((stat, index) => (
                    <tr key={`${stat.team_id}-${stat.stat_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2" title={stat.stat?.description || ''}>
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {stat.stat?.display_name || stat.stat?.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right" title={stat.stat?.description || ''}>
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {stat.display_value || stat.value}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right" title={stat.stat?.description || ''}>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.per_game_display_value || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {(() => {
                          const valRaw = stat.per_game_display_value ?? stat.display_value ?? stat.value
                          const valNum = getNumeric(valRaw)
                          const rankText = formatRankDisplay(stat.rank_display_value || stat.rank)
                          if (rankText && valNum !== 0) {
                            return <div className="text-xs text-gray-600 dark:text-gray-400">{rankText}</div>
                          }
                          return <div className="text-xs text-gray-400">—</div>
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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