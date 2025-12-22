import type { NextRequest } from 'next/server'
import { getApiClientsCollection } from './db'
import { hashApiKey } from './keys'
import { getPlan, isEndpointAllowed, isSportAllowed } from './plans'
import type { AuthenticatedApiClient } from './types'

function extractApiKey(req: NextRequest): string | null {
  const headerKey = req.headers.get('x-api-key')
  if (headerKey) return headerKey.trim()

  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (auth) {
    const v = auth.trim()
    // Authorization: ApiKey <key>
    if (/^apikey\s+/i.test(v)) return v.replace(/^apikey\s+/i, '').trim()
    // Authorization: Bearer <key> (optional support)
    if (/^bearer\s+/i.test(v)) return v.replace(/^bearer\s+/i, '').trim()
  }

  const qsKey = req.nextUrl.searchParams.get('api_key')
  return qsKey ? qsKey.trim() : null
}

export async function authenticateExternalRequest(opts: {
  req: NextRequest
  endpoint: string // like '/games'
  sport?: string | null
}): Promise<
  | { ok: true; client: AuthenticatedApiClient }
  | { ok: false; status: number; error: string; code: string }
> {
  const apiKey = extractApiKey(opts.req)
  if (!apiKey) {
    return { ok: false, status: 401, code: 'NO_API_KEY', error: 'Missing API key.' }
  }

  const hashedKey = hashApiKey(apiKey)
  const clientsCol = await getApiClientsCollection()
  const client = await clientsCol.findOne({ hashedKey, status: 'active' } as any)
  if (!client) {
    return { ok: false, status: 401, code: 'INVALID_API_KEY', error: 'Invalid or inactive API key.' }
  }

  const plan = await getPlan(client.planId)
  if (!plan) {
    return { ok: false, status: 403, code: 'PLAN_NOT_FOUND', error: 'API plan not found or inactive.' }
  }

  if (!isEndpointAllowed(plan, opts.endpoint)) {
    return { ok: false, status: 403, code: 'ENDPOINT_NOT_ALLOWED', error: 'Endpoint not allowed for this plan.' }
  }

  if (!isSportAllowed(plan, opts.sport)) {
    return { ok: false, status: 403, code: 'SPORT_NOT_ALLOWED', error: 'Sport not allowed for this plan.' }
  }

  // Update lastUsedAt asynchronously (best-effort)
  clientsCol
    .updateOne({ _id: client._id }, { $set: { lastUsedAt: new Date() } })
    .catch(() => {})

  return {
    ok: true,
    client: {
      clientId: String(client._id),
      plan,
      keyPrefix: client.keyPrefix,
    },
  }
}


