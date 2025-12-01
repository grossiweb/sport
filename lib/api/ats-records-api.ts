/**
 * ATS Records API - Fetch pre-computed ATS data from MongoDB
 * This replaces the expensive buildMatchupCoversSummary computation
 */

import { getAtsRecordsCollection } from '@/lib/mongodb'
import { SportType } from '@/types'

export interface AtsRecord {
  wins: number
  losses: number
  pushes: number
  gamesPlayed: number
}

export interface TeamAtsRecords {
  overall: AtsRecord
  home: AtsRecord
  road: AtsRecord
  lastTen: AtsRecord
}

export interface MatchupAtsRecords {
  home: TeamAtsRecords | null
  away: TeamAtsRecords | null
}

/**
 * Get ATS records for a single team
 */
export async function getTeamAtsRecords(
  sportId: number,
  teamId: string | number,
  season: number
): Promise<TeamAtsRecords | null> {
  try {
    const collection = await getAtsRecordsCollection()
    
    const record = await collection.findOne({
      sport_id: sportId,
      season: season,
      team_id: parseInt(teamId.toString())
    })

    if (!record || !record.ats) {
      console.log(`[ATS] No records found for team ${teamId}, sport ${sportId}, season ${season}`)
      return null
    }

    return record.ats as TeamAtsRecords
  } catch (error) {
    console.error(`[ATS] Error fetching records for team ${teamId}:`, error)
    return null
  }
}

/**
 * Get ATS records for both teams in a matchup (optimized - single query with $in)
 */
export async function getMatchupAtsRecords(
  sportId: number,
  homeTeamId: string | number,
  awayTeamId: string | number,
  season: number
): Promise<MatchupAtsRecords> {
  try {
    const collection = await getAtsRecordsCollection()
    
    const homeId = parseInt(homeTeamId.toString())
    const awayId = parseInt(awayTeamId.toString())

    // Fetch both teams in one query
    const records = await collection
      .find({
        sport_id: sportId,
        season: season,
        team_id: { $in: [homeId, awayId] }
      })
      .toArray()

    const homeRecord = records.find(r => r.team_id === homeId)
    const awayRecord = records.find(r => r.team_id === awayId)

    return {
      home: homeRecord?.ats as TeamAtsRecords || null,
      away: awayRecord?.ats as TeamAtsRecords || null
    }
  } catch (error) {
    console.error(`[ATS] Error fetching matchup records:`, error)
    return { home: null, away: null }
  }
}

/**
 * Get ATS records for multiple teams (bulk fetch for listing pages)
 */
export async function getBulkAtsRecords(
  sportId: number,
  teamIds: (string | number)[],
  season: number
): Promise<Map<number, TeamAtsRecords>> {
  const result = new Map<number, TeamAtsRecords>()

  if (!teamIds.length) return result

  try {
    const collection = await getAtsRecordsCollection()
    
    const numericIds = teamIds.map(id => parseInt(id.toString()))

    const records = await collection
      .find({
        sport_id: sportId,
        season: season,
        team_id: { $in: numericIds }
      })
      .toArray()

    records.forEach(record => {
      if (record.ats) {
        result.set(record.team_id, record.ats as TeamAtsRecords)
      }
    })

    return result
  } catch (error) {
    console.error(`[ATS] Error fetching bulk records:`, error)
    return result
  }
}

/**
 * Map sport type to sport ID
 */
export function getSportIdFromType(sportType: SportType): number {
  const sportMap: Record<SportType, number> = {
    'CFB': 1,
    'NFL': 2,
    'NCAAB': 3,
    'NBA': 4
  }
  return sportMap[sportType] || 1
}

/**
 * Get current season year for a sport
 */
export function getCurrentSeasonYear(sportType: SportType): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  
  // For sports that span calendar years (NBA, NCAAB), 
  // if we're before July, use previous year as season
  if ((sportType === 'NBA' || sportType === 'NCAAB') && now.getMonth() < 6) {
    return currentYear - 1
  }
  
  return currentYear
}

