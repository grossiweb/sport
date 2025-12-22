import type { ApiPlan } from './types'
import { getApiPlansCollection } from './db'

export const DEFAULT_PLANS: ApiPlan[] = [
  {
    _id: 'free',
    name: 'Free',
    status: 'active',
    requestsPerMinute: 10,
    dailyRequestLimit: 1000,
    monthlyRequestLimit: 10_000,
    allowedEndpoints: ['/games', '/teams'],
    allowedSports: ['CFB', 'NFL', 'NCAAB', 'NBA'],
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
  {
    _id: 'pro',
    name: 'Pro',
    status: 'active',
    requestsPerMinute: 10,
    dailyRequestLimit: 1000,
    monthlyRequestLimit: 200_000,
    allowedEndpoints: ['/games', '/teams'],
    allowedSports: ['CFB', 'NFL', 'NCAAB', 'NBA'],
    createdAt: new Date(0),
    updatedAt: new Date(0),
  },
]

export async function getPlan(planId: string): Promise<ApiPlan | null> {
  const col = await getApiPlansCollection()
  const plan = await col.findOne({ _id: planId, status: 'active' } as any)
  return plan as ApiPlan | null
}

export function isEndpointAllowed(plan: ApiPlan, endpoint: string): boolean {
  return plan.allowedEndpoints.includes('*') || plan.allowedEndpoints.includes(endpoint)
}

export function isSportAllowed(plan: ApiPlan, sport?: string | null): boolean {
  if (!sport) return true
  if (!plan.allowedSports || plan.allowedSports.length === 0) return true
  return plan.allowedSports.includes(sport.toUpperCase())
}


