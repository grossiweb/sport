import { Game, Team, TeamStats, BettingData, SportType, DetailedTeamStat, Player, ScoreByPeriod, MatchupCoversSummary, TeamCoversSummary, RecordSummary } from '@/types'
import { 
  getTeamsCollection, 
  getTeamStatsCollection, 
  getGamesCollection, 
  getBettingDataCollection,
  getPlayersCollection,
  MongoTeam,
  MongoTeamStats,
  MongoGame,
  MongoBettingData,
  MongoPlayer
} from '@/lib/mongodb'

// MongoDB-based Sports API service
export class MongoDBSportsAPI {
  
  // Convert MongoDB player to our Player interface
  private mapMongoPlayerToPlayer(mongoPlayer: MongoPlayer): Player {
    return {
      id: mongoPlayer.id.toString(),
      name: mongoPlayer.display_name,
      teamId: mongoPlayer.team_id.toString(),
      position: mongoPlayer.position,
      jerseyNumber: mongoPlayer.jersey ? parseInt(mongoPlayer.jersey) : undefined,
      age: mongoPlayer.age,
      height: mongoPlayer.display_height,
      weight: mongoPlayer.weight
    }
  }

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
  private mapScoreByPeriod(score: MongoBettingData['score'] | MongoGame['score'] | undefined | null): ScoreByPeriod | undefined {
    if (!score) return undefined

    const homePeriods = Array.isArray(score.score_home_by_period) ? score.score_home_by_period : undefined
    const awayPeriods = Array.isArray(score.score_away_by_period) ? score.score_away_by_period : undefined

    if (!homePeriods && !awayPeriods) return undefined

    const inferredLength = Math.max(homePeriods?.length ?? 0, awayPeriods?.length ?? 0)
    const periodLabels = inferredLength
      ? Array.from({ length: inferredLength }, (_, index) => `Q${index + 1}`)
      : undefined

    return {
      home: homePeriods ?? new Array(inferredLength).fill(0),
      away: awayPeriods ?? new Array(inferredLength).fill(0),
      updatedAt: typeof score.updated_at === 'string' ? score.updated_at : undefined,
      periodLabels
    }
  }

  public mapMongoGameToGame(
    mongoGame: MongoGame,
    bettingData?: MongoBettingData | null,
    homeTeam?: MongoTeam,
    awayTeam?: MongoTeam
  ): Game {
    return {
      id: mongoGame.event_id,
      homeTeam: {
        id: mongoGame.home_team_id.toString(),
        name: mongoGame.home_team,
        city: '',
        abbreviation: homeTeam?.abbreviation || mongoGame.home_team?.substring(0, 3).toUpperCase(),
        league: (mongoGame.sport_id === 2 ? 'NFL' : 'CFB') as SportType
      },
      awayTeam: {
        id: mongoGame.away_team_id.toString(),
        name: mongoGame.away_team,
        city: '',
        abbreviation: awayTeam?.abbreviation || mongoGame.away_team?.substring(0, 3).toUpperCase(),
        league: (mongoGame.sport_id === 2 ? 'NFL' : 'CFB') as SportType
      },
      league: (mongoGame.sport_id === 2 ? 'NFL' : 'CFB') as SportType,
      gameDate: new Date(mongoGame.date_event),
      status: this.mapEventStatus(mongoGame.event_status),
      statusDetail: mongoGame.event_status_detail || '',
      homeScore: mongoGame.home_score ?? 0,
      awayScore: mongoGame.away_score ?? 0,
      scoreByPeriod: this.mapScoreByPeriod(bettingData?.score ?? mongoGame.score),
      venue: mongoGame.event_location || 'TBD',
      broadcast: mongoGame.broadcast || 'N/A'
    }
  }

  private createEmptyRecord(): RecordSummary {
    return {
      wins: 0,
      losses: 0,
      pushes: 0,
      gamesPlayed: 0
    }
  }

