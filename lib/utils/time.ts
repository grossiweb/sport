import { utcToZonedTime } from 'date-fns-tz'

const DEFAULT_LOCALE = 'en-US'

// Central app timezone (only used when conversion is enabled)
export const DEFAULT_TIME_ZONE = 'America/New_York'

// Build‑time flag (works on server + client). If not set, defaults to true.
// Add to .env.local if you want to control it:
// NEXT_PUBLIC_ENABLE_TIMEZONE_CONVERSION=true | false
const ENABLE_TIMEZONE_CONVERSION =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_ENABLE_TIMEZONE_CONVERSION !== 'false'
    : true

export const isTimeZoneConversionEnabled = () => ENABLE_TIMEZONE_CONVERSION

export const getNowInAppTimeZone = (): Date => {
  const now = new Date()
  if (!isTimeZoneConversionEnabled()) return now
  return utcToZonedTime(now, DEFAULT_TIME_ZONE)
}

const toDate = (value: string | number | Date) => (value instanceof Date ? value : new Date(value))

const isInvalidDate = (date: Date) => Number.isNaN(date.getTime())

const formatInEastern = (value: string | number | Date, options: Intl.DateTimeFormatOptions) => {
  const date = toDate(value)

  if (isInvalidDate(date)) {
    return 'Invalid Date'
  }

  // If conversion is disabled, do NOT force a timeZone here – just use whatever
  // the environment / caller specifies in options.
  const baseOptions: Intl.DateTimeFormatOptions = isTimeZoneConversionEnabled()
    ? { timeZone: DEFAULT_TIME_ZONE }
    : {}

  const formatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    ...baseOptions,
    ...options
  })

  return formatter.format(date)
}

export const formatToEasternTime = (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => {
  const mergedOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options
  }

  const formatted = formatInEastern(value, mergedOptions)

  // Only append " ET" when we are actually applying the Eastern conversion and the
  // caller hasn't requested a specific timeZoneName label.
  const shouldAppendSuffix =
    isTimeZoneConversionEnabled() &&
    !(options?.timeZoneName === 'short' || options?.timeZoneName === 'long')

  const suffix = shouldAppendSuffix ? ' ET' : ''

  return `${formatted}${suffix}`
}

export const formatToEasternDate = (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => {
  const mergedOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }

  return formatInEastern(value, mergedOptions)
}

export const formatToEasternWeekday = (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => {
  const mergedOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    ...options
  }

  return formatInEastern(value, mergedOptions)
}
