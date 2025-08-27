'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { SportType, Matchup } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { MatchupCard } from '@/components/matchups/MatchupCard'
import { MatchupFilters } from '@/components/matchups/MatchupFilters'

const fetchMatchups = async (sport: SportType, date?: string): Promise<Matchup[]> => {
  const params = new URLSearchParams()
  params.append('sport', sport)
  if (date) params.append('date', date)
  
  const response = await fetch(`/api/matchups?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch matchups')
  const result = await response.json()
  return result.data
}

export default function SportMatchupsPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [filters, setFilters] = useState({})

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const sport = validSport || currentSport

  const { data: matchups, isLoading: matchupsLoading, error } = useQuery(
    ['matchups', sport, selectedDate],
    () => fetchMatchups(sport, selectedDate),
    { 
      enabled: !!sport,
      refetchInterval: 60000 // Refetch every minute for live updates
    }
  )

  const isLoading = contextLoading || matchupsLoading

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
          {currentSportData.displayName} Matchups
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Daily game insights with AI predictions and betting analysis for {currentSportData.displayName}.
        </p>
      </div>

      {/* Date and Filters */}
      <div className="mb-6">
        <MatchupFilters
          sport={sport}
          selectedDate={selectedDate}
          filters={filters}
          onDateChange={setSelectedDate}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Matchups List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Failed to load matchups. Please try again.
          </p>
        </div>
      ) : matchups && matchups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matchups.map((matchup) => (
            <MatchupCard
              key={matchup.game.id}
              matchup={matchup}
              sport={sport}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No games scheduled
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no {currentSportData.displayName} games scheduled for {selectedDate}.
          </p>
        </div>
      )}
    </div>
  )
}
