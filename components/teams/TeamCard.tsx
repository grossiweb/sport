'use client'

import Link from 'next/link'
import { Team } from '@/types'
import { TeamLogo } from '@/components/ui/TeamLogo'

interface TeamCardProps {
  team: Team
  sport: string
}

export function TeamCard({ team, sport }: TeamCardProps) {
  const href = `/sport/${sport.toLowerCase()}/teams/${team.id}`
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200">
      {/* Logo row */}
      <div className="w-full flex items-center justify-center mb-1.5">
        <Link href={href} className="inline-block">
          <TeamLogo team={team} size="md" className="transition-transform duration-150 hover:scale-[1.03]" />
        </Link>
      </div>

      {/* Team name row */}
      <div className="text-center">
        <Link href={href} className="block">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {team.name}
          </h3>
        </Link>
      </div>

      {/* Abbreviation (short name) */}
      <div className="text-center text-xs text-gray-600 dark:text-gray-300 mt-0.5">
        {team.abbreviation}
      </div>

      {/* Mascot */}
      {team.mascot && (
        <div className="text-center text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
          {team.mascot}
        </div>
      )}

      {/* Conference name */}
      {team.conference?.name && (
        <div className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
          {team.conference.name}
        </div>
      )}
    </div>
  )
}
