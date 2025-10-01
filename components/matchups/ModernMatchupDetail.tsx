'use client'

import { useState, useEffect, useCallback } from 'react'
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
  CalendarIcon,
  ChevronDownIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { TeamDetailedStats } from '@/components/teams/TeamDetailedStats'
import { BettingLinesPopup } from '@/components/matchups/BettingLinesPopup'
import { ScoreByPeriodPopup } from '@/components/matchups/ScoreByPeriodPopup'
import { ScoreByPeriodSummary } from '@/components/matchups/ScoreByPeriodSummary'
import { formatToEasternTime, formatToEasternDate, formatToEasternWeekday } from '@/lib/utils/time'
import { useScoreByPeriod } from '@/hooks/useScoreByPeriod'

interface ModernMatchupDetailProps {
  matchup: Matchup
  sport: SportType
}

export function ModernMatchupDetail({ matchup, sport }: ModernMatchupDetailProps) {
  const { game, predictions, trends, injuries, matchupAnalysis, headToHead } = matchup
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'trends' | 'betting'>('stats')
  const [homeTeamDetailedStats, setHomeTeamDetailedStats] = useState<DetailedTeamStat[]>([])
  const [awayTeamDetailedStats, setAwayTeamDetailedStats] = useState<DetailedTeamStat[]>([])
  const [loadingDetailedStats, setLoadingDetailedStats] = useState(false)
  const [showBettingPopup, setShowBettingPopup] = useState(false)
  const [showScorePopup, setShowScorePopup] = useState(false)

  const gameTime = formatToEasternTime(game.gameDate)
  const gameDate = formatToEasternDate(game.gameDate, { month: 'short', day: 'numeric', year: 'numeric' })
  const gameDayOfWeek = formatToEasternWeekday(game.gameDate)

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
    // { id: 'overview', name: 'Overview', icon: TrophyIcon }, // hidden
    { id: 'stats', name: 'Team Stats', icon: ChartBarIcon },
    { id: 'trends', name: 'Trends & Analysis', icon: ArrowTrendingUpIcon }, // hidden for now
    { id: 'betting', name: 'Odds', icon: CurrencyDollarIcon },
  ] as const

  const predictionInfo = null

  const formatScoreValue = (value: number) => (Number.isInteger(value) ? value.toString() : value.toFixed(1))

  const { hasScores: hasScoreByPeriod } = useScoreByPeriod(game.scoreByPeriod)

  const shouldShowScoreButton = hasScoreByPeriod && game.status === 'final'

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
      <div className="bg-[#0D1B2A] text-white rounded-xl shadow-lg overflow-hidden mb-8">
        {/* Covers-style Matchup Header Card */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-3">
            {/* Away Team (Left) */}
            <div className="w-1/3 flex items-center justify-end gap-3 min-w-0">
              <TeamLogo team={game.awayTeam} size="xl" className="flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold truncate">{game.awayTeam.name}</div>
                <div className="text-xs text-gray-300 truncate">
                  {game.awayTeam.conference?.name || '—'} • {game.awayTeam.record || '—'}
            </div>
          </div>
        </div>

            {/* Center Info */}
            <div className="w-1/3 text-center px-2">
              <div className="text-sm font-semibold">{gameTime}</div>
              <div className="text-xs text-gray-300">{format(new Date(game.gameDate), 'MMM dd, yyyy')}</div>
              {game.venue && (
                <div className="mt-1 flex items-center justify-center text-xs text-gray-300 gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="truncate max-w-[220px]">{game.venue}</span>
                </div>
              )}
              {game.broadcast && (
                <div className="text-xs text-gray-300 mt-0.5">{game.broadcast}</div>
              )}
              {/* Weather if available */}
              {game.weather && (
                <div className="mt-1 flex items-center justify-center text-xs text-gray-200 gap-1">
                  <CloudIcon className="h-4 w-4" />
                  <span>{`${game.weather.condition} ${Math.round(game.weather.temperature)}°F`}</span>
                </div>
              )}
            </div>

            {/* Home Team (Right) */}
            <div className="w-1/3 flex items-center justify-start gap-3 min-w-0">
              <div className="text-right min-w-0">
                <div className="text-lg font-bold truncate">{game.homeTeam.name}</div>
                <div className="text-xs text-gray-300 truncate">
                  {game.homeTeam.conference?.name || '—'} • {game.homeTeam.record || '—'}
              </div>
              </div>
              <TeamLogo team={game.homeTeam} size="xl" className="flex-shrink-0" />
                </div>
            </div>
          </div>

        {/* Optional: score by period below header card */}
        <div className="px-6 pb-6">
          <ScoreByPeriodSummary
            scoreByPeriod={game.scoreByPeriod}
            gameStatus={game.status}
            homeTeamAbbreviation={game.homeTeam.abbreviation}
            awayTeamAbbreviation={game.awayTeam.abbreviation}
            onOpenPopup={game.status === 'final' ? () => setShowScorePopup(true) : undefined}
          />
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
            {/* Betting Summary moved in place of predictions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                Betting Summary
                </h3>
              <DetailedBettingSection game={game} sport={sport} />
              </div>

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
                          {formatToEasternDate(game.date)}
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

        {activeTab === 'betting' && (
          <div className="space-y-6">
            <DetailedBettingSection game={game} sport={sport} />
          </div>
        )}
      </div>

      <BettingLinesPopup
        isOpen={showBettingPopup}
        onClose={() => setShowBettingPopup(false)}
        gameId={game.id}
        homeTeam={game.homeTeam}
        awayTeam={game.awayTeam}
        sport={sport}
      />

      <ScoreByPeriodPopup
        isOpen={showScorePopup}
        onClose={() => setShowScorePopup(false)}
        scoreByPeriod={game.scoreByPeriod}
        gameStatus={game.status}
        gameDate={game.gameDate}
        homeTeam={game.homeTeam}
        awayTeam={game.awayTeam}
      />
    </div>
  )
}

function DetailedBettingSection({ game, sport }: { game: Matchup['game']; sport: SportType }) {
  const [selectedSportsbook, setSelectedSportsbook] = useState<string>('')
  const [bettingData, setBettingData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBettingData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/betting-lines/${game.id}`)
      if (!response.ok) throw new Error('Failed to load betting data')
      const data = await response.json()
      setBettingData(data)
      if (data?.lines) {
        const sportsbookIds = Object.keys(data.lines)
        if (sportsbookIds.length > 0) {
          setSelectedSportsbook((prev) => prev || sportsbookIds[0])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load betting data')
    } finally {
      setLoading(false)
    }
  }, [game.id])

  useEffect(() => {
    loadBettingData()
  }, [loadBettingData])

  const selectedLine = bettingData?.lines?.[selectedSportsbook]
  const availableSportsbooks = bettingData?.lines ? Object.keys(bettingData.lines) : []

  const formatOdds = (odds: number) => (odds > 0 ? `+${odds}` : `${odds}`)
  const formatSpread = (spread: number) => (spread > 0 ? `+${spread}` : `${spread}`)
  const formatTime = (dateString: string) => formatToEasternTime(dateString)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Betting Lines</h2>
        </div>
        <button
          onClick={() => {
            setSelectedSportsbook('')
            loadBettingData()
          }}
          className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading betting lines...</span>
                  </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={() => {
              setSelectedSportsbook('')
              loadBettingData()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Retry
          </button>
                  </div>
      ) : availableSportsbooks.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-600 dark:text-gray-400">
          No betting lines available for this matchup.
                  </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Sportsbook
            </label>
            <div className="relative max-w-xs">
              <select
                value={selectedSportsbook}
                onChange={(e) => setSelectedSportsbook(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {availableSportsbooks.map((sportsbookId) => {
                  const sportsbook = bettingData.lines[sportsbookId]
                  return (
                    <option key={sportsbookId} value={sportsbookId}>
                      {sportsbook?.affiliate?.affiliate_name || `Sportsbook ${sportsbookId}`}
                    </option>
                  )
                })}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

          {selectedLine && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BettingLineCard
                  title="Moneyline"
                  color="from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30"
                  updatedAt={selectedLine.moneyline?.date_updated}
                  items={[
                    {
                      label: game.awayTeam.abbreviation,
                      value: formatOdds(selectedLine.moneyline?.moneyline_away)
                    },
                    {
                      label: game.homeTeam.abbreviation,
                      value: formatOdds(selectedLine.moneyline?.moneyline_home)
                    }
                  ]}
                />
                <BettingLineCard
                  title="Point Spread"
                  color="from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30"
                  updatedAt={selectedLine.spread?.date_updated}
                  items={[
                    {
                      label: game.awayTeam.abbreviation,
                      value: `${formatSpread(selectedLine.spread?.point_spread_away)} (${formatOdds(selectedLine.spread?.point_spread_away_money)})`
                    },
                    {
                      label: game.homeTeam.abbreviation,
                      value: `${formatSpread(selectedLine.spread?.point_spread_home)} (${formatOdds(selectedLine.spread?.point_spread_home_money)})`
                    }
                  ]}
                />
                <BettingLineCard
                  title="Total (O/U)"
                  color="from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30"
                  updatedAt={selectedLine.total?.date_updated}
                  items={[
                    {
                      label: 'Over',
                      value: `${selectedLine.total?.total_over} (${formatOdds(selectedLine.total?.total_over_money)})`
                    },
                    {
                      label: 'Under',
                      value: `${selectedLine.total?.total_under} (${formatOdds(selectedLine.total?.total_under_money)})`
                    }
                  ]}
                />
              </div>

              {selectedLine.affiliate?.affiliate_url && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedLine.affiliate.affiliate_name}
                        </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Best available odds from this book
                    </div>
                </div>
                  <a
                    href={selectedLine.affiliate.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                  >
                    Bet with {selectedLine.affiliate.affiliate_name}
                  </a>
              </div>
            )}
          </div>
        )}
        </>
      )}
    </div>
  )
}

function BettingLineCard({
  title,
  color,
  updatedAt,
  items
}: {
  title: string
  color: string
  updatedAt?: string
  items: Array<{ label: string; value: string }>
}) {
  return (
    <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
        {updatedAt && (
          <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-3 w-3 mr-1" />
            {formatToEasternTime(updatedAt)}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between bg-white/70 dark:bg-gray-800/50 rounded px-3 py-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
