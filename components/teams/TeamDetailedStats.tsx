'use client'

import { useState } from 'react'
import { DetailedTeamStat, SportType } from '@/types'
import { ChartBarIcon, TrophyIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { filterAndSortStats, STAT_CATEGORIES, mapCfbStatToCategory, getPreferredStats } from '@/lib/constants/team-stats-config'
import { TeamLogo } from '@/components/ui/TeamLogo'

interface TeamDetailedStatsProps {
  homeTeamStats: DetailedTeamStat[]
  awayTeamStats: DetailedTeamStat[]
  homeTeamName: string
  awayTeamName: string
  homeTeam?: any // Full team object for logo
  awayTeam?: any // Full team object for logo
  isLoading?: boolean
  sport?: SportType
  viewMode?: 'comparison' | 'single' // New prop to control view mode
  h2hStyle?: boolean // Apply head-to-head visual style (scoped for matchup detail)
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
  viewMode = 'comparison',
  h2hStyle = false
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

  // Get the appropriate display value based on configuration
  const getStatDisplayValue = (stat: DetailedTeamStat): any => {
    const statName = (stat.stat?.display_name || stat.stat?.name || '').trim().toLowerCase()
    const preferredStats = getPreferredStats(sport)
    
    // Find the config for this stat
    const config = preferredStats.find(p => 
      statName.includes(p.display_name.toLowerCase().replace('%', ''))
    )
    
    // If config specifies a display_field, use that field
    if (config?.display_field) {
      const value = (stat as any)[config.display_field]
      if (value !== undefined && value !== null) {
        return value
      }
    }
    
    // Default fallback: prefer per_game_display_value, then display_value, then value
    return stat.per_game_display_value ?? stat.display_value ?? stat.value
  }

  // Determine if a stat represents a percentage based on its metadata
  const isPercentageStat = (statLike: any): boolean => {
    const meta = statLike?.stat || statLike
    const texts = [meta?.abbreviation, meta?.display_name, meta?.description, meta?.name]
      .map((v: any) => (v ? String(v).toLowerCase() : ''))
    return texts.some((t) => t.includes('%') || t.includes('percent'))
  }

  // Append % to numeric displays for percent stats when missing
  const withPercentIfNeeded = (display: string, isPercent: boolean): string => {
    if (!isPercent) return display
    if (!display) return display
    const numeric = parseFloat(String(display).replace(/[^0-9.-]/g, ''))
    if (!isFinite(numeric)) return display
    // For zero values, do not show %
    if (numeric === 0) return '0'
    return display.includes('%') ? display : `${display}%`
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
          homeValue: getStatDisplayValue(stat),
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
          existing.awayValue = getStatDisplayValue(stat)
          existing.awayPerGame = stat.per_game_display_value || null
          existing.awayRank = stat.rank_display_value || stat.rank
        } else {
          comparisonMap.set(key, {
            ...stat,
            homeValue: null,
            homePerGame: null,
            homeRank: undefined,
            awayValue: getStatDisplayValue(stat),
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

  // Compute left/right (home/away) bar percentages, accounting for lower-is-better stats
  const getBarPercents = (homeValue: any, awayValue: any, statLabel: string) => {
    const homeNum = getNumeric(homeValue)
    const awayNum = getNumeric(awayValue)
    if (homeNum === null || awayNum === null) return { left: 0.5, right: 0.5 }

    const statLower = (statLabel || '').toLowerCase()
    const lowerIsBetter = ['penalt', 'turnover', 'interception', 'fumble'].some(k => statLower.includes(k))

    const epsilon = 1e-6
    let adjHome: number
    let adjAway: number

    if (lowerIsBetter) {
      adjHome = 1 / (Math.abs(homeNum) + epsilon)
      adjAway = 1 / (Math.abs(awayNum) + epsilon)
    } else {
      adjHome = Math.max(homeNum, 0)
      adjAway = Math.max(awayNum, 0)
    }

    const total = adjHome + adjAway
    if (total <= 0) return { left: 0.5, right: 0.5 }
    return { left: adjHome / total, right: adjAway / total }
  }

  // Format display value with max 2 decimal places; show 0 instead of 0.00
  const formatValueDisplay = (value: any): string => {
    if (value === null || value === undefined) return '-'
    
    // Handle numeric values
    if (typeof value === 'number') {
      if (value === 0) return '0'
      // Round to 2 decimal places max, but don't show trailing zeros
      const rounded = Math.round(value * 100) / 100
      return String(rounded)
    }
    
    // Handle string values
    const str = String(value).trim()
    if (!str) return '-'
    
    // Check if it's a percentage
    const hasPercent = str.includes('%')
    
    // Try to parse as number
    const cleanStr = str.replace(/%/g, '').replace(/,/g, '').trim()
    const numericValue = parseFloat(cleanStr)
    
    if (!isNaN(numericValue)) {
      if (numericValue === 0) return hasPercent ? '0%' : '0'
      // Round to 2 decimal places max, but don't show trailing zeros
      const rounded = Math.round(numericValue * 100) / 100
      return hasPercent ? `${rounded}%` : String(rounded)
    }
    
    // Return as-is if not numeric
    return str
  }

  const ViewToggle = () => {
    if (viewMode === 'single') return null
    
    return (
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
        {[
          { id: 'comparison', name: 'Head-to-Head', icon: ChartBarIcon },
          { id: 'away', name: awayTeamName, icon: TrophyIcon },
          { id: 'home', name: homeTeamName, icon: TrophyIcon }
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

  const ComparisonView = () => {
    if (!h2hStyle) {
      // Legacy compact comparison layout
      return (
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No statistics available for comparison.</p>
            </div>
          ) : (
            <>
              {/* Header: Stat | Away | Home */}
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

              {filteredData.map((stat, index) => {
                const winner = getWinnerIndicator(stat.homeValue, stat.awayValue, stat.stat?.display_name)
                const statLabel = stat.stat?.display_name || stat.stat?.name || '—'
                const statDesc = stat.stat?.description || ''
                const awayRaw = stat.awayValue
                const homeRaw = stat.homeValue
                const isPercent = isPercentageStat(stat)
                const awayDisplay = withPercentIfNeeded(formatValueDisplay(awayRaw), isPercent)
                const homeDisplay = withPercentIfNeeded(formatValueDisplay(homeRaw), isPercent)
                const awayRankText = formatRankDisplay(stat.awayRank)
                const homeRankText = formatRankDisplay(stat.homeRank)
                const awayNum = getNumeric(awayRaw)
                const homeNum = getNumeric(homeRaw)
                return (
                  <div key={`${stat.stat?.id}-${index}`} className="grid grid-cols-3 gap-3 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-left" title={statDesc}>
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{statLabel}</div>
                    </div>
                    <div className={`text-center font-semibold text-sm ${winner === 'away' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`} title={statDesc}>
                      {awayDisplay}
                      {awayRankText && awayNum !== 0 && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400"> - {awayRankText}</span>
                      )}
                    </div>
                    <div className={`text-center font-semibold text-sm ${winner === 'home' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`} title={statDesc}>
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
    }

    // H2H visual style: header with teams/category, stat label above green bar, grouped categories on All
    const getCategory = (stat: any) => (
      sport === 'CFB' ? mapCfbStatToCategory(stat) : (stat.stat?.category || 'Other')
    )
    const grouped = selectedCategory === 'all'
      ? filteredData.reduce((acc: Record<string, any[]>, s) => {
          const c = getCategory(s)
          if (!acc[c]) acc[c] = []
          acc[c].push(s)
          return acc
        }, {})
      : { [selectedCategory]: filteredData }

    const orderedCategories = selectedCategory === 'all'
      ? (sport === 'CFB' ? (
          [STAT_CATEGORIES.KEY_FACTORS, STAT_CATEGORIES.OFFENSE, STAT_CATEGORIES.DEFENSIVE, STAT_CATEGORIES.SPECIAL_TEAMS, STAT_CATEGORIES.TURNOVERS_PENALTIES]
            .filter(c => grouped[c]?.length)
        ) : (
          Object.keys(grouped)
        ))
      : [selectedCategory]

    return (
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No statistics available for comparison.</p>
          </div>
        ) : (
          <>
            {/* Header: [Away] [Category] [Home] to match matchup header order */}
            <div className="grid grid-cols-3 gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-semibold text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-start truncate">
                {awayTeam && <TeamLogo team={awayTeam} size="xs" className="mr-1" />}
                <span className="truncate">{awayTeamName}</span>
              </div>
              <div className="flex items-center justify-center truncate">
                <span className="uppercase tracking-wide">
                  {selectedCategory === 'all' ? 'All Stats' : selectedCategory}
                </span>
              </div>
              <div className="flex items-center justify-end truncate">
                <span className="truncate mr-1">{homeTeamName}</span>
                {homeTeam && <TeamLogo team={homeTeam} size="xs" />}
              </div>
            </div>

            {orderedCategories.map((cat) => (
              <div key={cat} className="space-y-2">
                {selectedCategory === 'all' && (
                  <div className="flex items-center my-3">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="mx-3 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      {cat}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                )}
                {grouped[cat]!.map((stat, index) => {
                const baseLabel = stat.stat?.display_name || stat.stat?.name || '—'
                  const statDesc = stat.stat?.description || ''
                  const awayRaw = stat.awayValue
                  const homeRaw = stat.homeValue
                const isPercent = isPercentageStat(stat)
                const awayDisplay = withPercentIfNeeded(formatValueDisplay(awayRaw), isPercent)
                const homeDisplay = withPercentIfNeeded(formatValueDisplay(homeRaw), isPercent)
                  const awayRankText = formatRankDisplay(stat.awayRank)
                  const homeRankText = formatRankDisplay(stat.homeRank)

                // Append "Per Game" in label when values represent per-game and label lacks it
                const hasPerGameInLabel = /per\s*game/i.test(baseLabel)
                const isPerGameStat = (stat.homePerGame != null || stat.awayPerGame != null)
                const statLabel = !hasPerGameInLabel && isPerGameStat ? `${baseLabel} Per Game` : baseLabel

                  const { left, right } = getBarPercents(awayRaw, homeRaw, statLabel)
                  const leftIsWinner = left > right
                  const rightIsWinner = right > left

                  return (
                    <div
                      key={`${stat.stat?.id}-${index}`}
                      className="grid grid-cols-3 gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                      title={statDesc}
                    >
                      {/* Away value and rank (left) */}
                      <div className="text-left flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {awayDisplay}
                        </span>
                        {awayRankText && getNumeric(awayRaw) !== 0 && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{awayRankText}</span>
                        )}
                      </div>

                      {/* Center stat label with progress bar underneath */}
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="text-[12px] md:text-sm font-semibold text-gray-800 dark:text-gray-200 text-center truncate max-w-full">
                          {statLabel}
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <div className="flex w-full h-full">
                            <div
                              className={`${leftIsWinner ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} h-full`}
                              style={{ width: `${Math.round(left * 100)}%` }}
                            />
                            <div
                              className={`${rightIsWinner ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} h-full`}
                              style={{ width: `${Math.round(right * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Home rank and value (right) */}
                      <div className="text-right flex items-center justify-end gap-1.5">
                        {homeRankText && getNumeric(homeRaw) !== 0 && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{homeRankText}</span>
                        )}
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {homeDisplay}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

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
            {/* Mobile stacked layout (no horizontal scroll) */}
            <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {categoryStats.map((stat, index) => {
                const isPercent = isPercentageStat(stat)
                const mainDisplay = withPercentIfNeeded(
                  formatValueDisplay(stat.display_value ?? stat.value),
                  isPercent
                )
                const perGameDisplay = withPercentIfNeeded(
                  formatValueDisplay(stat.per_game_display_value ?? '-'),
                  isPercent
                )
                const valRaw = stat.per_game_display_value ?? stat.display_value ?? stat.value
                const valNum = getNumeric(valRaw)
                const rankText = formatRankDisplay(stat.rank_display_value || stat.rank)
                return (
                  <div key={`${stat.team_id}-${stat.stat_id}-${index}`} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={stat.stat?.description || ''}>
                        {stat.stat?.display_name || stat.stat?.name}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {mainDisplay}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <div className="truncate">Per Game: {perGameDisplay}</div>
                      <div className="ml-3 whitespace-nowrap">{rankText && valNum !== 0 ? rankText : '—'}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop table layout */}
            <div className="hidden sm:block">
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
                          {withPercentIfNeeded(
                            formatValueDisplay(stat.display_value ?? stat.value),
                            isPercentageStat(stat)
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right" title={stat.stat?.description || ''}>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {withPercentIfNeeded(
                            formatValueDisplay(stat.per_game_display_value ?? '-'),
                            isPercentageStat(stat)
                          )}
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