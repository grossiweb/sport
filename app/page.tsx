'use client'

import { Suspense } from 'react'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { TodaysGames } from '@/components/dashboard/TodaysGames'
import { KeyStats } from '@/components/dashboard/KeyStats'
import { QuickAccess } from '@/components/dashboard/QuickAccess'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { DailyMatchups } from '@/components/dashboard/DailyMatchups'
import { useSport } from '@/contexts/SportContext'

export default function HomePage() {
  const { currentSportData } = useSport()
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <DashboardHero />

      {/* Daily Matchups */}
      <section>
        <Suspense fallback={<LoadingSpinner />}>
          <DailyMatchups />
        </Suspense>
      </section>

      {/* Key Statistics */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Key Statistics
        </h2>
        <Suspense fallback={<LoadingSpinner />}>
          <KeyStats />
        </Suspense>
      </section>

      {/* Quick Access Links */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Access to {currentSportData.displayName}
        </h2>
        <QuickAccess />
      </section>
    </div>
  )
}