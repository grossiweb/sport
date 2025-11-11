'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { SportType, Matchup } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { ModernMatchupCard } from '@/components/matchups/ModernMatchupCard'
import { MatchupFilters } from '@/components/matchups/MatchupFilters'
import { WeekInfo, getCurrentWeek, getWeekDateRange, getSeasonWeekOptions, getNFLSeasonWeekOptions, getCurrentSeasonWeekForSport } from '@/lib/utils/week-utils'
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
  const [weekReady, setWeekReady] = useState<boolean>(false)
  // Align initial selectedWeek/date to current season-relative week if season data exists
  useEffect(() => {
    const alignToSeason = async () => {
      const s = (validSport || currentSport)

      // Immediately align the week selection synchronously based on sport-specific logic
      // This prevents an initial fetch using generic ISO week ranges for NFL
      if (s && s !== 'NCAAB') {
        setWeekReady(false)
        setSelectedWeek(getCurrentSeasonWeekForSport(s))
      }
      // For NBA, always use provided season dates
      if (s === 'NBA') {
        const start = new Date('2025-10-09')
        const endDate = new Date('2026-04-12')
        const weeks = getSeasonWeekOptions({ startDate: start, endDate })
        const now = new Date()
        const current = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
        if (current) setSelectedWeek(current.weekInfo)
        return
      }

      // For NCAAB, use provided season dates
      if (s === 'NCAAB') {
        const start = new Date('2025-11-03')
        const endDate = new Date('2026-03-15')
        const weeks = getSeasonWeekOptions({ startDate: start, endDate })
        const now = new Date()
        const current = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
        if (current) setSelectedWeek(current.weekInfo)
        return
      }

      const sportId = s === 'CFB' ? 1 : s === 'NFL' ? 2 : undefined
      if (!sportId) return
      const year = new Date().getFullYear()
      try {
        const res = await fetch(`/api/seasons?sport_id=${sportId}&season=${year}`)
        const json = await res.json()
        const season = Array.isArray(json.data) ? json.data[0] : null
        if (!season?.start_date) return
        const start = new Date(season.start_date)
        const endDate = season.end_date ? new Date(season.end_date) : undefined
        // NFL: use exact league-defined week ranges when seasonYear == current year and sport is NFL
        const weeks = (s === 'NFL')
          ? getNFLSeasonWeekOptions(year, { startDate: start, endDate })
          : getSeasonWeekOptions({ startDate: start, endDate })
        const now = new Date()
        const current = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
        if (current) setSelectedWeek(current.weekInfo)
      } catch {}
    }
    alignToSeason()
  }, [validSport, currentSport])

  // Mark week ready only after selectedWeek aligns with sport-specific current week
  useEffect(() => {
    const s = (validSport || currentSport)
    if (!s || s === 'NCAAB') return
    const expected = getCurrentSeasonWeekForSport(s)
    if (
      expected &&
      selectedWeek &&
      selectedWeek.startDate.getTime() === expected.startDate.getTime() &&
      selectedWeek.endDate.getTime() === expected.endDate.getTime()
    ) {
      setWeekReady(true)
    } else {
      setWeekReady(false)
    }
  }, [validSport, currentSport, selectedWeek])
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

  // Use daily matchups for NCAAB, weekly for others
  const { data: matchups, isLoading: matchupsLoading, error } = useQuery(
    isNcaab 
      ? ['dailyMatchups', sport, format(selectedDate, 'yyyy-MM-dd')]
      : ['weekMatchups', sport, selectedWeek.weekNumber, selectedWeek.year],
    isNcaab
      ? () => fetchDailyMatchups(sport, selectedDate)
      : () => fetchWeekMatchups(sport, selectedWeek),
    { enabled: !!sport && (isNcaab ? !!selectedDate : weekReady) }
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
          selectedWeek={isNcaab ? undefined : selectedWeek}
          selectedDate={isNcaab ? selectedDate : undefined}
          filters={filters}
          onWeekChange={isNcaab ? undefined : setSelectedWeek}
          onDateChange={isNcaab ? setSelectedDate : undefined}
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
            {isNcaab ? (
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
