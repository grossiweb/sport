'use client'

import { useEffect, useState } from 'react'
import { Matchup, SportType, RecordSummary } from '@/types'
import { format } from 'date-fns'
import {
  ClockIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { BettingLinesPopup } from './BettingLinesPopup'
import { ScoreByPeriodPopup } from './ScoreByPeriodPopup'
import { formatToEasternTime, formatToEasternDate, formatToEasternWeekday } from '@/lib/utils/time'
import { useScoreByPeriod } from '@/hooks/useScoreByPeriod'
import { computeConsensus, computeAtsFromConsensus } from '@/lib/utils/consensus'

interface ModernMatchupCardProps {
  matchup: Matchup
  sport: SportType
}

export function ModernMatchupCard({ matchup, sport }: ModernMatchupCardProps) {
  const { game, predictions, coversSummary } = matchup
  const [isHovered, setIsHovered] = useState(false)
  const [showBettingPopup, setShowBettingPopup] = useState(false)
  const [showScorePopup, setShowScorePopup] = useState(false)
  const [consensusData, setConsensusData] = useState<{
    spreadAway: number | null
    spreadHome: number | null
    totalPoints: number | null
    winProbAway: number | null
    winProbHome: number | null
  } | null>(null)

  const gameTime = formatToEasternTime(game.gameDate)
  const gameDateShort = formatToEasternDate(game.gameDate, { month: 'short', day: 'numeric' })
  const gameDayOfWeek = formatToEasternWeekday(game.gameDate)
  const isScheduled = game.status === 'scheduled'
  const showPredictions = false

  const formatScoreValue = (value: number) => (Number.isInteger(value) ? value.toString() : value.toFixed(1))
  const displayScore = (val: unknown) => (typeof val === 'number' ? val.toString() : val === 0 ? '0' : '-')

  const predictionInfo = null

  const awayScoreDisplay = displayScore(game.awayScore)

  const homeScoreDisplay = displayScore(game.homeScore)

  const homeWinPercentage = undefined
  const awayWinPercentage = undefined

  // Color functions for percentages
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400'
    return 'text-red-600 dark:text-red-400'
  }

  const { hasScores: hasScoreByPeriod } = useScoreByPeriod(game.scoreByPeriod)
  const shouldShowScoreButton = hasScoreByPeriod && game.status === 'final'

  const formatRecord = (record?: RecordSummary) => {
    if (!record) return '0-0-0'
    return `${record.wins}-${record.losses}-${record.pushes}`
  }

  const formatRecordCompact = (record?: RecordSummary) => {
    if (!record) return '0-0'
    const { wins, losses, pushes } = record
    return pushes > 0 ? `${wins}-${losses}-${pushes}` : `${wins}-${losses}`
  }

  const getWinLossRecord = (recordString?: string, fallback?: RecordSummary) => {
    if (recordString && recordString.trim().length > 0) return recordString.trim()
    return formatRecordCompact(fallback)
  }

  const renderCoversRow = (
    label: string,
    prefix: string,
    suffix: string,
    homeRecord?: RecordSummary,
    awayRecord?: RecordSummary
  ) => (
    <div className="grid grid-cols-5 items-center text-[11px] text-gray-600 dark:text-gray-400">
      <span className="truncate" title={prefix}>
        {prefix}
      </span>
      <span className="text-center font-semibold text-gray-900 dark:text-white">
        {formatRecord(awayRecord)}
      </span>
      <span className="text-center font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <span className="text-center font-semibold text-gray-900 dark:text-white">
        {formatRecord(homeRecord)}
      </span>
      <span className="text-right truncate" title={suffix}>
        {suffix}
      </span>
    </div>
  )

  // Fetch all sportsbook lines for the game and compute consensus
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/betting-lines/${game.id}`)
        if (!res.ok) return
        const data = await res.json()
        const lineArray = Object.values(data?.lines || {}) as any[]
        if (lineArray.length === 0) return
        const consensus = computeConsensus(
          lineArray.map((l: any) => ({
            spread: {
              point_spread_away: l?.spread?.point_spread_away,
              point_spread_home: l?.spread?.point_spread_home,
              point_spread_away_money: l?.spread?.point_spread_away_money,
              point_spread_home_money: l?.spread?.point_spread_home_money
            },
            moneyline: {
              moneyline_away: l?.moneyline?.moneyline_away,
              moneyline_home: l?.moneyline?.moneyline_home
            },
            total: {
              total_over: l?.total?.total_over,
              total_under: l?.total?.total_under,
              total_over_money: l?.total?.total_over_money,
              total_under_money: l?.total?.total_under_money
            }
          }))
        )
        if (isMounted) setConsensusData(consensus)
      } catch (e) {
        // Silently ignore for now
      }
    })()
    return () => {
      isMounted = false
    }
  }, [game.id])

  const formatPct = (p: number | null | undefined) => (p == null ? '-' : `${Math.round(p * 100)}%`)
  const formatSpread = (v: number | null | undefined) => (v == null ? '-' : (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)))
  const formatTotal = (v: number | null | undefined) => (v == null ? '-' : v.toFixed(1))

  const pctBadgeClass = (p: number | null | undefined) => {
    if (p == null) return 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300'
    return p >= 0.5
      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
  }

  const canComputeATS = game.status === 'final' && consensusData &&
    typeof consensusData.spreadAway === 'number' && typeof consensusData.spreadHome === 'number'
  const atsResult = canComputeATS
    ? computeAtsFromConsensus(
        game.awayScore ?? 0,
        game.homeScore ?? 0,
        { spreadAway: consensusData!.spreadAway!, spreadHome: consensusData!.spreadHome! }
      )
    : null

  return (
    <>
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dark Header with Team Names */}
      <div className="px-5 py-3 bg-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            {game.awayTeam.name} @ {game.homeTeam.name}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
            game.status === 'live' ? 'bg-red-500 text-white' :
            game.status === 'final' ? 'bg-gray-600 text-gray-200' :
            'bg-blue-500 text-white'
          }`}>
            {game.status === 'live' && <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>}
            {game.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3">
        {/* Teams Side by Side with Date in Center */}
        <div className="grid grid-cols-3 gap-2 items-center mb-3">
          {/* Away Team: [Logo][Score][Short Name] left-aligned */}
          <div>
            <div className="flex items-center justify-start gap-2 mb-1">
              <TeamLogo team={game.awayTeam} size="md" className="" /> 
              <div className="text-[26px] font-bold leading-none text-gray-900 dark:text-white">
                {game.awayTeam.abbreviation}
              </div>
              <div className="text-[26px] font-bold leading-none text-gray-900 dark:text-white">
                {awayScoreDisplay}
              </div>
            </div>
          </div>

          {/* Game Date & Time in Center */}
            <div className="text-center border-l border-r border-gray-200 dark:border-gray-700 px-4">
            <div className="inline-block text-[10px] text-gray-700 dark:text-gray-800 font-medium bg-[#fff7d1] px-2 py-0.5 rounded">
              {`${gameDayOfWeek}, ${gameDateShort}`}
            </div>
            <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              {gameTime}
            </div>
            {game.venue && (
              <div className="flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {game.venue}
              </div>
            )}
          </div>

          {/* Home Team: [Short Name][Score][Logo] right-aligned */}
          <div>
            <div className="flex items-center justify-end gap-2 mb-1">
              <div className="text-[26px] font-bold leading-none text-gray-900 dark:text-white">
                {homeScoreDisplay}
              </div>
              <div className="text-[26px] font-bold leading-none text-gray-900 dark:text-white">
                {game.homeTeam.abbreviation}
              </div>
              <TeamLogo team={game.homeTeam} size="md" className="" />
            </div>
          </div>
        </div>

        {/* Consensus Lines aligned under team logos */}
        {game.status !== 'final' && consensusData ? (
          <div className="mt-3 p-3 rounded-lg min-h-[38px]">
            <div className="w-full grid grid-cols-3 items-center">
              {/* Left: Away% and Away Spread */}
              <div className="flex items-center gap-2 justify-start">
                <span className={`px-2 py-0.5 rounded text-[18px] font-bold ${pctBadgeClass(consensusData.winProbAway)}`}>
                  {formatPct(consensusData.winProbAway)}
                </span>
                <span className="text-[16px] font-normal text-gray-900 dark:text-white">
                  {formatSpread(consensusData.spreadAway)}
                </span>
              </div>

              {/* Center: o/u TOTAL */}
              <div className="flex items-center justify-center">
                <span className="px-2 py-0.5 rounded text-gray-800 dark:text-gray-200 text-[16px] font-normal uppercase tracking-wide">
                  o/u {formatTotal(consensusData.totalPoints)}
                </span>
              </div>

              {/* Right: Home Spread and Home% */}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[16px] font-normal text-gray-900 dark:text-white">
                  {formatSpread(consensusData.spreadHome)}
                </span>
                <span className={`px-2 py-0.5 rounded text-[18px] font-bold ${pctBadgeClass(consensusData.winProbHome)}`}>
                  {formatPct(consensusData.winProbHome)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Placeholder to preserve height when consensus is hidden on final games
          <div className="mt-3 p-3 rounded-lg min-h-[38px]"></div>
        )}

        {/* Matchup of Covers */}
        {coversSummary && (
          <div className="mt-4 p-3  rounded-lg">
            <div className="space-y-1">
              {renderCoversRow(
                'Win/Loss',
                `(${game.awayTeam.record} Road)` || '(-)',
                `(${game.homeTeam.record} Home)` || '(-)',
                coversSummary.home.overall,
                coversSummary.away.overall
              )}
              {renderCoversRow(
                'Against the Spread',
                coversSummary.away.ats?.road
                  ? `(${formatRecord(coversSummary.away.ats.road)} Road)`
                  : '-',
                coversSummary.home.ats?.home
                  ? `(${formatRecord(coversSummary.home.ats.home)} Home)`
                  : '-',
                coversSummary.home.ats?.overall,
                coversSummary.away.ats?.overall
              )}
              {renderCoversRow(
                'Last 10',
                coversSummary.away.lastTen.gamesPlayed > 0
                  ? `(${formatRecord(coversSummary.away.lastTen)})`
                  : '-',
                coversSummary.home.lastTen.gamesPlayed > 0
                  ? `(${formatRecord(coversSummary.home.lastTen)})`
                  : '-',
                coversSummary.home.ats?.lastTen,
                coversSummary.away.ats?.lastTen
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Link
            href={`/sport/${sport.toLowerCase()}/matchups/${game.id}`}
            className={`h-[35px] w-auto px-4 inline-flex items-center justify-center border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200`}
          >
            Matchup
          </Link>
          {shouldShowScoreButton ? (
            <button
              onClick={() => setShowScorePopup(true)}
              className="h-[35px] w-auto px-4 inline-flex items-center justify-center text-sm font-semibold rounded-lg border border-blue-100 dark:border-blue-500/40 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              View Box Score
            </button>
          ) : (
            <button
              onClick={() => setShowBettingPopup(true)}
              className="h-[35px] w-auto px-4 inline-flex items-center justify-center text-sm font-semibold rounded-lg border border-blue-100 dark:border-blue-500/40 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              View Betting Lines
            </button>
          )}
        </div>
      </div>

    </div>

    {/* Betting Lines Popup */}
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
    </>
  )
}