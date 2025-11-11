import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, getWeek, getYear, startOfYear, isAfter, parseISO } from 'date-fns'
import type { SportType } from '@/types'

export interface WeekInfo {
  weekNumber: number
  year: number
  startDate: Date
  endDate: Date
  label: string
  dateRange: string
}

export interface WeekOption {
  value: string
  label: string
  weekInfo: WeekInfo
}

export interface SeasonWeeksOptions {
  startDate: Date
  endDate?: Date
}

/**
 * Get week information for a given date
 */
export function getWeekInfo(date: Date): WeekInfo {
  const startDate = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
  const endDate = endOfWeek(date, { weekStartsOn: 1 }) // Sunday end
  const weekNumber = getWeek(date, { weekStartsOn: 1 })
  const year = getYear(date)
  
  return {
    weekNumber,
    year,
    startDate,
    endDate,
    label: `Week ${weekNumber}`,
    dateRange: formatDateRange(startDate, endDate)
  }
}

/**
 * Get current week info
 */
export function getCurrentWeek(): WeekInfo {
  return getWeekInfo(new Date())
}

/**
 * Get previous week info
 */
export function getPreviousWeek(currentWeek: WeekInfo): WeekInfo {
  const prevWeekDate = subWeeks(currentWeek.startDate, 1)
  return getWeekInfo(prevWeekDate)
}

/**
 * Get next week info
 */
export function getNextWeek(currentWeek: WeekInfo): WeekInfo {
  const nextWeekDate = addWeeks(currentWeek.startDate, 1)
  return getWeekInfo(nextWeekDate)
}

/**
 * Generate week options for a given year
 */
export function getWeekOptionsForYear(year: number): WeekOption[] {
  const weeks: WeekOption[] = []
  const startOfYearDate = startOfYear(new Date(year, 0, 1))
  
  // Generate 52-53 weeks for the year
  for (let weekNum = 1; weekNum <= 53; weekNum++) {
    const weekDate = addWeeks(startOfYearDate, weekNum - 1)
    const weekInfo = getWeekInfo(weekDate)
    
    // Stop if we've moved to the next year
    if (weekInfo.year !== year) break
    
    weeks.push({
      value: `${year}-W${weekNum.toString().padStart(2, '0')}`,
      label: `${weekInfo.label} (${weekInfo.dateRange})`,
      weekInfo
    })
  }
  
  return weeks
}

/**
 * Get week options for current year and next year
 */
export function getAvailableWeekOptions(): WeekOption[] {
  const currentYear = new Date().getFullYear()
  const currentYearWeeks = getWeekOptionsForYear(currentYear)
  const nextYearWeeks = getWeekOptionsForYear(currentYear + 1)
  
  return [...currentYearWeeks, ...nextYearWeeks]
}

/**
 * Build week options dynamically between a season start and (optional) end date.
 * Weeks are Monday-Sunday and labels mirror getWeekInfo labeling.
 */
export function getSeasonWeekOptions({ startDate, endDate }: SeasonWeeksOptions): WeekOption[] {
  const weeks: WeekOption[] = []
  const seasonStart = startOfWeek(startDate, { weekStartsOn: 1 })
  const hardEnd = endDate ? endOfWeek(endDate, { weekStartsOn: 1 }) : undefined

  let cursor = seasonStart
  for (let i = 0; i < 60; i++) { // safety bound ~60 weeks max
    const info = getWeekInfo(cursor)
    if (hardEnd && isAfter(info.startDate, hardEnd)) break
    // Build a WeekInfo with season-relative numbering so labels are correct everywhere
    const seasonWeekInfo: WeekInfo = {
      weekNumber: i + 1,
      year: info.year,
      startDate: info.startDate,
      endDate: info.endDate,
      label: `Week ${i + 1}`,
      dateRange: info.dateRange
    }
    weeks.push({
      // Keep value as ISO year-week for stable parsing, but show season-relative label
      value: `${info.year}-W${info.weekNumber.toString().padStart(2, '0')}`,
      label: `${seasonWeekInfo.label} (${seasonWeekInfo.dateRange})`,
      weekInfo: seasonWeekInfo
    })
    // Stop if adding another week would exceed endDate by too much (when provided)
    const nextCursor = addWeeks(cursor, 1)
    if (hardEnd && isAfter(nextCursor, hardEnd)) break
    cursor = nextCursor
  }
  return weeks
}

