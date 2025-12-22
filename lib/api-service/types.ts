export type ApiPlanId = string

export interface ApiPlan {
  _id: ApiPlanId
  name: string
  status: 'active' | 'inactive'
  // quotas
  requestsPerMinute: number
  dailyRequestLimit: number
  monthlyRequestLimit: number
  // access control
  allowedEndpoints: string[] // e.g. ['/games', '/teams'] or ['*']
  allowedSports?: string[] // optional: ['CFB','NFL','NCAAB','NBA']
  createdAt: Date
  updatedAt: Date
}

export interface ApiClient {
  _id?: any
  name: string
  contactEmail?: string
  planId: ApiPlanId
  status: 'active' | 'suspended'
  hashedKey: string
  keyPrefix: string // first 8 chars of raw key, for identification
  createdAt: Date
  lastUsedAt?: Date
  notes?: string
}

export interface AuthenticatedApiClient {
  clientId: string
  plan: ApiPlan
  keyPrefix: string
}


