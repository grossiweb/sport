'use client'

import { useState, useEffect } from 'react'
import { Matchup, SportType, DetailedTeamStat } from '@/types'
import { format } from 'date-fns'
import { 
  ClockIcon, 
  MapPinIcon, 
  TrophyIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { BettingCard } from '@/components/betting/BettingCard'
import { TeamDetailedStats } from '@/components/teams/TeamDetailedStats'

interface ModernMatchupDetailProps {
  matchup: Matchup
  sport: SportType
}

export function ModernMatchupDetail({ matchup, sport }: ModernMatchupDetailProps) {
  const { game, predictions, trends, injuries, bettingData, teamStats, matchupAnalysis, headToHead } = matchup
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'trends' | 'betting'>('overview')
  const [homeTeamDetailedStats, setHomeTeamDetailedStats] = useState<DetailedTeamStat[]>([])
  const [awayTeamDetailedStats, setAwayTeamDetailedStats] = useState<DetailedTeamStat[]>([])
  const [loadingDetailedStats, setLoadingDetailedStats] = useState(false)

  const gameTime = format(new Date(game.gameDate), 'h:mm a')
  const gameDate = format(new Date(game.gameDate), 'MMM d, yyyy')
  const gameDayOfWeek = format(new Date(game.gameDate), 'EEEE')

  // Calculate win probabilities for AI predictions
  const homeWinPercentage = predictions.predictedWinner === game.homeTeam.name ? 
    (predictions.confidence * 100) : (100 - predictions.confidence * 100)
  const awayWinPercentage = 100 - homeWinPercentage

  // Color functions for percentages
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Fetch detailed stats when stats tab is active
  useEffect(() => {
    const fetchDetailedStats = async () => {
      if (activeTab === 'stats' && homeTeamDetailedStats.length === 0 && awayTeamDetailedStats.length === 0) {
        setLoadingDetailedStats(true)
        try {
          const [homeResponse, awayResponse] = await Promise.all([
            fetch(`/api/teams/${game.homeTeam.id}/stats?sport=${sport}`),
            fetch(`/api/teams/${game.awayTeam.id}/stats?sport=${sport}`)
          ])

          if (homeResponse.ok && awayResponse.ok) {
            const homeData = await homeResponse.json()
            const awayData = await awayResponse.json()
            
            setHomeTeamDetailedStats(homeData.data || [])
            setAwayTeamDetailedStats(awayData.data || [])
          }
        } catch (error) {
          console.error('Failed to fetch detailed team stats:', error)
        } finally {
          setLoadingDetailedStats(false)
        }
      }
    }

    fetchDetailedStats()
  }, [activeTab, game.homeTeam.id, game.awayTeam.id, sport, homeTeamDetailedStats.length, awayTeamDetailedStats.length])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrophyIcon },
    { id: 'stats', name: 'Team Stats', icon: ChartBarIcon },
    { id: 'trends', name: 'Trends & Analysis', icon: ArrowTrendingUpIcon },
    { id: 'betting', name: 'Betting', icon: CurrencyDollarIcon },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/sport/${sport.toLowerCase()}/matchups`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Matchups
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        {/* Dark Header with Team Names */}
        <div className="px-8 py-6 bg-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {game.awayTeam.name} @ {game.homeTeam.name}
            </h1>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              game.status === 'live' ? 'bg-red-500 text-white' :
              game.status === 'final' ? 'bg-gray-600 text-gray-200' :
              'bg-blue-500 text-white'
            }`}>
              {game.status === 'live' && <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>}
              {game.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Teams Side by Side with Date in Center */}
        <div className="p-8">
          <div className="grid grid-cols-3 gap-8 items-center mb-8">
            {/* Away Team */}
            <div className="text-center">
              <TeamLogo team={game.awayTeam} size="2xl" className="mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {game.awayTeam.abbreviation}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {game.awayTeam.name}
              </div>
              {game.awayTeam.record && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {game.awayTeam.record}
                </div>
              )}
              {game.awayTeam.conference && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {game.awayTeam.conference.name}
                </div>
              )}
              {game.awayScore !== undefined && (
                <div className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
                  {game.awayScore}
                </div>
              )}
            </div>

            {/* Game Date & Time in Center */}
            <div className="text-center border-l border-r border-gray-200 dark:border-gray-700 px-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {gameDayOfWeek}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {gameDate}
              </div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
                {gameTime}
              </div>
              {game.venue && (
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {game.venue}
                </div>
              )}
              {game.broadcast && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {game.broadcast}
                </div>
              )}
            </div>

            {/* Home Team */}
            <div className="text-center">
              <TeamLogo team={game.homeTeam} size="2xl" className="mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {game.homeTeam.abbreviation}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {game.homeTeam.name}
              </div>
              {game.homeTeam.record && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {game.homeTeam.record}
                </div>
              )}
              {game.homeTeam.conference && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {game.homeTeam.conference.name}
                </div>
              )}
              {game.homeScore !== undefined && (
                <div className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
                  {game.homeScore}
                </div>
              )}
            </div>
          </div>

          {/* AI Prediction with Colored Percentages */}
          {predictions && (
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center mb-4">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  AI Prediction
                </span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {game.awayTeam.abbreviation}
                  </div>
                  <div className={`text-3xl font-bold ${getPercentageColor(awayWinPercentage)}`}>
                    {awayWinPercentage.toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {game.homeTeam.abbreviation}
                  </div>
                  <div className={`text-3xl font-bold ${getPercentageColor(homeWinPercentage)}`}>
                    {homeWinPercentage.toFixed(0)}%
                  </div>
                </div>
              </div>
              <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
                Predicted Score: {predictions.predictedScore.away} - {predictions.predictedScore.home}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Key Factors */}
            {predictions?.keyFactors && predictions.keyFactors.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Key Factors
                </h3>
                <div className="space-y-3">
                  {predictions.keyFactors.map((factor, index) => (
                    <div key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Injuries */}
            {injuries && injuries.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  Injury Report
                </h3>
                <div className="space-y-3">
                  {injuries.map((injury, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {injury.injury}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        injury.status === 'out' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                        injury.status === 'questionable' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {injury.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Head to Head */}
            {headToHead && headToHead.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Head-to-Head History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {headToHead.map((game, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(game.date), 'MMM d, yyyy')}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {game.awayScore} - {game.homeScore}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                        {game.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {loadingDetailedStats ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <TeamDetailedStats
                homeTeamStats={homeTeamDetailedStats}
                awayTeamStats={awayTeamDetailedStats}
                homeTeamName={game.homeTeam.name}
                awayTeamName={game.awayTeam.name}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                isLoading={loadingDetailedStats}
                sport={sport}
              />
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Matchup Analysis */}
            {matchupAnalysis && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Matchup Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Offensive Matchup</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {matchupAnalysis.offensiveMatchup}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Defensive Matchup</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {matchupAnalysis.defensiveMatchup}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Special Teams</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {matchupAnalysis.specialTeams}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Coaching</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {matchupAnalysis.coaching}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trends */}
            {trends && trends.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Current Trends
                </h3>
                <div className="space-y-4">
                  {trends.map((trend, index) => (
                    <div key={index} className="flex items-start">
                      <span className={`inline-block w-3 h-3 rounded-full mr-3 mt-1 ${
                        trend.impact === 'high' ? 'bg-red-500' : 
                        trend.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {trend.description}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Impact: {trend.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'betting' && bettingData && (
          <div className="space-y-6">
            <BettingCard bettingData={bettingData} game={game} />
          </div>
        )}
      </div>
    </div>
  )
}
