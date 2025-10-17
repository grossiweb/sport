'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { TodaysGames } from '@/components/dashboard/TodaysGames'
import { KeyStats } from '@/components/dashboard/KeyStats'
import { QuickAccess } from '@/components/dashboard/QuickAccess'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { DailyMatchups } from '@/components/dashboard/DailyMatchups'
import { RecentMatchups } from '@/components/dashboard/RecentMatchups'
import { UpcomingMatchups } from '@/components/dashboard/UpcomingMatchups'
import { UpcomingScroller } from '@/components/dashboard/UpcomingScroller'
import { useSport } from '@/contexts/SportContext'
import toast from 'react-hot-toast'

// Component to handle subscription success notification
function SubscriptionSuccessHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const sessionId = searchParams.get('session_id')
    
    if (success === 'true' && sessionId) {
      toast.success('🎉 Subscription activated successfully! Welcome to the Pro plan!')
      
      // Clean up URL parameters
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('session_id')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  return null
}

function HomePageContent() {
  const { currentSportData } = useSport()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <DashboardHero />

      {/* Today's Daily Matchups */}
      <section>
        <Suspense fallback={<LoadingSpinner />}>
          <DailyMatchups />
        </Suspense>
      </section>

      {/* Recent Matchups */}
      <section>
        <Suspense fallback={<LoadingSpinner />}>
          <RecentMatchups />
        </Suspense>
      </section>

      {/* Upcoming Matchups */}
      <section>
        <Suspense fallback={<LoadingSpinner />}>
          <UpcomingMatchups />
        </Suspense>
      </section>

      {/* Upcoming Scroller */}
      <section>
        <Suspense fallback={<LoadingSpinner />}>
          <UpcomingScroller />
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

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <SubscriptionSuccessHandler />
      </Suspense>
      <HomePageContent />
    </>
  )
}