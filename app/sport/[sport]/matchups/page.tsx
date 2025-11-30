'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { SportType, Matchup } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { ModernMatchupCard } from '@/components/matchups/ModernMatchupCard'
import { MatchupCardSkeleton } from '@/components/matchups/MatchupCardSkeleton'
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
  const { currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<WeekInfo>(getCurrentWeek())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isInitialized, setIsInitialized] = useState(false)
  
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
        setIsInitialized(true)
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
        setIsInitialized(true)
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
        setIsInitialized(true)
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
        setIsInitialized(true)
        return
      }

      // Fallback: if no sport-specific alignment applied, mark initialized so
      // the query can run using the default week/date.
      setIsInitialized(true)
    }
    alignToSeason()
  }, [validSport])
  
  const [filters, setFilters] = useState<MatchupFiltersState>({})
  const [displayedCount, setDisplayedCount] = useState(12) // Initial batch size
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  // Only trust the sport from the route for this page to avoid double-fetching
  // when the global context sport changes. This ensures we align weeks/dates
  // based purely on the URL segment and only fire one matchups query.
  const sport = validSport
  const isNcaab = sport === 'NCAAB'
  const isNba = sport === 'NBA'
  const isDaily = isNcaab || isNba

  // Use daily matchups for NCAAB/NBA, weekly for others
  const { data: matchups, isLoading: matchupsLoading, error } = useQuery(
    isDaily 
      ? ['dailyMatchups', sport, format(selectedDate, 'yyyy-MM-dd')]
      : ['weekMatchups', sport, selectedWeek.weekNumber, selectedWeek.year, format(selectedWeek.startDate, 'yyyy-MM-dd'), format(selectedWeek.endDate, 'yyyy-MM-dd')],
    isDaily
      ? () => fetchDailyMatchups(sport!, selectedDate)
      : () => fetchWeekMatchups(sport!, selectedWeek),
    {
      // Wait until we've aligned the initial week/date for the sport from
      // the URL to avoid an extra `/api/matchups` call with a temporary
      // week range.
      enabled: isInitialized && !!sport && (isDaily ? !!selectedDate : true)
    }
  )

  const isLoading = contextLoading || matchupsLoading

  // Apply filters to matchups using useMemo for performance
  const filteredMatchups = useMemo(() => {
    if (!matchups) return []
    
    return matchups.filter(matchup => {
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
    })
  }, [matchups, filters, sport])

  // Get the visible matchups for progressive loading
  const visibleMatchups = useMemo(() => {
    return filteredMatchups.slice(0, displayedCount)
  }, [filteredMatchups, displayedCount])

  // Load more handler
  const loadMore = () => {
    if (displayedCount < filteredMatchups.length) {
      setIsLoadingMore(true)
      // Use setTimeout to allow UI to update
      setTimeout(() => {
        setDisplayedCount(prev => Math.min(prev + 12, filteredMatchups.length))
        setIsLoadingMore(false)
      }, 100)
    }
  }

  // Reset displayed count when filters or data change
  useEffect(() => {
    setDisplayedCount(12)
  }, [filters, matchups])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredMatchups.length && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [displayedCount, filteredMatchups.length, isLoadingMore])

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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MatchupCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Failed to load matchups. Please try again.
          </p>
        </div>
      ) : filteredMatchups && filteredMatchups.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleMatchups.map((matchup) => (
              <ModernMatchupCard
                key={matchup.game.id}
                matchup={matchup}
                sport={sport}
              />
            ))}
          </div>

          {/* Infinite Scroll Trigger & Load More Button */}
          {displayedCount < filteredMatchups.length && (
            <>
              {/* Intersection Observer Target */}
              <div ref={observerTarget} className="h-10" />
              
              <div className="mt-4 text-center">
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Loading more games...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                  >
                    Load More ({filteredMatchups.length - displayedCount} remaining)
                  </button>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Showing {displayedCount} of {filteredMatchups.length} games
                </p>
              </div>
            </>
          )}

        </>
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
