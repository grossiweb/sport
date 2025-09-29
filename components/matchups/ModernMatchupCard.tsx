'use client'

import { useState } from 'react'
import { Matchup, SportType } from '@/types'
import { format } from 'date-fns'
import {
  ClockIcon,
  MapPinIcon,
  TrophyIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { BettingLinesPopup } from './BettingLinesPopup'
import { ScoreByPeriodPopup } from './ScoreByPeriodPopup'
import { formatToEasternTime, formatToEasternDate, formatToEasternWeekday } from '@/lib/utils/time'
import { useScoreByPeriod } from '@/hooks/useScoreByPeriod'

interface ModernMatchupCardProps {
  matchup: Matchup
  sport: SportType
}

export function ModernMatchupCard({ matchup, sport }: ModernMatchupCardProps) {
  const { game, predictions } = matchup
  const [isHovered, setIsHovered] = useState(false)
  const [showBettingPopup, setShowBettingPopup] = useState(false)
  const [showScorePopup, setShowScorePopup] = useState(false)

  const gameTime = formatToEasternTime(game.gameDate)
  const gameDate = formatToEasternDate(game.gameDate, { month: 'short', day: 'numeric', year: 'numeric' })
  const gameDayOfWeek = formatToEasternWeekday(game.gameDate)
  const isScheduled = game.status === 'scheduled'
  const showPredictions = isScheduled && !!predictions

  const formatScoreValue = (value: number) => (Number.isInteger(value) ? value.toString() : value.toFixed(1))

  const predictionInfo = showPredictions && predictions
    ? (() => {
        const homeWinPct = predictions.predictedWinner === game.homeTeam.name
          ? predictions.confidence * 100
          : 100 - predictions.confidence * 100

        return {
          awayScore: formatScoreValue(predictions.predictedScore.away),
          homeScore: formatScoreValue(predictions.predictedScore.home),
          homeWinPercentage: homeWinPct,
          awayWinPercentage: 100 - homeWinPct,
          updatedAt: predictions.createdAt
        }
      })()
    : null

  const awayScoreDisplay = predictionInfo
    ? predictionInfo.awayScore
    : game.awayScore !== undefined && game.awayScore !== null
      ? game.awayScore.toString()
      : '-'

  const homeScoreDisplay = predictionInfo
    ? predictionInfo.homeScore
    : game.homeScore !== undefined && game.homeScore !== null
      ? game.homeScore.toString()
      : '-'

  const homeWinPercentage = predictionInfo?.homeWinPercentage
  const awayWinPercentage = predictionInfo?.awayWinPercentage

  // Color functions for percentages
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400'
    return 'text-red-600 dark:text-red-400'
  }

  const { hasScores: hasScoreByPeriod } = useScoreByPeriod(game.scoreByPeriod)
  const shouldShowScoreButton = hasScoreByPeriod && game.status === 'final'

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dark Header with Team Names */}
      <div className="px-6 py-4 bg-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {game.awayTeam.name} @ {game.homeTeam.name}
          </h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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
      <div className="p-4">
        {/* Teams Side by Side with Date in Center */}
        <div className="grid grid-cols-3 gap-3 items-center mb-4">
          {/* Away Team */}
          <div className="text-center">
            <TeamLogo team={game.awayTeam} size="xl" className="mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {game.awayTeam.abbreviation}
            </div>
            {game.awayTeam.record && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {game.awayTeam.record}
              </div>
            )}
              {predictionInfo ? (
              <>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {awayScoreDisplay}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    {Math.round(predictionInfo.awayWinPercentage)}% Win
                  </span>
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-300">
                  AI Prediction
                </div>
              </>
            ) : (
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {awayScoreDisplay}
              </div>
            )}
          </div>

          {/* Game Date & Time in Center */}
          <div className="text-center border-l border-r border-gray-200 dark:border-gray-700 px-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {gameDayOfWeek}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {gameDate}
            </div>
            <div className="text-md font-semibold text-blue-600 dark:text-blue-400">
              {gameTime}
            </div>
            {showPredictions && (
              <div className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-300">
                AI numbers display until kickoff
              </div>
            )}
            {game.venue && (
              <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {game.venue}
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="text-center">
            <TeamLogo team={game.homeTeam} size="xl" className="mx-auto mb-3" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {game.homeTeam.abbreviation}
            </div>
            {game.homeTeam.record && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {game.homeTeam.record}
              </div>
            )}
              {predictionInfo ? (
              <>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {homeScoreDisplay}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    {Math.round(predictionInfo.homeWinPercentage)}% Win
                  </span>
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-300">
                  AI Prediction
                </div>
              </>
            ) : (
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {homeScoreDisplay}
              </div>
            )}
          </div>
        </div>

        {/* Additional matchup context can go here when available */}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Link
            href={`/sport/${sport.toLowerCase()}/matchups/${game.id}`}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform ${isHovered ? 'scale-105' : 'scale-100'}`}
          >
            <TrophyIcon className="h-4 w-4 mr-2" />
            Matchup
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Link>
          {shouldShowScoreButton ? (
            <button
              onClick={() => setShowScorePopup(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg border border-blue-100 dark:border-blue-500/40 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              View Box Score
            </button>
          ) : (
            <button
              onClick={() => setShowBettingPopup(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg border border-blue-100 dark:border-blue-500/40 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              View Betting Lines
            </button>
          )}
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
    </div>
  )
}