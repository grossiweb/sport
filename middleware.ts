import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/validate',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
]

// Define routes that require specific permissions
const adminRoutes = [
  '/admin'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // If the request is coming from the API subdomain, only allow API routes.
  // This keeps `api.bigballsbets.com` strictly for API usage (Option A on Vercel).
  if (host.toLowerCase().startsWith('api.')) {
    const isAllowedApiRoute =
      pathname.startsWith('/api/external') ||
      pathname.startsWith('/api/admin/api-service') ||
      pathname.startsWith('/api/auth') // allow auth endpoints if you ever need them for admin tooling

    if (!isAllowedApiRoute) {
      const redirectUrl = new URL(`https://www.${host.replace(/^api\./i, '')}${pathname}`, request.url)
      redirectUrl.search = request.nextUrl.search
      return NextResponse.redirect(redirectUrl, 308)
    }
  }
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For admin routes, you might want to validate the token here
  // and check if user has admin privileges
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // You could make a request to validate admin privileges
    // For now, we'll allow the request to proceed
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
