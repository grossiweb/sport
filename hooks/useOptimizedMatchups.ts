'use client'

import { useQuery, UseQueryOptions } from 'react-query'
import { format } from 'date-fns'
import { SportType, Matchup } from '@/types'

interface UseMatchupsOptions {
  sport: SportType
  date?: string
  enabled?: boolean
  limit?: number
  staleTime?: number
  refetchInterval?: number | false
}

const fetchMatchups = async (sport: SportType, date?: string): Promise<Matchup[]> => {
  const params = new URLSearchParams()
  params.append('sport', sport)
  if (date) params.append('date', date)
  
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
  const queryDate = date || format(new Date(), 'yyyy-MM-dd')
  
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
