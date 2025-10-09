'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { SportType, Team } from '@/types'
import { isValidSportType } from '@/lib/constants/sports'
import { useSport } from '@/contexts/SportContext'
import { TeamsListing } from '@/components/teams/TeamsListing'

const fetchTeams = async (sport: SportType): Promise<Team[]> => {
  const response = await fetch(`/api/teams?sport=${sport}`)
  if (!response.ok) throw new Error('Failed to fetch teams')
  const result = await response.json()
  return result.data
}

export default function SportTeamsPage() {
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

  const sport = validSport || currentSport

  const { data: teams, isLoading: teamsLoading } = useQuery(
    ['teams', sport],
    () => fetchTeams(sport),
    { enabled: !!sport }
  )

  const isLoading = contextLoading || teamsLoading

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

  // Only show invalid sport if the URL param is present and truly invalid
  const sportParamRaw = (params.sport as string) || ''
  const sportParamUpper = sportParamRaw.toUpperCase()
  const isParamInvalid = sportParamRaw && !isValidSportType(sportParamUpper)

  if (isParamInvalid) {
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
          {currentSportData?.displayName || currentSport} Teams
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Browse all {currentSportData?.displayName || currentSport} teams organized by division. Click on any team to view detailed statistics.
        </p>
      </div>

      {/* Teams Listing */}
      <TeamsListing
        teams={teams || []}
        sport={sport}
        isLoading={isLoading}
      />
    </div>
  )
}
