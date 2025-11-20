'use client'

import { useEffect, useState } from 'react'
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
            Top performers for the current {currentSportData.displayName} season (2025)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(k => (
            <div
              key={k}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
            >
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : !data ? null : (
        <div className="space-y-4">
          <StatRow
            title="Top Rushing Leaders"
            sport={currentSport}
            icon={<BoltIcon className="h-5 w-5 text-orange-500" />}
            accentColor="from-orange-500/10 to-orange-500/0"
            leaders={data.topRushing}
          />
          <StatRow
            title="Top Receiving Leaders"
            sport={currentSport}
            icon={<ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />}
            accentColor="from-blue-500/10 to-blue-500/0"
            leaders={data.topReceiving}
          />
          <StatRow
            title="Top Passing Leaders"
            sport={currentSport}
            icon={<TrophyIcon className="h-5 w-5 text-amber-500" />}
            accentColor="from-amber-500/10 to-amber-500/0"
            leaders={data.topPassing}
          />
          <StatRow
            title="Defensive Leaders"
            sport={currentSport}
            icon={<ShieldCheckIcon className="h-5 w-5 text-emerald-500" />}
            accentColor="from-emerald-500/10 to-emerald-500/0"
            leaders={[
              ...data.topDefensiveSacks.map(l => ({ ...l, statGroup: 'Sacks' as const })),
              ...data.topDefensiveInterceptions.map(l => ({ ...l, statGroup: 'INT' as const }))
            ]}
          />
        </div>
      )}
    </div>
  )
}

type StatRowProps = {
  title: string
  sport: SportType
  icon: React.ReactNode
  accentColor: string
  leaders: (PlayerLeader & { statGroup?: 'Sacks' | 'INT' })[]
}

function StatRow({ title, sport, icon, accentColor, leaders }: StatRowProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/80 to-transparent dark:from-gray-900/60">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${accentColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Season-long leaders
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3">
        {leaders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No stats available yet for this season.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {leaders.slice(0, 5).map((leader, idx) => (
              <li
                key={`${leader.playerId}-${leader.statName}-${idx}`}
                className="flex items-center justify-between py-2"
              >
                {/** Build a lightweight Team object for the logo (fallbacks handled inside TeamLogo) */}
                {(() => {
                  const team: Team = {
                    id: leader.teamId,
                    name: leader.teamName || `Team ${leader.teamId}`,
                    city: '',
                    abbreviation: leader.teamAbbreviation || leader.teamId,
                    league: sport
                  } as Team
                  return null
                })()}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">
                      {idx + 1}.
                    </span>
                    {leader.playerName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {leader.position && <span>{leader.position}</span>}
                    {leader.position && (leader.teamAbbreviation || leader.teamName) && <span className="mx-1">•</span>}
                    {(leader.teamAbbreviation || leader.teamName) && (
                      <span>{leader.teamAbbreviation || leader.teamName}</span>
                    )}
                    {leader.age && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{leader.age} yrs</span>
                      </>
                    )}
                    {leader.height && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{leader.height}</span>
                      </>
                    )}
                    {leader.statGroup && (
                      <span className="ml-1 text-xs uppercase text-gray-400">
                        ({leader.statGroup})
                      </span>
                    )}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {leader.value}
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        {leader.abbreviation}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {leader.statDisplayName}
                    </p>
                  </div>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


