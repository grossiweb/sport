'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSport } from '@/contexts/SportContext'
import { useWeekBasedUpcomingMatchups } from '@/hooks/useOptimizedMatchups'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { formatToEasternTime } from '@/lib/utils/time'

export function UpcomingScroller() {
  const { currentSport, currentSportData } = useSport()
  const { data: matchups, isLoading } = useWeekBasedUpcomingMatchups(currentSport, 10)
  const games = matchups?.map((m: any) => m.game) || []
  const loopGames = games.length > 0 ? [...games, ...games] : []

  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)
  const [isHovering, setIsHovering] = useState(false)

  // Smooth auto-scroll that loops seamlessly
  useEffect(() => {
    if (!scrollerRef.current || games.length === 0) return

    const speedPxPerSec = 60 // adjust for preferred speed

    const step = (ts: number) => {
      if (!scrollerRef.current) return
      if (isHovering) {
        rafRef.current = requestAnimationFrame(step)
        lastTsRef.current = ts
        return
      }
      const container = scrollerRef.current
      const deltaMs = lastTsRef.current ? (ts - lastTsRef.current) : 16
      lastTsRef.current = ts
      const deltaPx = (speedPxPerSec * deltaMs) / 1000

      container.scrollLeft += deltaPx
      const halfWidth = container.scrollWidth / 2
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = 0
    }
  }, [games.length, isHovering])

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[260px] h-28 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!games.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          This Week's Upcoming {currentSportData.displayName}
        </h3>
        <Link
          href={`/sport/${currentSport.toLowerCase()}/matchups`}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          See all
        </Link>
      </div>
      <div
        className="overflow-x-auto"
        ref={scrollerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex gap-3 pr-1">
          {loopGames.map((g: any, idx: number) => (
            <Link key={`${g.id}-${idx}`} href={`/sport/${g.league.toLowerCase()}/matchups/${g.id}`} className="min-w-[280px]">
              <div className="h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(g.gameDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {formatToEasternTime(g.gameDate)} ET
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamLogo team={g.awayTeam} size="xs" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                      {g.awayTeam.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">@</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamLogo team={g.homeTeam} size="xs" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                      {g.homeTeam.name}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}


