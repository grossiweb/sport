'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: string
  features: string[]
  stripePriceId?: string
}

interface SubscriptionLimits {
  apiRateLimit: number
  teamLimit: number
  matchupLimit: number
}

interface UserSubscription {
  id?: string
  status: string
  startDate?: string
  endDate?: string
  stripeSubscriptionId?: string
  apiUsageCount?: number
  lastUsageReset?: string
}

interface SubscriptionData {
  subscription: UserSubscription | null
  plan: SubscriptionPlan
  limits: SubscriptionLimits
  status: string
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSubscription(): SubscriptionData {
  const { user, isAuthenticated } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscription: null,
    plan: {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: []
    },
    limits: {
      apiRateLimit: 10,
      teamLimit: 3,
      matchupLimit: 5
    },
    status: 'inactive',
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const fetchSubscriptionData = async () => {
    if (!isAuthenticated || !user) {
      setSubscriptionData(prev => ({
        ...prev,
        loading: false,
        status: 'inactive'
      }))
      return
    }

    try {
      setSubscriptionData(prev => ({ ...prev, loading: true, error: null }))

      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/user/subscription?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSubscriptionData(prev => ({
          ...prev,
          subscription: data.subscription,
          plan: data.plan,
          limits: data.limits,
          status: data.status,
          loading: false,
          error: null
        }))
      } else {
        throw new Error(data.error || 'Failed to fetch subscription data')
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      setSubscriptionData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }

  useEffect(() => {
    fetchSubscriptionData()
  }, [isAuthenticated, user?.id])

  // Update the refetch function
  useEffect(() => {
    setSubscriptionData(prev => ({
      ...prev,
      refetch: fetchSubscriptionData
    }))
  }, [isAuthenticated, user?.id])

  return subscriptionData
}

// Helper function to get display name for subscription status
export function getSubscriptionDisplayName(plan: SubscriptionPlan, status: string): string {
  if (status === 'active') {
    return plan.name || 'Pro'
  } else if (status === 'trial') {
    return 'Trial'
  } else if (status === 'expired') {
    return 'Expired'
  } else {
    return 'Free'
  }
}

// Helper function to get subscription color class
export function getSubscriptionColorClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'trial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'expired':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}
