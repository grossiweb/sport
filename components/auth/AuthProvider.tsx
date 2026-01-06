'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User, AuthState } from '@/types'
import { hasActiveSubscription } from '@/lib/subscription-utils'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<boolean>
  checkSubscription: () => boolean
  syncSubscription: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicRoutes = ['/login', '/register', '/subscribe', '/', '/forgot-password', '/reset-password']

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for existing session on mount
    checkExistingSession()
    
    // Set up automatic session refresh every 30 minutes
    const refreshInterval = setInterval(() => {
      refreshSession()
    }, 30 * 60 * 1000) // 30 minutes

    // Set up subscription sync every 5 minutes to ensure real-time sync
    const syncInterval = setInterval(() => {
      syncSubscriptionStatus()
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      clearInterval(refreshInterval)
      clearInterval(syncInterval)
    }
  }, [])

  useEffect(() => {
    // Redirect logic based on auth state and current route
    if (!authState.isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname)
      const hasValidSubscription = checkSubscription()
      
      console.log('AuthProvider redirect check:', {
        isAuthenticated: authState.isAuthenticated,
        isPublicRoute,
        hasValidSubscription,
        pathname,
        user: authState.user ? {
          subscriptionStatus: authState.user.subscriptionStatus,
          subscriptionExpiry: authState.user.subscriptionExpiry
        } : null
      })
      
      if (!authState.isAuthenticated && !isPublicRoute) {
        console.log('Redirecting to login: not authenticated')
        router.push('/login')
      } else if (authState.isAuthenticated && !hasValidSubscription && pathname !== '/subscribe') {
        console.log('Redirecting to subscribe: no valid subscription')
        router.push('/subscribe')
      }
    }
  }, [authState.isAuthenticated, authState.isLoading, pathname, router])

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const loginTime = localStorage.getItem('loginTime')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (token && loginTime) {
        const loginDate = new Date(parseInt(loginTime))
        const now = new Date()
        const timeDifference = now.getTime() - loginDate.getTime()
        const hoursDifference = timeDifference / (1000 * 60 * 60)
        
        // If session is older than 24 hours, force logout
        if (hoursDifference > 24) {
          console.log('Session expired after 24 hours')
          localStorage.removeItem('authToken')
          localStorage.removeItem('loginTime')
          localStorage.removeItem('refreshToken')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
          return
        }
        
        // Validate token with your API
        const response = await fetch('/api/auth/validate', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const userData = await response.json()
          setAuthState({
            user: userData.user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          // Token is invalid, try to refresh if we have a refresh token
          if (refreshToken) {
            const refreshSuccess = await attemptTokenRefresh(refreshToken)
            if (!refreshSuccess) {
              clearAuthData()
            }
          } else {
            clearAuthData()
          }
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Session validation error:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const attemptTokenRefresh = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.token && data.user) {
          localStorage.setItem('authToken', data.token)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }
          // Don't update loginTime on refresh - we want to track original login
          
          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          })
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  const refreshSession = async () => {
    const token = localStorage.getItem('authToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (authState.isAuthenticated && refreshToken) {
      console.log('Attempting automatic session refresh...')
      await attemptTokenRefresh(refreshToken)
    }
  }

  const syncSubscriptionStatus = async () => {
    const token = localStorage.getItem('authToken')
    
    if (authState.isAuthenticated && token && authState.user) {
      try {
        // First, sync from Stripe to WordPress
        console.log('Syncing Stripe subscription to WordPress...')
        try {
          const manualSyncResponse = await fetch('/api/subscriptions/manual-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: authState.user.id,
              userEmail: authState.user.email,
            }),
          })
          
          if (manualSyncResponse.ok) {
            console.log('Stripe to WordPress sync successful')
          } else {
            console.warn('Stripe to WordPress sync failed, continuing with WordPress sync...')
          }
        } catch (manualSyncError) {
          console.warn('Manual sync error:', manualSyncError)
        }
        
        // Then sync WordPress data to local state
        console.log('Syncing subscription status with WordPress...')
        const response = await fetch('/api/sync-subscription', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            console.log('Subscription status synced successfully:', data.user.subscriptionStatus)
            // Update the user state with fresh subscription data
            setAuthState(prev => ({
              ...prev,
              user: data.user
            }))
          }
        } else {
          console.warn('Failed to sync subscription status:', response.status)
        }
      } catch (error) {
        console.error('Subscription sync error:', error)
      }
    }
  }

  const clearAuthData = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('loginTime')
    localStorage.removeItem('refreshToken')
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('loginTime', Date.now().toString())
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
        
        // Perform immediate subscription sync after successful login
        setTimeout(() => {
          syncSubscriptionStatus()
        }, 1000) // Small delay to ensure state is set
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('loginTime', Date.now().toString())
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      const token = localStorage.getItem('authToken')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with logout even if API call fails
    }
    
    // Clear local storage and state
    clearAuthData()
    router.push('/login')
  }

  const checkSubscription = (): boolean => {
    if (!authState.user) return false
    
    const { subscriptionStatus, subscriptionExpiry } = authState.user
    
    // Use centralized subscription checking logic
    return hasActiveSubscription(subscriptionStatus, subscriptionExpiry)
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    checkSubscription,
    syncSubscription: syncSubscriptionStatus,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}