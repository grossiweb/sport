import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, getWeek, getYear, startOfYear, differenceInWeeks } from 'date-fns'

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
    dateRange: `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`
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
