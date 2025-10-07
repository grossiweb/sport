'use client'

import { useMemo, useState } from 'react'
import { Team, SportType } from '@/types'
import { TeamCard } from './TeamCard'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface TeamsListingProps {
  teams: Team[]
  sport: SportType
  isLoading: boolean
}

export function TeamsListing({ teams, sport, isLoading }: TeamsListingProps) {
  const [searchTerm, setSearchTerm] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Search skeleton */}
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-full max-w-md"></div>
        </div>
        
        {/* Division skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="h-24 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Filter teams based on search
  const filteredTeams = teams.filter(team => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      team.name.toLowerCase().includes(search) ||
      team.abbreviation.toLowerCase().includes(search) ||
      team.mascot?.toLowerCase().includes(search) ||
      team.conference?.name?.toLowerCase().includes(search) ||
      team.division?.name?.toLowerCase().includes(search)
    )
  })

  // Group teams by division
  const teamsByDivision = filteredTeams.reduce((acc, team) => {
    const divisionName = team.division?.name || 'Other'
    if (!acc[divisionName]) {
      acc[divisionName] = []
    }
    acc[divisionName].push(team)
    return acc
  }, {} as Record<string, Team[]>)

  // Sort divisions for consistent display
  const sortedDivisions = Object.keys(teamsByDivision).sort((a, b) => {
    // For CFB, prioritize FBS over FCS
    if (sport === 'CFB') {
      if (a.includes('FBS') && !b.includes('FBS')) return -1
      if (!a.includes('FBS') && b.includes('FBS')) return 1
    }
    // For NFL, sort by conference (AFC before NFC)
    if (sport === 'NFL') {
      if (a.includes('AFC') && b.includes('NFC')) return -1
      if (a.includes('NFC') && b.includes('AFC')) return 1
    }
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={sport === 'CFB' ? 'Search CFB teams by team or conference...' : `Search ${sport} teams...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Teams by Division / Conference */}
      {sport === 'NFL' ? null : sortedDivisions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No teams found matching "{searchTerm}"
          </p>
        </div>
      ) : sport === 'NFL' ? null : (
        sortedDivisions.map((divisionName) => {
          const divisionTeams = teamsByDivision[divisionName]
          
          return (
            <div key={divisionName} className="space-y-4">
              {/* Division Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {divisionName}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {divisionTeams.length} team{divisionTeams.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {divisionTeams
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((team) => (
                    <TeamCard key={team.id} team={team} sport={sport} />
                  ))}
              </div>
            </div>
          )
        })
      )}

      {/* NFL conference layout */}
      {sport === 'NFL' && (
        <NFLConferenceTable teams={filteredTeams} sport={sport} />
      )}

      {/* Summary */}
      <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTeams.length} of {teams.length} {sport} teams
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>
    </div>
  )
}

function NFLConferenceTable({ teams, sport }: { teams: Team[]; sport: SportType }) {
  const groups = useMemo(() => {
    const group: Record<string, Record<string, Team[]>> = { AFC: { North: [], South: [], East: [], West: [] }, NFC: { North: [], South: [], East: [], West: [] } }
    const getConf = (t: Team): 'AFC' | 'NFC' | null => {
      const confName = t.conference?.name || ''
      const divName = t.division?.name || ''
      if (/\bAFC\b/i.test(confName) || /^\s*AFC\b/i.test(divName)) return 'AFC'
      if (/\bNFC\b/i.test(confName) || /^\s*NFC\b/i.test(divName)) return 'NFC'
      return null
    }
    const getDiv = (t: Team): 'North' | 'South' | 'East' | 'West' | null => {
      const ref = `${t.conference?.name || ''} ${t.division?.name || ''}`
      if (/North/i.test(ref)) return 'North'
      if (/South/i.test(ref)) return 'South'
      if (/East/i.test(ref)) return 'East'
      if (/West/i.test(ref)) return 'West'
      return null
    }
    for (const team of teams) {
      const conf = getConf(team)
      const div = getDiv(team)
      if (conf && div) {
        group[conf][div].push(team)
      }
    }
    ;(['AFC','NFC'] as const).forEach(conf => {
      ;(['North','South','East','West'] as const).forEach(div => {
        group[conf][div] = group[conf][div].sort((a, b) => a.name.localeCompare(b.name))
      })
    })
    return group
  }, [teams])

  return (
    <div className="space-y-4">
      {/* Header row with AFC and NFC */}
      <div className="grid grid-cols-2 gap-6">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">AFC</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">NFC</div>
      </div>

      {/* Divisions header row */}
      <div className="grid grid-cols-2 gap-6">
        {/* AFC divisions */}
        <div className="grid grid-cols-4 gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {(['North','South','East','West'] as const).map(div => (
            <div key={`afc-${div}`} className="text-center">{div}</div>
          ))}
        </div>
        {/* NFC divisions */}
        <div className="grid grid-cols-4 gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {(['North','South','East','West'] as const).map(div => (
            <div key={`nfc-${div}`} className="text-center">{div}</div>
          ))}
        </div>
      </div>

      {/* Teams grid: four columns per conference */}
      <div className="grid grid-cols-2 gap-6">
        {/* AFC columns */}
        <div className="grid grid-cols-4 gap-3">
          {(['North','South','East','West'] as const).map(div => (
            <div key={`afc-col-${div}`} className="space-y-2">
              {groups.AFC[div].map(team => (
                <TeamCard key={team.id} team={team} sport={sport} />
              ))}
            </div>
          ))}
        </div>

        {/* NFC columns */}
        <div className="grid grid-cols-4 gap-3">
          {(['North','South','East','West'] as const).map(div => (
            <div key={`nfc-col-${div}`} className="space-y-2">
              {groups.NFC[div].map(team => (
                <TeamCard key={team.id} team={team} sport={sport} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
