'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ChartBarIcon,
  HomeIcon,
  UsersIcon,
  TrophyIcon,
  PresentationChartLineIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Team Stats', href: '/teams', icon: UsersIcon },
  { name: 'Player Stats', href: '/players', icon: UserCircleIcon },
  { name: 'Daily Matchups', href: '/matchups', icon: TrophyIcon },
  { name: 'Predictions', href: '/predictions', icon: PresentationChartLineIcon },
  { name: 'Trends', href: '/trends', icon: ChartBarIcon },
  { name: 'Money Data', href: '/betting', icon: CurrencyDollarIcon },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center space-x-2">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold gradient-text">
                  StatsPro
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User menu and theme toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      user.subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : user.subscriptionStatus === 'trial'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    )}>
                      {user.subscriptionStatus === 'active' ? 'Pro' : 
                       user.subscriptionStatus === 'trial' ? 'Trial' : 'Inactive'}
                    </span>
                    <Link
                      href="/settings"
                      className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Settings"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={logout}
                      className="p-1 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
                      title="Logout"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/subscribe"
                  className="btn-primary text-sm"
                >
                  Subscribe
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors duration-200',
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
            
            {/* Mobile user menu */}
            {user && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="px-3 pb-2">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    {user.email}
                  </div>
                </div>
                <Link
                  href="/settings"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Cog6ToothIcon className="mr-3 h-5 w-5" />
                    Settings
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full border-l-4 border-transparent py-2 pl-3 pr-4 text-left text-base font-medium text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  <div className="flex items-center">
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}