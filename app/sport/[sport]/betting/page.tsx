'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SportType, Game, BettingData } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { sportsAPI } from '@/lib/api/sports-api'
import { BettingCard } from '@/components/betting/BettingCard'
import { BettingFilters } from '@/components/betting/BettingFilters'

interface GameWithBetting extends Game {
  bettingData?: BettingData | null
}

export default function SportBettingPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [games, setGames] = useState<GameWithBetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showOnlyRLM, setShowOnlyRLM] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const fetchBettingData = async () => {
    if (!validSport) return;
  
    try {
      setIsLoading(true);
      setError(null);
  
      // ✅ Fetch games for the selected date
      const gamesData = await sportsAPI.getGames(validSport, selectedDate, 10);
  
      // ✅ Properly type the result of Promise.allSettled
      const gamesWithBetting: PromiseSettledResult<GameWithBetting>[] =
        await Promise.allSettled(
          gamesData.map(async (game) => {
            try {
              const bettingData = await sportsAPI.getBettingData(validSport, game.id);
              return { ...game, bettingData };
            } catch (error) {
              console.warn(`Failed to fetch betting data for game ${game.id}:`, error);
              return { ...game, bettingData: null };
            }
          })
        );
  
      // ✅ Filter only fulfilled promises safely
      const validGames = gamesWithBetting
        .filter(
          (result): result is PromiseFulfilledResult<GameWithBetting> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value)
        .filter((game) => game.bettingData !== null); // ✅ Only show games with betting data
  
      setGames(validGames);
    } catch (error) {
      console.error('Error fetching betting data:', error);
      setError('Failed to load betting data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (validSport) {
      fetchBettingData()
    }
  }, [validSport, selectedDate])

  const filteredGames = games.filter(game => {
    if (showOnlyRLM) {
      return game.bettingData?.reverseLineMovement
    }
    return true
  })

  const rlmGames = games.filter(game => game.bettingData?.reverseLineMovement).length

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
          {currentSportData.displayName} Betting Data
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Money lines, spreads, and public betting information for {currentSportData.displayName}.
        </p>
      </div>

      {/* Filters */}
      <BettingFilters
        selectedSport={validSport === "CFB" ? "CFB" : "ALL"}
        selectedDate={selectedDate}
        showOnlyRLM={showOnlyRLM}
        onSportChange={() => {}} // Sport is fixed based on URL
        onDateChange={setSelectedDate}
        onRLMToggle={setShowOnlyRLM}
        onRefresh={fetchBettingData}
        totalGames={games.length}
        rlmGames={rlmGames}
      />

      {/* Content */}
      <div className="mt-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400">{error}</p>
            <button 
              onClick={fetchBettingData}
              className="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
            >
              Try again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => (
              game.bettingData && (
                <BettingCard 
                  key={game.id} 
                  bettingData={game.bettingData}
                  game={game}
                />
              )
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              No Betting Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {showOnlyRLM 
                ? "No games with reverse line movement found for the selected date."
                : "No games with betting lines found for the selected date."
              }
            </p>
            <button 
              onClick={fetchBettingData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
