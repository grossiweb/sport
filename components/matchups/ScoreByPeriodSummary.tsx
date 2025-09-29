import { Game, ScoreByPeriod } from '@/types'
import { useScoreByPeriod } from '@/hooks/useScoreByPeriod'

interface ScoreByPeriodSummaryProps {
  scoreByPeriod?: ScoreByPeriod
  gameStatus: Game['status']
  homeTeamAbbreviation: string
  awayTeamAbbreviation: string
  onOpenPopup?: () => void
}

export function ScoreByPeriodSummary({
  scoreByPeriod,
  gameStatus,
  homeTeamAbbreviation,
  awayTeamAbbreviation,
  onOpenPopup
}: ScoreByPeriodSummaryProps) {
  const {
    hasScores,
    periodLabels,
    awayScores,
    homeScores,
    awayTotal,
    homeTotal
  } = useScoreByPeriod(scoreByPeriod)

  if (!hasScores) {
    return null
  }

  const showTotalFallback = (scores: (number | null)[], total: number | null): number | string =>
    scores.some((value) => value !== null) ? total ?? '-' : '-'

  return (
    <div className="mt-6 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
          Score by Period
        </h2>
        {gameStatus === 'final' && onOpenPopup && (
          <button
            onClick={onOpenPopup}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Full Box Score
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <th className="text-left py-2 pr-4 font-semibold">Team</th>
              {periodLabels.map((label) => (
                <th key={label} className="text-center px-3 py-2 font-semibold">
                  {label}
                </th>
              ))}
              <th className="text-center px-3 py-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="py-2 pr-4 font-semibold text-gray-800 dark:text-gray-100">
                {awayTeamAbbreviation}
              </td>
              {awayScores.map((value, index) => (
                <td key={`summary-away-${index}`} className="text-center px-3 py-2 text-gray-700 dark:text-gray-300">
                  {value ?? '-'}
                </td>
              ))}
              <td className="text-center px-3 py-2 font-bold text-gray-900 dark:text-white">
                {showTotalFallback(awayScores, awayTotal)}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-semibold text-gray-800 dark:text-gray-100">
                {homeTeamAbbreviation}
              </td>
              {homeScores.map((value, index) => (
                <td key={`summary-home-${index}`} className="text-center px-3 py-2 text-gray-700 dark:text-gray-300">
                  {value ?? '-'}
                </td>
              ))}
              <td className="text-center px-3 py-2 font-bold text-gray-900 dark:text-white">
                {showTotalFallback(homeScores, homeTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

