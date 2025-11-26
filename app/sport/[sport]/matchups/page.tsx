'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { SportType, Matchup } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { ModernMatchupCard } from '@/components/matchups/ModernMatchupCard'
import { MatchupFilters } from '@/components/matchups/MatchupFilters'
import { WeekInfo, getCurrentWeek, getWeekDateRange, getSeasonWeekOptions, getNFLSeasonWeekOptions, getCurrentSeasonWeekForSport, getCFBSeasonWeekOptions } from '@/lib/utils/week-utils'
import { formatToEasternWeekday } from '@/lib/utils/time'
import { useQuery } from 'react-query'
import { CoversStyleMatchupCard } from '@/components/matchups/CoversStyleMatchupCard'

interface MatchupFiltersState {
  status?: string
  search?: string
  division?: string
}

// Removed fetchMatchups - now using optimized hook

// Fetch matchups for a week
const fetchWeekMatchups = async (sport: SportType, weekInfo: WeekInfo): Promise<Matchup[]> => {
  const { startDate, endDate } = getWeekDateRange(weekInfo)
  const response = await fetch(`/api/matchups?sport=${sport}&date=${startDate}&endDate=${endDate}`)
  if (!response.ok) throw new Error('Failed to fetch matchups')
  const result = await response.json()
  return result.data || []
}

// Fetch matchups for a single day (for NCAAB)
const fetchDailyMatchups = async (sport: SportType, date: Date): Promise<Matchup[]> => {
  const dateStr = format(date, 'yyyy-MM-dd')
  const response = await fetch(`/api/matchups?sport=${sport}&date=${dateStr}`)
  if (!response.ok) throw new Error('Failed to fetch matchups')
  const result = await response.json()
  return result.data || []
}

