'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { formatPrice } from '@/lib/stripe/config'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  priceId: string
  features: string[]
  popular?: boolean
  limits: {
    apiRateLimit: number
    teamLimit: number
    matchupLimit: number
  }
}

export default function SubscribePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  useEffect(() => {
    fetchSubscriptionPlans()
    
    // Check for cancelled subscription
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('cancelled') === 'true') {
      toast.error('Subscription cancelled. You can try again anytime!')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchSubscriptionPlans = async () => {
    try {
      // In a real app, this would fetch from your WordPress GraphQL API
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          interval: 'month',
          priceId: '',
          features: [
            '3 team pages per day',
            '5 matchup pages per day',
            '10 API requests per hour',
            'Basic analytics',
            'Community support'
          ],
          limits: {
            apiRateLimit: 10,
            teamLimit: 3,
            matchupLimit: 5
          }
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 29.99,
          interval: 'month',
          priceId: 'price_1SmWzsBsfc1fMnM5lpwnHNJT',
          popular: true,
          features: [
            'Unlimited team pages',
            'Unlimited matchup pages',
            '1,000 API requests per hour',
            'Advanced analytics',
            'Premium predictions',
            'Email support',
            'Export data to CSV'
          ],
          limits: {
            apiRateLimit: 1000,
            teamLimit: -1,
            matchupLimit: -1
          }
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 99.99,
          interval: 'month',
          priceId: 'price_1SmWzWBsfc1fMnM57LdsAiqR',
          features: [
            'Everything in Pro',
            '5,000 API requests per hour',
            'Custom integrations',
            'Priority support',
            'Custom analytics dashboard',
            'White-label options',
            'Dedicated account manager'
          ],
          limits: {
            apiRateLimit: 5000,
            teamLimit: -1,
            matchupLimit: -1
          }
        }
      ]

      setPlans(mockPlans)
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      toast.success('You are already on the free plan!')
      return
    }

    if (!user) {
      toast.error('Please log in to subscribe')
      return
    }

    setSelectedPlan(plan.id)
    setIsCreatingSession(true)

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to create subscription')
      setSelectedPlan(null)
    } finally {
      setIsCreatingSession(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Get access to premium sports analytics and insights
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-800 p-8 shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      /{plan.interval}
                    </span>
                  )}
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Usage Limits:
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    API Requests: {plan.limits.apiRateLimit === -1 ? 'Unlimited' : `${plan.limits.apiRateLimit}/hour`}
                  </div>
                  <div>
                    Team Pages: {plan.limits.teamLimit === -1 ? 'Unlimited' : `${plan.limits.teamLimit}/day`}
                  </div>
                  <div>
                    Matchup Pages: {plan.limits.matchupLimit === -1 ? 'Unlimited' : `${plan.limits.matchupLimit}/day`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isCreatingSession && selectedPlan === plan.id}
                className={`mt-8 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : plan.id === 'free'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCreatingSession && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : plan.id === 'free' ? (
                  'Current Plan'
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <span>✓ Secure payment with Stripe</span>
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  )
}
