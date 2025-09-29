'use client'

import { useEffect } from 'react'
import {
  XMarkIcon,
  ListBulletIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Game, ScoreByPeriod } from '@/types'
import { formatToEasternDate, formatToEasternTime } from '@/lib/utils/time'
import { useScoreByPeriod } from '@/hooks/useScoreByPeriod'

interface ScoreByPeriodPopupProps {
  isOpen: boolean
  onClose: () => void
  scoreByPeriod?: ScoreByPeriod
  gameStatus: Game['status']
  gameDate: Date
  homeTeam: { name: string; abbreviation: string }
  awayTeam: { name: string; abbreviation: string }
}

export function ScoreByPeriodPopup({
  isOpen,
  onClose,
  scoreByPeriod,
  gameStatus,
  gameDate,
  homeTeam,
  awayTeam
}: ScoreByPeriodPopupProps) {
  const {
    hasScores,
    periodLabels,
    awayScores,
    homeScores,
    awayTotal,
    homeTotal
  } = useScoreByPeriod(scoreByPeriod)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const awayTotalDisplay = awayScores.some((value) => value !== null) ? awayTotal : '-'
  const homeTotalDisplay = homeScores.some((value) => value !== null) ? homeTotal : '-'

  const lastUpdated = (() => {
    if (!scoreByPeriod?.updatedAt) return null
    const parsedDate = new Date(scoreByPeriod.updatedAt)
    if (Number.isNaN(parsedDate.getTime())) return null
    return `${formatToEasternDate(parsedDate, { month: 'short', day: 'numeric' })} • ${formatToEasternTime(parsedDate)}`
  })()

  const hasPeriodScores = hasScores

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2">
        <div
          className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-3 text-left shadow-2xl transition-all"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <ListBulletIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Matchup Box Score
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {awayTeam.name} @ {homeTeam.name}
              </h3>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wide">
                {gameStatus === 'final' ? 'Final Score' : 'In-Game Score'} • {formatToEasternDate(gameDate)}
              </p>
            </div>
          </div>

          {!hasPeriodScores ? (
            <div className="text-center py-7">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Score by period data is not available for this game yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700/60">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Team
                      </th>
              {periodLabels.map((label) => (
                        <th
                          key={label}
                          className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {label}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {awayTeam.abbreviation}
                      </td>
                      {awayScores.map((score, index) => (
                        <td key={`away-${index}`} className="px-3 py-2 text-center text-sm text-gray-800 dark:text-gray-200">
                          {typeof score === 'number' ? score : '-'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 dark:text-white">
                        {awayTotalDisplay}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {homeTeam.abbreviation}
                      </td>
                      {homeScores.map((score, index) => (
                        <td key={`home-${index}`} className="px-3 py-2 text-center text-sm text-gray-800 dark:text-gray-200">
                          {typeof score === 'number' ? score : '-'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 dark:text-white">
                        {homeTotalDisplay}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {lastUpdated && (
                <div className="mt-3 flex items-center text-[11px] text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Updated {lastUpdated}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


