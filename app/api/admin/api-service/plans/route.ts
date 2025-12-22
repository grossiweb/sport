import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/api-service/admin-auth'
import { jsonError, jsonOk } from '@/lib/api-service/json'
import type { ApiPlan } from '@/lib/api-service/types'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (admin.ok === false) return jsonError(admin.error, { status: admin.status, code: admin.code })

  const { db } = await connectToDatabase()
  const plans = await db.collection<ApiPlan>('api_plans').find({}).sort({ createdAt: -1 }).toArray()
  return jsonOk({ plans })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (admin.ok === false) return jsonError(admin.error, { status: admin.status, code: admin.code })

  const body = await request.json().catch(() => null)
  if (!body?._id || !body?.name) {
    return jsonError('Missing required fields: _id, name', { status: 400, code: 'BAD_REQUEST' })
  }

  const now = new Date()
  const plan = {
    _id: String(body._id),
    name: String(body.name),
    status: (body.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    requestsPerMinute: Number(body.requestsPerMinute ?? 10),
    dailyRequestLimit: Number(body.dailyRequestLimit ?? 1000),
    monthlyRequestLimit: Number(body.monthlyRequestLimit ?? 50_000),
    allowedEndpoints: Array.isArray(body.allowedEndpoints) ? body.allowedEndpoints.map(String) : ['*'],
    allowedSports: Array.isArray(body.allowedSports) ? body.allowedSports.map((s: any) => String(s).toUpperCase()) : undefined,
    createdAt: now,
    updatedAt: now,
  }

  const { db } = await connectToDatabase()
  await db.collection<ApiPlan>('api_plans').updateOne(
    { _id: plan._id },
    {
      $set: {
        name: plan.name,
        status: plan.status,
        requestsPerMinute: plan.requestsPerMinute,
        dailyRequestLimit: plan.dailyRequestLimit,
        monthlyRequestLimit: plan.monthlyRequestLimit,
        allowedEndpoints: plan.allowedEndpoints,
        allowedSports: plan.allowedSports,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  )

  return jsonOk({ planId: plan._id })
}


