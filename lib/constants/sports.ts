import { Sport, SportType } from '@/types'

export const SPORTS: Record<SportType, Sport> = {
  CFB: {
    id: 'cfb',
    name: 'College Football',
    displayName: 'NCAAF',
    shortName: 'NCAAF',
    apiId: 1
  },
  NFL: {
    id: 'nfl',
    name: 'NFL',
    displayName: 'National Football League',
    shortName: 'NFL',
    apiId: 2
  }
}

export const DEFAULT_SPORT: SportType = 'CFB'

export const SPORT_ROUTES = {
  CFB: '/sport/cfb',
  NFL: '/sport/nfl'
}

export function getSportByApiId(apiId: number): Sport | null {
  return Object.values(SPORTS).find(sport => sport.apiId === apiId) || null
}

export function getSportById(id: string): Sport | null {
  return Object.values(SPORTS).find(sport => sport.id === id) || null
}

export function isValidSportType(value: string): value is SportType {
  return value === 'CFB' || value === 'NFL'
}