  private accumulateRecord(record: RecordSummary, result: 'win' | 'loss' | 'push') {
    record.gamesPlayed += 1
    if (result === 'win') {
      record.wins += 1
    } else if (result === 'loss') {
      record.losses += 1
    } else {
      record.pushes += 1
    }
  }

  private computeTeamResult(game: Game, teamId: string): 'win' | 'loss' | 'push' | null {
    if (game.status !== 'final') return null

    const isHome = game.homeTeam.id === teamId
    const teamScore = isHome ? game.homeScore ?? 0 : game.awayScore ?? 0
    const opponentScore = isHome ? game.awayScore ?? 0 : game.homeScore ?? 0

    if (teamScore > opponentScore) return 'win'
    if (teamScore < opponentScore) return 'loss'
    return 'push'
  }

  private computeTeamCoversSummary(teamId: string, teamName: string | undefined, games: Game[]): TeamCoversSummary {
    const finalGames = games.filter(game => game.status === 'final')
    const overall = this.createEmptyRecord()
    const home = this.createEmptyRecord()
    const road = this.createEmptyRecord()
    const lastTen = this.createEmptyRecord()

    finalGames.forEach(game => {
      const result = this.computeTeamResult(game, teamId)
      if (!result) return

      this.accumulateRecord(overall, result)

      const isHome = game.homeTeam.id === teamId
      if (isHome) {
        this.accumulateRecord(home, result)
      } else {
        this.accumulateRecord(road, result)
      }
    })

    const lastTenGames = finalGames
      .slice()
      .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
      .slice(0, 10)

    lastTenGames.forEach(game => {
      const result = this.computeTeamResult(game, teamId)
      if (!result) return
      this.accumulateRecord(lastTen, result)
    })

    return {
      teamId,
      teamName,
      overall,
      home,
      road,
      lastTen,
      ats: undefined
    }
  }

  // Compute consensus spreads for a game from betting_data lines (averaging across books)
  private async getConsensusSpreadsForGame(eventId: string): Promise<{ home: number | null; away: number | null }> {
    try {
      const collection = await getBettingDataCollection()
      const mongoBetting = await collection.findOne({ event_id: eventId })
      if (!mongoBetting || !mongoBetting.lines) return { home: null, away: null }

      const lines = Object.values(mongoBetting.lines) as any[]
      const homeVals: number[] = []
      const awayVals: number[] = []
      for (const l of lines) {
        const h = typeof l?.spread?.point_spread_home === 'number' && isFinite(l.spread.point_spread_home)
          ? l.spread.point_spread_home
          : (typeof l?.spread?.point_spread_home_delta === 'number' ? l.spread.point_spread_home_delta : null)
        const a = typeof l?.spread?.point_spread_away === 'number' && isFinite(l.spread.point_spread_away)
          ? l.spread.point_spread_away
          : (typeof l?.spread?.point_spread_away_delta === 'number' ? l.spread.point_spread_away_delta : null)
        if (typeof h === 'number' && isFinite(h)) homeVals.push(h)
        if (typeof a === 'number' && isFinite(a)) awayVals.push(a)
      }
      const avg = (arr: number[]) => (arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : null)
      return { home: avg(homeVals), away: avg(awayVals) }
    } catch {
      return { home: null, away: null }
    }
  }

  private computeAtsOutcome(teamScore: number, opponentScore: number, teamSpread: number | null | undefined): 'win' | 'loss' | 'push' | null {
    if (teamSpread == null || !isFinite(teamSpread)) return null
    const adjusted = (teamScore ?? 0) + teamSpread
    if (adjusted > (opponentScore ?? 0)) return 'win'
    if (adjusted < (opponentScore ?? 0)) return 'loss'
    return 'push'
  }

  private accumulateAtsRecord(record: RecordSummary, outcome: 'win' | 'loss' | 'push' | null) {
    if (!outcome) return
    record.gamesPlayed += 1
    if (outcome === 'win') record.wins += 1
    else if (outcome === 'loss') record.losses += 1
    else record.pushes += 1
  }

