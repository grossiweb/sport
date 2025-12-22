import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/api-service/admin-auth'
import { jsonError, jsonOk } from '@/lib/api-service/json'
import { connectToDatabase } from '@/lib/mongodb'
import { generateApiKey, getKeyPrefix, hashApiKey } from '@/lib/api-service/keys'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (admin.ok === false) return jsonError(admin.error, { status: admin.status, code: admin.code })

  const { db } = await connectToDatabase()
  const clients = await db
    .collection('api_clients')
    .find({}, { projection: { hashedKey: 0 } })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray()

  return jsonOk({ clients })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (admin.ok === false) return jsonError(admin.error, { status: admin.status, code: admin.code })

  const body = await request.json().catch(() => null)
  if (!body?.name || !body?.planId) {
    return jsonError('Missing required fields: name, planId', { status: 400, code: 'BAD_REQUEST' })
  }

  const rawKey = generateApiKey()
  const hashedKey = hashApiKey(rawKey)
  const keyPrefix = getKeyPrefix(rawKey)
  const now = new Date()

  const { db } = await connectToDatabase()
  const res = await db.collection('api_clients').insertOne({
    name: String(body.name),
    contactEmail: body.contactEmail ? String(body.contactEmail) : undefined,
    planId: String(body.planId),
    status: 'active',
    hashedKey,
    keyPrefix,
    createdAt: now,
    notes: body.notes ? String(body.notes) : undefined,
  })

  // IMPORTANT: raw key is only returned once
  return jsonOk(
    {
      clientId: String(res.insertedId),
      apiKey: rawKey,
      keyPrefix,
    },
    { status: 201 }
  )
}


