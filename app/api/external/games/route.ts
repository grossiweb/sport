import { NextRequest } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { isValidSportType } from '@/lib/constants/sports'
import type { SportType } from '@/types'
import { authenticateExternalRequest } from '@/lib/api-service/auth'
import { enforceLimits } from '@/lib/api-service/limits'
import { jsonError, jsonOk } from '@/lib/api-service/json'
import { getCorsHeaders } from '@/lib/api-service/cors'

export async function OPTIONS(request: NextRequest) {
  const cors = getCorsHeaders(request)
  // If CORS is not configured, return 204 without any CORS headers.
  return new Response(null, { status: 204, headers: cors })
}

export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request)
  const { searchParams } = request.nextUrl
  const sport = (searchParams.get('sport')?.toUpperCase() || 'CFB').trim()
  const date = searchParams.get('date') || undefined

  if (!isValidSportType(sport)) {
    return jsonError('Invalid sport parameter', { status: 400, code: 'INVALID_SPORT', headers: cors })
  }

  const auth = await authenticateExternalRequest({
    req: request,
    endpoint: '/games',
    sport,
  })
  if (auth.ok === false) return jsonError(auth.error, { status: auth.status, code: auth.code, headers: cors })

  const limits = await enforceLimits({
    clientId: auth.client.clientId,
    plan: auth.client.plan,
    endpoint: '/games',
  })
  if (limits.ok === false) {
    return jsonError(limits.error, {
      status: limits.status,
      code: limits.code,
      headers: { ...cors, ...(limits.headers || {}) },
    })
  }

  try {
    const games = await mongoSportsAPI.getGames(sport as SportType, date)
    return jsonOk({ sport, date: date ?? null, games }, { headers: { ...cors, ...limits.headers } })
  } catch (e: any) {
    return jsonError('Failed to fetch games', {
      status: 500,
      code: 'GAMES_FETCH_FAILED',
      details: e?.message ? String(e.message) : undefined,
      headers: { ...cors, ...limits.headers },
    })
  }
}


