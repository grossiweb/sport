'use client'

import { useState, useEffect } from 'react'
import { PlayerStatsTable } from '@/components/players/PlayerStatsTable'
import { PlayerStatsFilters } from '@/components/players/PlayerStatsFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Player, PlayerStats, SportType, FilterOptions, SortOptions } from '@/types'
import { useQuery } from 'react-query'
import axios from 'axios'

const fetchPlayers = async (team?: string): Promise<Player[]> => {
  const params = new URLSearchParams()
  if (team) params.append('team', team)
  
  const response = await axios.get(`/api/players?${params.toString()}`)
  return response.data.data
}

const fetchPlayerStats = async (season: string, playerId?: string, teamId?: string): Promise<PlayerStats[]> => {
  const params = new URLSearchParams({ season })
  if (playerId) params.append('playerId', playerId)
  if (teamId) params.append('teamId', teamId)
  
  const response = await axios.get(`/api/players/stats?${params.toString()}`)
  return response.data.data
}

export default function PlayersPage() {
  const [selectedSport, setSelectedSport] = useState<SportType>('CFB')
  const [selectedSeason, setSelectedSeason] = useState('2024')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'battingAverage',
    direction: 'desc'
  })

  // Set default sort field for College Football
  useEffect(() => {
    setSortOptions(prev => ({
      ...prev,
      field: 'passingYards' // Default for CFB
    }))
  }, [])

  const { data: players, isLoading: playersLoading, error: playersError } = useQuery(
    ['players', selectedTeam],
    () => fetchPlayers(selectedTeam || undefined),
    {}
  )

  const { data: playerStats, isLoading: statsLoading, error: statsError } = useQuery(
    ['playerStats', selectedSeason, selectedTeam],
    () => fetchPlayerStats(selectedSeason, undefined, selectedTeam || undefined),
    { 
      enabled: !!selectedSeason // Always enabled since we have a default season
    }
  )

  const isLoading = playersLoading || statsLoading

  // Debug logging
  console.log('Players data:', players)
  console.log('Players loading:', playersLoading)
  console.log('Players error:', playersError)
  console.log('Player stats data:', playerStats)
  console.log('Stats loading:', statsLoading)
  console.log('Stats error:', statsError)

  return (
    <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            College Football Player Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedTeam 
              ? `Player stats for selected team (2024 season)` 
              : 'All College Football player stats (2024 season) - Select a team to filter'}
          </p>
        </div>

      <PlayerStatsFilters
        selectedSeason={selectedSeason}
        selectedTeam={selectedTeam}
        filters={filters}
        sortOptions={sortOptions}
        onSeasonChange={setSelectedSeason}
        onTeamChange={setSelectedTeam}
        onFiltersChange={setFilters}
        onSortChange={setSortOptions}
      />

                   {/* Debug Information */}
             <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
               <h3 className="font-semibold mb-2">Debug Info:</h3>
               <p>Players Loading: {playersLoading ? 'Yes' : 'No'}</p>
               <p>Stats Loading: {statsLoading ? 'Yes' : 'No'}</p>
               <p>Players Count: {players?.length || 0}</p>
               <p>Player Stats Count: {playerStats?.length || 0}</p>
               <p>Selected Team: {selectedTeam || 'All Teams'}</p>
               <p>API Call: /api/players{selectedTeam ? `?team=${selectedTeam}` : ''}</p>
               <p>Stats API Call: /api/players/stats?season={selectedSeason}{selectedTeam ? `&teamId=${selectedTeam}` : ''}</p>
               <p>Filter Mode: {selectedTeam ? `Team ${selectedTeam} Only` : 'All Teams (Default)'}</p>
               {players && players.length > 0 && (
                 <div>
                   <p>Sample Players:</p>
                   <ul className="text-sm ml-4">
                     {players.slice(0, 3).map(player => (
                       <li key={player.id}>{player.name} (Team: {player.teamId}, Position: {player.position})</li>
                     ))}
                   </ul>
                 </div>
               )}
               {playersError && <p className="text-red-500">Players Error: {playersError instanceof Error ? playersError.message : 'Unknown error'}</p>}
               {statsError && <p className="text-red-500">Stats Error: {statsError instanceof Error ? statsError.message : 'Unknown error'}</p>}
             </div>

      {isLoading ? (
        <div className="mt-8">
          <LoadingSpinner size="lg" />
          <p className="text-center mt-4">Loading College Football players...</p>
        </div>
      ) : playersError || statsError ? (
        <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error loading data:</h3>
          {playersError && <p>Players: {playersError instanceof Error ? playersError.message : 'Unknown players error'}</p>}
          {statsError && <p>Stats: {statsError instanceof Error ? statsError.message : 'Unknown stats error'}</p>}
        </div>
      ) : (
        <div className="mt-8">
          <PlayerStatsTable
            players={players || []}
            playerStats={playerStats || []}
            sport={selectedSport}
            filters={filters}
            sortOptions={sortOptions}
          />
        </div>
      )}
    </div>
  )
}