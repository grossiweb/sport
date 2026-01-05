'use client'

import React, { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { WeekInfo, getPreviousWeek, getNextWeek, getAvailableYears, getAvailableMonths, getWeeksForMonth, parseWeekString, weekInfoToString, getSeasonWeekOptions, getNFLSeasonWeekOptions, getCFBSeasonWeekOptions, NFL_2025_WEEKS, CFB_2025_WEEKS } from '@/lib/utils/week-utils'
import { useSport } from '@/contexts/SportContext'
import { useEffect } from 'react'
import { SportType } from '@/types'

interface WeekSelectorProps {
  currentWeek: WeekInfo
  onWeekChange: (week: WeekInfo) => void
  className?: string
}

export function WeekSelector({ currentWeek, onWeekChange, className = '' }: WeekSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedYear, setSelectedYear] = useState(currentWeek.year)
  const [selectedMonth, setSelectedMonth] = useState(currentWeek.startDate.getMonth())
  const [seasonStart, setSeasonStart] = useState<Date | null>(null)
  const [seasonWeeks, setSeasonWeeks] = useState<ReturnType<typeof getSeasonWeekOptions>>([])
  const { currentSport } = useSport()

  const availableYears = getAvailableYears()
  const availableMonths = getAvailableMonths()
  const weeksForSelectedMonth = getWeeksForMonth(selectedYear, selectedMonth)

  // Determine current season week (if aligned to a defined season window)
  const seasonIndex =
    seasonWeeks.length > 0
      ? seasonWeeks.findIndex(
          (w) =>
            currentWeek.startDate >= w.weekInfo.startDate &&
            currentWeek.startDate <= w.weekInfo.endDate
        )
      : -1
  const activeSeasonWeek = seasonIndex !== -1 ? seasonWeeks[seasonIndex] : undefined
  const isLastSeasonWeek = seasonWeeks.length > 0 && seasonIndex === seasonWeeks.length - 1
  const isBowlWeek =
    currentSport === 'CFB' &&
    !!activeSeasonWeek &&
    activeSeasonWeek.weekInfo.weekNumber === 18

  // Load season start date from API based on sport and year, then compute weeks dynamically
  useEffect(() => {
    // For NFL, use the hard-coded 2025 NFL weeks from week-utils
    if (currentSport === 'NFL') {
      const start = new Date(NFL_2025_WEEKS[0].start)
      const endDate = new Date(NFL_2025_WEEKS[NFL_2025_WEEKS.length - 1].end)
      setSeasonStart(start)
      const weeks = getNFLSeasonWeekOptions(selectedYear, { startDate: start, endDate })
      setSeasonWeeks(weeks)
      return
    }

    // For NBA, always use provided season dates
    if (currentSport === 'NBA') {
      const start = new Date('2025-10-09')
      const endDate = new Date('2026-04-12')
      setSeasonStart(start)
      const weeks = getSeasonWeekOptions({ startDate: start, endDate })
      setSeasonWeeks(weeks)
      return
    }

    // For NCAAB, use provided season dates
    if (currentSport === 'NCAAB') {
      const start = new Date('2025-11-03')
      const endDate = new Date('2026-03-15')
      setSeasonStart(start)
      const weeks = getSeasonWeekOptions({ startDate: start, endDate })
      setSeasonWeeks(weeks)
      return
    }

    // For CFB (NCAAF), use the hard-coded 2025 CFB weeks from week-utils
    if (currentSport === 'CFB') {
      const start = new Date(CFB_2025_WEEKS[0].start)
      const endDate = new Date(CFB_2025_WEEKS[CFB_2025_WEEKS.length - 1].end)
      setSeasonStart(start)
      const weeks = getCFBSeasonWeekOptions(selectedYear, { startDate: start, endDate })
      setSeasonWeeks(weeks)
      return
    }
  }, [currentSport, selectedYear])

  const handlePreviousWeek = () => {
    if (seasonWeeks.length > 0) {
      if (seasonIndex > 0) {
        onWeekChange(seasonWeeks[seasonIndex - 1].weekInfo)
        return
      }
    }
    const prevWeek = getPreviousWeek(currentWeek)
    onWeekChange(prevWeek)
  }

  const handleNextWeek = () => {
    if (seasonWeeks.length > 0) {
      if (seasonIndex !== -1 && seasonIndex < seasonWeeks.length - 1) {
        onWeekChange(seasonWeeks[seasonIndex + 1].weekInfo)
        return
      }
      // At or beyond last defined season week Ã¢â‚¬â€œ do not advance further
      return
    }
    const nextWeek = getNextWeek(currentWeek)
    onWeekChange(nextWeek)
  }

  const handleWeekSelect = (weekString: string) => {
    const weekInfo = parseWeekString(weekString)
    if (weekInfo) {
      onWeekChange(weekInfo)
      setShowDropdown(false)
    }
  }

  const handleSeasonWeekSelect = (weekInfo: WeekInfo) => {
    onWeekChange(weekInfo)
    setShowDropdown(false)
  }

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    // Reset to first month when year changes
    setSelectedMonth(0)
  }

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Week Navigation */}
      <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
        {/* Previous Week Button */}
        <button
          onClick={handlePreviousWeek}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          title="Previous Week"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Current Week Display */}
        <div className="flex items-center space-x-3 absolute left-1/2 -translate-x-1/2 sm:static sm:transform-none">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {seasonWeeks.length > 0
                ? activeSeasonWeek?.weekInfo.label ?? currentWeek.label
                : currentWeek.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {seasonWeeks.length > 0
                ? activeSeasonWeek?.weekInfo.dateRange ?? currentWeek.dateRange
                : currentWeek.dateRange}
            </div>
          </div>

          {/* Calendar Dropdown Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            title="Select Week"
          >
            <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Next Week Button */}
        <button
          onClick={handleNextWeek}
        disabled={isLastSeasonWeek}
          className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors ${
          isLastSeasonWeek
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title="Next Week"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Dropdown Calendar */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Week
            </h3>

            {/* Year Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection (fallback UI; hidden if season-based weeks available) */}
            <div className={`mb-4 ${seasonWeeks.length > 0 ? 'hidden' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {availableMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Week Selection (season-based if available, else fallback by month) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Week
              </label>
              <div className="max-h-48 overflow-y-auto">
                {seasonWeeks.length > 0 ? (
                  <div className="space-y-1">
                    {seasonWeeks.map(week => (
                      <button
                        key={week.value}
                        onClick={() => handleSeasonWeekSelect(week.weekInfo)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          (currentWeek.startDate >= week.weekInfo.startDate && currentWeek.startDate <= week.weekInfo.endDate)
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {week.label}
                      </button>
                    ))}
                  </div>
                ) : weeksForSelectedMonth.length > 0 ? (
                  <div className="space-y-1">
                    {weeksForSelectedMonth.map(week => (
                      <button
                        key={week.value}
                        onClick={() => handleWeekSelect(week.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          weekInfoToString(currentWeek) === week.value
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {week.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No weeks available for {availableMonths[selectedMonth].label} {selectedYear}
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowDropdown(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

export default WeekSelector
