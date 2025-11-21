import { Game, Team, TeamStats, BettingData, SportType, DetailedTeamStat, Player, PlayerStats, PlayerDetailedStat, ScoreByPeriod, MatchupCoversSummary, TeamCoversSummary, RecordSummary } from '@/types'
import { 
  getTeamsCollection, 
  getTeamStatsCollection, 
  getGamesCollection, 
  getBettingDataCollection,
  getPlayersCollection,
  getPlayerSeasonStatsCollection,
  MongoTeam,
  MongoTeamStats,
  MongoGame,
  MongoBettingData,
  MongoPlayer,
  MongoPlayerSeasonStats
} from '@/lib/mongodb'

// MongoDB-based Sports API service
export class MongoDBSportsAPI {
  private atsSummaryCache = new Map<string, { seasonYear: number; summary: { overall: RecordSummary; home: RecordSummary; road: RecordSummary; lastTen: RecordSummary }; createdAt: number }>()
  private teamSeasonGamesCache = new Map<string, { seasonYear: number; games: Game[]; createdAt: number }>()
  private coversSummaryCache = new Map<string, { seasonYear: number; summary: MatchupCoversSummary; createdAt: number }>()
  
  // Determine appropriate season year per sport (handles NBA cross-year seasons)
  private getSeasonYearForSport(sport: SportType, referenceDate: Date = new Date()): number {
    const year = referenceDate.getFullYear()
    if (sport === 'NBA') {
      // NBA season starts around October and runs into the next calendar year
      const month = referenceDate.getMonth() // 0-11
      // If before October (month < 9), we are still in the season that started last calendar year
      return month >= 9 ? year : year - 1
    }
    return year
  }

  private mapSportTypeToSportId(sport: SportType): number {
    switch (sport) {
      case 'CFB':
        return 1
      case 'NFL':
        return 2
      case 'NBA':
        return 4
      case 'NCAAB':
        return 5
      default:
        return 1
    }
  }

  private mapSportIdToSportType(sportId: number): SportType {
    switch (sportId) {
      case 1:
        return 'CFB'
      case 2:
        return 'NFL'
      case 4:
        return 'NBA'
      case 5:
        return 'NCAAB'
      default:
        return 'CFB'
    }
  }
  
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

  // Get head-to-head games between two teams (most recent first)
  public async getHeadToHeadGames(
    sport: SportType,
    teamIdA: string,
    teamIdB: string,
    limit: number = 10
  ): Promise<Array<{ date: string; homeTeamId: string; awayTeamId: string; homeTeamName?: string; awayTeamName?: string; homeScore: number; awayScore: number; result: string }>> {
    try {
      const collection = await getGamesCollection()
      const sportId = this.mapSportTypeToSportId(sport)

      const numericA = parseInt(teamIdA, 10)
      const numericB = parseInt(teamIdB, 10)

      const mongoGames = await collection
        .find({
          sport_id: sportId,
          $or: [
            { home_team_id: numericA, away_team_id: numericB },
            { home_team_id: numericB, away_team_id: numericA }
          ]
        })
        .sort({ date_event: -1 })
        .limit(limit)
        .toArray()

      // Fetch teams to get names
      const teamsCollection = await getTeamsCollection()
      const allTeams = await teamsCollection.find({ sport_id: sportId }).toArray()
      const teamsMap = new Map(allTeams.map(t => [t.team_id, t]))

      // Optionally fetch betting scores per event for accuracy
      const bettingCollection = await getBettingDataCollection()
      const eventIds = mongoGames.map(g => g.event_id)
      const bettingDocs = eventIds.length > 0
        ? await bettingCollection.find({ event_id: { $in: eventIds } }).toArray()
        : []
      const bettingByEvent = new Map(bettingDocs.map(doc => [doc.event_id, doc]))

      const sum = (arr?: number[] | null) => Array.isArray(arr) ? arr.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : undefined

      return mongoGames.map(g => {
        const betting = bettingByEvent.get(g.event_id) as MongoBettingData | undefined
        const bdHome = sum(betting?.score?.score_home_by_period)
        const bdAway = sum(betting?.score?.score_away_by_period)
        const homeScore = (bdHome ?? g.home_score ?? 0)
        const awayScore = (bdAway ?? g.away_score ?? 0)
        const homeTeamName = teamsMap.get(g.home_team_id)?.name
        const awayTeamName = teamsMap.get(g.away_team_id)?.name
        const result = homeScore > awayScore ? 'Home win' : homeScore < awayScore ? 'Away win' : 'Tie'
        return {
          date: g.date_event,
          homeTeamId: g.home_team_id.toString(),
          awayTeamId: g.away_team_id.toString(),
          homeTeamName,
          awayTeamName,
          homeScore,
          awayScore,
          result
        }
      })
    } catch (error) {
      console.error('Error fetching head-to-head games:', error)
      return []
    }
  }

  // Get a team's most recent final games (default 10) for the current season
  public async getTeamRecentGames(
    sport: SportType,
    teamId: string,
    limit: number = 10
  ): Promise<Array<{ date: string; opponentId: string; opponentName?: string; isHome: boolean; teamScore: number; opponentScore: number; result: 'win' | 'loss' | 'push' }>> {
    try {
      // For NBA, pull last 10 final games regardless of season-year boundaries
      if (sport === 'NBA') {
        const [gamesCollection, teamsCollection] = await Promise.all([
          getGamesCollection(),
          getTeamsCollection()
        ])
        const sportId = this.mapSportTypeToSportId(sport)
        const numericTeamId = parseInt(teamId, 10)

        // Pull most recent games for the team, then filter to finals and take last 10
        const mongoGames = await gamesCollection
          .find({
            sport_id: sportId,
            $or: [
              { home_team_id: numericTeamId },
              { away_team_id: numericTeamId }
            ]
          })
          .sort({ date_event: -1 })
          .limit(50)
          .toArray()

        const allTeams = await teamsCollection.find({ sport_id: sportId }).toArray()
        const mongoTeamsById = new Map(allTeams.map(t => [t.team_id, t]))
        const teamsMap = new Map(allTeams.map(t => [t.team_id.toString(), t.name]))

        const mappedGames = mongoGames.map(g => this.mapMongoGameToGame(
          g,
          null,
          mongoTeamsById.get(g.home_team_id),
          mongoTeamsById.get(g.away_team_id)
        ))

        const recentFinal = mappedGames
          .filter(g => g.status === 'final')
          .slice(0, limit)

        // Prefer betting_data summed scores if available
        const bettingCollection = await getBettingDataCollection()
        const eventIds = recentFinal.map(g => g.id)
        const bettingDocs = eventIds.length > 0
          ? await bettingCollection.find({ event_id: { $in: eventIds } }).toArray()
          : []
        const bettingByEvent = new Map(bettingDocs.map(doc => [doc.event_id, doc]))
        const sum = (arr?: number[] | null) => Array.isArray(arr) ? arr.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : undefined

        return recentFinal.map(g => {
          const isHome = g.homeTeam.id === teamId
          const opponentId = isHome ? g.awayTeam.id : g.homeTeam.id
          const opponentName = teamsMap.get(opponentId)

          // Priority 1: Use g.homeScore/awayScore
          let homeScore = g.homeScore
          let awayScore = g.awayScore

          // Priority 2: Sum scoreByPeriod if needed
          if ((homeScore == null || homeScore === 0) && Array.isArray(g.scoreByPeriod?.home)) {
            const summed = (g.scoreByPeriod!.home as number[]).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
            if (summed > 0) homeScore = summed
          }
          if ((awayScore == null || awayScore === 0) && Array.isArray(g.scoreByPeriod?.away)) {
            const summed = (g.scoreByPeriod!.away as number[]).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
            if (summed > 0) awayScore = summed
          }

          // Priority 3: Check betting_data if still missing/zero
          const betting = bettingByEvent.get(g.id) as MongoBettingData | undefined
          if (betting?.score) {
            const bdHome = sum(betting.score.score_home_by_period)
            const bdAway = sum(betting.score.score_away_by_period)
            if ((homeScore == null || homeScore === 0) && bdHome != null && bdHome > 0) homeScore = bdHome
            if ((awayScore == null || awayScore === 0) && bdAway != null && bdAway > 0) awayScore = bdAway
          }

          homeScore = homeScore ?? 0
          awayScore = awayScore ?? 0

          const teamScore = isHome ? homeScore : awayScore
          const opponentScore = isHome ? awayScore : homeScore
          const result: 'win' | 'loss' | 'push' = teamScore > opponentScore ? 'win' : teamScore < opponentScore ? 'loss' : 'push'
          return {
            date: g.gameDate.toISOString(),
            opponentId,
            opponentName,
            isHome,
            teamScore,
            opponentScore,
            result
          }
        })
      }

      // Default behavior (CFB/NFL): use current season-year games
      const currentYear = new Date().getFullYear()
      const games = await this.getTeamSeasonGames(sport, teamId, currentYear)
      const recentFinal = games
        .filter(g => g.status === 'final')
        .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
        .slice(0, limit)

      // Fetch teams for names
      const teamsCollection = await getTeamsCollection()
      const sportId = this.mapSportTypeToSportId(sport)
      const allTeams = await teamsCollection.find({ sport_id: sportId }).toArray()
      const teamsMap = new Map(allTeams.map(t => [t.team_id.toString(), t.name]))

      // Prefer betting_data summed scores if available
      const bettingCollection = await getBettingDataCollection()
      const eventIds = recentFinal.map(g => g.id)
      const bettingDocs = eventIds.length > 0
        ? await bettingCollection.find({ event_id: { $in: eventIds } }).toArray()
        : []
      const bettingByEvent = new Map(bettingDocs.map(doc => [doc.event_id, doc]))
      const sum = (arr?: number[] | null) => Array.isArray(arr) ? arr.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : undefined

      return recentFinal.map(g => {
        const isHome = g.homeTeam.id === teamId
        const opponentId = isHome ? g.awayTeam.id : g.homeTeam.id
        const opponentName = teamsMap.get(opponentId)
        
        // Priority 1: Try g.homeScore/awayScore (from games collection)
        let homeScore = g.homeScore
        let awayScore = g.awayScore
        
        // Priority 2: If not available or zero, try summing from g.scoreByPeriod
        if ((homeScore == null || homeScore === 0) && Array.isArray(g.scoreByPeriod?.home)) {
          const summed = (g.scoreByPeriod!.home as number[]).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
          if (summed > 0) homeScore = summed
        }
        if ((awayScore == null || awayScore === 0) && Array.isArray(g.scoreByPeriod?.away)) {
          const summed = (g.scoreByPeriod!.away as number[]).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
          if (summed > 0) awayScore = summed
        }
        
        // Priority 3: Finally check betting_data if still missing/zero
        const betting = bettingByEvent.get(g.id) as MongoBettingData | undefined
        if (betting?.score) {
          const bdHome = sum(betting.score.score_home_by_period)
          const bdAway = sum(betting.score.score_away_by_period)
          if ((homeScore == null || homeScore === 0) && bdHome != null && bdHome > 0) homeScore = bdHome
          if ((awayScore == null || awayScore === 0) && bdAway != null && bdAway > 0) awayScore = bdAway
        }
        
        // Default to 0 if still null
        homeScore = homeScore ?? 0
        awayScore = awayScore ?? 0
        
        const teamScore = isHome ? homeScore : awayScore
        const opponentScore = isHome ? awayScore : homeScore
        const result: 'win' | 'loss' | 'push' = teamScore > opponentScore ? 'win' : teamScore < opponentScore ? 'loss' : 'push'
        return {
          date: g.gameDate.toISOString(),
          opponentId,
          opponentName,
          isHome,
          teamScore,
          opponentScore,
          result
        }
      })
    } catch (error) {
      console.error('Error fetching recent games for team:', error)
      return []
    }
  }

