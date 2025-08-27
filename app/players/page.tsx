'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSport } from '@/contexts/SportContext'

export default function PlayersPage() {
  const router = useRouter()
  const { currentSport, isLoading } = useSport()

  useEffect(() => {
    if (!isLoading) {
      // Redirect to sport-specific players page
      router.replace(`/sport/${currentSport.toLowerCase()}/players`)
    }
  }, [router, currentSport, isLoading])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to {currentSport} player statistics...
        </p>
      </div>
    </div>
  )
}