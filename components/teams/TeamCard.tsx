'use client'

import Link from 'next/link'
import { Team } from '@/types'
import { TeamLogo } from '@/components/ui/TeamLogo'

interface TeamCardProps {
  team: Team
  sport: string
}

export function TeamCard({ team, sport }: TeamCardProps) {
  return (
    <Link 
      href={`/sport/${sport.toLowerCase()}/teams/${team.id}`}
      className="group block"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group-hover:scale-[1.02]">
        <div className="flex items-center space-x-4">
          {/* Team Logo */}
          <div className="flex-shrink-0">
            <TeamLogo team={team} size="lg" />
          </div>
          
          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {team.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {team.abbreviation}
                  {team.mascot && ` • ${team.mascot}`}
                </p>
                {team.conference && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {team.conference.name}
                  </p>
                )}
              </div>
              
              {/* Basic Stats */}
              <div className="text-right">
                {team.record && (
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {team.record}
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  View Details →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
