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
  return new Response(null, { status: 204, headers: cors })
}

export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request)
  const { searchParams } = request.nextUrl
  const sport = (searchParams.get('sport')?.toUpperCase() || 'CFB').trim()

  if (!isValidSportType(sport)) {
    return jsonError('Invalid sport parameter', { status: 400, code: 'INVALID_SPORT', headers: cors })
  }

  const auth = await authenticateExternalRequest({
    req: request,
    endpoint: '/teams',
    sport,
  })
  if (auth.ok === false) return jsonError(auth.error, { status: auth.status, code: auth.code, headers: cors })

  const limits = await enforceLimits({
    clientId: auth.client.clientId,
    plan: auth.client.plan,
    endpoint: '/teams',
  })
  if (limits.ok === false) {
    return jsonError(limits.error, {
      status: limits.status,
      code: limits.code,
      headers: { ...cors, ...(limits.headers || {}) },
    })
  }

  try {
    const teams = await mongoSportsAPI.getTeams(sport as SportType)
    return jsonOk({ sport, teams }, { headers: { ...cors, ...limits.headers } })
  } catch (e: any) {
    return jsonError('Failed to fetch teams', {
      status: 500,
      code: 'TEAMS_FETCH_FAILED',
      details: e?.message ? String(e.message) : undefined,
      headers: { ...cors, ...limits.headers },
    })
  }
}


