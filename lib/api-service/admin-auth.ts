import { GraphQLClient } from 'graphql-request'
import type { NextRequest } from 'next/server'

const VALIDATE_TOKEN_QUERY = `
  query ValidateToken {
    viewer {
      id
      roles {
        nodes {
          name
        }
      }
    }
  }
`

export async function requireAdmin(request: NextRequest): Promise<
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string; code: string }
> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, code: 'NO_BEARER', error: 'No valid token provided.' }
  }

  const token = authHeader.substring(7)
  const client = new GraphQLClient(
    process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql',
    { headers: { Authorization: `Bearer ${token}` } }
  )

  try {
    const data = (await client.request(VALIDATE_TOKEN_QUERY)) as any
    const roles: string[] = data?.viewer?.roles?.nodes?.map((r: any) => r?.name).filter(Boolean) || []
    const isAdmin = roles.includes('administrator')
    if (!data?.viewer?.id || !isAdmin) {
      return { ok: false, status: 403, code: 'NOT_ADMIN', error: 'Admin role required.' }
    }
    return { ok: true, userId: String(data.viewer.id) }
  } catch {
    return { ok: false, status: 401, code: 'TOKEN_INVALID', error: 'Token validation failed.' }
  }
}


