import { useQuery } from 'react-query'
import { SportType, Game } from '@/types'
import { getCurrentSeasonWeekForSport, getWeekDateRange } from '@/lib/utils/week-utils'

type MostBetItem = {
  game: Game
  consensusSpread: { home: number | null; away: number | null; absMax: number | null; winProbHome?: number | null; winProbAway?: number | null }
}

type MostBetApiResponse = {
  success: boolean
  data: MostBetItem[]
  meta?: {
    sport: SportType
    startDate?: string
    endDate?: string
    total?: number
  }
  error?: string
}

export function useMostBetMatchups(sport: SportType, limit: number = 3, days: number = 7) {
  return useQuery(
    ['mostBetMatchups', sport, limit, days],
    async () => {
      const params = new URLSearchParams()
      params.append('sport', (sport || 'CFB').toUpperCase())
      params.append('limit', String(limit ?? 3))

      // For NFL and NCAAF (CFB), restrict to the current week window instead of a rolling days window
      if (sport === 'NFL' || sport === 'CFB') {
        const weekInfo = getCurrentSeasonWeekForSport(sport)
        const { startDate, endDate } = getWeekDateRange(weekInfo)
        params.append('date', startDate)
        params.append('endDate', endDate)
      } else {
        // Other sports: keep the rolling "next N days" behavior
        params.append('days', String(days ?? 7))
      }

      const response = await fetch(`/api/matchups/most-bet?${params.toString()}`)
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || 'Failed to fetch most bet matchups')
      }
      const result: MostBetApiResponse = await response.json()
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to fetch most bet matchups')
      }
      return Array.isArray(result.data) ? result.data : []
    },
    {
      enabled: !!sport,
      staleTime: 10 * 60 * 1000,
      cacheTime: 20 * 60 * 1000,
      refetchInterval: 15 * 60 * 1000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 2,
      keepPreviousData: false
    }
  )
}


