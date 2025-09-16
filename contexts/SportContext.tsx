'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SportType, Sport } from '@/types'
import { SPORTS, DEFAULT_SPORT, isValidSportType } from '@/lib/constants/sports'

interface SportContextType {
  currentSport: SportType
  currentSportData: Sport
  changeSport: (sport: SportType) => void
  availableSports: Sport[]
  isLoading: boolean
}

const SportContext = createContext<SportContextType | undefined>(undefined)

interface SportProviderProps {
  children: ReactNode
}

export function SportProvider({ children }: SportProviderProps) {
  const [currentSport, setCurrentSport] = useState<SportType>(DEFAULT_SPORT)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Extract sport from URL path
  useEffect(() => {
    const pathSegments = pathname.split('/')
    const sportIndex = pathSegments.indexOf('sport')
    
    if (sportIndex !== -1 && pathSegments[sportIndex + 1]) {
      const sportFromUrl = pathSegments[sportIndex + 1].toUpperCase()
      if (isValidSportType(sportFromUrl)) {
        setCurrentSport(sportFromUrl)
      } else {
        // Invalid sport in URL, redirect to default
        const newPath = pathname.replace(`/sport/${pathSegments[sportIndex + 1]}`, `/sport/${DEFAULT_SPORT.toLowerCase()}`)
        router.replace(newPath)
        setCurrentSport(DEFAULT_SPORT)
      }
    } else if (pathname.includes('/sport/')) {
      // Sport path but no sport specified, redirect to default
      setCurrentSport(DEFAULT_SPORT)
    }
    
    setIsLoading(false)
  }, [pathname, router])

  const changeSport = (sport: SportType) => {
    setCurrentSport(sport)
    
    // Update URL to reflect new sport
    if (pathname.includes('/sport/')) {
      const pathSegments = pathname.split('/')
      const sportIndex = pathSegments.indexOf('sport')
      
      if (sportIndex !== -1) {
        pathSegments[sportIndex + 1] = sport.toLowerCase()
        const newPath = pathSegments.join('/')
        router.push(newPath)
      }
    }
  }

  const currentSportData = SPORTS[currentSport] || SPORTS[DEFAULT_SPORT]
  const availableSports = Object.values(SPORTS)

  return (
    <SportContext.Provider
      value={{
        currentSport,
        currentSportData,
        changeSport,
        availableSports,
        isLoading
      }}
    >
      {children}
    </SportContext.Provider>
  )
}

export function useSport() {
  const context = useContext(SportContext)
  if (context === undefined) {
    throw new Error('useSport must be used within a SportProvider')
  }
  return context
}
