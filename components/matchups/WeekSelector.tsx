'use client'

import React, { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { WeekInfo, getPreviousWeek, getNextWeek, getAvailableYears, getAvailableMonths, getWeeksForMonth, parseWeekString, weekInfoToString } from '@/lib/utils/week-utils'

interface WeekSelectorProps {
  currentWeek: WeekInfo
  onWeekChange: (week: WeekInfo) => void
  className?: string
}

export function WeekSelector({ currentWeek, onWeekChange, className = '' }: WeekSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedYear, setSelectedYear] = useState(currentWeek.year)
  const [selectedMonth, setSelectedMonth] = useState(currentWeek.startDate.getMonth())

  const availableYears = getAvailableYears()
  const availableMonths = getAvailableMonths()
  const weeksForSelectedMonth = getWeeksForMonth(selectedYear, selectedMonth)

  const handlePreviousWeek = () => {
    const prevWeek = getPreviousWeek(currentWeek)
    onWeekChange(prevWeek)
  }

  const handleNextWeek = () => {
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
      <div className="flex items-center space-x-4">
        {/* Previous Week Button */}
        <button
          onClick={handlePreviousWeek}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          title="Previous Week"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Current Week Display */}
        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentWeek.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentWeek.dateRange}
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
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {availableMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Week Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Week
              </label>
              <div className="max-h-48 overflow-y-auto">
                {weeksForSelectedMonth.length > 0 ? (
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
