'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { SportType, Matchup, DetailedTeamStat } from '@/types'
import { sportsAPI } from '@/lib/api/sports-api'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ModernMatchupDetail } from '@/components/matchups/ModernMatchupDetail'

const fetchMatchupDetails = async (sport: SportType, gameId: string): Promise<Matchup> => {
  const response = await fetch(`/api/matchups/${gameId}/details?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch matchup details')
  const result = await response.json()
  return result.data
}

const fetchTeamDetailedStats = async (sport: SportType, teamId: string): Promise<DetailedTeamStat[]> => {
  const response = await fetch(`/api/teams/${teamId}/detailed-stats?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch team detailed stats')
  const result = await response.json()
  return result.data
}

export default function MatchupDetailsPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [showAllLines, setShowAllLines] = useState(false)
  const [allBettingLines, setAllBettingLines] = useState<any[]>([])
  const [loadingAllLines, setLoadingAllLines] = useState(false)
  const [showTeamStats, setShowTeamStats] = useState(false)
  const gameId = params.gameId as string

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const sport = validSport || currentSport

  const { data: matchup, isLoading, error } = useQuery(
    ['matchupDetails', sport, gameId],
    () => fetchMatchupDetails(sport, gameId),
    { 
      enabled: !!sport && !!gameId,
      staleTime: 2 * 60 * 1000, // 2 minutes for matchup details
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchInterval: false, // Don't auto-refresh on details page
      refetchOnWindowFocus: false
    }
  )

  // Fetch team stats for both teams in a single optimized query
  const { data: teamStats, isLoading: teamStatsLoading } = useQuery(
    ['teamDetailedStats', sport, matchup?.game.homeTeam.id, matchup?.game.awayTeam.id],
    async () => {
      if (!matchup) return null
      const [homeStats, awayStats] = await Promise.all([
        fetchTeamDetailedStats(sport, matchup.game.homeTeam.id),
        fetchTeamDetailedStats(sport, matchup.game.awayTeam.id)
      ])
      return { home: homeStats, away: awayStats }
    },
    { 
      enabled: !!matchup && showTeamStats,
      staleTime: 5 * 60 * 1000, // 5 minutes for team stats
      cacheTime: 15 * 60 * 1000 // 15 minutes
    }
  )

  const fetchAllBettingLines = async () => {
    if (!matchup) return
    
    setLoadingAllLines(true)
    try {
      const response = await fetch(`/api/betting/data?sport=${sport}&gameId=${gameId}`)
      const result = await response.json()
      setAllBettingLines(result.data || [])
      setShowAllLines(true)
    } catch (error) {
      console.error('Failed to fetch all betting lines:', error)
    } finally {
      setLoadingAllLines(false)
    }
  }

  if (contextLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Matchup Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested matchup could not be found or may no longer be available.
          </p>
          <Link
            href={`/sport/${sport.toLowerCase()}/matchups`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Matchups
          </Link>
        </div>
      </div>
    )
  }

  if (!matchup) {
    return null
  }

  return <ModernMatchupDetail matchup={matchup} sport={sport} />
}