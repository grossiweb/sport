'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSport } from '@/contexts/SportContext'
import { Team, SportType } from '@/types'
import { TeamLogo } from '@/components/ui/TeamLogo'
import {
  TrophyIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

type PlayerLeader = {
  playerId: string
  playerName: string
  teamId: string
  position?: string
  jerseyNumber?: number
  statName: string
  statDisplayName: string
  abbreviation: string
  value: number
  // Enriched from Mongo "players" and "teams" collections
  age?: number
  height?: string
  weight?: number
  teamAbbreviation?: string
  teamName?: string
}

type PlayerInsightsResponse = {
  topRushing: PlayerLeader[]
  topReceiving: PlayerLeader[]
  topPassing: PlayerLeader[]
  topDefensiveTackles: PlayerLeader[]
  topDefensiveSacks: PlayerLeader[]
  topDefensiveInterceptions: PlayerLeader[]
}

export function PlayerInsights() {
  const { currentSport, currentSportData } = useSport()
  const [data, setData] = useState<PlayerInsightsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Only show for NCAAF (CFB) and NFL per requirements
  const isSupportedSport = currentSport === 'CFB' || currentSport === 'NFL'

  useEffect(() => {
    let isMounted = true

    async function load() {
      if (!isSupportedSport) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/player-insights?sport=${currentSport}`, {
          cache: 'no-store'
        })
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        const json = await res.json()
        if (isMounted) {
          setData(json.data as PlayerInsightsResponse)
          setIsLoading(false)
        }
      } catch (e: any) {
        console.error('Failed to load player insights:', e)
        if (isMounted) {
          setError('Unable to load player insights.')
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [currentSport, isSupportedSport])

  if (!isSupportedSport) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Player Insights – {currentSportData.displayName}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
            Top offensive and defensive leaders for the current season (2025)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(k => (
            <div
              key={k}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
            >
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : !data ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offensive Leaders column */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BoltIcon className="h-5 w-5 text-orange-500" />
                Offensive Leaders
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <LeadersTable
                sport={currentSport}
                title="PASSING"
                statLabel="YDS"
                statKey="passing"
                leaders={data.topPassing}
              />
              <LeadersTable
                sport={currentSport}
                title="RUSHING"
                statLabel="YDS"
                statKey="rushing"
                leaders={data.topRushing}
              />
              <LeadersTable
                sport={currentSport}
                title="RECEIVING"
                statLabel="YDS"
                statKey="receiving"
                leaders={data.topReceiving}
              />
            </div>
          </div>

          {/* Defensive Leaders column */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                Defensive Leaders
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <LeadersTable
                sport={currentSport}
                title="TACKLES"
                statLabel="TOT"
                statKey="tackles"
                leaders={data.topDefensiveTackles}
              />
              <LeadersTable
                sport={currentSport}
                title="SACKS"
                statLabel="SACK"
                statKey="sacks"
                leaders={data.topDefensiveSacks}
              />
              <LeadersTable
                sport={currentSport}
                title="INTERCEPTIONS"
                statLabel="INT"
                statKey="interceptions"
                leaders={data.topDefensiveInterceptions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type LeadersTableProps = {
  title: string
  statLabel: string
  sport: SportType
  leaders: PlayerLeader[]
  statKey: 'passing' | 'rushing' | 'receiving' | 'tackles' | 'sacks' | 'interceptions'
}

function LeadersTable({ title, statLabel, sport, leaders, statKey }: LeadersTableProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          {title}
        </span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {statLabel}
        </span>
      </div>
      <div className="px-3 py-2">
        {leaders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No stats available yet for this season.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {leaders.slice(0, 5).map((leader, idx) => (
              <li
                key={`${leader.playerId}-${leader.statName}-${idx}`}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 w-4 text-right">
                    {idx + 1}
                  </span>
                  <div className="hidden sm:block">
                    <TeamLogo
                      team={{
                        id: leader.teamId,
                        name: leader.teamName || `Team ${leader.teamId}`,
                        city: '',
                        abbreviation: leader.teamAbbreviation || leader.teamId,
                        league: sport
                      } as Team}
                      size="xs"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {leader.playerName}
                    </p>
                  </div>
                </div>
                <div className="ml-3 text-right flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {leader.value.toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


