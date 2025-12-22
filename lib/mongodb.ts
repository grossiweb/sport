import { MongoClient, Db, Collection } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''
const MONGODB_DB = process.env.MONGODB_DB || 'sportStats'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local (and in Vercel env vars).')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo

if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      }
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    cached.promise = null
    throw e
  }
}

// Collection interfaces based on the schemas
export interface MongoTeam {
  _id?: any
  abbreviation: string
  conference: {
    conference_id: number | null
    division_id: number | null
    name: string | null
    sport_id: number | null
  }
  createdAt: any
  division: {
    division_id: number | null
    name: string | null
    sport_id: number | null
  }
  id: number
  mascot: string
  meta: {
    savedAt: any
    sourceUrl: string
  }
  name: string
  raw: any
  record: string | null
  sport_id: number
  team_id: number
}

export interface MongoTeamStats {
  _id?: any
  count: number
  createdAt: any
  meta: {
    fetchedAt: any
    sourceUrl: string
  }
  season_type: number
  season_type_name: string | null
  season_year: number
  stats: Array<{
    abbreviation: string
    category: string
    description: string
    display_name: string
    display_value: string
    name: string
    per_game_display_value: string | null
    per_game_value: number | null
    rank: number | null
    rank_display_value: string | null
    stat_id: number
    updated_at: string
    value: number
  }>
  team_id: number
  updatedAt: any
}

export interface MongoGame {
  _id?: any
  attendance: number
  away_score: number | null
  away_team: string
  away_team_id: number
  broadcast: string | null
  conference_competition: boolean
  createdAt: any
  date_event: string
  event_id: string
  event_location: string
  event_name: string
  event_status: string | null
  event_status_detail: string | null
  event_uuid: string
  home_score: number | null
  home_team: string
  home_team_id: number
  id: string
  league_name: string
  meta: {
    fetchedAt: any
    sourceUrl: string
  }
  neutral_site: boolean
  season_type: string
  season_year: number
  sport_id: number
  updated_at: string
  updatedAt: any
  score?: {
    score_home_by_period?: number[]
    score_away_by_period?: number[]
    updated_at?: string
    [key: string]: unknown
  } | null
}

export interface MongoBettingData {
  _id?: any
  createdAt: any
  event_date: string
  event_id: string
  event_uuid: string
  lines: {
    [key: string]: {
      affiliate: {
        affiliate_id: number
        affiliate_name: string
        affiliate_url: string
      }
      line_id: number
      moneyline: {
        affiliate_id: number
        date_updated: string
        event_id: string
        format: string
        line_id: number
        moneyline_away: number
        moneyline_away_delta: number
        moneyline_draw: number
        moneyline_draw_delta: number
        moneyline_home: number
        moneyline_home_delta: number
        sport_id: number
      }
      spread: {
        affiliate_id: number
        date_updated: string
        event_id: string
        format: string
        line_id: number
        point_spread_away: number
        point_spread_away_delta: number
        point_spread_away_money: number
        point_spread_away_money_delta: number
        point_spread_home: number
        point_spread_home_delta: number
        point_spread_home_money: number
        point_spread_home_money_delta: number
        sport_id: number
      }
      total: {
        affiliate_id: number
        date_updated: string
        event_id: string
        format: string
        line_id: number
        sport_id: number
        total_over: number
        total_over_delta: number
        total_over_money: number
        total_over_money_delta: number
        total_under: number
        total_under_delta: number
        total_under_money: number
        total_under_money_delta: number
      }
    }
  }
  meta: {
    fetchedAt: any
    sourceUrl: string
  }
  rotation_number_away: number
  rotation_number_home: number
  schedule: any
  score: {
    score_home_by_period?: number[]
    score_away_by_period?: number[]
    updated_at?: string
    [key: string]: unknown
  } | null
  sport_id: number
  teams: any
  teams_normalized: any
  updatedAt: any
}

export interface MongoPlayer {
  _id?: any
  active: boolean
  age: number
  birth_place_city: string
  birth_place_country: string
  createdAt: string
  date_of_birth: string
  display_height: string
  display_name: string
  display_weight: string
  experience_years: number
  first_name: string
  height: number
  id: number
  jersey: string
  last_name: string
  meta: {
    fetchedAt: string
    sourceUrl: string
  }
  position: string
  position_abbreviation: string
  slug: string
  sport_id: number
  status: string
  team_id: number
  updated_at: string
  updatedAt: string
  weight: number
}

// Player season stats collection (per-player, per-team, per-season)
export interface MongoPlayerSeasonStats {
  _id?: any
  season_year: number
  team_id: number
  player_id: number
  createdAt: string
  meta: {
    sourceUrl: string
    fetchedAt: string
  }
  player: {
    first_name: string
    last_name: string
    display_name: string
    position: string
    position_abbreviation: string
    jersey: string
    slug: string
    status: string
    active: boolean
    updated_at: string
  }
  season_type: number
  season_type_name: string
  sport_id: number
  stats: {
    [statId: string]: {
      stat_id: number
      name: string
      category: string
      display_name: string
      abbreviation: string
      description: string
      sport_id: number
      value: number
      display_value: string
      per_game_value: number | null
      per_game_display_value: string | null
      api_updated_at: string
    }
  }
}

// Sport seasons collection (used for dynamic season-based weeks)
export interface MongoSportSeason {
  _id?: any
  season: number
  sport_id: number
  sport_name?: string
  // Stored as ISO string or Date depending on import; accept both
  start_date: string | Date
  end_date?: string | Date
}

// Helper functions to get collections
export async function getTeamsCollection(): Promise<Collection<MongoTeam>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoTeam>('teams')
}

export async function getTeamStatsCollection(): Promise<Collection<MongoTeamStats>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoTeamStats>('team_stats')
}

export async function getGamesCollection(): Promise<Collection<MongoGame>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoGame>('games')
}

export async function getBettingDataCollection(): Promise<Collection<MongoBettingData>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoBettingData>('betting_data')
}

export async function getPlayersCollection(): Promise<Collection<MongoPlayer>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoPlayer>('players')
}

export async function getPlayerSeasonStatsCollection(): Promise<Collection<MongoPlayerSeasonStats>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoPlayerSeasonStats>('player_season_stats')
}

export async function getSportSeasonsCollection(): Promise<Collection<MongoSportSeason>> {
  const { db } = await connectToDatabase()
  return db.collection<MongoSportSeason>('sport_seasons')
}

export async function getAtsRecordsCollection(): Promise<Collection<any>> {
  const { db } = await connectToDatabase()
  return db.collection('ats_records')
}