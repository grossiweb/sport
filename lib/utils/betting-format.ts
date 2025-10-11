/**
 * Utility functions for formatting betting lines according to sportsbook standards
 */

/**
 * Rounds a number to the nearest 0.5 (whole number or half)
 * Examples: 2.2 -> 2, 2.3 -> 2.5, 2.7 -> 2.5, 2.8 -> 3
 */
export function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2
}

/**
 * Formats a spread value for display (rounded to nearest 0.5)
 * Includes + prefix for positive values
 */
export function formatSpread(spread: number | null | undefined): string {
  if (spread == null || isNaN(spread)) return '-'
  
  const rounded = roundToNearestHalf(spread)
  const formatted = rounded === Math.floor(rounded) ? rounded.toString() : rounded.toFixed(1)
  
  return rounded > 0 ? `+${formatted}` : formatted
}

/**
 * Formats a total (over/under) value for display (rounded to nearest 0.5)
 */
export function formatTotal(total: number | null | undefined): string {
  if (total == null || isNaN(total)) return '-'
  
  const rounded = roundToNearestHalf(total)
  return rounded === Math.floor(rounded) ? rounded.toString() : rounded.toFixed(1)
}

/**
 * Formats odds (moneyline) for display
 * Includes + prefix for positive values
 */
export function formatOdds(odds: number | null | undefined): string {
  if (odds == null || isNaN(odds)) return '-'
  
  return odds > 0 ? `+${odds}` : `${odds}`
}

/**
 * Formats percentage for display
 */
export function formatPercentage(percentage: number | null | undefined): string {
  if (percentage == null || isNaN(percentage)) return '-'
  
  return `${Math.round(percentage * 100)}%`
}

