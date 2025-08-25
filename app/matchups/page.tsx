'use client'

import { useState, useEffect } from 'react'
import { MatchupCard } from '@/components/matchups/MatchupCard'
import { MatchupFilters } from '@/components/matchups/MatchupFilters'
import { MatchupHero } from '@/components/matchups/MatchupHero'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Game, Matchup, SportType } from '@/types'
import { useQuery } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'

const fetchTodaysMatchups = async (sport?: SportType, date?: string): Promise<Matchup[]> => {
  const params = new URLSearchParams()
  if (sport) params.append('sport', sport)
  if (date) params.append('date', date)
  
  const response = await axios.get(`/api/matchups?${params.toString()}`)
  return response.data.data
}

export default function MatchupsPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'ALL'>('ALL')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showOnlyPremium, setShowOnlyPremium] = useState(false)

  const { data: matchups, isLoading, refetch } = useQuery(
    ['matchups', selectedSport, selectedDate],
    () => fetchTodaysMatchups(
      selectedSport === 'ALL' ? undefined : selectedSport,
      selectedDate
    ),
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for live data
      refetchOnWindowFocus: true
    }
  )

  const filteredMatchups = matchups?.filter(matchup => {
    if (showOnlyPremium && matchup.predictions.confidence < 0.8) return false
    return true
  }) || []

  const groupedMatchups = filteredMatchups.reduce((acc, matchup) => {
    const sport = matchup.game.league
    if (!acc[sport]) {
      acc[sport] = []
    }
    acc[sport].push(matchup)
    return acc
  }, {} as Record<SportType, Matchup[]>)

  return (
    <div className="container mx-auto px-4 py-8">
      <MatchupHero 
        totalGames={filteredMatchups.length}
        highConfidencePicks={filteredMatchups.filter(m => m.predictions.confidence >= 0.8).length}
        date={selectedDate}
      />

      <div className="mt-8">
        <MatchupFilters
          selectedSport={selectedSport}
          selectedDate={selectedDate}
          showOnlyPremium={showOnlyPremium}
          onSportChange={setSelectedSport}
          onDateChange={setSelectedDate}
          onPremiumToggle={setShowOnlyPremium}
          onRefresh={() => refetch()}
        />
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(groupedMatchups).map(([sport, sportMatchups]) => (
            <div key={sport}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sport} Games
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                  {sportMatchups.length} {sportMatchups.length === 1 ? 'Game' : 'Games'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sportMatchups.map((matchup) => (
                  <MatchupCard key={matchup.game.id} matchup={matchup} />
                ))}
              </div>
            </div>
          ))}

          {filteredMatchups.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No games found</h3>
                <p>
                  {selectedSport === 'ALL' 
                    ? `No games scheduled for ${format(new Date(selectedDate), 'MMMM do, yyyy')}`
                    : `No ${selectedSport} games scheduled for ${format(new Date(selectedDate), 'MMMM do, yyyy')}`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}