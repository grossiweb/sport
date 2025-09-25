'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import Link from 'next/link'
import { SportType, Team, DetailedTeamStat } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { TeamDetailedStats } from '@/components/teams/TeamDetailedStats'
import TeamPlayers from '@/components/teams/TeamPlayers'
import { ArrowLeftIcon, ChartBarIcon, UserGroupIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

const fetchTeam = async (sport: SportType, teamId: string): Promise<Team | null> => {
  const response = await fetch(`/api/teams?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch teams')
  const result = await response.json()
  const teams: Team[] = result.data
  return teams.find(team => team.id === teamId) || null
}

const fetchTeamDetailedStats = async (sport: SportType, teamId: string): Promise<DetailedTeamStat[]> => {
  const response = await fetch(`/api/teams/${teamId}/stats?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch team stats')
  const result = await response.json()
  return result.data || []
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'players'>('overview')

  const teamId = params.teamId as string
  const sportParam = params.sport as string

  useEffect(() => {
    const sportType = sportParam?.toUpperCase()
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [sportParam])

  const sport = validSport || currentSport

  const { data: team, isLoading: teamLoading } = useQuery(
    ['team', sport, teamId],
    () => fetchTeam(sport, teamId),
    { enabled: !!sport && !!teamId }
  )

  const { data: teamStats, isLoading: statsLoading } = useQuery(
    ['teamDetailedStats', sport, teamId],
    () => fetchTeamDetailedStats(sport, teamId),
    { enabled: !!sport && !!teamId }
  )

  const isLoading = contextLoading || teamLoading || statsLoading

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

  if (!team && !teamLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Team Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The requested team could not be found.
          </p>
          <Link
            href={`/sport/${sport.toLowerCase()}/teams`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Teams
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/sport/${sport.toLowerCase()}/teams`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to {sport} Teams
        </Link>
      </div>

      {/* Team Header */}
      {team && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center space-x-6">
              {/* Team Logo */}
              <div className="flex-shrink-0">
                <TeamLogo team={team} size="xl" />
              </div>
              
              {/* Team Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {team.name}
                </h1>
                <div className="flex items-center space-x-4 text-lg text-gray-600 dark:text-gray-400">
                  <span>{team.abbreviation}</span>
                  {team.mascot && (
                    <>
                      <span>•</span>
                      <span>{team.mascot}</span>
                    </>
                  )}
                  {team.record && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {team.record}
                      </span>
                    </>
                  )}
                </div>
                {team.conference && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {team.conference.name}
                    {team.division && team.division.name !== team.conference.name && (
                      <span> • {team.division.name}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
              { id: 'stats', name: 'Statistics', icon: ChartBarIcon },
              { id: 'players', name: 'Players', icon: UserGroupIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'stats' | 'players')}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && team && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Team Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Team Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{team.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Abbreviation:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{team.abbreviation}</span>
                      </div>
                      {team.mascot && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Mascot:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{team.mascot}</span>
                        </div>
                      )}
                      {team.record && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Record:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{team.record}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">League:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{sport}</span>
                      </div>
                    </div>
                  </div>
                  
                  {team.conference && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Conference & Division
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Conference:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{team.conference.name}</span>
                        </div>
                        {team.division && team.division.name !== team.conference.name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Division:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{team.division.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Team Statistics
              </h2>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  ))}
                </div>
              ) : teamStats && teamStats.length > 0 ? (
                <TeamDetailedStats
                  homeTeamStats={teamStats}
                  awayTeamStats={[]}
                  homeTeamName={team?.name || 'Team'}
                  awayTeamName=""
                  homeTeam={team}
                  awayTeam={undefined}
                  isLoading={false}
                  sport={sport}
                  viewMode="single"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No statistics available for this team.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Players Tab */}
          {activeTab === 'players' && team && (
            <TeamPlayers
              teamId={team.id}
              sport={sport}
              teamName={team.name}
            />
          )}
        </div>
      </div>
    </div>
  )
}
