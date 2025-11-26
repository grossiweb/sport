'use client'

import { useQuery, UseQueryOptions } from 'react-query'
import { format, subDays, addDays } from 'date-fns'
import { getNowInAppTimeZone } from '@/lib/utils/time'
import { SportType, Matchup } from '@/types'

interface UseMatchupsOptions {
  sport: SportType
  date?: string
  enabled?: boolean
  limit?: number
  staleTime?: number
  refetchInterval?: number | false
}

const fetchMatchups = async (sport: SportType, date?: string, status?: string, dateRange?: string): Promise<Matchup[]> => {
  const params = new URLSearchParams()
  params.append('sport', sport)
  if (date) params.append('date', date)
  if (status) params.append('status', status)
  if (dateRange) params.append('dateRange', dateRange)
  
  const response = await fetch(`/api/matchups?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch matchups')
  const result = await response.json()
  return result.data || []
}

/**
 * Optimized hook for fetching matchups with smart caching and reduced API calls
 */
export function useOptimizedMatchups({
  sport,
  date,
  enabled = true,
  limit,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  refetchInterval = 10 * 60 * 1000 // 10 minutes default
}: UseMatchupsOptions) {
  const now = getNowInAppTimeZone()
  const queryDate = date || format(now, 'yyyy-MM-dd')
  
  return useQuery(
    ['optimizedMatchups', sport, queryDate, limit],
    () => fetchMatchups(sport, queryDate),
    {
      enabled: enabled && !!sport,
      staleTime,
      cacheTime: staleTime * 2, // Cache for twice the stale time
      refetchInterval,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => {
        // Apply limit if specified
        return limit ? data.slice(0, limit) : data
      }
    }
  )
}

/**
 * Hook specifically for dashboard components that need featured games
 */
export function useFeaturedMatchups(sport: SportType, limit: number = 3) {
  return useOptimizedMatchups({
    sport,
    limit,
    staleTime: 10 * 60 * 1000, // 10 minutes for featured games
    refetchInterval: 15 * 60 * 1000 // 15 minutes refresh
  })
}

/**
 * Hook for the main matchups page with more frequent updates
 */
export function useMatchupsPage(sport: SportType, date?: string) {
  return useOptimizedMatchups({
    sport,
    date,
    staleTime: 3 * 60 * 1000, // 3 minutes for main page
    refetchInterval: 5 * 60 * 1000 // 5 minutes refresh
  })
}

/**
 * Hook for less critical matchup displays with longer cache times
 */
export function useBackgroundMatchups(sport: SportType, date?: string) {
  return useOptimizedMatchups({
    sport,
    date,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: false // No auto-refresh for background components
  })
}

/**
 * Hook for fetching recent completed matchups
 */
export function useRecentMatchups(sport: SportType, limit: number = 3) {
  return useQuery(
    ['recentMatchups', sport, limit],
    () => fetchMatchups(sport, undefined, undefined, 'past'),
    {
      enabled: !!sport,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 20 * 60 * 1000, // 20 minutes cache
      refetchInterval: 15 * 60 * 1000, // 15 minutes refresh
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => {
        // Filter to only completed games and sort by most recent
        const completedGames = data
          .filter(matchup => matchup.game.status === 'final')
          .sort((a, b) => new Date(b.game.gameDate).getTime() - new Date(a.game.gameDate).getTime())
        
        return completedGames.slice(0, limit)
      }
    }
  )
}

/**
 * Hook for fetching upcoming matchups (not today)
 */
export function useUpcomingMatchups(sport: SportType, limit: number = 3) {
  return useQuery(
    ['upcomingMatchups', sport, limit],
    () => fetchMatchups(sport, undefined, undefined, 'future'),
    {
      enabled: !!sport,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 20 * 60 * 1000, // 20 minutes cache
      refetchInterval: 15 * 60 * 1000, // 15 minutes refresh
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => {
        // Filter to only scheduled games and sort by earliest first
        const upcomingGames = data
          .filter(matchup => matchup.game.status === 'scheduled')
          .sort((a, b) => new Date(a.game.gameDate).getTime() - new Date(b.game.gameDate).getTime())
        
        return upcomingGames.slice(0, limit)
      }
    }
  )
}

/**
 * Hook for fetching today's matchups only
 */
export function useTodaysMatchups(sport: SportType, limit: number = 3) {
  const now = getNowInAppTimeZone()
  const today = format(now, 'yyyy-MM-dd')
  
  return useQuery(
    ['todaysMatchups', sport, today, limit],
    () => fetchMatchups(sport, today),
    {
      enabled: !!sport,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes cache
      refetchInterval: 10 * 60 * 1000, // 10 minutes refresh
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => {
        // Filter to only include games that are actually today
        const todayStart = getNowInAppTimeZone()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = getNowInAppTimeZone()
        todayEnd.setHours(23, 59, 59, 999)
        
        const todaysGames = data.filter(matchup => {
          const gameDate = new Date(matchup.game.gameDate)
          return gameDate >= todayStart && gameDate <= todayEnd
        })
        
        return todaysGames.slice(0, limit)
      }
    }
  )
}

/**
 * Hook for fetching recent matchups from last 7 days using week-based MongoDB logic
 */
export function useWeekBasedRecentMatchups(sport: SportType, limit: number = 3) {
  // Calculate date range for last 7 days
  const now = getNowInAppTimeZone()
  const endDate = format(now, 'yyyy-MM-dd')
  const startDate = format(subDays(now, 7), 'yyyy-MM-dd')
  
  return useQuery(
    ['weekBasedRecentMatchups', sport, startDate, endDate, limit],
    async () => {
      const response = await fetch(`/api/matchups?sport=${sport}&date=${startDate}&endDate=${endDate}&limit=50`)
      if (!response.ok) throw new Error('Failed to fetch recent matchups')
      const result = await response.json()
      return result.data || []
    },
    {
      enabled: !!sport,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 20 * 60 * 1000, // 20 minutes cache
      refetchInterval: 15 * 60 * 1000, // 15 minutes refresh
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => {
        // Filter to only completed games from the last 7 days and sort by most recent
        const zonedNow = getNowInAppTimeZone()
        const sevenDaysAgo = subDays(zonedNow, 7)
        
        const recentGames = data
          .filter(matchup => {
            const gameDate = new Date(matchup.game.gameDate)
            return matchup.game.status === 'final' && 
                   gameDate >= sevenDaysAgo && 
                   gameDate <= zonedNow
          })
          .sort((a, b) => new Date(b.game.gameDate).getTime() - new Date(a.game.gameDate).getTime())
        
        return recentGames.slice(0, limit)
      }
    }
  )
}

/**
 * Hook for fetching upcoming matchups from next 7 days using week-based MongoDB logic
 */
export function useWeekBasedUpcomingMatchups(sport: SportType, limit: number = 3) {
  // Calculate date range for next 7 days
  const now = getNowInAppTimeZone()
  const startDate = format(addDays(now, 1), 'yyyy-MM-dd') // Start from tomorrow
  const endDate = format(addDays(now, 7), 'yyyy-MM-dd')
  
  return useQuery(
    ['weekBasedUpcomingMatchups', sport, startDate, endDate, limit],
    async () => {
      const response = await fetch(`/api/matchups?sport=${sport}&date=${startDate}&endDate=${endDate}&limit=50`)
      if (!response.ok) throw new Error('Failed to fetch upcoming matchups')
      const result = await response.json()
      return result.data || []
    },
    {
      enabled: !!sport,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 20 * 60 * 1000, // 20 minutes cache
      refetchInterval: 15 * 60 * 1000, // 15 minutes refresh
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => {
        // Filter to only scheduled games in the next 7 days and sort by earliest first
        const zonedNow = getNowInAppTimeZone()
        const sevenDaysFromNow = addDays(zonedNow, 7)
        
        const upcomingGames = data
          .filter(matchup => {
            const gameDate = new Date(matchup.game.gameDate)
            return matchup.game.status === 'scheduled' && 
                   gameDate > zonedNow && 
                   gameDate <= sevenDaysFromNow
          })
          .sort((a, b) => new Date(a.game.gameDate).getTime() - new Date(b.game.gameDate).getTime())
        
        return upcomingGames.slice(0, limit)
      }
    }
  )
}