export default function SportMatchupsPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<WeekInfo>(getCurrentWeek())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  // Align initial selectedWeek/date to current season-relative week based on the route sport only.
  // We intentionally use `validSport` (from the URL) instead of `currentSport` from context
  // so that a previous/global sport (e.g. CFB) cannot override the NFL week selection after load.
  useEffect(() => {
    const alignToSeason = async () => {
      if (!validSport) return
      const s = validSport

      // For NFL, use provided season dates (same logic as NCAAB)
      if (s === 'NFL') {
        const start = new Date('2025-09-04')
        const endDate = new Date('2026-01-07')
        const weeks = getNFLSeasonWeekOptions(2025, { startDate: start, endDate })
        const now = new Date()
        let current = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
        if (!current) {
          // If today is not inside any NFL week window (e.g., Nov 18–19),
          // treat the next future week as the "current" default; otherwise use the last week.
          current = weeks.find(w => now < w.weekInfo.startDate) || weeks[weeks.length - 1]
        }
        if (current) setSelectedWeek(current.weekInfo)
        return
      }

      // For NBA, use date-based selection within the 2025-26 season window
      if (s === 'NBA') {
        const seasonStart = new Date('2025-10-03')
        const seasonEnd = new Date('2026-04-12')
        const now = new Date()
        let initial = now
        if (initial < seasonStart) initial = seasonStart
        if (initial > seasonEnd) initial = seasonEnd
        setSelectedDate(initial)
        return
      }

      // For NCAAB, use provided season dates
      if (s === 'NCAAB') {
        const start = new Date('2025-11-03')
        const endDate = new Date('2026-03-15')
        const weeks = getSeasonWeekOptions({ startDate: start, endDate })
        const now = new Date()
        let current = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
        if (!current) {
          current = weeks.find(w => now < w.weekInfo.startDate) || weeks[weeks.length - 1]
        }
        if (current) setSelectedWeek(current.weekInfo)
        return
      }

      // For CFB (NCAAF), use explicit season week windows (Covers-style)
      if (s === 'CFB') {
        const start = new Date('2025-08-23')
        const endDate = new Date('2025-12-13')
        const weeks = getCFBSeasonWeekOptions(2025, { startDate: start, endDate })
        const now = new Date()
        let current = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
        if (!current) {
          // If today is not inside any CFB week window,
          // treat the next future week as the "current" default; otherwise use the last week.
          current = weeks.find(w => now < w.weekInfo.startDate) || weeks[weeks.length - 1]
        }
        if (current) setSelectedWeek(current.weekInfo)
        return
      }
    }
    alignToSeason()
  }, [validSport])
  
  const [filters, setFilters] = useState<MatchupFiltersState>({})

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const sport = validSport || currentSport
  const isNcaab = sport === 'NCAAB'
  const isNba = sport === 'NBA'
  const isDaily = isNcaab || isNba

  // Use daily matchups for NCAAB/NBA, weekly for others
  const { data: matchups, isLoading: matchupsLoading, error } = useQuery(
    isDaily 
      ? ['dailyMatchups', sport, format(selectedDate, 'yyyy-MM-dd')]
      : ['weekMatchups', sport, selectedWeek.weekNumber, selectedWeek.year, format(selectedWeek.startDate, 'yyyy-MM-dd'), format(selectedWeek.endDate, 'yyyy-MM-dd')],
    isDaily
      ? () => fetchDailyMatchups(sport, selectedDate)
      : () => fetchWeekMatchups(sport, selectedWeek),
    { enabled: !!sport && (isDaily ? !!selectedDate : true) }
  )

  const isLoading = contextLoading || matchupsLoading

  // Apply filters to matchups
  const filteredMatchups = matchups?.filter(matchup => {
    // Debug: log team division data for first matchup
    if (matchups?.indexOf(matchup) === 0 && sport === 'CFB') {
      console.log('First matchup team divisions:', {
        homeTeam: matchup.game.homeTeam.name,
        homeTeamDivision: matchup.game.homeTeam.division?.name,
        awayTeam: matchup.game.awayTeam.name,
        awayTeamDivision: matchup.game.awayTeam.division?.name,
        selectedDivision: filters.division
      })
    }
    // Status filter
    if (filters.status && matchup.game.status !== filters.status) {
      return false
    }
    
    // Search filter (team name, abbreviation, weekday)
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase()
      const homeName = matchup.game.homeTeam.name?.toLowerCase() || ''
      const awayName = matchup.game.awayTeam.name?.toLowerCase() || ''
      const homeAbbr = matchup.game.homeTeam.abbreviation?.toLowerCase() || ''
      const awayAbbr = matchup.game.awayTeam.abbreviation?.toLowerCase() || ''
      const weekdayET = formatToEasternWeekday(matchup.game.gameDate).toLowerCase()
      const weekdayShort = weekdayET.slice(0, 3)
      const matches = [homeName, awayName, homeAbbr, awayAbbr, weekdayET, weekdayShort].some(val => val.includes(q))
      if (!matches) return false
    }
    
    // Division filtering is now handled at API level for CFB (only FBS and FCS teams)
    
    return true
  }) || []

  if (contextLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    )
  }

  if (!validSport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Sport
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The sport "{params.sport}" is not supported.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          {currentSportData.displayName} Matchups
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
          Daily game insights with AI predictions and betting analysis for {currentSportData.displayName}.
        </p>
      </div>

      {/* Week/Date and Filters */}
      <div className="mb-6">
        <MatchupFilters
          sport={sport}
          selectedWeek={isDaily ? undefined : selectedWeek}
          selectedDate={isDaily ? selectedDate : undefined}
          filters={filters}
          onWeekChange={isDaily ? undefined : setSelectedWeek}
          onDateChange={isDaily ? setSelectedDate : undefined}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Matchups List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Failed to load matchups. Please try again.
          </p>
        </div>
      ) : filteredMatchups && filteredMatchups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatchups.map((matchup) => (
            <ModernMatchupCard
              key={matchup.game.id}
              matchup={matchup}
              sport={sport}
            />
          ))}

          {/* Demo: Covers-style cards using provided betting JSON (renders if IDs match) */}
          {/*} 
          {Array.isArray(sampleBetting) && sampleBetting.map((evt: any) => (
            <CoversStyleMatchupCard
              key={evt.event_id}
              away={{
                id: evt.teams?.find((t: any) => t.is_away)?.team_id || 'away',
                name: evt.teams_normalized?.find((t: any) => t.is_away)?.name || 'Away',
                abbreviation: evt.teams_normalized?.find((t: any) => t.is_away)?.abbreviation,
                city: evt.teams_normalized?.find((t: any) => t.is_away)?.name,
                league: 'NFL',
                score: evt.score?.score_away ?? 0
              }}
              home={{
                id: evt.teams?.find((t: any) => t.is_home)?.team_id || 'home',
                name: evt.teams_normalized?.find((t: any) => t.is_home)?.name || 'Home',
                abbreviation: evt.teams_normalized?.find((t: any) => t.is_home)?.abbreviation,
                city: evt.teams_normalized?.find((t: any) => t.is_home)?.name,
                league: 'NFL',
                score: evt.score?.score_home ?? 0
              }}
              lines={evt.lines}
            />
          ))}
            */}
        </div>
      ) : matchups && matchups.length > 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No games match your filters
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters to see more games.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No games scheduled
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isDaily ? (
              <>There are no {currentSportData.displayName} games scheduled for {format(selectedDate, 'MMMM d, yyyy')}.</>
            ) : (
              <>There are no {currentSportData.displayName} games scheduled for {selectedWeek.label} ({selectedWeek.dateRange}).</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
