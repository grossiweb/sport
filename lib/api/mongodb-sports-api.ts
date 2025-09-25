import { Game, Team, TeamStats, BettingData, SportType, DetailedTeamStat } from '@/types'
import { 
  getTeamsCollection, 
  getTeamStatsCollection, 
  getGamesCollection, 
  getBettingDataCollection,
  MongoTeam,
  MongoTeamStats,
  MongoGame,
  MongoBettingData
} from '@/lib/mongodb'

// MongoDB-based Sports API service
export class MongoDBSportsAPI {
  
  // Convert MongoDB team to our Team interface
  private mapMongoTeamToTeam(mongoTeam: MongoTeam): Team {
    return {
      id: mongoTeam.team_id.toString(),
      name: mongoTeam.name,
      city: mongoTeam.mascot || '',
      abbreviation: mongoTeam.abbreviation,
      league: (mongoTeam.sport_id === 2 ? 'NFL' : 'CFB') as SportType,
      logoUrl: undefined, // Not in MongoDB schema
      primaryColor: undefined, // Not in MongoDB schema
      secondaryColor: undefined, // Not in MongoDB schema
      mascot: mongoTeam.mascot,
      record: mongoTeam.record || undefined,
      conference: mongoTeam.conference ? {
        conference_id: mongoTeam.conference.conference_id || 0,
        division_id: mongoTeam.conference.division_id || 0,
        sport_id: mongoTeam.conference.sport_id || 0,
        name: mongoTeam.conference.name || ''
      } : undefined,
      division: mongoTeam.division ? {
        division_id: mongoTeam.division.division_id || 0,
        sport_id: mongoTeam.division.sport_id || 0,
        name: mongoTeam.division.name || ''
      } : undefined
    }
  }

  // Convert MongoDB game to our Game interface
  private mapMongoGameToGame(mongoGame: MongoGame): Game {
    return {
      id: mongoGame.event_id,
      homeTeam: {
        id: mongoGame.home_team_id.toString(),
        name: mongoGame.home_team,
        city: '',
        abbreviation: mongoGame.home_team.substring(0, 3).toUpperCase(),
        league: (mongoGame.sport_id === 2 ? 'NFL' : 'CFB') as SportType
      },
      awayTeam: {
        id: mongoGame.away_team_id.toString(),
        name: mongoGame.away_team,
        city: '',
        abbreviation: mongoGame.away_team.substring(0, 3).toUpperCase(),
        league: (mongoGame.sport_id === 2 ? 'NFL' : 'CFB') as SportType
      },
      league: (mongoGame.sport_id === 2 ? 'NFL' : 'CFB') as SportType,
      gameDate: new Date(mongoGame.date_event),
      status: this.mapEventStatus(mongoGame.event_status),
      statusDetail: mongoGame.event_status_detail || '',
      homeScore: mongoGame.home_score ?? 0,
      awayScore: mongoGame.away_score ?? 0,
      venue: mongoGame.event_location || 'TBD',
      broadcast: mongoGame.broadcast || 'N/A'
    }
  }

  // Convert MongoDB team stats to our TeamStats interface
  private mapMongoTeamStatsToTeamStats(mongoStats: MongoTeamStats): TeamStats {
    // Extract common stats from the stats array
    const getStatValue = (statName: string): number => {
      const stat = mongoStats.stats.find(s => s.name.toLowerCase().includes(statName.toLowerCase()))
      return stat ? stat.value : 0
    }

    const wins = getStatValue('wins') || getStatValue('win')
    const losses = getStatValue('losses') || getStatValue('loss')
    const games = wins + losses || getStatValue('games')

    return {
      teamId: mongoStats.team_id.toString(),
      season: mongoStats.season_year.toString(),
      games: games,
      wins: wins,
      losses: losses,
      winPercentage: games > 0 ? wins / games : 0,
      pointsFor: getStatValue('points') || getStatValue('scoring'),
      pointsAgainst: getStatValue('points allowed') || getStatValue('opponent points'),
      yardsFor: getStatValue('total yards') || getStatValue('offense'),
      yardsAgainst: getStatValue('yards allowed') || getStatValue('defense'),
      turnovers: getStatValue('turnovers'),
      turnoverDifferential: getStatValue('turnover margin') || getStatValue('turnover differential')
    }
  }

  // Convert MongoDB team stats to detailed team stats
  private mapMongoTeamStatsToDetailedStats(mongoStats: MongoTeamStats): DetailedTeamStat[] {
    return mongoStats.stats.map(stat => ({
      team_id: mongoStats.team_id,
      stat_id: stat.stat_id,
      stat: {
        id: stat.stat_id,
        name: stat.name,
        category: stat.category,
        display_name: stat.display_name,
        abbreviation: stat.abbreviation,
        description: stat.description,
        sport_id: mongoStats.season_type // Using season_type as sport_id fallback
      },
      season_year: mongoStats.season_year,
      season_type: mongoStats.season_type,
      season_type_name: mongoStats.season_type_name || '',
      value: stat.value,
      display_value: stat.display_value,
      per_game_value: stat.per_game_value,
      per_game_display_value: stat.per_game_display_value,
      rank: stat.rank,
      rank_display_value: stat.rank_display_value,
      updated_at: stat.updated_at
    }))
  }