  private async computeTeamAtsSummary(teamId: string, games: Game[]): Promise<{ overall: RecordSummary; home: RecordSummary; road: RecordSummary; lastTen: RecordSummary }> {
    const overall = this.createEmptyRecord()
    const home = this.createEmptyRecord()
    const road = this.createEmptyRecord()
    const lastTen = this.createEmptyRecord()

    const finalGames = games.filter(g => g.status === 'final')

    // Cache spreads per event
    const spreadsCache = new Map<string, { home: number | null; away: number | null }>()

    for (const game of finalGames) {
      if (!spreadsCache.has(game.id)) {
        spreadsCache.set(game.id, await this.getConsensusSpreadsForGame(game.id))
      }
      const spreads = spreadsCache.get(game.id)!
      const isHome = game.homeTeam.id === teamId
      const teamSpread = isHome ? spreads.home : spreads.away
      const teamScore = isHome ? (game.homeScore ?? 0) : (game.awayScore ?? 0)
      const oppScore = isHome ? (game.awayScore ?? 0) : (game.homeScore ?? 0)
      const outcome = this.computeAtsOutcome(teamScore, oppScore, teamSpread)

      this.accumulateAtsRecord(overall, outcome)
      if (isHome) this.accumulateAtsRecord(home, outcome)
      else this.accumulateAtsRecord(road, outcome)
    }

    const lastTenGames = finalGames
      .slice()
      .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
      .slice(0, 10)

    for (const game of lastTenGames) {
      if (!spreadsCache.has(game.id)) {
        spreadsCache.set(game.id, await this.getConsensusSpreadsForGame(game.id))
      }
      const spreads = spreadsCache.get(game.id)!
      const isHome = game.homeTeam.id === teamId
      const teamSpread = isHome ? spreads.home : spreads.away
      const teamScore = isHome ? (game.homeScore ?? 0) : (game.awayScore ?? 0)
      const oppScore = isHome ? (game.awayScore ?? 0) : (game.homeScore ?? 0)
      const outcome = this.computeAtsOutcome(teamScore, oppScore, teamSpread)
      this.accumulateAtsRecord(lastTen, outcome)
    }

    return { overall, home, road, lastTen }
  }

  public async getTeamSeasonGames(
    sport: SportType,
    teamId: string,
    seasonYear: number
  ): Promise<Game[]> {
    const collection = await getGamesCollection()
    const teamsCollection = await getTeamsCollection()
    const sportId = sport === 'NFL' ? 2 : 1
    const numericTeamId = parseInt(teamId, 10)

    const mongoGames = await collection
      .find({
        sport_id: sportId,
        season_year: seasonYear,
        $or: [
          { home_team_id: numericTeamId },
          { away_team_id: numericTeamId }
        ]
      })
      .sort({ date_event: -1 })
      .toArray()

    // Get all teams for this sport to look up abbreviations
    const allTeams = await teamsCollection.find({ sport_id: sportId }).toArray()
    const teamsMap = new Map(allTeams.map(team => [team.team_id, team]))

    return mongoGames.map(game => {
      const homeTeam = teamsMap.get(game.home_team_id)
      const awayTeam = teamsMap.get(game.away_team_id)
      return this.mapMongoGameToGame(game, null, homeTeam, awayTeam)
    })
  }