  // Convert MongoDB team to our Team interface
  private mapMongoTeamToTeam(mongoTeam: MongoTeam): Team {
    return {
      id: mongoTeam.team_id.toString(),
      name: mongoTeam.name,
      city: mongoTeam.mascot || '',
      abbreviation: mongoTeam.abbreviation,
      league: this.mapSportIdToSportType(mongoTeam.sport_id),
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
        league: this.mapSportIdToSportType(mongoGame.sport_id)
      },
      awayTeam: {
        id: mongoGame.away_team_id.toString(),
        name: mongoGame.away_team,
        city: '',
        abbreviation: awayTeam?.abbreviation || mongoGame.away_team?.substring(0, 3).toUpperCase(),
        league: this.mapSportIdToSportType(mongoGame.sport_id)
      },
      league: this.mapSportIdToSportType(mongoGame.sport_id),
      // Preserve exact DB date string for display consistency across time zones
      gameDateString: mongoGame.date_event,
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

  // Get final scores for a game from betting_data by summing score_by_period
  private async getScoresFromBettingData(eventId: string): Promise<{ home: number | null; away: number | null }> {
    try {
      const collection = await getBettingDataCollection()
      const mongoBetting = await collection.findOne({ event_id: eventId }) as MongoBettingData | null
      if (!mongoBetting || !mongoBetting.score) return { home: null, away: null }

      const homePeriods = Array.isArray(mongoBetting.score.score_home_by_period)
        ? mongoBetting.score.score_home_by_period as number[]
        : null
      const awayPeriods = Array.isArray(mongoBetting.score.score_away_by_period)
        ? mongoBetting.score.score_away_by_period as number[]
        : null

      const sum = (arr: number[] | null) => arr && arr.length ? arr.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : null
      return { home: sum(homePeriods), away: sum(awayPeriods) }
    } catch {
      return { home: null, away: null }
    }
  }

  // Bulk fetch spreads (avg across books) and summed scores for many events in one query
  private async getBettingSummariesForEvents(eventIds: string[]): Promise<Map<string, { spreadHome: number | null; spreadAway: number | null; totalPoints: number | null; scoreHome: number | null; scoreAway: number | null; moneylineHome: number | null; moneylineAway: number | null }>> {
    const result = new Map<string, { spreadHome: number | null; spreadAway: number | null; totalPoints: number | null; scoreHome: number | null; scoreAway: number | null; moneylineHome: number | null; moneylineAway: number | null }>()
    if (!eventIds.length) return result
    try {
      const collection = await getBettingDataCollection()
      const docs = await collection.find({ event_id: { $in: eventIds } }).toArray()

      for (const doc of docs as MongoBettingData[]) {
        const lines = Object.values(doc.lines || {}) as any[]
        const homeSpreads: number[] = []
        const awaySpreads: number[] = []
        const totals: number[] = []
        const moneyHome: number[] = []
        const moneyAway: number[] = []
        for (const l of lines) {
          const h = typeof l?.spread?.point_spread_home === 'number' && isFinite(l.spread.point_spread_home)
            ? l.spread.point_spread_home
            : (typeof l?.spread?.point_spread_home_delta === 'number' ? l.spread.point_spread_home_delta : null)
          const a = typeof l?.spread?.point_spread_away === 'number' && isFinite(l.spread.point_spread_away)
            ? l.spread.point_spread_away
            : (typeof l?.spread?.point_spread_away_delta === 'number' ? l.spread.point_spread_away_delta : null)
          const t = typeof l?.total?.total_over === 'number' && isFinite(l.total.total_over) && typeof l?.total?.total_under === 'number' && isFinite(l.total.total_under)
            ? (Number(l.total.total_over) + Number(l.total.total_under)) / 2
            : (typeof l?.total?.total_over_delta === 'number' && typeof l?.total?.total_under_delta === 'number'
              ? (Number(l.total.total_over_delta) + Number(l.total.total_under_delta)) / 2
              : null)
          if (typeof h === 'number' && isFinite(h)) homeSpreads.push(h)
          if (typeof a === 'number' && isFinite(a)) awaySpreads.push(a)
          if (typeof t === 'number' && isFinite(t)) totals.push(t)
          const mh = typeof l?.moneyline?.moneyline_home === 'number' && isFinite(l.moneyline.moneyline_home)
            ? l.moneyline.moneyline_home
            : (typeof l?.moneyline?.moneyline_home_delta === 'number' ? l.moneyline.moneyline_home_delta : null)
          const ma = typeof l?.moneyline?.moneyline_away === 'number' && isFinite(l.moneyline.moneyline_away)
            ? l.moneyline.moneyline_away
            : (typeof l?.moneyline?.moneyline_away_delta === 'number' ? l.moneyline.moneyline_away_delta : null)
          if (typeof mh === 'number' && isFinite(mh)) moneyHome.push(mh)
          if (typeof ma === 'number' && isFinite(ma)) moneyAway.push(ma)
        }
        const avg = (arr: number[]) => (arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : null)
        const sum = (arr?: number[] | null) => Array.isArray(arr) ? arr.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : null
        result.set(doc.event_id, {
          spreadHome: avg(homeSpreads),
          spreadAway: avg(awaySpreads),
          totalPoints: avg(totals),
          scoreHome: sum(doc.score?.score_home_by_period),
          scoreAway: sum(doc.score?.score_away_by_period),
          moneylineHome: avg(moneyHome),
          moneylineAway: avg(moneyAway)
        })
      }
    } catch (e) {
      // On failure, return empty map; callers should fallback
    }
    return result
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

  private async computeTeamAtsSummary(teamId: string, games: Game[], seasonYear?: number, preloadedBetting?: Map<string, { spreadHome: number | null; spreadAway: number | null; totalPoints: number | null; scoreHome: number | null; scoreAway: number | null }>): Promise<{ overall: RecordSummary; home: RecordSummary; road: RecordSummary; lastTen: RecordSummary }> {
    const overall = this.createEmptyRecord()
    const home = this.createEmptyRecord()
    const road = this.createEmptyRecord()
    const lastTen = this.createEmptyRecord()

    // Cache check per team-season
    const cacheSeason = seasonYear ?? (games[0] ? new Date(games[0].gameDate).getFullYear() : new Date().getFullYear())
    const cacheKey = `${teamId}:${cacheSeason}`
    const cached = this.atsSummaryCache.get(cacheKey)
    if (cached && cached.seasonYear === cacheSeason && (Date.now() - cached.createdAt) < 6 * 60 * 60 * 1000) {
      return cached.summary
    }

    const finalGames = games.filter(g => g.status === 'final')

    // Cache spreads per event
    const spreadsCache = new Map<string, { home: number | null; away: number | null }>()
    // Cache scores per event (from betting_data)
    const scoresCache = new Map<string, { home: number | null; away: number | null }>()

    // Preload betting data for all events once if not provided
    if (!preloadedBetting) {
      const allEventIds = Array.from(new Set(finalGames.map(g => g.id)))
      const bulk = await this.getBettingSummariesForEvents(allEventIds)
      preloadedBetting = bulk
    }

    for (const game of finalGames) {
      if (!spreadsCache.has(game.id)) {
        const b = preloadedBetting?.get(game.id)
        if (b) spreadsCache.set(game.id, { home: b.spreadHome, away: b.spreadAway })
        else spreadsCache.set(game.id, await this.getConsensusSpreadsForGame(game.id))
      }
      if (!scoresCache.has(game.id)) {
        const b = preloadedBetting?.get(game.id)
        if (b) scoresCache.set(game.id, { home: b.scoreHome, away: b.scoreAway })
        else scoresCache.set(game.id, await this.getScoresFromBettingData(game.id))
      }
      const spreads = spreadsCache.get(game.id)!
      const scores = scoresCache.get(game.id)!
      const isHome = game.homeTeam.id === teamId
      const teamSpread = isHome ? spreads.home : spreads.away
      const teamScoreFromBetting = isHome ? scores.home : scores.away
      const oppScoreFromBetting = isHome ? scores.away : scores.home
      const teamScore = (teamScoreFromBetting ?? null) != null ? teamScoreFromBetting! : (isHome ? (game.homeScore ?? 0) : (game.awayScore ?? 0))
      const oppScore = (oppScoreFromBetting ?? null) != null ? oppScoreFromBetting! : (isHome ? (game.awayScore ?? 0) : (game.homeScore ?? 0))
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
        const b = preloadedBetting?.get(game.id)
        if (b) spreadsCache.set(game.id, { home: b.spreadHome, away: b.spreadAway })
        else spreadsCache.set(game.id, await this.getConsensusSpreadsForGame(game.id))
      }
      if (!scoresCache.has(game.id)) {
        const b = preloadedBetting?.get(game.id)
        if (b) scoresCache.set(game.id, { home: b.scoreHome, away: b.scoreAway })
        else scoresCache.set(game.id, await this.getScoresFromBettingData(game.id))
      }
      const spreads = spreadsCache.get(game.id)!
      const scores = scoresCache.get(game.id)!
      const isHome = game.homeTeam.id === teamId
      const teamSpread = isHome ? spreads.home : spreads.away
      const teamScoreFromBetting = isHome ? scores.home : scores.away
      const oppScoreFromBetting = isHome ? scores.away : scores.home
      const teamScore = (teamScoreFromBetting ?? null) != null ? teamScoreFromBetting! : (isHome ? (game.homeScore ?? 0) : (game.awayScore ?? 0))
      const oppScore = (oppScoreFromBetting ?? null) != null ? oppScoreFromBetting! : (isHome ? (game.awayScore ?? 0) : (game.homeScore ?? 0))
      const outcome = this.computeAtsOutcome(teamScore, oppScore, teamSpread)
      this.accumulateAtsRecord(lastTen, outcome)
    }

    const summary = { overall, home, road, lastTen }
    this.atsSummaryCache.set(cacheKey, { seasonYear: cacheSeason, summary, createdAt: Date.now() })
    return summary
  }

  public async getTeamSeasonGames(
    sport: SportType,
    teamId: string,
    seasonYear: number
  ): Promise<Game[]> {
    const cacheKey = `${sport}:${teamId}:${seasonYear}`
    const cached = this.teamSeasonGamesCache.get(cacheKey)
    if (cached && cached.seasonYear === seasonYear && (Date.now() - cached.createdAt) < 6 * 60 * 60 * 1000) {
      return cached.games
    }

    const collection = await getGamesCollection()
    const teamsCollection = await getTeamsCollection()
    const sportId = this.mapSportTypeToSportId(sport)
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

    const games = mongoGames.map(game => {
      const homeTeam = teamsMap.get(game.home_team_id)
      const awayTeam = teamsMap.get(game.away_team_id)
      return this.mapMongoGameToGame(game, null, homeTeam, awayTeam)
    })

    this.teamSeasonGamesCache.set(cacheKey, { seasonYear, games, createdAt: Date.now() })
    return games
  }

  async buildMatchupCoversSummary(
    sport: SportType,
    homeTeamId: string,
    awayTeamId: string,
    homeTeamName?: string,
    awayTeamName?: string
  ): Promise<MatchupCoversSummary | null> {
    try {
      // Use sport-aware season year (NBA spans calendar years)
      const currentYear = this.getSeasonYearForSport(sport)

      // Cache key (sport + season + team pair)
      const cacheKey = `${sport}:${currentYear}:${homeTeamId}:${awayTeamId}`
      const cached = this.coversSummaryCache.get(cacheKey)
      if (cached && cached.seasonYear === currentYear && (Date.now() - cached.createdAt) < 6 * 60 * 60 * 1000) {
        return cached.summary
      }

      // For NBA, fetch all games without season_year filter (cross-season spanning)
      let homeGames: Game[]
      let awayGames: Game[]
      
      if (sport === 'NBA') {
        const bulkGames = await this.getTeamsAllGamesBulk(sport, [homeTeamId, awayTeamId])
        homeGames = bulkGames.get(homeTeamId) || []
        awayGames = bulkGames.get(awayTeamId) || []
      } else {
        // For CFB/NFL, use season-year filtering
        const bulkGames = await this.getTeamsSeasonGamesBulk(sport, [homeTeamId, awayTeamId], currentYear)
        homeGames = bulkGames.get(homeTeamId) || []
        awayGames = bulkGames.get(awayTeamId) || []
      }

      const homeSummary = this.computeTeamCoversSummary(homeTeamId, homeTeamName, homeGames)
      const awaySummary = this.computeTeamCoversSummary(awayTeamId, awayTeamName, awayGames)

      // Compute ATS summaries using betting_data spreads
      // Preload all betting summaries for both teams' final games in one query
      const allEventIds = Array.from(new Set([
        ...homeGames.filter(g => g.status === 'final').map(g => g.id),
        ...awayGames.filter(g => g.status === 'final').map(g => g.id)
      ]))
      const bulkBetting = await this.getBettingSummariesForEvents(allEventIds)
      const [homeAts, awayAts] = await Promise.all([
        this.computeTeamAtsSummary(homeTeamId, homeGames, currentYear, bulkBetting),
        this.computeTeamAtsSummary(awayTeamId, awayGames, currentYear, bulkBetting)
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

      const summary: MatchupCoversSummary = {
        home: homeSummary,
        away: awaySummary
      }

      // Save to cache
      this.coversSummaryCache.set(cacheKey, { seasonYear: currentYear, summary, createdAt: Date.now() })

      return summary
    } catch (error) {
      console.error('Error building matchup covers summary:', error)
      return null
    }
  }

  // Compute implied win probabilities from closing moneylines
  public computeWinProbFromMoneylines(moneylineHome: number | null, moneylineAway: number | null): { winProbHome: number | null; winProbAway: number | null } {
    if (moneylineHome == null || moneylineAway == null || !isFinite(moneylineHome) || !isFinite(moneylineAway)) {
      return { winProbHome: null, winProbAway: null }
    }
    const americanToImplied = (odds: number): number => {
      if (odds > 0) return 100 / (odds + 100)
      return -odds / (-odds + 100)
    }
    let pHome = americanToImplied(moneylineHome)
    let pAway = americanToImplied(moneylineAway)
    const sum = pHome + pAway
    if (sum > 0) {
      pHome = pHome / sum
      pAway = pAway / sum
    }
    return { winProbHome: pHome, winProbAway: pAway }
  }

  // Bulk fetch all games for multiple teams (NBA-specific, no season_year filter)
  public async getTeamsAllGamesBulk(
    sport: SportType,
    teamIds: string[]
  ): Promise<Map<string, Game[]>> {
    const result = new Map<string, Game[]>()
    if (teamIds.length === 0) return result
    const sportId = this.mapSportTypeToSportId(sport)
    const numericTeamIds = teamIds.map(id => parseInt(id, 10))

    const [gamesCollection, teamsCollection] = await Promise.all([
      getGamesCollection(),
      getTeamsCollection()
    ])

    // Query all games for all those teams (no season_year filter)
    const mongoGames = await gamesCollection
      .find({
        sport_id: sportId,
        $or: [
          { home_team_id: { $in: numericTeamIds } },
          { away_team_id: { $in: numericTeamIds } }
        ]
      })
      .sort({ date_event: -1 })
      .toArray()

    const allMongoTeams = await teamsCollection.find({ sport_id: sportId }).toArray()
    const mongoTeamsMap = new Map(allMongoTeams.map(team => [team.team_id, team]))

    // Group games per requested team id
    for (const teamId of teamIds) {
      const list: Game[] = []
      const numericTeamId = parseInt(teamId, 10)
      for (const g of mongoGames) {
        if (g.home_team_id === numericTeamId || g.away_team_id === numericTeamId) {
          const homeTeam = mongoTeamsMap.get(g.home_team_id)
          const awayTeam = mongoTeamsMap.get(g.away_team_id)
          list.push(this.mapMongoGameToGame(g, null, homeTeam, awayTeam))
        }
      }
      result.set(teamId, list)
    }

    return result
  }

  // Bulk fetch season games for multiple teams to reduce DB roundtrips
  public async getTeamsSeasonGamesBulk(
    sport: SportType,
    teamIds: string[],
    seasonYear: number
  ): Promise<Map<string, Game[]>> {
    const result = new Map<string, Game[]>()
    if (teamIds.length === 0) return result
    const sportId = this.mapSportTypeToSportId(sport)
    const numericTeamIds = teamIds.map(id => parseInt(id, 10))

    const [gamesCollection, teamsCollection] = await Promise.all([
      getGamesCollection(),
      getTeamsCollection()
    ])

    // Query all games for all those teams in one call
    const mongoGames = await gamesCollection
      .find({
        sport_id: sportId,
        season_year: seasonYear,
        $or: [
          { home_team_id: { $in: numericTeamIds } },
          { away_team_id: { $in: numericTeamIds } }
        ]
      })
      .sort({ date_event: -1 })
      .toArray()

    const allMongoTeams = await teamsCollection.find({ sport_id: sportId }).toArray()
    const mongoTeamsMap = new Map(allMongoTeams.map(team => [team.team_id, team]))

    // Group games per requested team id
    for (const teamId of teamIds) {
      const list: Game[] = []
      const numericTeamId = parseInt(teamId, 10)
      for (const g of mongoGames) {
        if (g.home_team_id === numericTeamId || g.away_team_id === numericTeamId) {
          const homeTeam = mongoTeamsMap.get(g.home_team_id)
          const awayTeam = mongoTeamsMap.get(g.away_team_id)
          list.push(this.mapMongoGameToGame(g, null, homeTeam, awayTeam))
        }
      }
      result.set(teamId, list)
    }

    return result
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
      const sportId = this.mapSportTypeToSportId(sport)
      
      const mongoTeams = await collection.find({ sport_id: sportId }).toArray()
      
      // Filter CFB teams to only show FBS (division_id: 1)
      let filteredTeams = mongoTeams
      if (sport === 'CFB') {
        filteredTeams = mongoTeams.filter(team => {
          const divisionId = team.division?.division_id
          return divisionId === 1
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
      
      // For NCAAB, try current year first, then fall back to previous year if no data
      // (NCAAB season spans across calendar years, e.g., 2024-2025 season)
      let mongoStats = await collection.findOne({ 
        team_id: parseInt(teamId),
        season_year: currentYear
      })
      
      // If no stats found for NCAAB in current year, try previous year
      if (!mongoStats && sport === 'NCAAB') {
        console.log(`[${sport}] No stats found for team ${teamId} in year ${currentYear}, trying ${currentYear - 1}`)
        mongoStats = await collection.findOne({ 
          team_id: parseInt(teamId),
          season_year: currentYear - 1
        })
      }
      
      if (!mongoStats) {
        console.log(`[${sport}] No stats found for team ${teamId} in MongoDB`)
        return []
      }
      
      console.log(`[${sport}] Found ${mongoStats.stats.length} stats for team ${teamId}, season ${mongoStats.season_year}`)
      
      const detailedStats = this.mapMongoTeamStatsToDetailedStats(mongoStats)
      
      // Log stats with missing ranks for debugging
      const statsWithoutRank = detailedStats.filter(s => !s.rank && !s.rank_display_value)
      if (statsWithoutRank.length > 0) {
        console.log(`[${sport}] Team ${teamId}: ${statsWithoutRank.length}/${detailedStats.length} stats missing rank data`)
        console.log(`[${sport}] Sample stats without ranks:`, statsWithoutRank.slice(0, 3).map(s => s.stat?.display_name))
      }
      
      return detailedStats
    } catch (error) {
      console.error(`Error fetching detailed team stats for team ${teamId}:`, error)
      return []
    }
  }

  // Get games from MongoDB
  async getGames(sport: SportType = 'CFB', date?: string, limit?: number, endDate?: string): Promise<Game[]> {
    try {
      const collection = await getGamesCollection()
      const sportId = this.mapSportTypeToSportId(sport)
      
      let query: any = { sport_id: sportId }

      // Add date filter if provided
      if (date) {
        if (endDate) {
          // Inclusive start, exclusive end (next day) to ensure all times on endDate are included
          const start = new Date(date)
          const endExclusive = new Date(endDate)
          endExclusive.setDate(endExclusive.getDate() + 1)
          query.date_event = {
            $gte: start.toISOString().split('T')[0],
            $lte: endExclusive.toISOString().split('T')[0]
          }
        } else {
          // Single date query (legacy support)
          const targetDate = new Date(date)
          const nextDay = new Date(targetDate)
          nextDay.setDate(nextDay.getDate() + 1)
          
          query.date_event = {
            $gte: targetDate.toISOString().split('T')[0],
            $lte: nextDay.toISOString().split('T')[0]
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

  // Fallback: fetch a single game by event_id regardless of sport filters
  public async getGameByEventId(eventId: string): Promise<Game | null> {
    try {
      const gamesCollection = await getGamesCollection()
      const mongoGame = await gamesCollection.findOne({ event_id: eventId }) as MongoGame | null
      if (!mongoGame) return null

      // Resolve sport type from sport_id field on the game document
      const sportType = this.mapSportIdToSportType(mongoGame.sport_id)

      // Load teams metadata for proper mapping
      const teams = await this.getTeams(sportType)
      const teamsMap = new Map(teams.map(team => [team.id, team]))

      // Mongo team docs for abbreviations
      const teamsCollection = await getTeamsCollection()
      const allMongoTeams = await teamsCollection.find({ sport_id: mongoGame.sport_id }).toArray()
      const mongoTeamsMap = new Map(allMongoTeams.map(team => [team.team_id.toString(), team]))

      const game = this.mapMongoGameToGame(
        mongoGame,
        null,
        mongoTeamsMap.get(mongoGame.home_team_id.toString()),
        mongoTeamsMap.get(mongoGame.away_team_id.toString())
      )

      // Enrich with division/conference/mascot/record
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
    } catch (e) {
      console.error('Error fetching game by event_id:', e)
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
      const sportId = this.mapSportTypeToSportId(sport)
      
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

  // Generic helper to get top players by a given stat "name" (e.g. 'receivingYards', 'sacks')
  async getTopPlayersByPlayerStat(
    sport: SportType,
    statName: string,
    options: { limit?: number; seasonYear?: number } = {}
  ): Promise<Array<{
    playerId: string
    playerName: string
    teamId: string
    position?: string
    jerseyNumber?: number
    statName: string
    statDisplayName: string
    abbreviation: string
    value: number
  }>> {
    try {
      const collection = await getPlayerSeasonStatsCollection()
      const sportId = this.mapSportTypeToSportId(sport)

      // Per requirements, always use the current season (2025 for now)
      const seasonYear = options.seasonYear ?? 2025
      const limit = options.limit ?? 5

      const pipeline = [
        {
          $match: {
            sport_id: sportId,
            season_year: seasonYear,
            'player.status': 'Active'
          }
        },
        {
          $project: {
            season_year: 1,
            sport_id: 1,
            team_id: 1,
            player_id: 1,
            player: 1,
            statsArray: { $objectToArray: '$stats' }
          }
        },
        { $unwind: '$statsArray' },
        { $match: { 'statsArray.v.name': statName } },
        {
          $project: {
            _id: 0,
            playerId: { $toString: '$player_id' },
            playerName: '$player.display_name',
            teamId: { $toString: '$team_id' },
            position: '$player.position_abbreviation',
            jerseyNumber: {
              $cond: [
                { $gt: [{ $strLenCP: '$player.jersey' }, 0] },
                { $toInt: '$player.jersey' },
                null
              ]
            },
            statName: '$statsArray.v.name',
            statDisplayName: '$statsArray.v.display_name',
            abbreviation: '$statsArray.v.abbreviation',
            value: '$statsArray.v.value'
          }
        },
        { $sort: { value: -1 } },
        { $limit: limit }
      ]

      const leaders = await collection.aggregate(pipeline).toArray()
      return leaders as any
    } catch (error) {
      console.error('Error fetching top player stats from MongoDB:', error)
      return []
    }
  }

  // Public helper for detailed "complete leaders" pages
  async getPlayerLeadersByStat(
    sport: SportType,
    statKey: 'passing' | 'rushing' | 'receiving' | 'tackles' | 'sacks' | 'interceptions',
    options: { limit?: number } = {}
  ) {
    let statName: string
    switch (statKey) {
      case 'passing':
        statName = 'passingYards'
        break
      case 'rushing':
        statName = 'rushingYards'
        break
      case 'receiving':
        statName = 'receivingYards'
        break
      case 'tackles':
        statName = 'totalTackles'
        break
      case 'sacks':
        statName = 'sacks'
        break
      case 'interceptions':
        statName = 'interceptions'
        break
      default:
        statName = 'passingYards'
    }

    const base = await this.getTopPlayersByPlayerStat(sport, statName, {
      limit: options.limit ?? 50
    })

    // Enrich with team and player metadata (reuse logic from getPlayerInsights)
    const sportId = this.mapSportTypeToSportId(sport)
    const uniquePlayerIds = Array.from(
      new Set(base.map((l: any) => l.playerId).filter(Boolean))
    )

    const [playersCollection, teams] = await Promise.all([
      getPlayersCollection(),
      this.getTeams(sport)
    ])

    const numericPlayerIds = uniquePlayerIds
      .map(id => parseInt(id, 10))
      .filter(id => !Number.isNaN(id))

    const mongoPlayers = numericPlayerIds.length
      ? await playersCollection
          .find({ sport_id: sportId, id: { $in: numericPlayerIds } })
          .toArray()
      : []

    const playersById = new Map<number, MongoPlayer>(
      mongoPlayers.map(p => [p.id, p])
    )

    const teamsById = new Map(
      teams.map(team => [team.id, team])
    )

    return base.map((leader: any) => {
      const numericId = parseInt(leader.playerId, 10)
      const playerDoc = playersById.get(numericId)
      const team = teamsById.get(leader.teamId)

      return {
        ...leader,
        age: playerDoc?.age,
        height: playerDoc?.display_height,
        weight: playerDoc?.weight,
        teamAbbreviation: team?.abbreviation,
        teamName: team?.name
      }
    })
  }

  // Player Insights: small leaderboards for rushing/receiving/passing + defensive
  async getPlayerInsights(sport: SportType): Promise<{
    topRushing: any[]
    topReceiving: any[]
    topPassing: any[]
    topDefensiveTackles: any[]
    topDefensiveSacks: any[]
    topDefensiveInterceptions: any[]
  }> {
    // Only enabled for CFB (NCAAF) and NFL per requirements
    if (sport !== 'CFB' && sport !== 'NFL') {
      return {
        topRushing: [],
        topReceiving: [],
        topPassing: [],
        topDefensiveTackles: [],
        topDefensiveSacks: [],
        topDefensiveInterceptions: []
      }
    }

    // NOTE: These stat "name" values come from the player_season_stats.stats.*.name field.
    // We can clearly see 'receivingYards', 'sacks', 'interceptions', and 'totalTackles' in the sample data.
    // 'rushingYards' and 'passingYards' are assumed based on provider naming; adjust here if needed.
    const [topReceiving, topSacks, topInterceptions, topRushing, topPassing, topTackles] = await Promise.all([
      this.getTopPlayersByPlayerStat(sport, 'receivingYards', { limit: 5 }),
      this.getTopPlayersByPlayerStat(sport, 'sacks', { limit: 5 }),
      this.getTopPlayersByPlayerStat(sport, 'interceptions', { limit: 5 }),
      this.getTopPlayersByPlayerStat(sport, 'rushingYards', { limit: 5 }),
      this.getTopPlayersByPlayerStat(sport, 'passingYards', { limit: 5 }),
      this.getTopPlayersByPlayerStat(sport, 'totalTackles', { limit: 5 })
    ])

    // Enrich leaders with player and team metadata from MongoDB
    try {
      const allLeaders = [
        ...topRushing,
        ...topReceiving,
        ...topPassing,
        ...topTackles,
        ...topSacks,
        ...topInterceptions
      ]

      const uniquePlayerIds = Array.from(
        new Set(allLeaders.map((l: any) => l.playerId).filter(Boolean))
      )
      const uniqueTeamIds = Array.from(
        new Set(allLeaders.map((l: any) => l.teamId).filter(Boolean))
      )

      const sportId = this.mapSportTypeToSportId(sport)

      const [playersCollection, teams] = await Promise.all([
        getPlayersCollection(),
        this.getTeams(sport)
      ])

      const numericPlayerIds = uniquePlayerIds
        .map(id => parseInt(id, 10))
        .filter(id => !Number.isNaN(id))

      const mongoPlayers = numericPlayerIds.length
        ? await playersCollection
            .find({ sport_id: sportId, id: { $in: numericPlayerIds } })
            .toArray()
        : []

      const playersById = new Map<number, MongoPlayer>(
        mongoPlayers.map(p => [p.id, p])
      )

      const teamsById = new Map(
        teams.map(team => [team.id, team])
      )

      const enrichLeader = (leader: any) => {
        const numericId = parseInt(leader.playerId, 10)
        const playerDoc = playersById.get(numericId)
        const team = teamsById.get(leader.teamId)

        return {
          ...leader,
          age: playerDoc?.age,
          height: playerDoc?.display_height,
          weight: playerDoc?.weight,
          teamAbbreviation: team?.abbreviation,
          teamName: team?.name
        }
      }

      return {
        topRushing: topRushing.map(enrichLeader),
        topReceiving: topReceiving.map(enrichLeader),
        topPassing: topPassing.map(enrichLeader),
        topDefensiveTackles: topTackles.map(enrichLeader),
        topDefensiveSacks: topSacks.map(enrichLeader),
        topDefensiveInterceptions: topInterceptions.map(enrichLeader)
      }
    } catch (metaError) {
      console.error('Error enriching player insights with metadata:', metaError)
      // Fallback to original simple arrays if enrichment fails
      return {
        topRushing,
        topReceiving,
        topPassing,
        topDefensiveTackles: topTackles,
        topDefensiveSacks: topSacks,
        topDefensiveInterceptions: topInterceptions
      }
    }
  }

  /**
   * Get season aggregated player stats from MongoDB player_season_stats and map them
   * into the generic PlayerStats interface used by the UI tables.
   *
   * NOTE: For now this focuses on football (CFB/NFL) metrics and always uses the
   * player_season_stats "value" field for season totals.
   */
  async getPlayerSeasonStatsFromMongo(
    sport: SportType,
    options: { seasonYear?: number; teamId?: string; playerId?: string } = {}
  ): Promise<PlayerStats[]> {
    const seasonYear = options.seasonYear ?? 2025
    const sportId = this.mapSportTypeToSportId(sport)

    try {
      const collection = await getPlayerSeasonStatsCollection()

      const match: any = {
        sport_id: sportId,
        season_year: seasonYear,
        'player.status': 'Active'
      }
      if (options.teamId) {
        match.team_id = parseInt(options.teamId, 10)
      }
      if (options.playerId) {
        match.player_id = parseInt(options.playerId, 10)
      }

      const docs: MongoPlayerSeasonStats[] = await collection.find(match).toArray()

      const mapDocToPlayerStats = (doc: MongoPlayerSeasonStats): PlayerStats => {
        const statsArray = Object.values(doc.stats || {})

        const findValue = (name: string): number | undefined => {
          const s = statsArray.find(stat => stat.name === name)
          return s && typeof s.value === 'number' ? s.value : undefined
        }

        const passingYards = findValue('passingYards')
        const passingTouchdowns = findValue('passingTouchdowns')
        const interceptions = findValue('interceptions')
        const rushingYards = findValue('rushingYards')
        const rushingTouchdowns = findValue('rushingTouchdowns')
        const receivingYards = findValue('receivingYards')
        const receivingTouchdowns = findValue('receivingTouchdowns')
        const receptions = findValue('receptions')
        const tackles = findValue('totalTackles')
        const sacks = findValue('sacks')
        const fumbles = findValue('fumbles') ?? findValue('receivingFumbles')

        return {
          playerId: doc.player_id.toString(),
          season: seasonYear.toString(),
          games: findValue('games') || 0,
          passingYards,
          passingTouchdowns,
          interceptions,
          rushingYards,
          rushingTouchdowns,
          receivingYards,
          receivingTouchdowns,
          receptions,
          tackles,
          sacks,
          fumbles
        }
      }

      return docs.map(mapDocToPlayerStats)
    } catch (error) {
      console.error('Error fetching player season stats from MongoDB:', error)
      return []
    }
  }

  /**
   * Get full, per-stat player season stats from Mongo (all stat IDs, grouped by category on the frontend).
   */
  async getPlayerDetailedSeasonStatsFromMongo(
    sport: SportType,
    options: { seasonYear?: number; teamId?: string; playerId: string }
  ): Promise<PlayerDetailedStat[]> {
    const seasonYear = options.seasonYear ?? 2025
    const sportId = this.mapSportTypeToSportId(sport)

    try {
      const collection = await getPlayerSeasonStatsCollection()

      const match: any = {
        sport_id: sportId,
        season_year: seasonYear,
        player_id: parseInt(options.playerId, 10),
        'player.status': 'Active'
      }
      if (options.teamId) {
        match.team_id = parseInt(options.teamId, 10)
      }

      const doc: MongoPlayerSeasonStats | null = await collection.findOne(match)
      if (!doc || !doc.stats) return []

      const statsArray = Object.values(doc.stats)

      return statsArray.map((s): PlayerDetailedStat => ({
        statId: s.stat_id,
        name: s.name,
        category: s.category,
        displayName: s.display_name,
        abbreviation: s.abbreviation,
        description: s.description,
        value: s.value,
        displayValue: s.display_value,
        perGameValue: s.per_game_value,
        perGameDisplayValue: s.per_game_display_value
      }))
    } catch (error) {
      console.error('Error fetching detailed player season stats from MongoDB:', error)
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

  /**
   * Calculate opponent stats for a team (offensive stats of opponents faced)
   * This represents the offensive performance of teams this team has played against
   */
  async calculateOpponentStats(sport: SportType, teamId: string, seasonYear?: number): Promise<{
    opponentThirdDownConvPct: number | null
    opponentRedZoneEfficiencyPct: number | null
  }> {
    try {
      const currentYear = seasonYear || this.getSeasonYearForSport(sport)
      const sportId = this.mapSportTypeToSportId(sport)
      const numericTeamId = parseInt(teamId, 10)

      // Get completed games for this team
      let completedGames: Game[] = []
      if (sport === 'NBA') {
        // Use ALL NBA games in the system (no season_year filter)
        const bulk = await this.getTeamsAllGamesBulk(sport, [teamId])
        const allGames = bulk.get(teamId) || []
        completedGames = allGames.filter(g => g.status === 'final')
      } else {
        // Non-NBA fallback (season-scoped)
        const gamesCollection = await getGamesCollection()
        const raw = await gamesCollection.find({
          sport_id: sportId,
          season_year: currentYear,
          event_status: 'STATUS_FINAL',
          $or: [
            { home_team_id: numericTeamId },
            { away_team_id: numericTeamId }
          ]
        }).toArray()
        completedGames = raw.map(g => this.mapMongoGameToGame(g as any, null as any))
      }

      if (completedGames.length === 0) {
        return {
          opponentThirdDownConvPct: null,
          opponentRedZoneEfficiencyPct: null
        }
      }

      // Extract opponent team IDs
      const opponentIds = completedGames.map(game => {
        const isHome = game.homeTeam.id === teamId
        return parseInt(isHome ? game.awayTeam.id : game.homeTeam.id, 10)
      })

      if (opponentIds.length === 0) {
        return {
          opponentThirdDownConvPct: null,
          opponentRedZoneEfficiencyPct: null
        }
      }

      // Get stats for all opponents
      const teamStatsCollection = await getTeamStatsCollection()
      const opponentStats = await teamStatsCollection.find({
        team_id: { $in: opponentIds },
        season_year: currentYear
      }).toArray()

      // Helper: find a stat object by stat_id OR by name/display_name keywords
      const findStatByIdOrName = (statsArr: any[] | undefined | null, opts: { ids?: number[]; nameIncludes?: string[]; displayIncludes?: string[] }) => {
        if (!Array.isArray(statsArr)) return undefined
        const ids = new Set((opts.ids || []).map(n => Number(n)))
        const nameNeedles = (opts.nameIncludes || []).map(s => s.toLowerCase())
        const displayNeedles = (opts.displayIncludes || []).map(s => s.toLowerCase())
        // Prefer exact id matches first
        let found = statsArr.find((s: any) => typeof s?.stat_id === 'number' && ids.has(Number(s.stat_id)))
        if (found) return found
        // Fallback: match by internal name
        found = statsArr.find((s: any) => {
          const nm = (s?.name || '').toString().toLowerCase()
          return nameNeedles.some(n => n && nm.includes(n))
        })
        if (found) return found
        // Fallback: match by display name
        found = statsArr.find((s: any) => {
          const dn = (s?.display_name || '').toString().toLowerCase()
          return displayNeedles.some(n => n && dn.includes(n))
        })
        return found
      }

      // Calculate cumulative third down conversion percentage and opponent RZ% (avg of per-game values)
      let totalThirdDownConvs = 0
      let totalThirdDownAttempts = 0
      let redZoneEffPctSum = 0
      let redZoneEffPctCount = 0

      for (const opponentStat of opponentStats) {
        // Third down conversions: prefer stat_id 1662 but fallback to name patterns
        const thirdDownConvsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1662],
          nameIncludes: ['thirddownconvs', 'third down conv', '3rd down conv'],
          displayIncludes: ['third down conv']
        })
        if (thirdDownConvsStat?.value) {
          totalThirdDownConvs += thirdDownConvsStat.value
        }

        // Third down attempts: prefer stat_id 1663 but fallback to name patterns
        const thirdDownAttemptsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1663],
          nameIncludes: ['thirddownattempts', 'third down attempt', '3rd down attempt'],
          displayIncludes: ['third down attempt']
        })
        if (thirdDownAttemptsStat?.value) {
          totalThirdDownAttempts += thirdDownAttemptsStat.value
        }

        // Red zone efficiency percentage: prefer stat_id 1673 but fallback to name patterns
        const redZoneEffPctStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1673],
          nameIncludes: ['redzoneefficiencypct', 'red zone efficiency pct', 'red zone eff %'],
          displayIncludes: ['red zone efficiency percentage', 'red zone efficiency %']
        })
        if (redZoneEffPctStat) {
          const rzValRaw = (redZoneEffPctStat as any).per_game_value ?? redZoneEffPctStat.value
          const rzValNum = typeof rzValRaw === 'string' ? parseFloat(rzValRaw) : rzValRaw
          if (typeof rzValNum === 'number' && isFinite(rzValNum)) {
            redZoneEffPctSum += rzValNum
            redZoneEffPctCount++
          }
        }
      }

      const opponentThirdDownConvPct = totalThirdDownAttempts > 0 
        ? (totalThirdDownConvs / totalThirdDownAttempts) * 100 
        : null

      const opponentRedZoneEfficiencyPct = redZoneEffPctCount > 0
        ? redZoneEffPctSum / redZoneEffPctCount
        : null

      return {
        opponentThirdDownConvPct,
        opponentRedZoneEfficiencyPct
      }
    } catch (error) {
      console.error('Error calculating opponent stats:', error)
      return {
        opponentThirdDownConvPct: null,
        opponentRedZoneEfficiencyPct: null
      }
    }
  }

  /**
   * Calculate defensive stats for a team (stats allowed to opponents)
   * This represents how well this team's defense performs
   */
  async calculateDefensiveStats(sport: SportType, teamId: string, seasonYear?: number): Promise<{
    defensiveThirdDownConvPct: number | null
  }> {
    try {
      const currentYear = seasonYear || new Date().getFullYear()
      const sportId = this.mapSportTypeToSportId(sport)
      const numericTeamId = parseInt(teamId, 10)

      // Get all completed games for this team
      const gamesCollection = await getGamesCollection()
      const completedGames = await gamesCollection.find({
        sport_id: sportId,
        season_year: currentYear,
        event_status: 'STATUS_FINAL',
        $or: [
          { home_team_id: numericTeamId },
          { away_team_id: numericTeamId }
        ]
      }).toArray()

      if (completedGames.length === 0) {
        return { defensiveThirdDownConvPct: null }
      }

      // Extract opponent team IDs
      const opponentIds = completedGames.map(game => {
        return game.home_team_id === numericTeamId ? game.away_team_id : game.home_team_id
      })

      if (opponentIds.length === 0) {
        return { defensiveThirdDownConvPct: null }
      }

      // Get stats for all opponents (their offensive performance against this team)
      const teamStatsCollection = await getTeamStatsCollection()
      const opponentStats = await teamStatsCollection.find({
        team_id: { $in: opponentIds },
        season_year: currentYear
      }).toArray()

      // Sum up third down conversions and attempts by opponents
      let totalThirdDownConvsByOpponents = 0
      let totalThirdDownAttemptsByOpponents = 0

      for (const opponentStat of opponentStats) {
        // Helper: find a stat by id or name
        const findStatByIdOrName = (statsArr: any[] | undefined | null, opts: { ids?: number[]; nameIncludes?: string[]; displayIncludes?: string[] }) => {
          if (!Array.isArray(statsArr)) return undefined
          const ids = new Set((opts.ids || []).map(n => Number(n)))
          const nameNeedles = (opts.nameIncludes || []).map(s => s.toLowerCase())
          const displayNeedles = (opts.displayIncludes || []).map(s => s.toLowerCase())
          let found = statsArr.find((s: any) => typeof s?.stat_id === 'number' && ids.has(Number(s.stat_id)))
          if (found) return found
          found = statsArr.find((s: any) => {
            const nm = (s?.name || '').toString().toLowerCase()
            return nameNeedles.some(n => n && nm.includes(n))
          })
          if (found) return found
          found = statsArr.find((s: any) => {
            const dn = (s?.display_name || '').toString().toLowerCase()
            return displayNeedles.some(n => n && dn.includes(n))
          })
          return found
        }

        // Third down conversions
        const thirdDownConvsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1662],
          nameIncludes: ['thirddownconvs', 'third down conv', '3rd down conv'],
          displayIncludes: ['third down conv']
        })
        if (thirdDownConvsStat?.value) {
          totalThirdDownConvsByOpponents += thirdDownConvsStat.value
        }

        // Third down attempts
        const thirdDownAttemptsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1663],
          nameIncludes: ['thirddownattempts', 'third down attempt', '3rd down attempt'],
          displayIncludes: ['third down attempt']
        })
        if (thirdDownAttemptsStat?.value) {
          totalThirdDownAttemptsByOpponents += thirdDownAttemptsStat.value
        }
      }

      const defensiveThirdDownConvPct = totalThirdDownAttemptsByOpponents > 0
        ? (totalThirdDownConvsByOpponents / totalThirdDownAttemptsByOpponents) * 100
        : null

      return { defensiveThirdDownConvPct }
    } catch (error) {
      console.error('Error calculating defensive stats:', error)
      return { defensiveThirdDownConvPct: null }
    }
  }

  /**
   * Calculate NBA opponent stats for a team
   * Returns stats that opponents scored against this team
   */
  async calculateNBAOpponentStats(sport: SportType, teamId: string, seasonYear?: number): Promise<any> {
    try {
      const sportId = this.mapSportTypeToSportId(sport)
      const numericTeamId = parseInt(teamId, 10)

      console.log(`[NBA Opponent Stats] Calculating for team ${teamId} (${numericTeamId})`)

      // Get ALL completed games for this NBA team (no season filter)
      const gamesCollection = await getGamesCollection()
      const completedGames = await gamesCollection.find({
        sport_id: sportId,
        event_status: 'STATUS_FINAL',
        $or: [
          { home_team_id: numericTeamId },
          { away_team_id: numericTeamId }
        ]
      }).toArray()

      console.log(`[NBA Opponent Stats] Found ${completedGames.length} completed games`)

      if (completedGames.length === 0) {
        console.log(`[NBA Opponent Stats] No games found, returning empty`)
        return {}
      }

      // Extract opponent team IDs
      const opponentIds = completedGames.map(game => {
        return game.home_team_id === numericTeamId ? game.away_team_id : game.home_team_id
      })

      if (opponentIds.length === 0) {
        console.log(`[NBA Opponent Stats] No opponent IDs found`)
        return {}
      }

      const numberOfGames = completedGames.length
      console.log(`[NBA Opponent Stats] Processing ${opponentIds.length} unique opponents`)

      // Get stats for all opponents (no season filter for NBA)
      const teamStatsCollection = await getTeamStatsCollection()
      const opponentStats = await teamStatsCollection.find({
        team_id: { $in: opponentIds }
      }).toArray()

      console.log(`[NBA Opponent Stats] Found ${opponentStats.length} opponent stat records`)

      // Helper: find a stat object by stat_id OR by name/display_name keywords
      const findStatByIdOrName = (statsArr: any[] | undefined | null, opts: { ids?: number[]; nameIncludes?: string[]; displayIncludes?: string[] }) => {
        if (!Array.isArray(statsArr)) return undefined
        const ids = new Set((opts.ids || []).map(n => Number(n)))
        const nameNeedles = (opts.nameIncludes || []).map(s => s.toLowerCase())
        const displayNeedles = (opts.displayIncludes || []).map(s => s.toLowerCase())
        let found = statsArr.find((s: any) => typeof s?.stat_id === 'number' && ids.has(Number(s.stat_id)))
        if (found) return found
        found = statsArr.find((s: any) => {
          const nm = (s?.name || '').toString().toLowerCase()
          return nameNeedles.some(n => n && nm.includes(n))
        })
        if (found) return found
        found = statsArr.find((s: any) => {
          const dn = (s?.display_name || '').toString().toLowerCase()
          return displayNeedles.some(n => n && dn.includes(n))
        })
        return found
      }

      // Initialize accumulators
      let totalFouls = 0, countFouls = 0
      let totalRebounds = 0, countRebounds = 0
      let totalPoints = 0, countPoints = 0
      let totalOffensiveRebounds = 0, countOffensiveRebounds = 0
      let totalTurnovers = 0, countTurnovers = 0
      let totalDefensiveRebounds = 0, countDefensiveRebounds = 0
      let totalAssists = 0, countAssists = 0
      let totalBlocks = 0
      let totalSteals = 0
      let totalFTM = 0, totalFTA = 0
      let total3PM = 0, total3PA = 0
      let total2PM = 0, total2PA = 0
      let totalFGM = 0, totalFGA = 0

      // Iterate through opponent stats
      for (const opponentStat of opponentStats) {
        // 1244 - Fouls Per Game (avgFouls)
        const foulsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1244],
          nameIncludes: ['avgfouls', 'fouls per game'],
          displayIncludes: ['fouls per game']
        })
        if (foulsStat?.value) {
          totalFouls += foulsStat.value
          countFouls++
        }

        // 1242 - Rebounds Per Game (avgRebounds)
        const reboundsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1242, 1249, 1250],
          nameIncludes: ['avgrebound', 'rebounds per game', 'totalrebounds', 'rebounds'],
          displayIncludes: ['rebounds per game', 'rebounds']
        })
        if (reboundsStat?.value) {
          totalRebounds += reboundsStat.value
          countRebounds++
        }

        // 1259 - Points Per Game (avgPoints) or 1269 - Points
        const pointsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1259, 1269],
          nameIncludes: ['avgpoints', 'points per game', 'points'],
          displayIncludes: ['points per game', 'points']
        })
        if (pointsStat?.value) {
          totalPoints += pointsStat.value
          countPoints++
        }

        // 1260 - Offensive Rebounds Per Game (avgOffensiveRebounds) or 1270 - Offensive Rebounds
        const offRebStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1260, 1270],
          nameIncludes: ['avgoffensiverebounds', 'offensive rebounds per game', 'offensiverebounds'],
          displayIncludes: ['offensive rebounds per game', 'offensive rebounds']
        })
        if (offRebStat?.value) {
          totalOffensiveRebounds += offRebStat.value
          countOffensiveRebounds++
        }

        // 1262 - Turnovers Per Game (avgTurnovers) or 1272 - Turnovers
        const turnoversStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1262, 1272],
          nameIncludes: ['avgturnovers', 'turnovers per game', 'turnovers'],
          displayIncludes: ['turnovers per game', 'turnovers']
        })
        if (turnoversStat?.value) {
          totalTurnovers += turnoversStat.value
          countTurnovers++
        }

        // 1282 - Defensive Rebounds Per Game (avgDefensiveRebounds)
        const defRebStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1282],
          nameIncludes: ['avgdefensiverebounds', 'defensive rebounds per game', 'defensiverebounds'],
          displayIncludes: ['defensive rebounds per game', 'defensive rebounds']
        })
        if (defRebStat?.value) {
          totalDefensiveRebounds += defRebStat.value
          countDefensiveRebounds++
        }

        // 1261 - Assists Per Game (avgAssists) or 1271 - Assists
        const assistsStat = findStatByIdOrName(opponentStat.stats, {
          ids: [1261, 1271],
          nameIncludes: ['avgassists', 'assists per game', 'assists'],
          displayIncludes: ['assists per game', 'assists']
        })
        if (assistsStat?.value) {
          totalAssists += assistsStat.value
          countAssists++
        }

        // Blocks (prefer per-game if present)
        const blocksStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['blocks per game', 'blocks'],
          displayIncludes: ['blocks per game', 'blocks']
        })
        if (blocksStat?.value) {
          totalBlocks += blocksStat.value
        }

        // Steals (prefer per-game if present)
        const stealsStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['steals per game', 'steals'],
          displayIncludes: ['steals per game', 'steals']
        })
        if (stealsStat?.value) {
          totalSteals += stealsStat.value
        }

        // Free Throw stats for calculating FT%
        const ftmStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['free throws made', 'freethrowsmade', 'average free throws made'],
          displayIncludes: ['free throws made', 'average free throws made']
        })
        const ftaStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['free throws attempted', 'freethrowsattempted', 'average free throws attempted'],
          displayIncludes: ['free throws attempted', 'average free throws attempted']
        })
        if (ftmStat?.value) totalFTM += ftmStat.value
        if (ftaStat?.value) totalFTA += ftaStat.value

        // 3-Point stats for calculating 3P%
        const threePMStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['3-point field goals made', 'threepointfieldgoalsmade', 'average 3-point field goals made'],
          displayIncludes: ['3-point field goals made', 'average 3-point field goals made']
        })
        const threePAStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['3-point field goals attempted', 'threepointfieldgoalsattempted', 'average 3-point field goals attempted'],
          displayIncludes: ['3-point field goals attempted', 'average 3-point field goals attempted']
        })
        if (threePMStat?.value) total3PM += threePMStat.value
        if (threePAStat?.value) total3PA += threePAStat.value

        // 2-Point stats for calculating 2P%
        const twoPMStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['2-point field goals made', 'twopointfieldgoalsmade'],
          displayIncludes: ['2-point field goals made', '2-point field goals made per game']
        })
        const twoPAStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['2-point field goals attempted', 'twopointfieldgoalsattempted'],
          displayIncludes: ['2-point field goals attempted', '2-point field goals attempted per game']
        })
        if (twoPMStat?.value) total2PM += twoPMStat.value
        if (twoPAStat?.value) total2PA += twoPAStat.value

        // Field Goal stats for calculating FG%
        const fgmStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['field goals made', 'fieldgoalsmade', 'average field goals made'],
          displayIncludes: ['field goals made', 'average field goals made']
        })
        const fgaStat = findStatByIdOrName(opponentStat.stats, {
          nameIncludes: ['field goals attempted', 'fieldgoalsattempted', 'average field goals attempted'],
          displayIncludes: ['field goals attempted', 'average field goals attempted']
        })
        if (fgmStat?.value) totalFGM += fgmStat.value
        if (fgaStat?.value) totalFGA += fgaStat.value
      }

      // Calculate opponent stats
      const opponentStatsResult: any = {}

      // Per-game stats (averages)
      if (numberOfGames > 0) {
        opponentStatsResult['1244'] = totalFouls / numberOfGames
        opponentStatsResult['1242'] = totalRebounds / numberOfGames
        opponentStatsResult['1249'] = totalRebounds
        opponentStatsResult['1250'] = totalRebounds / numberOfGames
        opponentStatsResult['1259'] = totalPoints / numberOfGames
        opponentStatsResult['1269'] = totalPoints / numberOfGames
        opponentStatsResult['1260'] = totalOffensiveRebounds / numberOfGames
        opponentStatsResult['1270'] = totalOffensiveRebounds / numberOfGames
        opponentStatsResult['1262'] = totalTurnovers / numberOfGames
        opponentStatsResult['1272'] = totalTurnovers
        opponentStatsResult['1282'] = totalDefensiveRebounds / numberOfGames
        opponentStatsResult['1261'] = totalAssists / numberOfGames
        opponentStatsResult['1271'] = totalAssists / numberOfGames
        opponentStatsResult['opp_blocks_per_game'] = totalBlocks / numberOfGames
        opponentStatsResult['opp_steals_per_game'] = totalSteals / numberOfGames
      }

      // Percentage stats
      if (totalFTA > 0) {
        opponentStatsResult['1251'] = (totalFTM / totalFTA) * 100
      }
      if (total3PA > 0) {
        opponentStatsResult['1252'] = (total3PM / total3PA) * 100
        opponentStatsResult['1279'] = (total3PM / total3PA) * 100
      }
      if (total2PA > 0) {
        opponentStatsResult['1263'] = (total2PM / total2PA) * 100
      }
      if (totalFGA > 0) {
        opponentStatsResult['1266'] = (totalFGM / totalFGA) * 100
      }

      // Efficiency stats
      // 1264 Scoring Efficiency: Points per Field Goal Attempt (not a percentage)
      if (totalFGA > 0) {
        opponentStatsResult['1264'] = totalPoints / totalFGA
      }
      // 1265 Shooting Efficiency: Effective FG% = (FGM + 0.5 * 3PM) / FGA
      if (totalFGA > 0) {
        opponentStatsResult['1265'] = ((totalFGM + 0.5 * total3PM) / totalFGA) * 100
      }

      // Opponent Assist/Turnover Ratio (1243)
      if (totalTurnovers > 0) {
        opponentStatsResult['1243'] = totalAssists / totalTurnovers
      }

      console.log(`[NBA Opponent Stats] Returning ${Object.keys(opponentStatsResult).length} stats:`, opponentStatsResult)
      return opponentStatsResult
    } catch (error) {
      console.error('Error calculating NBA opponent stats:', error)
      return {}
    }
  }
}

// Export singleton instance
export const mongoSportsAPI = new MongoDBSportsAPI()