  // Convert MongoDB betting data to our BettingData interface
  private mapMongoBettingDataToBettingData(mongoBetting: MongoBettingData): BettingData | null {
    // Get the first available sportsbook line
    const lineKeys = Object.keys(mongoBetting.lines)
    if (lineKeys.length === 0) return null

    const firstLineKey = lineKeys[0]
    const line = mongoBetting.lines[firstLineKey]

    if (!line || !line.spread || !line.moneyline || !line.total) return null

    return {
      gameId: mongoBetting.event_id,
      spread: {
        home: line.spread.point_spread_home_delta || 0,
        away: line.spread.point_spread_away_delta || 0,
        juice: line.spread.point_spread_home_money_delta || -110
      },
      moneyLine: {
        home: line.moneyline.moneyline_home_delta || 0,
        away: line.moneyline.moneyline_away_delta || 0
      },
      total: {
        over: line.total.total_over_money_delta || -110,
        under: line.total.total_under_money_delta || -110,
        points: Math.abs(line.total.total_over_delta || 50)
      },
      publicBets: {
        homePercentage: 50, // Not available in MongoDB
        awayPercentage: 50
      },
      handle: {
        homePercentage: 50, // Not available in MongoDB
        awayPercentage: 50
      },
      reverseLineMovement: false, // Would need historical data
      sportsbook: {
        name: line.affiliate.affiliate_name || 'Unknown',
        url: line.affiliate.affiliate_url || '',
        affiliateId: line.affiliate.affiliate_id.toString()
      }
    }
  }

  // Get teams from MongoDB
  async getTeams(sport: SportType = 'CFB'): Promise<Team[]> {
    try {
      const collection = await getTeamsCollection()
      const sportId = sport === 'NFL' ? 2 : 1
      
      const mongoTeams = await collection.find({ sport_id: sportId }).toArray()
      
      // Filter CFB teams to only show FBS (division_id: 1) and FCS (division_id: 4)
      let filteredTeams = mongoTeams
      if (sport === 'CFB') {
        filteredTeams = mongoTeams.filter(team => {
          const divisionId = team.division?.division_id
          return divisionId === 1 || divisionId === 4
        })
      }
      
      return filteredTeams.map(team => this.mapMongoTeamToTeam(team))
    } catch (error) {
      console.error('Error fetching teams from MongoDB:', error)
      return []
    }
  }

  // Get team stats from MongoDB
  async getTeamStats(sport: SportType = 'CFB'): Promise<TeamStats[]> {
    try {
      const collection = await getTeamStatsCollection()
      const currentYear = new Date().getFullYear()
      
      // Get teams first to filter by sport
      const teams = await this.getTeams(sport)
      const teamIds = teams.map(team => parseInt(team.id))
      
      const mongoTeamStats = await collection.find({ 
        team_id: { $in: teamIds },
        season_year: currentYear
      }).toArray()
      
      return mongoTeamStats.map(stats => this.mapMongoTeamStatsToTeamStats(stats))
    } catch (error) {
      console.error('Error fetching team stats from MongoDB:', error)
      return []
    }
  }

  // Get individual team stats by team ID
  async getTeamStatsByTeamId(sport: SportType = 'CFB', teamId: string): Promise<TeamStats | null> {
    try {
      const collection = await getTeamStatsCollection()
      const currentYear = new Date().getFullYear()
      
      const mongoStats = await collection.findOne({ 
        team_id: parseInt(teamId),
        season_year: currentYear
      })
      
      if (!mongoStats) return null
      
      return this.mapMongoTeamStatsToTeamStats(mongoStats)
    } catch (error) {
      console.error(`Error fetching team stats for team ${teamId}:`, error)
      return null
    }
  }

  // Get detailed team stats by team ID
  async getDetailedTeamStats(sport: SportType = 'CFB', teamId: string): Promise<DetailedTeamStat[]> {
    try {
      const collection = await getTeamStatsCollection()
      const currentYear = new Date().getFullYear()
      
      const mongoStats = await collection.findOne({ 
        team_id: parseInt(teamId),
        season_year: currentYear
      })
      
      if (!mongoStats) return []
      
      return this.mapMongoTeamStatsToDetailedStats(mongoStats)
    } catch (error) {
      console.error(`Error fetching detailed team stats for team ${teamId}:`, error)
      return []
    }
  }

