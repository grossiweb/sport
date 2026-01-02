import { SportType } from '@/types'

function readEnvInt(name: string): number | undefined {
  const raw = process.env[name]
  if (!raw) return undefined
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Per-sport season year overrides.
 *
 * - Use env vars if present (easy to change without code deploy in Vercel).
 * - Provide sensible defaults where your Mongo data is known to be pinned.
 *
 * Env vars:
 * - SEASON_YEAR_CFB
 * - SEASON_YEAR_NFL
 * - SEASON_YEAR_NBA
 * - SEASON_YEAR_NCAAB
 */
export const SEASON_YEAR_OVERRIDES: Partial<Record<SportType, number>> = {
  // You requested CFB team stats should use season_year=2025.
  CFB: readEnvInt('SEASON_YEAR_CFB') ?? 2025,

  // Optional overrides per sport (unset -> use automatic season logic).
  NFL: readEnvInt('SEASON_YEAR_NFL'),
  NBA: readEnvInt('SEASON_YEAR_NBA'),

  // Your current NCAAB dataset uses season_year=2026 (2025-11 to 2026-03 window).
  NCAAB: readEnvInt('SEASON_YEAR_NCAAB') ?? 2026
}

export function getSeasonYearOverride(sport: SportType): number | undefined {
  const v = SEASON_YEAR_OVERRIDES[sport]
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined
}