/**
 * Format a concise date range. If months differ, include month on both sides.
 * If the year differs across the range, include the year on the end only.
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  if (sameMonth) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`
  }
  if (sameYear) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
  }
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
}

function getNFLSeasonRange(): SeasonWeeksOptions {
  return {
    startDate: parseISO('2025-09-04'),
    endDate: parseISO('2026-01-07')
  }
}

/**
 * Helper to get NFL season week options by season year.
 * Uses the same week-building logic as other sports but with the NFL season window.
 */
export function getNFLSeasonWeekOptions(seasonYear: number, _fallback: SeasonWeeksOptions): WeekOption[] {
  const range = getNFLSeasonRange()
  return getSeasonWeekOptions(range)
}

/**
 * Get the correct "current week" for a sport based on season-specific mappings when available.
 * - NFL: If today falls within the 2025 season window (2025-09-04 to 2026-01-07), use season-specific weeks.
 * - NBA: Uses the 2025-26 season window defined in UI.
 * - Others: fallback to ISO Monday–Sunday week.
 */
export function getCurrentSeasonWeekForSport(sport: SportType): WeekInfo {
  const now = new Date()
  if (sport === 'NFL') {
    const { startDate, endDate } = getNFLSeasonRange()
    if (now >= startDate && now <= (endDate ?? now)) {
      const weeks = getSeasonWeekOptions({ startDate, endDate })
      const m = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
      if (m) return m.weekInfo
    }
  }
  if (sport === 'NBA') {
    const start = new Date('2025-10-09')
    const endDate = new Date('2026-04-12')
    const weeks = getSeasonWeekOptions({ startDate: start, endDate })
    const m = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
    if (m) return m.weekInfo
  }
  if (sport === 'NCAAB') {
    const start = new Date('2025-11-03')
    const endDate = new Date('2026-03-15')
    const weeks = getSeasonWeekOptions({ startDate: start, endDate })
    const m = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
    if (m) return m.weekInfo
  }
  return getCurrentWeek()
}

/**
 * Parse week string (e.g., "2024-W15") to WeekInfo
 */
export function parseWeekString(weekString: string): WeekInfo | null {
  const match = weekString.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return null
  
  const year = parseInt(match[1])
  const weekNumber = parseInt(match[2])
  
  const startOfYearDate = startOfYear(new Date(year, 0, 1))
  const weekDate = addWeeks(startOfYearDate, weekNumber - 1)
  
  return getWeekInfo(weekDate)
}

/**
 * Convert WeekInfo to week string
 */
export function weekInfoToString(weekInfo: WeekInfo): string {
  return `${weekInfo.year}-W${weekInfo.weekNumber.toString().padStart(2, '0')}`
}

/**
 * Get date range for MongoDB query
 */
export function getWeekDateRange(weekInfo: WeekInfo): { startDate: string, endDate: string } {
  return {
    startDate: format(weekInfo.startDate, 'yyyy-MM-dd'),
    endDate: format(weekInfo.endDate, 'yyyy-MM-dd')
  }
}

/**
 * Get weeks for a specific month
 */
export function getWeeksForMonth(year: number, month: number): WeekOption[] {
  const allWeeks = getWeekOptionsForYear(year)
  
  return allWeeks.filter(week => {
    const weekMonth = week.weekInfo.startDate.getMonth()
    const weekEndMonth = week.weekInfo.endDate.getMonth()
    
    // Include week if it starts or ends in the target month
    return weekMonth === month || weekEndMonth === month
  })
}

/**
 * Get available years that have weeks
 */
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
}

/**
 * Get available months for a year (0-11)
 */
export function getAvailableMonths(): Array<{ value: number, label: string }> {
  return [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ]
}
