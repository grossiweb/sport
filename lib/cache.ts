/**
 * Simple in-memory cache for API responses
 * In production, you might want to use Redis or similar
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Global cache instance
export const apiCache = new MemoryCache()

// Cleanup expired items every 5 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    apiCache.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Cache key generators for consistent caching
 */
export const cacheKeys = {
  matchups: (sport: string, date?: string) => 
    `matchups:${sport}:${date || 'today'}`,
  
  matchupDetails: (sport: string, gameId: string) => 
    `matchup:${sport}:${gameId}`,
  
  teams: (sport: string) => 
    `teams:${sport}`,
  
  teamStats: (sport: string, teamId: string) => 
    `team-stats:${sport}:${teamId}`,
  
  games: (sport: string, date?: string) => 
    `games:${sport}:${date || 'today'}`,
    
  bettingData: (sport: string, gameId: string) => 
    `betting:${sport}:${gameId}`
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const cacheTTL = {
  matchups: 3 * 60 * 1000,      // 3 minutes - frequently changing
  matchupDetails: 5 * 60 * 1000, // 5 minutes - moderate changes
  teams: 24 * 60 * 60 * 1000,   // 24 hours - rarely changes
  teamStats: 30 * 60 * 1000,    // 30 minutes - changes occasionally
  games: 2 * 60 * 1000,         // 2 minutes - frequently changing
  bettingData: 1 * 60 * 1000     // 1 minute - very frequently changing
}
