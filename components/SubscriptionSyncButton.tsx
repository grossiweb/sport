'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { getSubscriptionTier, type SubscriptionTier } from '@/lib/subscription-utils'

export default function SubscriptionSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('unknown')
  const { syncSubscription, user } = useAuth()

  // Get subscription tier for display
  useEffect(() => {
    if (user && user.subscriptionTier) {
      setSubscriptionTier(user.subscriptionTier)
    } else if (user) {
      // Fallback if subscriptionTier is not available
      if (user.subscriptionStatus === 'active') {
        setSubscriptionTier('pro') // Default to pro for active
      } else {
        setSubscriptionTier('free') // Default to free for trial status
      }
    }
  }, [user])

  const handleSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      await syncSubscription()
      toast.success('Subscription status synced successfully!')
      
      // Force page reload to refresh all subscription data
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to sync subscription status')
    } finally {
      setIsSyncing(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Subscription Status
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Current: <span className="capitalize font-semibold text-primary-600 dark:text-primary-400">
          {subscriptionTier === 'free' ? 'Free Subscriber' : 
             subscriptionTier === 'pro' ? 'Pro Subscriber' :
             subscriptionTier === 'enterprise' ? 'Enterprise Subscriber' :
             subscriptionTier === 'trial' ? 'Trial' : 'Unknown'}
          </span>
          {user.subscriptionExpiry && new Date(user.subscriptionExpiry).getFullYear() < 2030 && (
            <span className="ml-2 text-orange-600 dark:text-orange-400">
              (Expires: {new Date(user.subscriptionExpiry).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
              })})
            </span>
          )}
        </p>
      </div>
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowPathIcon 
          className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} 
        />
        {isSyncing ? 'Syncing...' : 'Sync with WordPress'}
      </button>
    </div>
  )
}
