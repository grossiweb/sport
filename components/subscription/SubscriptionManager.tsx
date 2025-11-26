'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatPrice } from '@/lib/stripe/config'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'

interface SubscriptionData {
  subscription: {
    id: string
    stripeId: string
    status: string
    startDate: string
    endDate: string
    apiUsageCount: number
    currentPeriodEnd: number
    cancelAtPeriodEnd: boolean
  } | null
  plan: {
    id: string
    name: string
    price: number
    interval: string
    features: string[]
  } | string
  limits: {
    apiRateLimit: number
    teamLimit: number
    matchupLimit: number
  }
}

export function SubscriptionManager() {
  const { user } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch(`/api/subscriptions/status?userId=${user?.id}`)
      const data = await response.json()

      if (data.success) {
        setSubscriptionData(data)
      } else {
        throw new Error(data.error || 'Failed to fetch subscription data')
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error)
      toast.error('Failed to load subscription information')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionData?.subscription?.stripeId) return

    const confirmed = confirm(
      'Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.'
    )

    if (!confirmed) return

    setActionLoading(true)

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionData.subscription.stripeId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Subscription cancelled successfully')
        await fetchSubscriptionData() // Refresh data
      } else {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
    } catch (error: any) {
      console.error('Cancel subscription error:', error)
      toast.error(error.message || 'Failed to cancel subscription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpgrade = () => {
    window.location.href = '/subscribe'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'trialing':
        return 'text-blue-600 bg-blue-100'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
      case 'canceled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'trialing':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'past_due':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case 'cancelled':
      case 'canceled':
        return <XCircleIcon className="h-5 w-5" />
      default:
        return <XCircleIcon className="h-5 w-5" />
    }
  }

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!subscriptionData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Unable to Load Subscription
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We couldn't load your subscription information. Please try again.
          </p>
          <button
            onClick={fetchSubscriptionData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const isFreePlan = typeof subscriptionData.plan === 'string' && subscriptionData.plan === 'free'
  const hasActiveSubscription = subscriptionData.subscription && subscriptionData.subscription.status === 'active'

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Current Plan
          </h3>
          {subscriptionData.subscription && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscriptionData.subscription.status)}`}>
              {getStatusIcon(subscriptionData.subscription.status)}
              <span className="ml-1 capitalize">
                {subscriptionData.subscription.status}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isFreePlan ? 'Free Plan' : (subscriptionData.plan as any).name}
            </h4>
            {!isFreePlan && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {formatPrice((subscriptionData.plan as any).price)}/{(subscriptionData.plan as any).interval}
              </p>
            )}
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">API Requests:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {subscriptionData.limits.apiRateLimit === -1 ? 'Unlimited' : `${subscriptionData.limits.apiRateLimit}/hour`}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Team Pages:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {subscriptionData.limits.teamLimit === -1 ? 'Unlimited' : `${subscriptionData.limits.teamLimit}/day`}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Matchup Pages:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {subscriptionData.limits.matchupLimit === -1 ? 'Unlimited' : `${subscriptionData.limits.matchupLimit}/day`}
                </span>
              </div>
            </div>
          </div>

          <div>
            {subscriptionData.subscription && (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Current Period Ends:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(subscriptionData.subscription.currentPeriodEnd)}
                  </p>
                </div>
                
                {subscriptionData.subscription.apiUsageCount > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      API Usage (Current Hour):
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {subscriptionData.subscription.apiUsageCount} / {subscriptionData.limits.apiRateLimit === -1 ? '∞' : subscriptionData.limits.apiRateLimit}
                    </p>
                  </div>
                )}

                {subscriptionData.subscription.cancelAtPeriodEnd && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your subscription will end on {formatDate(subscriptionData.subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isFreePlan || !hasActiveSubscription ? (
            <button
              onClick={handleUpgrade}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              Upgrade Plan
            </button>
          ) : (
            <>
              <button
                onClick={handleUpgrade}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUpIcon className="h-4 w-4 mr-2" />
                Change Plan
              </button>
              
              {!subscriptionData.subscription.cancelAtPeriodEnd && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Features List */}
      {!isFreePlan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Plan Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(subscriptionData.plan as any).features?.map((feature: string, index: number) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Information */}
      {hasActiveSubscription && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Billing Information
          </h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CreditCardIcon className="h-4 w-4 mr-2" />
            <span>Payments are processed securely through Stripe</span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            To update your payment method or view billing history, please contact support.
          </p>
        </div>
      )}
    </div>
  )
}
