import type { NextRequest } from 'next/server'

function normalizeOrigins(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function getCorsHeaders(req: NextRequest): Record<string, string> {
  // By default, CORS is OFF unless you explicitly set allowed origins.
  // Set in Vercel env:
  //   API_CORS_ORIGINS=https://www.bigballsbets.com,https://app.customer.com
  const allowList = normalizeOrigins(process.env.API_CORS_ORIGINS || '')
  if (!allowList.length) return {}

  const origin = req.headers.get('origin')
  if (!origin) return {}

  const isAllowed = allowList.includes('*') || allowList.includes(origin)
  if (!isAllowed) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'x-api-key,authorization,content-type',
    'Access-Control-Max-Age': '86400',
  }
}


