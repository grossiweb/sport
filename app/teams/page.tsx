'use client'

import { useState, useEffect } from 'react'
import { TeamStatsTable } from '@/components/teams/TeamStatsTable'
import { TeamStatsFilters } from '@/components/teams/TeamStatsFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Team, TeamStats, SportType, FilterOptions, SortOptions } from '@/types'
import { useQuery } from 'react-query'
import axios from 'axios'

const fetchTeams = async (): Promise<Team[]> => {
  const response = await axios.get('/api/teams')
  return response.data.data
}

const fetchTeamStats = async (season: string): Promise<TeamStats[]> => {
  const response = await axios.get(`/api/teams/stats?season=${season}`)
  return response.data.data
}

// Helper function to safely display errors
const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error occurred'
}

export default function TeamsPage() {
  const [selectedSport, setSelectedSport] = useState<SportType>('CFB')
  const [selectedSeason, setSelectedSeason] = useState('2024')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'winPercentage',
    direction: 'desc'
  })

  const { data: teams, isLoading: teamsLoading, error: teamsError } = useQuery(
    ['teams'],
    () => fetchTeams(),
    {}
  )

  const { data: teamStats, isLoading: statsLoading, error: statsError } = useQuery(
    ['teamStats', selectedSeason],
    () => fetchTeamStats(selectedSeason),
    { enabled: !!selectedSeason }
  )

  const isLoading = teamsLoading || statsLoading

  // Debug logging
  console.log('Teams data:', teams)
  console.log('Teams loading:', teamsLoading)
  console.log('Teams error:', teamsError)
  console.log('Team stats data:', teamStats)
  console.log('Stats loading:', statsLoading)
  console.log('Stats error:', statsError)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          College Football Team Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced team analytics and performance metrics for College Football
        </p>
      </div>

      <TeamStatsFilters
        selectedSeason={selectedSeason}
        filters={filters}
        sortOptions={sortOptions}
        onSeasonChange={setSelectedSeason}
        onFiltersChange={setFilters}
        onSortChange={setSortOptions}
      />

      {/* Debug Information */}
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Teams Loading: {teamsLoading ? 'Yes' : 'No'}</p>
        <p>Stats Loading: {statsLoading ? 'Yes' : 'No'}</p>
        <p>Teams Count: {teams?.length || 0}</p>
        <p>Team Stats Count: {teamStats?.length || 0}</p>
        {teamsError ? <p className="text-red-500">Teams Error: {formatError(teamsError)}</p> : null}
        {statsError ? <p className="text-red-500">Stats Error: {formatError(statsError)}</p> : null}
      </div>

      {isLoading ? (
        <div className="mt-8">
          <LoadingSpinner size="lg" />
          <p className="text-center mt-4">Loading College Football data...</p>
        </div>
      ) : teamsError || statsError ? (
        <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error loading data:</h3>
          {teamsError ? <p>Teams: {formatError(teamsError)}</p> : null}
          {statsError ? <p>Stats: {formatError(statsError)}</p> : null}
        </div>
      ) : (
        <div className="mt-8">
          <TeamStatsTable
            teams={teams || []}
            teamStats={teamStats || []}
            sport={selectedSport}
            filters={filters}
            sortOptions={sortOptions}
          />
        </div>
      )}
    </div>
  )
}