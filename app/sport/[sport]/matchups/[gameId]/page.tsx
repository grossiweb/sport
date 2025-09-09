'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { SportType, Matchup, DetailedTeamStat } from '@/types'
import { sportsAPI } from '@/lib/api/sports-api'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { format } from 'date-fns'
import { 
  ClockIcon, 
  MapPinIcon, 
  TrophyIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { BettingCard } from '@/components/betting/BettingCard'
import { TeamDetailedStats } from '@/components/teams/TeamDetailedStats'

const fetchMatchupDetails = async (sport: SportType, gameId: string): Promise<Matchup> => {
  const response = await fetch(`/api/matchups/${gameId}/details?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch matchup details')
  const result = await response.json()
  return result.data
}

const fetchTeamDetailedStats = async (sport: SportType, teamId: string): Promise<DetailedTeamStat[]> => {
  const response = await fetch(`/api/teams/${teamId}/stats?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch team detailed stats')
  const result = await response.json()
  return result.data
}

export default function MatchupDetailsPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)
  const [showAllLines, setShowAllLines] = useState(false)
  const [allBettingLines, setAllBettingLines] = useState<any[]>([])
  const [loadingAllLines, setLoadingAllLines] = useState(false)
  const [showTeamStats, setShowTeamStats] = useState(false)
  const gameId = params.gameId as string

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  const sport = validSport || currentSport

  const { data: matchup, isLoading, error } = useQuery(
    ['matchupDetails', sport, gameId],
    () => fetchMatchupDetails(sport, gameId),
    { enabled: !!sport && !!gameId }
  )

  // Fetch team stats for CFB teams (only FBS and FCS have detailed stats)
  const { data: homeTeamStats, isLoading: homeStatsLoading } = useQuery(
    ['teamStats', sport, matchup?.game.homeTeam.id],
    () => fetchTeamDetailedStats(sport, matchup!.game.homeTeam.id),
    { 
      enabled: !!sport && !!matchup && sport === 'CFB' && showTeamStats,
      retry: false
    }
  )

  const { data: awayTeamStats, isLoading: awayStatsLoading } = useQuery(
    ['teamStats', sport, matchup?.game.awayTeam.id],
    () => fetchTeamDetailedStats(sport, matchup!.game.awayTeam.id),
    { 
      enabled: !!sport && !!matchup && sport === 'CFB' && showTeamStats,
      retry: false
    }
  )

  const fetchAllBettingLines = async () => {
    if (!sport || !gameId || loadingAllLines) return
    
    try {
      setLoadingAllLines(true)
      const lines = await sportsAPI.getAllBettingLines(sport, gameId)
      setAllBettingLines(lines)
      setShowAllLines(true)
    } catch (error) {
      console.error('Failed to fetch all betting lines:', error)
    } finally {
      setLoadingAllLines(false)
    }
  }

  if (contextLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Matchup Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested matchup could not be found or may no longer be available.
          </p>
          <Link
            href={`/sport/${sport.toLowerCase()}/matchups`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Matchups
          </Link>
        </div>
      </div>
    )
  }

  if (!matchup) {
    return null
  }

  const { game, predictions } = matchup
  const confidenceColor = predictions.confidence >= 0.8 ? 'text-green-600' : 
                         predictions.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/sport/${sport.toLowerCase()}/matchups`}
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Matchups
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {game.awayTeam.name} vs {game.homeTeam.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {currentSportData.displayName} • {format(new Date(game.gameDate), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Game Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                game.status === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                game.status === 'final' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {game.status.toUpperCase()}
              </span>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-5 w-5 mr-2" />
                {format(new Date(game.gameDate), 'h:mm a')}
              </div>
            </div>

            {/* Teams Display */}
            <div className="grid grid-cols-2 gap-8">
              {/* Away Team */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {game.awayTeam.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {game.awayTeam.city}
                </p>
                {game.awayScore !== undefined ? (
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {game.awayScore}
                  </div>
                ) : (
                  <div className="text-2xl font-medium text-gray-500 dark:text-gray-400">
                    Away
                  </div>
                )}
              </div>

              {/* Home Team */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {game.homeTeam.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {game.homeTeam.city}
                </p>
                {game.homeScore !== undefined ? (
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {game.homeScore}
                  </div>
                ) : (
                  <div className="text-2xl font-medium text-gray-500 dark:text-gray-400">
                    Home
                  </div>
                )}
              </div>
            </div>

            {/* Venue */}
            {game.venue && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  {game.venue}
                </div>
              </div>
            )}
          </div>

          {/* AI Prediction Card */}
          {predictions && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Prediction
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Predicted Winner</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {predictions.predictedWinner}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Confidence Level</p>
                  <p className={`text-xl font-semibold ${confidenceColor}`}>
                    {(predictions.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Predicted Score</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {predictions.predictedScore.away} - {predictions.predictedScore.home}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Key Factors</p>
                  <div className="space-y-1">
                    {predictions.keyFactors.slice(0, 3).map((factor, index) => (
                      <span key={index} className="inline-block bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {predictions.aiAnalysis && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI Analysis</p>
                  <p className="text-gray-900 dark:text-white">
                    {predictions.aiAnalysis}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Betting Data Card */}
          {matchup.bettingData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Betting Lines
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Spread */}
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Point Spread</div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {matchup.bettingData.spread.home > 0 ? '+' : ''}{matchup.bettingData.spread.home}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    ({matchup.bettingData.spread.juice > 0 ? '+' : ''}{matchup.bettingData.spread.juice})
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {game.homeTeam.abbreviation}
                  </div>
                </div>

                {/* Total */}
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Points</div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {matchup.bettingData.total.points}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    O {matchup.bettingData.total.over} / U {matchup.bettingData.total.under}
                  </div>
                </div>

                {/* Money Line */}
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Money Line</div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{game.homeTeam.abbreviation}:</span>
                      <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                        {matchup.bettingData.moneyLine.home > 0 ? '+' : ''}{matchup.bettingData.moneyLine.home}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{game.awayTeam.abbreviation}:</span>
                      <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                        {matchup.bettingData.moneyLine.away > 0 ? '+' : ''}{matchup.bettingData.moneyLine.away}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sportsbook Info and Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {matchup.bettingData.sportsbook ? (
                      <span className="text-gray-600 dark:text-gray-400">
                        Lines from: <span className="font-medium text-gray-900 dark:text-white">{matchup.bettingData.sportsbook.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">Betting lines available</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {matchup.bettingData.sportsbook?.url && (
                      <a 
                        href={matchup.bettingData.sportsbook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                      >
                        Visit Sportsbook →
                      </a>
                    )}
                    <button
                      onClick={showAllLines ? () => setShowAllLines(false) : fetchAllBettingLines}
                      disabled={loadingAllLines}
                      className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50"
                    >
                      {loadingAllLines ? 'Loading...' : showAllLines ? 'Show Less' : 'Compare All Books'}
                    </button>
                  </div>
                </div>
              </div>

              {/* RLM Alert */}
              {matchup.bettingData.reverseLineMovement && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-400">
                      Reverse Line Movement Detected
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    The betting line has moved against the public betting percentage, indicating sharp money action.
                  </p>
                </div>
              )}

              {/* All Sportsbook Lines */}
              {showAllLines && allBettingLines.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    All Sportsbook Lines
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Sportsbook</th>
                          <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Spread</th>
                          <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Total</th>
                          <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Moneyline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBettingLines.map((line, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="py-3">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {line.sportsbook}
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {game.homeTeam.abbreviation} {line.spread.home > 0 ? '+' : ''}{line.spread.home}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ({line.spread.homeOdds > 0 ? '+' : ''}{line.spread.homeOdds})
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              <div className="space-y-1">
                                <div className="font-medium">{line.total.points}</div>
                                <div className="text-xs text-gray-500">
                                  O{line.total.over} / U{line.total.under}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              <div className="space-y-1 text-xs">
                                <div>{game.homeTeam.abbreviation}: {line.moneyline.home > 0 ? '+' : ''}{line.moneyline.home}</div>
                                <div>{game.awayTeam.abbreviation}: {line.moneyline.away > 0 ? '+' : ''}{line.moneyline.away}</div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Statistics Section */}
          {showTeamStats && sport === 'CFB' && (
            <TeamDetailedStats
              homeTeamStats={homeTeamStats || []}
              awayTeamStats={awayTeamStats || []}
              homeTeamName={game.homeTeam.name}
              awayTeamName={game.awayTeam.name}
              isLoading={homeStatsLoading || awayStatsLoading}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">League</span>
                <span className="font-medium text-gray-900 dark:text-white">{game.league}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Game ID</span>
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{game.id}</span>
              </div>
              {game.quarter && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quarter</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.quarter}</span>
                </div>
              )}
              {game.timeRemaining && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time Remaining</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.timeRemaining}</span>
                </div>
              )}
            </div>
          </div>

          {/* Weather (if available) */}
          {game.weather && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weather Conditions
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.weather.temperature}°F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Condition</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.weather.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wind</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {game.weather.windSpeed} mph {game.weather.windDirection}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Team Stats Toggle (CFB only) */}
          {sport === 'CFB' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Statistics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                View detailed season statistics for both teams. Available for FBS (I-A) and FCS (I-AA) teams only.
              </p>
              <button
                onClick={() => setShowTeamStats(!showTeamStats)}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                {showTeamStats ? 'Hide Team Stats' : 'Show Team Stats'}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={`/sport/${sport.toLowerCase()}/matchups`}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <TrophyIcon className="h-4 w-4 mr-2" />
              View All Matchups
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
