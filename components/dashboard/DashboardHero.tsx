'use client'

import { useAuth } from '@/hooks/useAuth'
import { useSport } from '@/contexts/SportContext'
import { CalendarIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

export function DashboardHero() {
  const { user } = useAuth()
  const { currentSportData } = useSport()
  const today = new Date()

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-primary-100 text-lg mb-4">
            Professional {currentSportData.displayName} analytics at your fingertips
          </p>
          <div className="flex items-center space-x-6 text-primary-200">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{format(today, 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrophyIcon className="h-5 w-5" />
              <span>Currently viewing {currentSportData.shortName}</span>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <ChartBarIcon className="h-32 w-32 text-primary-300 opacity-50" />
        </div>
      </div>
      
      {user?.subscriptionStatus === 'trial' && (
        <div className="mt-6 bg-yellow-500/20 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-100">
            <strong>Trial Account:</strong> You have access to all features until{' '}
            {user.subscriptionExpiry && format(new Date(user.subscriptionExpiry), 'MMM do, yyyy')}
          </p>
        </div>
      )}
    </div>
  )
}