  // Get games from MongoDB
  async getGames(sport: SportType = 'CFB', date?: string, limit?: number): Promise<Game[]> {
    try {
      const collection = await getGamesCollection()
      const sportId = sport === 'NFL' ? 2 : 1
      
      let query: any = { sport_id: sportId }
      
      // Add date filter if provided
      if (date) {
        const targetDate = new Date(date)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)
        
        query.date_event = {
          $gte: targetDate.toISOString().split('T')[0],
          $lt: nextDay.toISOString().split('T')[0]
        }
      }
      
      let cursor = collection.find(query).sort({ date_event: 1 })
      
      if (limit) {
        cursor = cursor.limit(limit)
      }
      
      const mongoGames = await cursor.toArray()
      const games = mongoGames.map(game => this.mapMongoGameToGame(game))
      
      // Enrich games with team data
      const teams = await this.getTeams(sport)
      const teamsMap = new Map(teams.map(team => [team.id, team]))
      
      return games.map(game => {
        const homeTeam = teamsMap.get(game.homeTeam.id)
        const awayTeam = teamsMap.get(game.awayTeam.id)
        
        return {
          ...game,
          homeTeam: {
            ...game.homeTeam,
            division: homeTeam?.division,
            conference: homeTeam?.conference,
            mascot: homeTeam?.mascot,
            record: homeTeam?.record
          },
          awayTeam: {
            ...game.awayTeam,
            division: awayTeam?.division,
            conference: awayTeam?.conference,
            mascot: awayTeam?.mascot,
            record: awayTeam?.record
          }
        }
      })
    } catch (error) {
      console.error('Error fetching games from MongoDB:', error)
      return []
    }
  }

  // Get betting data from MongoDB
  async getBettingData(sport: SportType = 'CFB', eventId: string): Promise<BettingData | null> {
    try {
      const collection = await getBettingDataCollection()
      
      const mongoBetting = await collection.findOne({ event_id: eventId })
      
      if (!mongoBetting) return null
      
      return this.mapMongoBettingDataToBettingData(mongoBetting)
    } catch (error) {
      console.error(`Error fetching betting data for event ${eventId}:`, error)
      return null
    }
  }

  // Get all betting lines for comparison
  async getAllBettingLines(sport: SportType = 'CFB', eventId: string): Promise<any[]> {
    try {
      const collection = await getBettingDataCollection()
      
      const mongoBetting = await collection.findOne({ event_id: eventId })
      
      if (!mongoBetting || !mongoBetting.lines) return []
      
      const allLines = []
      for (const [affiliateId, lineData] of Object.entries(mongoBetting.lines)) {
        const line = lineData as any
        if (line.spread && line.moneyline && line.total && line.affiliate) {
          allLines.push({
            sportsbook: line.affiliate.affiliate_name,
            url: line.affiliate.affiliate_url,
            affiliateId: affiliateId,
            spread: {
              home: line.spread.point_spread_home_delta || 0,
              away: line.spread.point_spread_away_delta || 0,
              homeOdds: line.spread.point_spread_home_money_delta || -110,
              awayOdds: line.spread.point_spread_away_money_delta || -110
            },
            moneyline: {
              home: line.moneyline.moneyline_home_delta || 0,
              away: line.moneyline.moneyline_away_delta || 0
            },
            total: {
              points: Math.abs(line.total.total_over_delta || 50),
              over: line.total.total_over_money_delta || -110,
              under: line.total.total_under_money_delta || -110
            },
            lastUpdated: line.spread.date_updated || line.moneyline.date_updated || line.total.date_updated
          })
        }
      }

      return allLines.sort((a, b) => {
        // Sort by sportsbook priority
        const priority = ['BetMGM', 'Fanduel', 'Draftkings', 'Pinnacle', 'Bovada']
        const aIndex = priority.indexOf(a.sportsbook)
        const bIndex = priority.indexOf(b.sportsbook)
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
        return a.sportsbook.localeCompare(b.sportsbook)
      })
    } catch (error) {
      console.error('Error fetching all betting lines:', error)
      return []
    }
  }


  // Map event status from MongoDB to our Game status
  private mapEventStatus(status?: string | null): Game['status'] {
    if (!status) return 'scheduled'
    
    switch (status.toLowerCase()) {
      case 'status_scheduled':
      case 'scheduled':
      case 'upcoming':
        return 'scheduled'
      case 'status_inprogress':
      case 'status_live':
      case 'inprogress':
      case 'live':
        return 'live'
      case 'status_final':
      case 'status_completed':
      case 'final':
      case 'completed':
        return 'final'
      case 'status_postponed':
      case 'postponed':
        return 'postponed'
      case 'status_cancelled':
      case 'cancelled':
        return 'cancelled'
      default:
        return 'scheduled'
    }
  }
}

// Export singleton instance
export const mongoSportsAPI = new MongoDBSportsAPI()
