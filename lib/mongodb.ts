import { MongoClient, Db, Collection } from 'mongodb'

const MONGODB_URI = "mongodb+srv://stefano:Ar99uZ48gq4x1O9l@cluster0.xikytgx.mongodb.net/sportStats?retryWrites=true&w=majority&appName=Cluster0"
const MONGODB_DB = "sportStats"

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
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
  score: any
  sport_id: number
  teams: any
  teams_normalized: any
  updatedAt: any
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
