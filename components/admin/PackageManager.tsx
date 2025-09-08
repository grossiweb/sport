'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface SubscriptionPlan {
  id: string
  name: string
  planName: string
  price: number
  interval: 'month' | 'year'
  stripePriceId: string
  apiRateLimit: number
  teamLimit: number
  matchupLimit: number
  features: string[]
}

export function PackageManager() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      fetchPlans()
    }
  }, [isAdmin])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/admin/packages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data.data || [])
      } else {
        setError('Failed to fetch subscription plans')
      }
    } catch (error) {
      setError('Error loading subscription plans')
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async (planData: Omit<SubscriptionPlan, 'id'> & { id?: string }) => {
    try {
      const token = localStorage.getItem('authToken')
      const isUpdate = !!planData.id

      const response = await fetch('/api/admin/packages', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })

      if (response.ok) {
        setSuccess(isUpdate ? 'Plan updated successfully' : 'Plan created successfully')
        setEditingPlan(null)
        setShowCreateForm(false)
        fetchPlans()
      } else {
        setError(`Failed to ${isUpdate ? 'update' : 'create'} plan`)
      }
    } catch (error) {
      setError(`Error ${editingPlan ? 'updating' : 'creating'} plan`)
      console.error('Error saving plan:', error)
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You need admin privileges to manage subscription packages.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Subscription Packages
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Package
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No subscription plans found. Create your first plan to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {plan.planName}
                      </h4>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          /{plan.interval}
                        </span>
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">API Limit:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{plan.apiRateLimit}/hour</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">Teams:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{plan.teamLimit}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">Matchups:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{plan.matchupLimit}</span>
                        </div>
                      </div>
                      {plan.stripePriceId && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Stripe Price ID: {plan.stripePriceId}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingPlan) && (
        <PackageForm
          plan={editingPlan}
          onSave={savePlan}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingPlan(null)
          }}
        />
      )}
    </div>
  )
}

interface PackageFormProps {
  plan?: SubscriptionPlan | null
  onSave: (plan: Omit<SubscriptionPlan, 'id'> & { id?: string }) => void
  onCancel: () => void
}

function PackageForm({ plan, onSave, onCancel }: PackageFormProps) {
  const [formData, setFormData] = useState({
    planName: plan?.planName || '',
    price: plan?.price || 0,
    interval: plan?.interval || 'month' as 'month' | 'year',
    stripePriceId: plan?.stripePriceId || '',
    apiRateLimit: plan?.apiRateLimit || 10,
    teamLimit: plan?.teamLimit || 3,
    matchupLimit: plan?.matchupLimit || 5,
    features: plan?.features?.join('\n') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const planData = {
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim()),
      ...(plan?.id && { id: plan.id })
    }
    
    onSave(planData)
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {plan ? 'Edit Package' : 'Create Package'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interval
              </label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value as 'month' | 'year' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stripe Price ID
            </label>
            <input
              type="text"
              value={formData.stripePriceId}
              onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="price_1234567890"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Limit/hour
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.apiRateLimit}
                onChange={(e) => setFormData({ ...formData, apiRateLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teams
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.teamLimit}
                onChange={(e) => setFormData({ ...formData, teamLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Matchups
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.matchupLimit}
                onChange={(e) => setFormData({ ...formData, matchupLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Features (one per line)
            </label>
            <textarea
              rows={4}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {plan ? 'Update' : 'Create'} Package
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
