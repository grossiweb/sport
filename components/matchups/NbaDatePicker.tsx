'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter
} from 'date-fns'

interface NbaDatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  className?: string
}

// NBA Season window for 2025-26
const SEASON_START = new Date('2025-10-03')
const SEASON_END = new Date('2026-04-12')

// Disabled dates (no games) within the NBA season
const DISABLED_DATE_STRINGS = new Set<string>([
  // October 18–20, 2025
  '2025-10-18',
  '2025-10-19',
  '2025-10-20',
  // December 16 & 24, 2025
  '2025-12-16',
  '2025-12-24',
  // February 13–18, 2026
  '2026-02-13',
  '2026-02-14',
  '2026-02-15',
  '2026-02-16',
  '2026-02-17',
  '2026-02-18',
  // April 11, 2026
  '2026-04-11'
])

const isDateInSeason = (date: Date): boolean =>
  isWithinInterval(date, { start: SEASON_START, end: SEASON_END })

const isDisabledDate = (date: Date): boolean =>
  DISABLED_DATE_STRINGS.has(format(date, 'yyyy-MM-dd'))

// Find the closest previous selectable date in the season window
const findPreviousSelectable = (current: Date): Date | null => {
  let d = subDays(current, 1)
  while (!isBefore(d, SEASON_START)) {
    if (!isDisabledDate(d)) return d
    d = subDays(d, 1)
  }
  return null
}

// Find the closest next selectable date in the season window
const findNextSelectable = (current: Date): Date | null => {
  let d = addDays(current, 1)
  while (!isAfter(d, SEASON_END)) {
    if (!isDisabledDate(d)) return d
    d = addDays(d, 1)
  }
  return null
}

export function NbaDatePicker({ selectedDate, onDateChange, className = '' }: NbaDatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(selectedDate)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  const handlePreviousDay = () => {
    const prev = findPreviousSelectable(selectedDate)
    if (prev) {
      onDateChange(prev)
    }
  }

  const handleNextDay = () => {
    const next = findNextSelectable(selectedDate)
    if (next) {
      onDateChange(next)
    }
  }

  const handleDateSelect = (date: Date) => {
    if (!isDateInSeason(date) || isDisabledDate(date)) return
    onDateChange(date)
    setShowCalendar(false)
  }

  const handlePreviousMonth = () => {
    const prevMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    setCalendarMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    setCalendarMonth(nextMonth)
  }

  const canGoPrevious = !!findPreviousSelectable(selectedDate)
  const canGoNext = !!findNextSelectable(selectedDate)

  // Generate calendar days
  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Ensure the initial selected date is valid (inside season and not disabled)
  useEffect(() => {
    if (!isDateInSeason(selectedDate) || isDisabledDate(selectedDate)) {
      // Snap to the first selectable day in the season
      let d = SEASON_START
      while (!isAfter(d, SEASON_END) && isDisabledDate(d)) {
        d = addDays(d, 1)
      }
      onDateChange(d)
      setCalendarMonth(d)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Date Display with Navigation */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
        <button
          onClick={handlePreviousDay}
          disabled={!canGoPrevious}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            !canGoPrevious ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title="Previous day"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-1 min-w-0"
        >
          <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {format(selectedDate, 'EEEE, MMM d, yyyy')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click to select date
            </span>
          </div>
        </button>

        <button
          onClick={handleNextDay}
          disabled={!canGoNext}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            !canGoNext ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title="Next day"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 p-4 w-80">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(calendarMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Season Info */}
          <div className="mb-3 text-xs text-gray-600 dark:text-gray-400 text-center">
            Season: {format(SEASON_START, 'MMM d, yyyy')} - {format(SEASON_END, 'MMM d, yyyy')}
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const isSelected = isSameDay(day, selectedDate)
              const inSeason = isDateInSeason(day)
              const disabled = !inSeason || isDisabledDate(day)
              const isCurrentMonth = day.getMonth() === calendarMonth.getMonth()
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  className={`
                    p-2 text-sm rounded transition-colors
                    ${isSelected ? 'bg-primary-600 text-white font-bold' : ''}
                    ${!isSelected && isToday && !disabled ? 'border-2 border-primary-600 font-semibold' : ''}
                    ${
                      !isSelected &&
                      !isToday &&
                      !disabled &&
                      inSeason &&
                      isCurrentMonth
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                        : ''
                    }
                    ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
                    ${
                      disabled
                        ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-40'
                        : 'cursor-pointer'
                    }
                  `}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const today = new Date()
                if (isDateInSeason(today) && !isDisabledDate(today)) {
                  handleDateSelect(today)
                } else {
                  // If today is outside season or disabled, go to first selectable date in season
                  let d = SEASON_START
                  while (!isAfter(d, SEASON_END) && isDisabledDate(d)) {
                    d = addDays(d, 1)
                  }
                  handleDateSelect(d)
                }
              }}
              className="w-full px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isDateInSeason(new Date()) && !isDisabledDate(new Date())
                ? 'Go to Today'
                : 'Go to Season Start'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


