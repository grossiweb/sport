'use client'

import { useState } from 'react'
import { BettingCard } from '@/components/betting/BettingCard'
import { BettingFilters } from '@/components/betting/BettingFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BettingData, SportType } from '@/types'
import { useQuery } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'

const fetchBettingData = async (
  sport?: SportType,
  date?: string
): Promise<BettingData[]> => {
  const params = new URLSearchParams()
  if (sport) params.append('sport', sport)
  if (date) params.append('date', date)
  
  const response = await axios.get(`/api/betting/data?${params.toString()}`)
  return response.data.data
}

export default function BettingPage() {
  const [selectedSport, setSelectedSport] = useState<SportType | 'ALL'>('ALL')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showOnlyRLM, setShowOnlyRLM] = useState(false)

  const { data: bettingData, isLoading, refetch } = useQuery(
    ['bettingData', selectedSport, selectedDate],
    () => fetchBettingData(
      selectedSport === 'ALL' ? undefined : selectedSport,
      selectedDate
    ),
    {
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for live betting data
    }
  )

  const filteredData = bettingData?.filter(data => {
    if (showOnlyRLM && !data.reverseLineMovement) return false
    return true
  }) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Betting Data & Market Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Live betting lines, public money, sharp action, and reverse line movement alerts
        </p>
      </div>

      <BettingFilters
        selectedSport={selectedSport}
        selectedDate={selectedDate}
        showOnlyRLM={showOnlyRLM}
        onSportChange={setSelectedSport}
        onDateChange={setSelectedDate}
        onRLMToggle={setShowOnlyRLM}
        onRefresh={() => refetch()}
        totalGames={filteredData.length}
        rlmGames={bettingData?.filter(d => d.reverseLineMovement).length || 0}
      />

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="mt-8">
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData.map((data) => (
                <BettingCard key={data.gameId} bettingData={data} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No betting data found</h3>
                <p>
                  {showOnlyRLM 
                    ? 'No reverse line movement detected for your selected filters.'
                    : `No betting data available for ${format(new Date(selectedDate), 'MMMM do, yyyy')}`
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