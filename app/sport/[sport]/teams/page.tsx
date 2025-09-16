'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { SportType, Team, TeamStats, TeamFiltersState } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { TeamStatsTable } from '@/components/teams/TeamStatsTable'
import { TeamStatsFilters } from '@/components/teams/TeamStatsFilters'

interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

const fetchTeams = async (sport: SportType): Promise<Team[]> => {
  const response = await fetch(`/api/teams?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch teams')
  const result = await response.json()
  return result.data
}

const fetchTeamStats = async (sport: SportType): Promise<TeamStats[]> => {
  const response = await fetch(`/api/teams/stats?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch team stats')
  const result = await response.json()
  return result.data
}

export default function SportTeamsPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [filters, setFilters] = useState<TeamFiltersState>({})
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'winPercentage',
    direction: 'desc'
  })

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const sport = validSport || currentSport

  const { data: teams, isLoading: teamsLoading } = useQuery(
    ['teams', sport],
    () => fetchTeams(sport),
    { enabled: !!sport }
  )

  const { data: teamStats, isLoading: statsLoading } = useQuery(
    ['teamStats', sport],
    () => fetchTeamStats(sport),
    { enabled: !!sport }
  )

  const isLoading = contextLoading || teamsLoading || statsLoading

  // Filter teams based on filters
  const filteredTeams = teams?.filter(team => {
    // Team name filter
    if (filters.teamName) {
      const searchTerm = filters.teamName.toLowerCase()
      const matchesName = team.name.toLowerCase().includes(searchTerm) ||
                         team.city.toLowerCase().includes(searchTerm) ||
                         team.abbreviation.toLowerCase().includes(searchTerm)
      if (!matchesName) return false
    }

    // Division filter (NFL specific)
    if (filters.division && sport === 'NFL') {
      if (team.division?.name !== filters.division) return false
    }

    // Subdivision filter (CFB specific)
    if (filters.subdivision && sport === 'CFB') {
      if (team.division?.name !== filters.subdivision) return false
    }

    // For CFB, only show FBS (I-A) and FCS (I-AA) teams if no subdivision filter is applied
    if (sport === 'CFB' && !filters.subdivision) {
      if (team.division?.name !== 'FBS (I-A)' && team.division?.name !== 'FCS (I-AA)') {
        return false
      }
    }

    return true
  }) || []

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {currentSportData?.displayName || currentSport} Team Statistics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Comprehensive team analytics and performance metrics for {currentSportData?.displayName || currentSport}.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TeamStatsFilters
          sport={sport}
          filters={filters}
          sortOptions={sortOptions}
          onFiltersChange={setFilters}
          onSortChange={setSortOptions}
        />
      </div>

      {/* Stats Table */}
      <TeamStatsTable
        teams={filteredTeams}
        teamStats={teamStats || []}
        isLoading={isLoading}
        sport={sport}
        sortOptions={sortOptions}
        onSortChange={setSortOptions}
      />
    </div>
  )
}
