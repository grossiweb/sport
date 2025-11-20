'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { SportType, Player, PlayerStats } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { PlayerStatsTable } from '@/components/players/PlayerStatsTable'
import { PlayerStatsFilters } from '@/components/players/PlayerStatsFilters'

const fetchPlayers = async (sport: SportType, teamId?: string): Promise<Player[]> => {
  const params = new URLSearchParams()
  params.append('sport', sport)
  if (teamId) params.append('teamId', teamId)
  
  const response = await fetch(`/api/players?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch players')
  const result = await response.json()
  return result.data
}

const fetchPlayerStats = async (sport: SportType, season: string, teamId?: string): Promise<PlayerStats[]> => {
  const params = new URLSearchParams()
  params.append('sport', sport)
  params.append('season', season)
  if (teamId) params.append('teamId', teamId)
  
  const response = await fetch(`/api/players/stats?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch player stats')
  const result = await response.json()
  return result.data
}

export default function SportPlayersPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [selectedSeason, setSelectedSeason] = useState('2025')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [filters, setFilters] = useState({})
  const [sortOptions, setSortOptions] = useState({
    field: currentSport === 'CFB' ? 'passingYards' : 'rushingYards',
    direction: 'desc' as const
  })

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const sport = validSport || currentSport

  // Update default sort field based on sport
  useEffect(() => {
    setSortOptions(prev => ({
      ...prev,
      field: sport === 'CFB' ? 'passingYards' : 'rushingYards'
    }))
  }, [sport])

  const { data: players, isLoading: playersLoading } = useQuery(
    ['players', sport, selectedTeam],
    () => fetchPlayers(sport, selectedTeam || undefined),
    { enabled: !!sport }
  )

  const { data: playerStats, isLoading: statsLoading } = useQuery(
    ['playerStats', sport, selectedSeason, selectedTeam],
    () => fetchPlayerStats(sport, selectedSeason, selectedTeam || undefined),
    { enabled: !!sport && !!selectedSeason }
  )

  const isLoading = contextLoading || playersLoading || statsLoading

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
          {currentSportData.displayName} Player Statistics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Individual player performance metrics and trends for {currentSportData.displayName}.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <PlayerStatsFilters
          sport={sport}
          selectedSeason={selectedSeason}
          selectedTeam={selectedTeam}
          filters={filters}
          sortOptions={sortOptions}
          onSeasonChange={setSelectedSeason}
          onTeamChange={setSelectedTeam}
          onFiltersChange={setFilters}
          onSortChange={setSortOptions}
        />
      </div>

      {/* Stats Table */}
      <PlayerStatsTable
        players={players || []}
        playerStats={playerStats || []}
        isLoading={isLoading}
        sport={sport}
        sortOptions={sortOptions}
        onSortChange={setSortOptions}
      />
    </div>
  )
}
