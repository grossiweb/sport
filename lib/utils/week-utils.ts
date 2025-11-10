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

/**
 * NFL 2025 regular season week definitions (per NFL Football Operations).
 * Uses exact Thursday–Wednesday ranges except Week 18 (Jan 3–Jan 4, 2026).
 */
const NFL_2025_WEEKS: Array<{ weekNumber: number, startISO: string, endISO: string }> = [
  // Per request: fixed ranges (inclusive) for 2025 season
  { weekNumber: 1,  startISO: '2025-09-04', endISO: '2025-09-09' }, // Sep 4 - 9
  { weekNumber: 2,  startISO: '2025-09-10', endISO: '2025-09-16' }, // Sep 10 - 16
  { weekNumber: 3,  startISO: '2025-09-17', endISO: '2025-09-23' }, // Sep 17 - 23
  { weekNumber: 4,  startISO: '2025-09-24', endISO: '2025-09-30' }, // Sep 24 - 30
  { weekNumber: 5,  startISO: '2025-10-01', endISO: '2025-10-07' }, // Oct 1 - 7
  { weekNumber: 6,  startISO: '2025-10-08', endISO: '2025-10-14' }, // Oct 8 - 14
  { weekNumber: 7,  startISO: '2025-10-15', endISO: '2025-10-21' }, // Oct 15 - 21
  { weekNumber: 8,  startISO: '2025-10-22', endISO: '2025-10-28' }, // Oct 22 - 28
  { weekNumber: 9,  startISO: '2025-10-29', endISO: '2025-11-04' }, // Oct 29 - Nov 4
  { weekNumber: 10, startISO: '2025-11-05', endISO: '2025-11-11' }, // Nov 5 - 11
  { weekNumber: 11, startISO: '2025-11-12', endISO: '2025-11-18' }, // Nov 12 - 18
  { weekNumber: 12, startISO: '2025-11-19', endISO: '2025-11-25' }, // Nov 19 - 25
  { weekNumber: 13, startISO: '2025-11-26', endISO: '2025-12-02' }, // Nov 26 - Dec 2
  { weekNumber: 14, startISO: '2025-12-03', endISO: '2025-12-09' }, // Dec 3 - 9
  { weekNumber: 15, startISO: '2025-12-10', endISO: '2025-12-16' }, // Dec 10 - 16
  { weekNumber: 16, startISO: '2025-12-17', endISO: '2025-12-23' }, // Dec 17 - 23
  { weekNumber: 17, startISO: '2025-12-24', endISO: '2025-12-30' }, // Dec 24 - 30
  { weekNumber: 18, startISO: '2025-12-31', endISO: '2026-01-07' }, // Dec 31 - Jan 7
]

/**
 * Build WeekOption[] for NFL 2025 season.
 */
export function getNFL2025WeekOptions(): WeekOption[] {
  return NFL_2025_WEEKS.map(({ weekNumber, startISO, endISO }) => {
    const startDate = parseISO(startISO)
    const endDate = parseISO(endISO)
    const weekInfo: WeekInfo = {
      weekNumber,
      year: startDate.getFullYear(),
      startDate,
      endDate,
      label: `Week ${weekNumber}`,
      dateRange: formatDateRange(startDate, endDate)
    }
    return {
      value: `${startDate.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`,
      label: `${weekInfo.label} (${weekInfo.dateRange})`,
      weekInfo
    }
  })
}

/**
 * Helper to get NFL season week options by season year.
 * Currently supports 2025 regular season mapping; falls back to generic weeks otherwise.
 */
export function getNFLSeasonWeekOptions(seasonYear: number, fallback: SeasonWeeksOptions): WeekOption[] {
  if (seasonYear === 2025) {
    return getNFL2025WeekOptions()
  }
  return getSeasonWeekOptions(fallback)
}

/**
 * Get the correct "current week" for a sport based on season-specific mappings when available.
 * - NFL: If today falls within the 2025 season window (2025-09-04 to 2026-01-04), use NFL_2025 weeks.
 * - NBA: Uses the 2025-26 season window defined in UI.
 * - Others: fallback to ISO Monday–Sunday week.
 */
export function getCurrentSeasonWeekForSport(sport: SportType): WeekInfo {
  const now = new Date()
  if (sport === 'NFL') {
    const seasonStart = parseISO('2025-09-04')
    const seasonEnd = parseISO('2026-01-04')
    if (now >= seasonStart && now <= seasonEnd) {
      const weeks = getNFL2025WeekOptions()
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
