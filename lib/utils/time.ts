const DEFAULT_LOCALE = 'en-US'

export const DEFAULT_TIME_ZONE = 'America/New_York'

const toDate = (value: string | number | Date) => (value instanceof Date ? value : new Date(value))

const isInvalidDate = (date: Date) => Number.isNaN(date.getTime())

const formatInEastern = (value: string | number | Date, options: Intl.DateTimeFormatOptions) => {
  const date = toDate(value)

  if (isInvalidDate(date)) {
    return 'Invalid Date'
  }

  const formatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIME_ZONE,
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
  const suffix = options?.timeZoneName === 'short' || options?.timeZoneName === 'long' ? '' : ' ET'

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
