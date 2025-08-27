'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SportType } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'

export default function SportBettingPage() {
  const params = useParams()
  const { currentSport, currentSportData, isLoading: contextLoading } = useSport()
  const [validSport, setValidSport] = useState<SportType | null>(null)

  useEffect(() => {
    const sportParam = params.sport as string
    const sportType = sportParam?.toUpperCase()
    
    if (isValidSportType(sportType)) {
      setValidSport(sportType)
    }
  }, [params.sport])

  if (contextLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
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
          {currentSportData.displayName} Betting Data
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Money lines, spreads, and public betting information for {currentSportData.displayName}.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Betting Data Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're working on bringing you comprehensive betting analytics for {currentSportData.displayName}.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Features will include:
          <ul className="mt-2 space-y-1">
            <li>• Live betting lines and odds</li>
            <li>• Public betting percentages</li>
            <li>• Line movement tracking</li>
            <li>• Sharp vs. public money indicators</li>
            <li>• Historical betting trends</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
