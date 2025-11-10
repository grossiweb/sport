import { useQuery } from 'react-query'
import { SportType, Game } from '@/types'

type MostBetItem = {
  game: Game
  consensusSpread: { home: number | null; away: number | null; absMax: number | null }
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
      const params = new URLSearchParams({
        sport: (sport || 'CFB').toUpperCase(),
        limit: String(limit ?? 3),
        days: String(days ?? 7)
      })

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


