'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from 'react-query'
import { SportType, Player, PlayerStats } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'

interface PlayerSeasonStatsResponse {
  success: boolean
  data: PlayerStats[]
}

const fetchPlayerStats = async (
  sport: SportType,
  teamId: string,
  playerId: string
): Promise<PlayerStats | null> => {
  const params = new URLSearchParams()
  params.append('sport', sport)
  params.append('season', '2025')
  params.append('teamId', teamId)
  params.append('playerId', playerId)

  const response = await fetch(`/api/players/stats?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch player stats')
  }
  const result: PlayerSeasonStatsResponse = await response.json()
  const stats = result.data || []
  return stats.length > 0 ? stats[0] : null
}

const fetchPlayerInfo = async (
  sport: SportType,
  teamId: string,
  playerId: string
): Promise<Player | null> => {
  const params = new URLSearchParams()
  params.append('sport', sport)
  params.append('team', teamId)

  const response = await fetch(`/api/players?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch players')
  const result = await response.json()
  const players: Player[] = result.data || []
  return players.find(p => p.id === playerId) || null
}

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)

  const sportParam = params.sport as string
  const teamId = params.teamId as string
  const playerId = params.playerId as string

  useEffect(() => {
    const sportType = sportParam?.toUpperCase()
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [sportParam])

  const sport = validSport || currentSport

  const { data: stats, isLoading: statsLoading } = useQuery(
    ['playerSeasonStats', sport, teamId, playerId],
    () => fetchPlayerStats(sport, teamId, playerId),
    { enabled: !!sport && !!teamId && !!playerId }
  )

  const { data: player, isLoading: playerLoading } = useQuery(
    ['playerInfo', sport, teamId, playerId],
    () => fetchPlayerInfo(sport, teamId, playerId),
    { enabled: !!sport && !!teamId && !!playerId }
  )

  const isLoading = contextLoading || statsLoading || playerLoading

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href={`/sport/${sport.toLowerCase()}/teams/${teamId}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span className="mr-1">←</span>
          Back to Team
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {player?.name || 'Player'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {player?.position && (
                <span className="mr-2">
                  Position: <span className="font-semibold">{player.position}</span>
                </span>
              )}
              {player?.jerseyNumber != null && (
                <span className="mr-2">
                  • #{player.jerseyNumber}
                </span>
              )}
              <span>
                • {currentSportData.displayName} – Season 2025
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Season Statistics (2025)
        </h2>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : !stats ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No season stats available for this player.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Passing */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Passing
              </h3>
              <dl className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <StatRow label="Passing Yards" value={stats.passingYards} />
                <StatRow label="Passing TDs" value={stats.passingTouchdowns} />
                <StatRow label="Interceptions" value={stats.interceptions} />
              </dl>
            </div>

            {/* Rushing */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Rushing
              </h3>
              <dl className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <StatRow label="Rushing Yards" value={stats.rushingYards} />
                <StatRow label="Rushing TDs" value={stats.rushingTouchdowns} />
              </dl>
            </div>

            {/* Receiving */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Receiving
              </h3>
              <dl className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <StatRow label="Receptions" value={stats.receptions} />
                <StatRow label="Receiving Yards" value={stats.receivingYards} />
                <StatRow label="Receiving TDs" value={stats.receivingTouchdowns} />
              </dl>
            </div>

            {/* Defensive */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Defensive
              </h3>
              <dl className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <StatRow label="Tackles" value={stats.tackles} />
                <StatRow label="Sacks" value={stats.sacks} />
                <StatRow label="Fumbles" value={stats.fumbles} />
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-semibold text-gray-900 dark:text-white">
        {value != null ? value : '-'}
      </dd>
    </div>
  )
}


