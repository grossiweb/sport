'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager'
import { PackageManager } from '@/components/admin/PackageManager'
import SubscriptionSyncButton from '@/components/SubscriptionSyncButton'
import { 
  UserIcon, 
  CreditCardIcon, 
  BellIcon, 
  ShieldCheckIcon,
  Cog6ToothIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

type SettingsTab = 'profile' | 'subscription' | 'notifications' | 'security' | 'preferences' | 'packages'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const baseTabs = [
    { id: 'profile' as const, name: 'Profile', icon: UserIcon },
    { id: 'subscription' as const, name: 'Subscription', icon: CreditCardIcon },
    { id: 'notifications' as const, name: 'Notifications', icon: BellIcon },
    { id: 'security' as const, name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences' as const, name: 'Preferences', icon: Cog6ToothIcon },
  ]

  // Add admin-only tabs
  const tabs = user?.role === 'admin' 
    ? [...baseTabs, { id: 'packages' as const, name: 'Packages', icon: CubeIcon }]
    : baseTabs

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <SubscriptionSyncButton />
                <SubscriptionManager />
              </div>
            )}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'preferences' && <PreferenceSettings />}
            {activeTab === 'packages' && <PackageManager />}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  const { user } = useAuth()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Profile Information
      </h2>
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user?.name}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Notification Preferences
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Email Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Receive email updates about your subscription and account
            </p>
          </div>
          <input type="checkbox" className="rounded" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Game Predictions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get notified when new predictions are available
            </p>
          </div>
          <input type="checkbox" className="rounded" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Weekly Reports
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Receive weekly analytics reports
            </p>
          </div>
          <input type="checkbox" className="rounded" />
        </div>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Security Settings
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Change Password
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function PreferenceSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Preferences
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Sport
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="CFB">NCAAF</option>
            <option value="NFL">NFL</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Zone
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="ET">Eastern Time</option>
            <option value="CT">Central Time</option>
            <option value="MT">Mountain Time</option>
            <option value="PT">Pacific Time</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Dark Mode
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use dark theme for better viewing in low light
            </p>
          </div>
          <input type="checkbox" className="rounded" />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
