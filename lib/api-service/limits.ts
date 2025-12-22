import { getApiUsageDailyCollection, getApiUsageMinuteCollection, getApiUsageMonthlyCollection } from './db'
import type { ApiPlan } from './types'

function getMonthKey(d: Date): string {
  // YYYY-MM
  return d.toISOString().slice(0, 7)
}

function getMinuteWindowKey(d: Date): string {
  // YYYY-MM-DDTHH:MM (UTC)
  return d.toISOString().slice(0, 16)
}

function getDayKey(d: Date): string {
  // YYYY-MM-DD (UTC)
  return d.toISOString().slice(0, 10)
}

export async function enforceLimits(opts: {
  clientId: string
  plan: ApiPlan
  endpoint: string
}): Promise<
  | { ok: true; headers: Record<string, string> }
  | {
      ok: false
      status: number
      error: string
      code: string
      headers?: Record<string, string>
    }
> {
  const now = new Date()

  // ---- Per-minute (fixed window) ----
  const minuteCol = await getApiUsageMinuteCollection()
  const minuteKey = getMinuteWindowKey(now)
  const minuteId = `${opts.clientId}:${minuteKey}`

  const minuteRes = await minuteCol.findOneAndUpdate(
    { _id: minuteId },
    {
      $inc: { count: 1 },
      $setOnInsert: {
        clientId: opts.clientId,
        minute: minuteKey,
        createdAt: now,
        // TTL field (you should add a TTL index on expiresAt)
        expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
  const minuteCount = minuteRes.value?.count ?? 1
  if (minuteCount > opts.plan.requestsPerMinute) {
    return {
      ok: false,
      status: 429,
      code: 'RATE_LIMIT_MINUTE',
      error: 'Rate limit exceeded (per-minute).',
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit-Minute': String(opts.plan.requestsPerMinute),
        'X-RateLimit-Used-Minute': String(minuteCount),
      },
    }
  }

  // ---- Daily quota ----
  const dayCol = await getApiUsageDailyCollection()
  const day = getDayKey(now)
  const dayId = `${opts.clientId}:${day}`

  const dayRes = await dayCol.findOneAndUpdate(
    { _id: dayId },
    {
      $inc: { total: 1, [`perEndpoint.${opts.endpoint}`]: 1 },
      $setOnInsert: {
        clientId: opts.clientId,
        day,
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  )

  const dailyTotal = dayRes.value?.total ?? 1
  if (dailyTotal > opts.plan.dailyRequestLimit) {
    return {
      ok: false,
      status: 429,
      code: 'QUOTA_DAILY',
      error: 'Daily quota exceeded.',
      headers: {
        'X-Quota-Limit-Day': String(opts.plan.dailyRequestLimit),
        'X-Quota-Used-Day': String(dailyTotal),
      },
    }
  }

  // ---- Monthly quota ----
  const monthCol = await getApiUsageMonthlyCollection()
  const month = getMonthKey(now)
  const monthId = `${opts.clientId}:${month}`

  const monthRes = await monthCol.findOneAndUpdate(
    { _id: monthId },
    {
      $inc: { total: 1, [`perEndpoint.${opts.endpoint}`]: 1 },
      $setOnInsert: {
        clientId: opts.clientId,
        month,
        createdAt: now,
      },
      $set: {
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  )

  const monthlyTotal = monthRes.value?.total ?? 1
  if (monthlyTotal > opts.plan.monthlyRequestLimit) {
    return {
      ok: false,
      status: 429,
      code: 'QUOTA_MONTHLY',
      error: 'Monthly quota exceeded.',
      headers: {
        'X-Quota-Limit-Month': String(opts.plan.monthlyRequestLimit),
        'X-Quota-Used-Month': String(monthlyTotal),
      },
    }
  }

  return {
    ok: true,
    headers: {
      'X-RateLimit-Limit-Minute': String(opts.plan.requestsPerMinute),
      'X-RateLimit-Used-Minute': String(minuteCount),
      'X-Quota-Limit-Day': String(opts.plan.dailyRequestLimit),
      'X-Quota-Used-Day': String(dailyTotal),
      'X-Quota-Limit-Month': String(opts.plan.monthlyRequestLimit),
      'X-Quota-Used-Month': String(monthlyTotal),
    },
  }
}