  async buildMatchupCoversSummary(
    sport: SportType,
    homeTeamId: string,
    awayTeamId: string,
    homeTeamName?: string,
    awayTeamName?: string
  ): Promise<MatchupCoversSummary | null> {
    try {
      const currentYear = new Date().getFullYear()

      const [homeGames, awayGames] = await Promise.all([
        this.getTeamSeasonGames(sport, homeTeamId, currentYear),
        this.getTeamSeasonGames(sport, awayTeamId, currentYear)
      ])

      const homeSummary = this.computeTeamCoversSummary(homeTeamId, homeTeamName, homeGames)
      const awaySummary = this.computeTeamCoversSummary(awayTeamId, awayTeamName, awayGames)

      // Compute ATS summaries using betting_data spreads
      const [homeAts, awayAts] = await Promise.all([
        this.computeTeamAtsSummary(homeTeamId, homeGames),
        this.computeTeamAtsSummary(awayTeamId, awayGames)
      ])

      homeSummary.ats = {
        overall: homeAts.overall,
        home: homeAts.home,
        road: homeAts.road,
        lastTen: homeAts.lastTen
      }
      awaySummary.ats = {
        overall: awayAts.overall,
        home: awayAts.home,
        road: awayAts.road,
        lastTen: awayAts.lastTen
      }

      return {
        home: homeSummary,
        away: awaySummary
      }
    } catch (error) {
      console.error('Error building matchup covers summary:', error)
      return null
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
  async getGames(sport: SportType = 'CFB', date?: string, limit?: number, endDate?: string): Promise<Game[]> {
    try {
      const collection = await getGamesCollection()
      const sportId = sport === 'NFL' ? 2 : 1
      
      let query: any = { sport_id: sportId }
      
      // Add date filter if provided
      if (date) {
        if (endDate) {
          // Date range query for week-based filtering
          query.date_event = {
            $gte: date,
            $lte: endDate
          }
        } else {
          // Single date query (legacy support)
          const targetDate = new Date(date)
          const nextDay = new Date(targetDate)
          nextDay.setDate(nextDay.getDate() + 1)
          
          query.date_event = {
            $gte: targetDate.toISOString().split('T')[0],
            $lt: nextDay.toISOString().split('T')[0]
          }
        }
      }
      
      let cursor = collection.find(query).sort({ date_event: 1 })
      
      if (limit) {
        cursor = cursor.limit(limit)
      }
      
      const mongoGames = await cursor.toArray()
      const bettingCollection = await getBettingDataCollection()

      const bettingDataByEventId = new Map<string, MongoBettingData>()

      const eventIds = mongoGames.map(game => game.event_id)
      if (eventIds.length > 0) {
      if (eventIds.length > 0) {
        const bettingDocuments = await bettingCollection.find({ event_id: { $in: eventIds } }).toArray()
        for (const doc of bettingDocuments) {
          bettingDataByEventId.set(doc.event_id, doc)
        }
      }
      }

      // Enrich games with team data
      const teams = await this.getTeams(sport)
      const teamsMap = new Map(teams.map(team => [team.id, team]))

      // Get MongoDB team data for abbreviations
      const teamsCollection = await getTeamsCollection()
      const allMongoTeams = await teamsCollection.find({ sport_id: sportId }).toArray()
      const mongoTeamsMap = new Map(allMongoTeams.map(team => [team.team_id.toString(), team]))

      const games = mongoGames.map(game => {
        const homeTeamData = mongoTeamsMap.get(game.home_team_id.toString())
        const awayTeamData = mongoTeamsMap.get(game.away_team_id.toString())
        return this.mapMongoGameToGame(game, bettingDataByEventId.get(game.event_id), homeTeamData, awayTeamData)
      })

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

  // Get players from MongoDB
  async getPlayers(sport: SportType = 'CFB', teamId?: string): Promise<Player[]> {
    try {
      const collection = await getPlayersCollection()
      const sportId = sport === 'NFL' ? 2 : 1
      
      let query: any = { sport_id: sportId, active: true }
      
      // Add team filter if provided
      if (teamId) {
        query.team_id = parseInt(teamId)
      }
      
      const mongoPlayers = await collection.find(query).toArray()
      
      return mongoPlayers.map(player => this.mapMongoPlayerToPlayer(player))
    } catch (error) {
      console.error('Error fetching players from MongoDB:', error)
      return []
    }
  }

  // Get predictions from MongoDB (stub method - no collection exists yet)
  async getPredictions(sport: SportType = 'CFB', date?: string): Promise<any[]> {
    try {
      // TODO: Implement when predictions collection is available
      console.log(`Predictions requested for ${sport}${date ? ` on ${date}` : ''} - returning empty array (no collection exists yet)`)
      return []
    } catch (error) {
      console.error('Error fetching predictions from MongoDB:', error)
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
