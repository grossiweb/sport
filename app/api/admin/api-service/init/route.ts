import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/api-service/admin-auth'
import { jsonError, jsonOk } from '@/lib/api-service/json'
import { DEFAULT_PLANS } from '@/lib/api-service/plans'
import type { ApiPlan } from '@/lib/api-service/types'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (admin.ok === false) return jsonError(admin.error, { status: admin.status, code: admin.code })

  const { db } = await connectToDatabase()

  // Seed default plans (upsert)
  const plansCol = db.collection<ApiPlan>('api_plans')
  const now = new Date()
  for (const p of DEFAULT_PLANS) {
    await plansCol.updateOne(
      { _id: p._id },
      {
        $set: {
          name: p.name,
          status: p.status,
          requestsPerMinute: p.requestsPerMinute,
          dailyRequestLimit: p.dailyRequestLimit,
          monthlyRequestLimit: p.monthlyRequestLimit,
          allowedEndpoints: p.allowedEndpoints,
          allowedSports: p.allowedSports,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    )
  }

  // Indexes (best-effort)
  await db.collection('api_clients').createIndex({ hashedKey: 1 }, { unique: true })
  await db.collection('api_clients').createIndex({ keyPrefix: 1 })
  await db.collection('api_clients').createIndex({ planId: 1 })

  // TTL for minute window docs
  await db.collection('api_usage_minute').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

  // Daily usage keys
  await db.collection('api_usage_daily').createIndex({ clientId: 1, day: 1 }, { unique: true })

  // Monthly usage keys
  await db.collection('api_usage_monthly').createIndex({ clientId: 1, month: 1 }, { unique: true })

  return jsonOk({ seededPlans: DEFAULT_PLANS.map((p) => p._id) })
}


