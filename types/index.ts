// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  subscriptionStatus: 'active' | 'inactive' | 'trial'
  subscriptionExpiry?: Date
  role: 'user' | 'admin'
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Sports and League Types - Multi-sport support
export type SportType = 'CFB' | 'NFL'

export interface Sport {
  id: string
  name: string
  displayName: string
  shortName: string
  apiId: number // TheRundown API sport ID (1 for CFB, 2 for NFL)
}

export interface League {
  id: string
  name: string
  sport: SportType
  season: string
  isActive: boolean
}

// College Football Prediction Types
export interface CollegeFootballPrediction {
  gameId: string
  homeTeamWinProbability: number
  awayTeamWinProbability: number
  predictedScore: {
    home: number
    away: number
  }
  confidence: 'low' | 'medium' | 'high'
  factors: string[]
  createdAt?: Date
}

// Team Types
export interface Team {
  id: string
  name: string
  city: string
  abbreviation: string
  league: SportType
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
}

export interface TeamStats {
  teamId: string
  season: string
  games: number
  wins: number
  losses: number
  winPercentage: number
  
  // Baseball specific
  runs?: number
  runsAllowed?: number
  battingAverage?: number
  onBasePercentage?: number
  sluggingPercentage?: number
  ops?: number
  era?: number
  whip?: number
  fip?: number
  
  // Football specific
  pointsFor?: number
  pointsAgainst?: number
  yardsFor?: number
  yardsAgainst?: number
  turnovers?: number
  turnoverDifferential?: number
  
  // Basketball specific
  pointsPerGame?: number
  pointsAllowedPerGame?: number
  reboundsPerGame?: number
  assistsPerGame?: number
  fieldGoalPercentage?: number
  threePointPercentage?: number
  freeThrowPercentage?: number
}

// Player Types
export interface Player {
  id: string
  name: string
  teamId: string
  position: string
  jerseyNumber?: number
  age?: number
  height?: string
  weight?: number
}

export interface PlayerStats {
  playerId: string
  season: string
  games: number
  
  // Baseball specific
  atBats?: number
  hits?: number
  homeRuns?: number
  rbi?: number
  battingAverage?: number
  onBasePercentage?: number
  sluggingPercentage?: number
  ops?: number
  strikeouts?: number
  walks?: number
  stolenBases?: number
  
  // Pitching stats
  wins?: number
  losses?: number
  saves?: number
  era?: number
  whip?: number
  fip?: number
  inningsPitched?: number
  strikeoutsPitched?: number
  walksPitched?: number
  
  // Football specific
  passingYards?: number
  passingTouchdowns?: number
  interceptions?: number
  rushingYards?: number
  rushingTouchdowns?: number
  receivingYards?: number
  receivingTouchdowns?: number
  receptions?: number
  tackles?: number
  sacks?: number
  fumbles?: number
  
  // Basketball specific
  points?: number
  rebounds?: number
  assists?: number
  steals?: number
  blocks?: number
  fieldGoalsMade?: number
  fieldGoalsAttempted?: number
  threePointsMade?: number
  threePointsAttempted?: number
  freeThrowsMade?: number
  freeThrowsAttempted?: number
  turnovers?: number
  minutesPlayed?: number
}

// Game and Matchup Types
export interface Game {
  id: string
  homeTeam: Team
  awayTeam: Team
  league: SportType
  gameDate: Date
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled'
  homeScore?: number
  awayScore?: number
  inning?: number
  quarter?: number
  timeRemaining?: string
  venue?: string
  weather?: WeatherData
}

export interface WeatherData {
  temperature: number
  condition: string
  windSpeed: number
  windDirection: string
  humidity: number
  precipitation: number
}

export interface Matchup {
  game: Game
  predictions: GamePrediction
  bettingData: BettingData
  trends: TrendData[]
  keyPlayers: Player[]
  injuries: InjuryReport[]
  matchupAnalysis?: any
  headToHead?: any[]
  teamStats?: {
    home: any
    away: any
  }
}

// Prediction and Betting Types
export interface GamePrediction {
  gameId: string
  predictedWinner: string
  confidence: number
  predictedScore: {
    home: number
    away: number
  }
  keyFactors: string[]
  aiAnalysis: string
  createdAt: Date
}

export interface BettingData {
  gameId: string
  spread: {
    home: number
    away: number
    juice: number
  }
  moneyLine: {
    home: number
    away: number
  }
  total: {
    over: number
    under: number
    points: number
  }
  publicBets: {
    homePercentage: number
    awayPercentage: number
  }
  handle: {
    homePercentage: number
    awayPercentage: number
  }
  reverseLineMovement: boolean
}

export interface TrendData {
  id: string
  gameId: string
  type: 'team' | 'player' | 'betting' | 'weather'
  description: string
  value: number
  impact: 'high' | 'medium' | 'low'
  timeframe: '7d' | '15d' | '30d' | 'season'
}

// Injury and Status Types
export interface InjuryReport {
  playerId: string
  status: 'out' | 'questionable' | 'probable' | 'day-to-day'
  injury: string
  expectedReturn?: Date
  lastUpdated: Date
}

// Filter and Sorting Types
export interface FilterOptions {
  league?: SportType[]
  timeframe?: '7d' | '15d' | '30d' | 'season'
  teams?: string[]
  players?: string[]
  statType?: string
  minGames?: number
  position?: string
  ageRange?: string
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// WordPress CMS Types
export interface WordPressPost {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  publishedAt: Date
  author: string
  categories: string[]
  tags: string[]
  featuredImage?: string
}

export interface EmailContent {
  subject: string
  htmlContent: string
  textContent: string
  recipients: string[]
  scheduledDate?: Date
}

export interface SocialPost {
  platform: 'instagram' | 'facebook' | 'twitter'
  content: string
  imageUrl?: string
  scheduledDate?: Date
  status: 'draft' | 'scheduled' | 'published'
}