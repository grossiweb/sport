import { useMemo } from 'react'
import { ScoreByPeriod } from '@/types'

const DEFAULT_PERIOD_LABEL = (index: number): string => `Q${index + 1}`

export const useScoreByPeriod = (scoreByPeriod?: ScoreByPeriod) => {
  return useMemo(() => {
    const periodCount = Math.max(
      scoreByPeriod?.home?.length ?? 0,
      scoreByPeriod?.away?.length ?? 0
    )

    if (periodCount === 0) {
      return {
        hasScores: false,
        periodLabels: [] as string[],
        awayScores: [] as (number | null)[],
        homeScores: [] as (number | null)[],
        awayTotal: 0,
        homeTotal: 0
      }
    }

    const awayScores = Array.from({ length: periodCount }, (_, index) => {
      const value = scoreByPeriod?.away?.[index]
      return typeof value === 'number' ? value : null
    })

    const homeScores = Array.from({ length: periodCount }, (_, index) => {
      const value = scoreByPeriod?.home?.[index]
      return typeof value === 'number' ? value : null
    })

    const hasAwayScores = awayScores.some((value) => value !== null)
    const hasHomeScores = homeScores.some((value) => value !== null)

    const hasScores = hasAwayScores || hasHomeScores

    const periodLabels = scoreByPeriod?.periodLabels?.slice(0, periodCount) ??
      Array.from({ length: periodCount }, (_, index) => DEFAULT_PERIOD_LABEL(index))

    const awayTotal = awayScores.reduce((sum, value) => sum + (value ?? 0), 0)
    const homeTotal = homeScores.reduce((sum, value) => sum + (value ?? 0), 0)

    return {
      hasScores,
      periodLabels,
      awayScores,
      homeScores,
      awayTotal,
      homeTotal
    }
  }, [scoreByPeriod])
}

