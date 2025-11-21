'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import Link from 'next/link'
import { SportType } from '@/types'
import { useSport } from '@/contexts/SportContext'
import { isValidSportType } from '@/lib/constants/sports'

type StatKey = 'passing' | 'rushing' | 'receiving' | 'tackles' | 'sacks' | 'interceptions'

type Leader = {
  playerId: string
  playerName: string
  teamId: string
  position?: string
  jerseyNumber?: number
  statName: string
  statDisplayName: string
  abbreviation: string
  value: number
  teamAbbreviation?: string
  teamName?: string
}

interface LeadersApiResponse {
  success: boolean
  data: Leader[]
}

const STAT_CONFIG: Record<StatKey, { title: string; columnLabel: string; statLabel: string }> = {
  passing: { title: 'Passing Leaders', columnLabel: 'PASSING', statLabel: 'YDS' },
  rushing: { title: 'Rushing Leaders', columnLabel: 'RUSHING', statLabel: 'YDS' },
  receiving: { title: 'Receiving Leaders', columnLabel: 'RECEIVING', statLabel: 'YDS' },
  tackles: { title: 'Tackle Leaders', columnLabel: 'TACKLES', statLabel: 'TOT' },
  sacks: { title: 'Sack Leaders', columnLabel: 'SACKS', statLabel: 'SACK' },
  interceptions: { title: 'Interception Leaders', columnLabel: 'INTERCEPTIONS', statLabel: 'INT' }
}

async function fetchLeaders(
  sport: SportType,
  statKey: StatKey
): Promise<Leader[]> {
  const params = new URLSearchParams()
  params.append('sport', sport)
  params.append('stat', statKey)
  params.append('limit', '50')

  const res = await fetch(`/api/player-leaders?${params.toString()}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch leaders')
  }
  const json: LeadersApiResponse = await res.json()
  return json.data || []
}

export default function PlayerLeadersPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [statKey, setStatKey] = useState<StatKey | null>(null)

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }

    const statParam = (params.stat as string)?.toLowerCase() as StatKey
    if (statParam && STAT_CONFIG[statParam]) {
      setStatKey(statParam)
    }
  }, [params.sport, params.stat])

  const sport = validSport || currentSport

  const { data: leaders, isLoading, error } = useQuery(
    ['playerLeaders', sport, statKey],
    () => fetchLeaders(sport, statKey as StatKey),
    { enabled: !!sport && !!statKey }
  )

  if (contextLoading || !statKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8" />
        </div>
      </div>
    )
  }

  const config = STAT_CONFIG[statKey]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentSportData.displayName} {config.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Season 2025 player {config.columnLabel.toLowerCase()} leaders.
          </p>
        </div>
        <Link
          href={`/sport/${sport.toLowerCase()}`}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {config.columnLabel}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {config.statLabel}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">
            Failed to load leaders.
          </div>
        ) : !leaders || leaders.length === 0 ? (
          <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
            No stats available for this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                    Rank
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                    Player
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                    Team
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                    {config.statLabel}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/60">
                {leaders.map((leader, idx) => (
                  <tr key={leader.playerId}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
                      {leader.playerName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {leader.teamAbbreviation || leader.teamName || leader.teamId}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white text-right">
                      {leader.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


