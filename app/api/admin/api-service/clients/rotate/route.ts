import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { requireAdmin } from '@/lib/api-service/admin-auth'
import { jsonError, jsonOk } from '@/lib/api-service/json'
import { connectToDatabase } from '@/lib/mongodb'
import { generateApiKey, getKeyPrefix, hashApiKey } from '@/lib/api-service/keys'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin.ok) return jsonError(admin.error, { status: admin.status, code: admin.code })

  const body = await request.json().catch(() => null)
  if (!body?.clientId) {
    return jsonError('Missing required field: clientId', { status: 400, code: 'BAD_REQUEST' })
  }

  const rawKey = generateApiKey()
  const hashedKey = hashApiKey(rawKey)
  const keyPrefix = getKeyPrefix(rawKey)

  const { db } = await connectToDatabase()
  const res = await db.collection('api_clients').updateOne(
    { _id: new ObjectId(String(body.clientId)) },
    { $set: { hashedKey, keyPrefix, lastUsedAt: undefined } }
  )

  if (res.matchedCount === 0) {
    return jsonError('Client not found', { status: 404, code: 'NOT_FOUND' })
  }

  return jsonOk({ clientId: String(body.clientId), apiKey: rawKey, keyPrefix })
}


