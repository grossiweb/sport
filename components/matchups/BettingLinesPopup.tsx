'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  CurrencyDollarIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { SportType, Game } from '@/types'
import { formatToEasternTime } from '@/lib/utils/time'
import { formatSpread as formatSpreadUtil, formatOdds as formatOddsUtil, formatTotal as formatTotalUtil } from '@/lib/utils/betting-format'

interface BettingLine {
  affiliate: {
    affiliate_id: number
    affiliate_name: string
    affiliate_url: string
  }
  moneyline: {
    moneyline_away: number
    moneyline_home: number
    date_updated: string
  }
  spread: {
    point_spread_away: number
    point_spread_home: number
    point_spread_away_money: number
    point_spread_home_money: number
    date_updated: string
  }
  total: {
    total_over: number
    total_under: number
    total_over_money: number
    total_under_money: number
    date_updated: string
  }
}

interface BettingData {
  event_id: string
  lines: Record<string, BettingLine>
}

interface BettingLinesPopupProps {
  isOpen: boolean
  onClose: () => void
  gameId: string
  homeTeam: { name: string; abbreviation: string }
  awayTeam: { name: string; abbreviation: string }
  sport: SportType
  gameStatus?: Game['status']
}

function BettingLinesPopup({ 
  isOpen, 
  onClose, 
  gameId, 
  homeTeam, 
  awayTeam, 
  sport,
  gameStatus
}: BettingLinesPopupProps) {
  const [bettingData, setBettingData] = useState<BettingData | null>(null)
  const [selectedSportsbook, setSelectedSportsbook] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && gameId) {
      fetchBettingData()
    }
  }, [isOpen, gameId])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const fetchBettingData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/betting-lines/${gameId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch betting data')
      }
      const data = await response.json()
      setBettingData(data)
      
      // Set first available sportsbook as default
      if (data?.lines && Object.keys(data.lines).length > 0) {
        setSelectedSportsbook(Object.keys(data.lines)[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load betting data')
    } finally {
      setLoading(false)
    }
  }

  const formatOdds = (odds: number | null | undefined) => formatOddsUtil(odds)

  const formatSpread = (spread: number | null | undefined) => formatSpreadUtil(spread)

  const formatTotal = (total: number | null | undefined) => formatTotalUtil(total)

  const formatTime = (dateString: string) => formatToEasternTime(dateString)

  const selectedLine = bettingData?.lines?.[selectedSportsbook]
  const isFinal = gameStatus === 'final'
  const availableSportsbooks = bettingData?.lines ? Object.keys(bettingData.lines) : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2">
        <div 
          className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-3 text-left shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Betting Lines
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Matchup Header */}
          <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {awayTeam.name} @ {homeTeam.name}
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wide">
                {sport} Odds
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading betting lines...</span>
            </div>
          ) : error ? (
            <div className="text-center py-7">
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
              <button
                onClick={fetchBettingData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : availableSportsbooks.length === 0 ? (
            <div className="text-center py-7">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No betting lines available for this game.
              </p>
            </div>
          ) : (
            <>
              {/* Sportsbook Selector */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Sportsbook
                </label>
                <div className="relative">
                  <select
                    value={selectedSportsbook}
                    onChange={(e) => setSelectedSportsbook(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {availableSportsbooks.map((sportsbookId) => {
                      const sportsbook = bettingData?.lines?.[sportsbookId]
                      return (
                        <option key={sportsbookId} value={sportsbookId}>
                          {sportsbook?.affiliate?.affiliate_name || `Sportsbook ${sportsbookId}`}
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Betting Lines Display */}
              {selectedLine && (
                <div className="space-y-2.5">
                  {/* Moneyline */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Moneyline</h4>
                      <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatTime(selectedLine.moneyline.date_updated)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {awayTeam.abbreviation}
                        </div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {formatOdds(isFinal ? (selectedLine as any).moneyline?.moneyline_away_delta ?? selectedLine.moneyline.moneyline_away : selectedLine.moneyline.moneyline_away)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {homeTeam.abbreviation}
                        </div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {formatOdds(isFinal ? (selectedLine as any).moneyline?.moneyline_home_delta ?? selectedLine.moneyline.moneyline_home : selectedLine.moneyline.moneyline_home)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Point Spread */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-2.5 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Point Spread</h4>
                      <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatTime(selectedLine.spread.date_updated)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {awayTeam.abbreviation}
                        </div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {formatSpread(isFinal ? (selectedLine as any).spread?.point_spread_away_delta ?? selectedLine.spread.point_spread_away : selectedLine.spread.point_spread_away)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          ({formatOdds(isFinal ? (selectedLine as any).spread?.point_spread_away_money_delta ?? selectedLine.spread.point_spread_away_money : selectedLine.spread.point_spread_away_money)})
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {homeTeam.abbreviation}
                        </div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {formatSpread(isFinal ? (selectedLine as any).spread?.point_spread_home_delta ?? selectedLine.spread.point_spread_home : selectedLine.spread.point_spread_home)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          ({formatOdds(isFinal ? (selectedLine as any).spread?.point_spread_home_money_delta ?? selectedLine.spread.point_spread_home_money : selectedLine.spread.point_spread_home_money)})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total (Over/Under) */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Total (O/U)</h4>
                      <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatTime(selectedLine.total.date_updated)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Over</div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {formatTotal(isFinal ? (selectedLine as any).total?.total_over_delta ?? selectedLine.total.total_over : selectedLine.total.total_over)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          ({formatOdds(isFinal ? (selectedLine as any).total?.total_over_money_delta ?? selectedLine.total.total_over_money : selectedLine.total.total_over_money)})
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Under</div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {formatTotal(isFinal ? (selectedLine as any).total?.total_under_delta ?? selectedLine.total.total_under : selectedLine.total.total_under)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          ({formatOdds(isFinal ? (selectedLine as any).total?.total_under_money_delta ?? selectedLine.total.total_under_money : selectedLine.total.total_under_money)})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sportsbook Link */}
                  {selectedLine.affiliate?.affiliate_url && (
                    <div className="mt-3 text-center">
                      <a
                        href={selectedLine.affiliate.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                        Bet on {selectedLine.affiliate.affiliate_name}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { BettingLinesPopup }
