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
 * Given a list of season week options and a date, return the "current" week:
 * - If the date is inside a week range, return that week
 * - Otherwise, return the next future week (first week whose startDate is after the date)
 * - If there is no future week, return the last week in the list
 */
function resolveCurrentOrNextWeek(weeks: WeekOption[], now: Date): WeekInfo | null {
  if (!weeks.length) return null

  const inRange = weeks.find(w => now >= w.weekInfo.startDate && now <= w.weekInfo.endDate)
  if (inRange) return inRange.weekInfo

  const future = weeks.find(w => now < w.weekInfo.startDate)
  if (future) return future.weekInfo

  // If we're past the last defined week, treat the last week as "current"
  return weeks[weeks.length - 1].weekInfo
}

/**
 * Format a concise date range. If months differ, include month on both sides.
 * If the year differs across the range, include the year on the end only.
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameDay = startDate.getTime() === endDate.getTime()
  if (sameDay) {
    return format(startDate, 'MMM d')
  }
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

const NFL_2025_WEEKS: Array<{ weekNumber: number; start: string; end: string }> = [
  { weekNumber: 1, start: '2025-09-04', end: '2025-09-08' },
  { weekNumber: 2, start: '2025-09-11', end: '2025-09-15' },
  { weekNumber: 3, start: '2025-09-18', end: '2025-09-22' },
  { weekNumber: 4, start: '2025-09-25', end: '2025-09-29' },
  { weekNumber: 5, start: '2025-10-02', end: '2025-10-06' },
  { weekNumber: 6, start: '2025-10-09', end: '2025-10-13' },
  { weekNumber: 7, start: '2025-10-16', end: '2025-10-20' },
  { weekNumber: 8, start: '2025-10-23', end: '2025-10-27' },
  { weekNumber: 9, start: '2025-10-30', end: '2025-11-03' },
  { weekNumber: 10, start: '2025-11-06', end: '2025-11-10' },
  { weekNumber: 11, start: '2025-11-13', end: '2025-11-17' },
  { weekNumber: 12, start: '2025-11-20', end: '2025-11-24' },
  { weekNumber: 13, start: '2025-11-27', end: '2025-12-01' },
  { weekNumber: 14, start: '2025-12-04', end: '2025-12-08' },
  { weekNumber: 15, start: '2025-12-11', end: '2025-12-15' },
  { weekNumber: 16, start: '2025-12-18', end: '2025-12-22' },
  { weekNumber: 17, start: '2025-12-25', end: '2025-12-29' },
  { weekNumber: 18, start: '2026-01-04', end: '2026-01-04' }
]

function getNFLSeasonRange(): SeasonWeeksOptions {
  return {
    startDate: parseISO(NFL_2025_WEEKS[0].start),
    endDate: parseISO(NFL_2025_WEEKS[NFL_2025_WEEKS.length - 1].end)
  }
}

/**
 * Helper to get NFL season week options by season year.
 * Uses explicit Covers.com week windows for 2025; falls back to generic weeks otherwise.
 */
export function getNFLSeasonWeekOptions(seasonYear: number, _fallback: SeasonWeeksOptions): WeekOption[] {
  if (seasonYear === 2025) {
    return NFL_2025_WEEKS.map(({ weekNumber, start, end }) => {
      const startDate = parseISO(start)
      const endDate = parseISO(end)
      const weekInfo: WeekInfo = {
        weekNumber,
        year: startDate.getFullYear(),
        startDate,
        endDate,
        label: `Week ${weekNumber}`,
        dateRange: formatDateRange(startDate, endDate)
      }
      return {
        value: `${seasonYear}-W${weekNumber.toString().padStart(2, '0')}`,
        label: `${weekInfo.label} (${weekInfo.dateRange})`,
        weekInfo
      }
    })
  }

  // Fallback: build generic Monday–Sunday weeks using provided season window
  return getSeasonWeekOptions(_fallback)
}

