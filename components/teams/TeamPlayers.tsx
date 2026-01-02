'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Player, SportType } from '@/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface TeamPlayersProps {
  teamId: string
  sport: SportType
  teamName?: string
}

interface GroupedPlayers {
  [position: string]: Player[]
}

const TeamPlayers: React.FC<TeamPlayersProps> = ({ teamId, sport, teamName }) => {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string>('All')

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/players?sport=${sport}&team=${teamId}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch players')
        }
        
        setPlayers(data.data || [])
      } catch (err) {
        console.error('Error fetching players:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch players')
      } finally {
        setLoading(false)
      }
    }

    if (teamId && sport) {
      fetchPlayers()
    }
  }, [teamId, sport])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold">Error Loading Players</h3>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }


  // Group players by position
  const groupedPlayers: GroupedPlayers = players.reduce((acc, player) => {
    const position = player.position || 'Unknown'
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(player)
    return acc
  }, {} as GroupedPlayers)

  // Get unique positions for filter
  const positions = ['All', ...Object.keys(groupedPlayers).sort()]

  // Filter players based on selected position
  const filteredPlayers = selectedPosition === 'All' 
    ? players 
    : groupedPlayers[selectedPosition] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {teamName ? `${teamName} Roster` : 'Team Roster'}
          </h2>
          <p className="text-gray-600 mt-1">
            {players.length} player{players.length !== 1 ? 's' : ''} • {sport}
          </p>
        </div>

        {/* Position Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="position-filter" className="text-sm font-medium text-gray-700">
            Position:
          </label>
          <select
            id="position-filter"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {positions.map(position => (
              <option key={position} value={position}>
                {position} {position !== 'All' && groupedPlayers[position] ? `(${groupedPlayers[position].length})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Height
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlayers.map((player, index) => (
                <tr key={player.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {player.jerseyNumber ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{player.jerseyNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/sport/${sport.toLowerCase()}/teams/${teamId}/players/${player.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-800"
                    >
                      {player.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {player.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.age || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.height || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.weight ? `${player.weight} lbs` : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-semibold">No Players Found</h3>
              <p className="text-sm text-gray-600 mt-2">
                {selectedPosition !== 'All' 
                  ? `No players found for position: ${selectedPosition}` 
                  : 'No players found for this team'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary by Position */}
      {selectedPosition === 'All' && Object.keys(groupedPlayers).length > 1 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Roster Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(groupedPlayers)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([position, positionPlayers]) => (
                <div key={position} className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {positionPlayers.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {position}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamPlayers
