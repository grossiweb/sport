import { NextRequest } from 'next/server'

interface RateLimitInfo {
  count: number
  resetTime: number
}

interface UserLimits {
  apiRateLimit: number
  teamLimit: number
  matchupLimit: number
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitInfo>()
const featureUsageStore = new Map<string, { [key: string]: number }>()

export class RateLimiter {
  private static instance: RateLimiter
  
  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  public async checkApiRateLimit(
    userId: string, 
    limits: UserLimits
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `api_${userId}`
    const now = Date.now()
    const windowMs = 60 * 60 * 1000 // 1 hour window
    
    const current = rateLimitStore.get(key)
    
    if (!current || now > current.resetTime) {
      // Reset or initialize
      const resetTime = now + windowMs
      rateLimitStore.set(key, { count: 1, resetTime })
      
      return {
        allowed: true,
        remaining: limits.apiRateLimit - 1,
        resetTime
      }
    }
    
    if (current.count >= limits.apiRateLimit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }
    
    current.count++
    rateLimitStore.set(key, current)
    
    return {
      allowed: true,
      remaining: limits.apiRateLimit - current.count,
      resetTime: current.resetTime
    }
  }

  public async checkFeatureLimit(
    userId: string,
    feature: 'teams' | 'matchups',
    limits: UserLimits
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const key = `${feature}_${userId}`
    const now = Date.now()
    const windowMs = 24 * 60 * 60 * 1000 // 24 hour window
    
    // Get current usage for today
    const userUsage = featureUsageStore.get(userId) || {}
    const todayKey = new Date().toDateString()
    const currentUsage = userUsage[`${feature}_${todayKey}`] || 0
    
    const limit = feature === 'teams' ? limits.teamLimit : limits.matchupLimit
    
    // -1 means unlimited
    if (limit === -1) {
      return {
        allowed: true,
        current: currentUsage,
        limit: -1
      }
    }
    
    if (currentUsage >= limit) {
      return {
        allowed: false,
        current: currentUsage,
        limit
      }
    }
    
    return {
      allowed: true,
      current: currentUsage,
      limit
    }
  }

  public async incrementFeatureUsage(
    userId: string,
    feature: 'teams' | 'matchups'
  ): Promise<void> {
    const userUsage = featureUsageStore.get(userId) || {}
    const todayKey = new Date().toDateString()
    const featureKey = `${feature}_${todayKey}`
    
    userUsage[featureKey] = (userUsage[featureKey] || 0) + 1
    featureUsageStore.set(userId, userUsage)
  }

  public async getUserLimits(userId: string): Promise<UserLimits> {
    try {
      // Default to free tier limits since we don't have a getUserToken method
      // This method is kept for compatibility but uses free tier limits
      return {
        apiRateLimit: 10,
        teamLimit: 3,
        matchupLimit: 5
      }
    } catch (error) {
      console.error('Error getting user limits:', error)
      // Default to free tier limits
      return {
        apiRateLimit: 10,
        teamLimit: 3,
        matchupLimit: 5
      }
    }
  }

  public async getUserLimitsWithToken(userId: string, token: string | null): Promise<UserLimits> {
    try {
      if (!token) {
        // Default to free tier limits if no token
        return {
          apiRateLimit: 10,
          teamLimit: 3,
          matchupLimit: 5
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/subscription?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        // Default to free tier limits
        return {
          apiRateLimit: 10,
          teamLimit: 3,
          matchupLimit: 5
        }
      }
      
      const data = await response.json()
      return data.limits || {
        apiRateLimit: 10,
        teamLimit: 3,
        matchupLimit: 5
      }
    } catch (error) {
      console.error('Error getting user limits with token:', error)
      // Default to free tier limits
      return {
        apiRateLimit: 10,
        teamLimit: 3,
        matchupLimit: 5
      }
    }
  }

  // Clean up old entries (should be called periodically)
  public cleanup(): void {
    const now = Date.now()
    
    // Clean up API rate limit store
    for (const [key, value] of Array.from(rateLimitStore.entries())) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
    
    // Clean up feature usage store (keep only last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    for (const [userId, usage] of Array.from(featureUsageStore.entries())) {
      const cleanedUsage: { [key: string]: number } = {}
      
      for (const [featureKey, count] of Object.entries(usage)) {
        const dateStr = featureKey.split('_').slice(-3).join(' ') // Extract date from key
        const featureDate = new Date(dateStr)
        
        if (featureDate >= sevenDaysAgo) {
          cleanedUsage[featureKey] = typeof count === 'number' ? count : 0
        }
      }
      
      if (Object.keys(cleanedUsage).length > 0) {
        featureUsageStore.set(userId, cleanedUsage)
      } else {
        featureUsageStore.delete(userId)
      }
    }
  }
}

// Helper function to extract user ID from request
export function getUserIdFromRequest(request: NextRequest): string | null {
  // Try to get user ID from Authorization header (JWT token)
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.user_id || payload.sub
    } catch (error) {
      console.error('Error decoding JWT token:', error)
    }
  }
  
  // Try to get user ID from query parameters
  const url = new URL(request.url)
  const userIdFromQuery = url.searchParams.get('userId')
  if (userIdFromQuery) {
    return userIdFromQuery
  }
  
  return null
}

// Middleware function to check rate limits
export async function withRateLimit(
  request: NextRequest,
  feature?: 'teams' | 'matchups'
) {
  const rateLimiter = RateLimiter.getInstance()
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return {
      error: 'Authentication required',
      status: 401
    }
  }

  // Extract token from request for subscription data
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  
  const limits = await rateLimiter.getUserLimitsWithToken(userId, token)
  
  // Check API rate limit
  const apiCheck = await rateLimiter.checkApiRateLimit(userId, limits)
  
  if (!apiCheck.allowed) {
    return {
      error: 'API rate limit exceeded',
      status: 429,
      headers: {
        'X-RateLimit-Limit': limits.apiRateLimit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(apiCheck.resetTime / 1000).toString()
      }
    }
  }
  
  // Check feature limit if specified
  if (feature) {
    const featureCheck = await rateLimiter.checkFeatureLimit(userId, feature, limits)
    
    if (!featureCheck.allowed) {
      return {
        error: `${feature} limit exceeded for your subscription plan`,
        status: 403,
        current: featureCheck.current,
        limit: featureCheck.limit
      }
    }
    
    // Increment feature usage
    await rateLimiter.incrementFeatureUsage(userId, feature)
  }
  
  return {
    success: true,
    userId,
    limits,
    headers: {
      'X-RateLimit-Limit': limits.apiRateLimit.toString(),
      'X-RateLimit-Remaining': apiCheck.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(apiCheck.resetTime / 1000).toString()
    }
  }
}

// Cleanup interval (run every hour)
setInterval(() => {
  RateLimiter.getInstance().cleanup()
}, 60 * 60 * 1000)