const CFB_2025_WEEKS: Array<{ weekNumber: number; start: string; end: string }> = [
  { weekNumber: 1, start: '2025-08-23', end: '2025-09-01' },
  { weekNumber: 2, start: '2025-09-05', end: '2025-09-07' },
  { weekNumber: 3, start: '2025-09-11', end: '2025-09-14' },
  { weekNumber: 4, start: '2025-09-18', end: '2025-09-21' },
  { weekNumber: 5, start: '2025-09-25', end: '2025-09-27' },
  { weekNumber: 6, start: '2025-10-02', end: '2025-10-04' },
  { weekNumber: 7, start: '2025-10-08', end: '2025-10-12' },
  { weekNumber: 8, start: '2025-10-14', end: '2025-10-18' },
  { weekNumber: 9, start: '2025-10-21', end: '2025-10-25' },
  { weekNumber: 10, start: '2025-10-28', end: '2025-11-01' },
  { weekNumber: 11, start: '2025-11-04', end: '2025-11-08' },
  { weekNumber: 12, start: '2025-11-11', end: '2025-11-15' },
  { weekNumber: 13, start: '2025-11-18', end: '2025-11-22' },
  { weekNumber: 14, start: '2025-11-25', end: '2025-11-29' },
  // Note: schedule provided skips "Week 15" and goes to Week 16 on Dec 13
  { weekNumber: 16, start: '2025-12-13', end: '2025-12-13' }
]

function getCFBSeasonRange(): SeasonWeeksOptions {
  return {
    startDate: parseISO(CFB_2025_WEEKS[0].start),
    endDate: parseISO(CFB_2025_WEEKS[CFB_2025_WEEKS.length - 1].end)
  }
}

/**
 * Helper to get CFB season week options by season year.
 * Uses explicit Covers-style week windows for 2025; falls back to generic weeks otherwise.
 */
export function getCFBSeasonWeekOptions(seasonYear: number, _fallback: SeasonWeeksOptions): WeekOption[] {
  if (seasonYear === 2025) {
    return CFB_2025_WEEKS.map(({ weekNumber, start, end }) => {
      const startDate = parseISO(start)
      const endDate = parseISO(end)
      const weekInfo: WeekInfo = {
        weekNumber,
        year: startDate.getFullYear(),
        startDate,
        endDate,
        label: `Week ${weekNumber}`,
        dateRange: formatDateRange(startDate, endDate)
      }
      return {
        value: `${seasonYear}-W${weekNumber.toString().padStart(2, '0')}`,
        label: `${weekInfo.label} (${weekInfo.dateRange})`,
        weekInfo
      }
    })
  }

  // Fallback: build generic Monday–Sunday weeks using provided season window
  return getSeasonWeekOptions(_fallback)
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
      const weeks = getNFLSeasonWeekOptions(startDate.getFullYear(), { startDate, endDate })
      const wk = resolveCurrentOrNextWeek(weeks, now)
      if (wk) return wk
    }
  }
  if (sport === 'CFB') {
    const { startDate, endDate } = getCFBSeasonRange()
    if (now >= startDate && now <= (endDate ?? now)) {
      const weeks = getCFBSeasonWeekOptions(startDate.getFullYear(), { startDate, endDate })
      const wk = resolveCurrentOrNextWeek(weeks, now)
      if (wk) return wk
    }
  }
  if (sport === 'NBA') {
    const start = new Date('2025-10-09')
    const endDate = new Date('2026-04-12')
    const weeks = getSeasonWeekOptions({ startDate: start, endDate })
    const wk = resolveCurrentOrNextWeek(weeks, now)
    if (wk) return wk
  }
  if (sport === 'NCAAB') {
    const start = new Date('2025-11-03')
    const endDate = new Date('2026-03-15')
    const weeks = getSeasonWeekOptions({ startDate: start, endDate })
    const wk = resolveCurrentOrNextWeek(weeks, now)
    if (wk) return wk
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
