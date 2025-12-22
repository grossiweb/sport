import { connectToDatabase } from '@/lib/mongodb'
import type { Collection } from 'mongodb'
import type { ApiClient, ApiPlan } from './types'

export async function getApiPlansCollection(): Promise<Collection<ApiPlan>> {
  const { db } = await connectToDatabase()
  return db.collection<ApiPlan>('api_plans')
}

export async function getApiClientsCollection(): Promise<Collection<ApiClient>> {
  const { db } = await connectToDatabase()
  return db.collection<ApiClient>('api_clients')
}

export async function getApiUsageMinuteCollection(): Promise<Collection<any>> {
  const { db } = await connectToDatabase()
  return db.collection('api_usage_minute')
}

export async function getApiUsageDailyCollection(): Promise<Collection<any>> {
  const { db } = await connectToDatabase()
  return db.collection('api_usage_daily')
}

export async function getApiUsageMonthlyCollection(): Promise<Collection<any>> {
  const { db } = await connectToDatabase()
  return db.collection('api_usage_monthly')
}


