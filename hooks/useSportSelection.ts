'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SportType } from '@/types'
import { useSport } from '@/contexts/SportContext'

const STATS_ROUTES = [
  '/sport',
  '/teams',
  '/players', 
  '/matchups',
  '/predictions',
  '/betting',
  '/trends',
  '/analysis'
]

const EXCLUDED_ROUTES = [
  '/login',
  '/register',
  '/settings'
]

export function useSportSelection() {
  const [showSportModal, setShowSportModal] = useState(false)
  const { currentSport, changeSport } = useSport()
  const pathname = usePathname()

  useEffect(() => {
    // Check if current path requires sport selection
    const isStatsRoute = STATS_ROUTES.some(route => 
      pathname.includes(route) || pathname.startsWith(route)
    )
    
    const isExcludedRoute = EXCLUDED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route)
    )

    const isHomePage = pathname === '/'

    // Show modal if on stats route but not using sport-specific URL structure and not on home page
    if (isStatsRoute && !isExcludedRoute && !isHomePage && !pathname.includes('/sport/')) {
      setShowSportModal(true)
    }
  }, [pathname])

  const handleSportSelect = (sport: SportType) => {
    changeSport(sport)
    setShowSportModal(false)
  }

  const closeSportModal = () => {
    setShowSportModal(false)
  }

  const openSportModal = () => {
    setShowSportModal(true)
  }

  return {
    showSportModal,
    handleSportSelect,
    closeSportModal,
    openSportModal,
    currentSport
  }
}
