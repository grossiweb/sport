import { NextRequest } from 'next/server'
import { jsonOk } from '@/lib/api-service/json'
import { getCorsHeaders } from '@/lib/api-service/cors'

export async function OPTIONS(request: NextRequest) {
  const cors = getCorsHeaders(request)
  return new Response(null, { status: 204, headers: cors })
}

export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request)
  return jsonOk({ status: 'ok' }, { headers: cors })
}


