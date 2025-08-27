'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { DailyMatchups } from '@/components/dashboard/DailyMatchups'
import { QuickAccess } from '@/components/dashboard/QuickAccess'
import { useSport } from '@/contexts/SportContext'

export default function SportHomePage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!validSport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Sport
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The sport "{params.sport}" is not supported.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {currentSportData.displayName} Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Professional {currentSportData.displayName} analytics platform with advanced statistics, 
          AI predictions, and betting insights.
        </p>
      </div>

      {/* Quick Access Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Quick Access
        </h2>
        <QuickAccess />
      </div>

      {/* Daily Matchups Section */}
      <div className="mb-12">
        <DailyMatchups />
      </div>
    </div>
  )
}
