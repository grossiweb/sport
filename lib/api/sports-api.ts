import axios from 'axios'
import { Game, Team, Player, TeamStats, PlayerStats, BettingData, SportType, DetailedTeamStat } from '@/types'

// TheRundown.io API client for Multiple Sports
class TheRundownAPI {
  private apiKey: string
  private baseUrl = 'https://therundown-therundown-v1.p.rapidapi.com'
  private sportId: string

  constructor(apiKey: string, sportId: string = '1') {
    this.apiKey = apiKey
    this.sportId = sportId
  }

  private async makeRequest(endpoint: string, params?: Record<string, any>) {
    try {
      // console.log('Making request to:', `${this.baseUrl}${endpoint}`, 'with params:', params)
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'therundown-therundown-v1.p.rapidapi.com'
        },
        params
      })
      // console.log('Response status:', response.status)
      // console.log('Response data keys:', Object.keys(response.data))
      return response.data
    } catch (error) {
      // console.error('TheRundown API error:', error)
      if (axios.isAxiosError(error)) {
        // console.error('Error response:', error.response?.data)
        // console.error('Error status:', error.response?.status)
      }
      throw error
    }
  }

  async getGames(date?: string, limit?: number): Promise<Game[]> {
    // Use the correct schedule endpoint for TheRundown API
    const fromDate = date || new Date().toISOString().split('T')[0]
    
    // Apply division filters only for CFB (sportId = '1')
    let endpoint = `/sports/${this.sportId}/schedule?include=scores&include=all_periods`
    if (this.sportId === '1') {
      // For CFB, filter to only FBS (division_id=1) and FCS (division_id=4)
      endpoint += '&division_id=1&division_id=4'
    }
    
    const params = {
      from: fromDate,
      limit: limit || 10
    }
    
    // Make the API request
    const data = await this.makeRequest(endpoint, params)
  
         // console.log('✅ Raw API response:', data)
  
    // Extract schedules safely
    const events = Array.isArray(data?.schedules) ? data.schedules : []
  
         // console.log(`📌 Total events found: ${events.length}`)
    if (events.length > 0) {
             // console.log('📄 First event structure:', Object.keys(events[0]))
    }
  
    // If no events found, return an empty array
    if (events.length === 0) {
             // console.warn('⚠️ No events found for date:', fromDate)
      return []
    }
  
    // Map response into your Game[] structure
    return events.map((event: any) => {
             // console.log('⚡ Processing event:', {
       //   id: event.event_id,
       //   home: event.home_team,
       //   away: event.away_team,
       //   date: event.date_event,
       //   status: event.event_status
       // })
  
      return {
        id: event.event_id,
        homeTeam: {
          id: event.home_team_id != null ? String(event.home_team_id) : 'unknown',
          name: event.home_team || 'Home Team',
          city: '', // ❌ Not provided in response
          abbreviation: event.home_team?.substring(0, 3).toUpperCase() || 'HOM',
          league: (this.sportId === '2' ? 'NFL' : 'CFB') as SportType
        },
        awayTeam: {
          id: event.away_team_id != null ? String(event.away_team_id) : 'unknown',
          name: event.away_team || 'Away Team',
          city: '', // ❌ Not provided in response
          abbreviation: event.away_team?.substring(0, 3).toUpperCase() || 'AWY',
          league: (this.sportId === '2' ? 'NFL' : 'CFB') as SportType
        },
        league: (this.sportId === '2' ? 'NFL' : 'CFB') as SportType,
        gameDate: new Date(event.date_event),
        status: this.mapEventStatus(event.event_status),
        statusDetail: event.event_status_detail || '', // ✅ Added for better UI
        homeScore: event.home_score ?? 0,
        awayScore: event.away_score ?? 0,
        venue: event.event_location || 'TBD',
        broadcast: event.broadcast || 'N/A' // ✅ Added for live game info
      }
    })
  }
  

  async getAllBettingLines(eventId: string): Promise<any[]> {
    try {
      const eventData = await this.makeRequest(`/events/${eventId}?include=scores%2Call_periods`)
      
      if (!eventData || !eventData.lines) {
        return []
      }

      const allLines = []
      for (const [affiliateId, lineData] of Object.entries(eventData.lines)) {
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

  async getBettingData(eventId: string): Promise<BettingData | null> {
    try {
      // Fetch event data with lines included
      const eventData = await this.makeRequest(`/events/${eventId}?include=scores%2Call_periods`)
      
      if (!eventData || !eventData.lines) {
        console.log('No betting lines found for event:', eventId)
        return null
      }

      // Get the first available sportsbook line (prioritize major books)
      const prioritySportsbooks = ['22', '23', '19', '3', '2'] // BetMGM, FanDuel, DraftKings, Pinnacle, Bovada
      let selectedLine = null
      
      // Try to find a line from priority sportsbooks first
      for (const bookId of prioritySportsbooks) {
        if (eventData.lines[bookId]) {
          selectedLine = eventData.lines[bookId]
          break
        }
      }
      
      // If no priority book found, use the first available line
      if (!selectedLine) {
        const firstLineKey = Object.keys(eventData.lines)[0]
        selectedLine = eventData.lines[firstLineKey]
      }

      if (!selectedLine) {
        console.log('No valid betting line found for event:', eventId)
        return null
      }

      // Extract betting data from the selected line
      const spread = selectedLine.spread || {}
      const moneyline = selectedLine.moneyline || {}
      const total = selectedLine.total || {}
      const affiliate = selectedLine.affiliate || {}

      // Parse actual betting values from delta fields
      // Looking at the API response, delta fields contain the actual betting values
      const parseValue = (deltaValue: number, defaultValue: number = 0) => {
        if (deltaValue === 0.0001 || deltaValue === 0) return defaultValue
        return deltaValue
      }

      // For spread - home team gets negative spread, away team gets positive
      const homeSpread = parseValue(spread.point_spread_home_delta || 0)
      const awaySpread = parseValue(spread.point_spread_away_delta || 0)
      
      // For moneyline - values can be positive (underdog) or negative (favorite)
      const homeMoneyline = parseValue(moneyline.moneyline_home_delta || 0)
      const awayMoneyline = parseValue(moneyline.moneyline_away_delta || 0)
      
      // For totals - the total points line
      const totalPoints = Math.abs(parseValue(total.total_over_delta || 0, 50)) // Use absolute value for total points
      const overMoney = parseValue(total.total_over_money_delta || -110, -110)
      const underMoney = parseValue(total.total_under_money_delta || -110, -110)

      return {
        gameId: eventId,
        spread: {
          home: homeSpread,
          away: awaySpread,
          juice: parseValue(spread.point_spread_home_money_delta || -110, -110)
        },
        moneyLine: {
          home: homeMoneyline,
          away: awayMoneyline
        },
        total: {
          over: overMoney,
          under: underMoney,
          points: totalPoints
        },
        publicBets: {
          homePercentage: 50, // API doesn't provide public betting percentages
          awayPercentage: 50
        },
        handle: {
          homePercentage: 50, // API doesn't provide handle percentages
          awayPercentage: 50
        },
        reverseLineMovement: false, // Would need historical data to determine this
        sportsbook: {
          name: affiliate.affiliate_name || 'Unknown',
          url: affiliate.affiliate_url || '',
          affiliateId: selectedLine.affiliate_id || ''
        }
      }
    } catch (error) {
      console.error('Error fetching betting data:', error)
      return null
    }
  }

  async getTeams(): Promise<Team[]> {
    const endpoint = `/sports/${this.sportId}/teams`
    const data = await this.makeRequest(endpoint)
    
    return data.teams?.map((team: any) => ({
      id: team.team_id?.toString() || team.team_id,
      name: team.name,
      city: team.mascot || '',
      abbreviation: team.abbreviation,
      league: (this.sportId === '2' ? 'NFL' : 'CFB') as SportType,
      logoUrl: team.logo_url,
      primaryColor: team.primary_color,
      secondaryColor: team.secondary_color,
      mascot: team.mascot,
      record: team.record,
      conference: team.conference ? {
        conference_id: team.conference.conference_id,
        division_id: team.conference.division_id,
        sport_id: team.conference.sport_id,
        name: team.conference.name
      } : undefined,
      division: team.division ? {
        division_id: team.division.division_id,
        sport_id: team.division.sport_id,
        name: team.division.name
      } : undefined
    })) || []
  }

  async getTeamStats(): Promise<TeamStats[]> {
    console.log('Getting team stats...')
    try {
      // First get all teams
      const teams = await this.getTeams()
      console.log(`Found ${teams.length} teams, will get stats for first 10`)
      const teamStats: TeamStats[] = []
      
      // For each team, get their individual stats
      for (const team of teams.slice(0, 10)) { // Limit to first 10 teams to avoid rate limiting
        try {
          const endpoint = `/v2/teams/${team.id}/stats`
          console.log(`Fetching stats for team ${team.id} (${team.name})`)
          const data = await this.makeRequest(endpoint)
          
          if (data && data.stats) {
            console.log(`Got real stats for team ${team.id}`)
            teamStats.push({
              teamId: team.id,
              season: new Date().getFullYear().toString(),
              games: data.stats.games_played || 0,
              wins: data.stats.wins || 0,
              losses: data.stats.losses || 0,
              winPercentage: data.stats.win_percentage || 0,
              pointsFor: data.stats.points_for || 0,
              pointsAgainst: data.stats.points_against || 0,
              yardsFor: data.stats.total_yards_offense || 0,
              yardsAgainst: data.stats.total_yards_defense || 0,
              turnovers: data.stats.turnovers || 0,
              turnoverDifferential: data.stats.turnover_differential || 0
            })
          } else {
            console.log(`No stats data for team ${team.id}, generating sample stats`)
            teamStats.push(this.getSampleTeamStats(team.id, team.name))
          }
        } catch (error) {
          console.error(`Failed to get stats for team ${team.id}:`, error)
          console.log(`Using sample stats for team ${team.id} due to API error`)
          teamStats.push(this.getSampleTeamStats(team.id, team.name))
        }
      }
      
      console.log(`Returning ${teamStats.length} team stats`)
      return teamStats
    } catch (error) {
      console.error('Error in getTeamStats:', error)
      console.log('Returning sample team stats due to error')
      return this.getSampleTeamStatsForMultipleTeams()
    }
  }

  private getSampleTeamStats(teamId: string, teamName: string): TeamStats {
    return {
      teamId: teamId,
      season: new Date().getFullYear().toString(),
      games: 12,
      wins: Math.floor(Math.random() * 10) + 2,
      losses: Math.floor(Math.random() * 8) + 2,
      winPercentage: Math.random() * 0.6 + 0.3, // 30% to 90%
      pointsFor: Math.floor(Math.random() * 200) + 250, // 250-450 points
      pointsAgainst: Math.floor(Math.random() * 150) + 200, // 200-350 points
      yardsFor: Math.floor(Math.random() * 2000) + 3000, // 3000-5000 yards
      yardsAgainst: Math.floor(Math.random() * 1500) + 2500, // 2500-4000 yards
      turnovers: Math.floor(Math.random() * 15) + 5, // 5-20 turnovers
      turnoverDifferential: Math.floor(Math.random() * 21) - 10 // -10 to +10
    }
  }

  private getSampleTeamStatsForMultipleTeams(): TeamStats[] {
    const sampleTeamIds = ['95', '96', '97', '98', '99', '100', '101', '102', '103', '104']
    const teamNames = ['Alabama', 'Michigan', 'Ohio State', 'Georgia', 'Texas', 'Oklahoma', 'Notre Dame', 'USC', 'Florida', 'LSU']
    
    return sampleTeamIds.map((teamId, index) => 
      this.getSampleTeamStats(teamId, teamNames[index] || `Team ${teamId}`)
    )
  }

  async getTeamStatsByTeamId(teamId: string): Promise<TeamStats | null> {
    try {
      const endpoint = `/v2/teams/${teamId}/stats`
      const data = await this.makeRequest(endpoint)
      
      if (data && data.stats) {
        return {
          teamId: teamId,
          season: new Date().getFullYear().toString(),
          games: data.stats.games_played || 0,
          wins: data.stats.wins || 0,
          losses: data.stats.losses || 0,
          winPercentage: data.stats.win_percentage || 0,
          pointsFor: data.stats.points_for || 0,
          pointsAgainst: data.stats.points_against || 0,
          yardsFor: data.stats.total_yards_offense || 0,
          yardsAgainst: data.stats.total_yards_defense || 0,
          turnovers: data.stats.turnovers || 0,
          turnoverDifferential: data.stats.turnover_differential || 0
        }
      }
      return null
    } catch (error) {
      console.error(`Failed to get stats for team ${teamId}:`, error)
      return null
    }
  }

  async getDetailedTeamStats(teamId: string): Promise<DetailedTeamStat[]> {
    try {
      const endpoint = `/v2/teams/${teamId}/stats`
      const data = await this.makeRequest(endpoint)
      
      if (data && Array.isArray(data)) {
        // The API returns an array of detailed stats
        return data.filter((stat: any) => 
          stat.team_id && 
          stat.stat && 
          stat.value !== undefined && 
          stat.display_value
        ).map((stat: any) => ({
          team_id: stat.team_id,
          stat_id: stat.stat_id,
          stat: {
            id: stat.stat.id,
            name: stat.stat.name,
            category: stat.stat.category,
            display_name: stat.stat.display_name,
            abbreviation: stat.stat.abbreviation,
            description: stat.stat.description,
            sport_id: stat.stat.sport_id
          },
          season_year: stat.season_year,
          season_type: stat.season_type,
          season_type_name: stat.season_type_name,
          value: stat.value,
          display_value: stat.display_value,
          per_game_value: stat.per_game_value,
          per_game_display_value: stat.per_game_display_value,
          rank: stat.rank,
          rank_display_value: stat.rank_display_value,
          updated_at: stat.updated_at
        }))
      }
      return []
    } catch (error) {
      console.error(`Failed to get detailed stats for team ${teamId}:`, error)
      return []
    }
  }

  async getPlayers(teamId?: string): Promise<Player[]> {
    try {
      if (teamId) {
        console.log(`Fetching players for team ${teamId}`)
        // Try to get players for a specific team using the v2 API
        const endpoint = `/v2/teams/${teamId}/players`
        try {
          const data = await this.makeRequest(endpoint)
          console.log(`API response for ${endpoint}:`, data ? 'got data' : 'no data')
          
          if (data && data.players) {
            console.log(`Real API returned ${data.players.length} players for team ${teamId}`)
            return data.players.map((player: any) => ({
              id: player.player_id || player.id,
              name: player.name || `${player.first_name} ${player.last_name}`,
              teamId: teamId,
              position: player.position || '',
              jerseyNumber: parseInt(player.jersey_number || player.number || '') || Math.floor(Math.random() * 99) + 1,
              age: player.age || 0,
              height: player.height || `6'0"`,
              weight: parseInt(player.weight || '200')
            }))
          } else {
            console.log(`API returned no players data for team ${teamId}, using fallback`)
            return this.getSamplePlayersForTeam(teamId)
          }
        } catch (apiError) {
          console.error(`API endpoint ${endpoint} not available:`, apiError)
          console.log(`Using sample data for team ${teamId}`)
          // Return sample players for the selected team
          return this.getSamplePlayersForTeam(teamId)
        }
      } else {
        console.log('No team specified, returning sample players from multiple teams')
        // Return sample players from various teams to show the interface works
        return this.getSamplePlayers()
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      return this.getSamplePlayers()
    }
  }

  private getSamplePlayersForTeam(teamId: string): Player[] {
    const firstNames = ['Jake', 'Mike', 'Tyler', 'Connor', 'Ryan', 'Alex', 'Jordan', 'Brandon', 'Austin', 'Trevor']
    const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson']
    
    const getRandomName = () => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      return `${firstName} ${lastName}`
    }
    
    const samplePlayers = [
      { id: `${teamId}-qb1`, name: getRandomName(), teamId, position: 'QB', jerseyNumber: 12, age: 20, height: `6'2"`, weight: 210 },
      { id: `${teamId}-rb1`, name: getRandomName(), teamId, position: 'RB', jerseyNumber: 23, age: 19, height: `5'11"`, weight: 195 },
      { id: `${teamId}-wr1`, name: getRandomName(), teamId, position: 'WR', jerseyNumber: 17, age: 21, height: `6'0"`, weight: 185 },
      { id: `${teamId}-te1`, name: getRandomName(), teamId, position: 'TE', jerseyNumber: 87, age: 20, height: `6'4"`, weight: 250 },
      { id: `${teamId}-lb1`, name: getRandomName(), teamId, position: 'LB', jerseyNumber: 44, age: 21, height: `6'1"`, weight: 225 }
    ]
    return samplePlayers
  }

  private getSamplePlayers(): Player[] {
    const teams = ['95', '96', '97', '98', '99'] // Sample team IDs
    const allPlayers: Player[] = []
    
    teams.forEach(teamId => {
      allPlayers.push(...this.getSamplePlayersForTeam(teamId))
    })
    
    return allPlayers
  }

  async getPlayerStats(teamId?: string, playerId?: string): Promise<PlayerStats[]> {
    try {
      console.log(`Getting player stats for teamId: ${teamId}, playerId: ${playerId}`)
      
      if (playerId && teamId) {
        // Get stats for a specific player
        console.log(`Fetching stats for specific player ${playerId} on team ${teamId}`)
        const endpoint = `/v2/teams/${teamId}/players/${playerId}/stats`
        try {
          const data = await this.makeRequest(endpoint)
          
          if (data) {
            console.log(`Got real stats for player ${playerId}`)
            return [{
              playerId: playerId,
              season: new Date().getFullYear().toString(),
              games: data.games_played || 0,
              passingYards: data.passing_yards || 0,
              passingTouchdowns: data.passing_touchdowns || 0,
              interceptions: data.interceptions || 0,
              rushingYards: data.rushing_yards || 0,
              rushingTouchdowns: data.rushing_touchdowns || 0,
              receivingYards: data.receiving_yards || 0,
              receivingTouchdowns: data.receiving_touchdowns || 0,
              receptions: data.receptions || 0,
              tackles: data.tackles || 0,
              sacks: data.sacks || 0
            }]
          } else {
            console.log(`No real stats for player ${playerId}, using sample`)
            return this.getSamplePlayerStats(playerId)
          }
        } catch (apiError) {
          console.error(`Player stats API not available:`, apiError)
          console.log(`Using sample stats for player ${playerId}`)
          return this.getSamplePlayerStats(playerId)
        }
      } else if (teamId) {
        // Get stats for all players on a team
        console.log(`Getting stats for all players on team ${teamId}`)
        const players = await this.getPlayers(teamId)
        console.log(`Found ${players.length} players for team ${teamId}, generating stats`)
        
        const playerStats: PlayerStats[] = []
        for (const player of players) {
          playerStats.push(...this.getSamplePlayerStats(player.id))
        }
        
        console.log(`Generated ${playerStats.length} player stats for team ${teamId}`)
        return playerStats
      } else {
        // Return sample stats for multiple players to show the interface works
        console.log('No specific team/player, getting stats for players from multiple teams')
        const allPlayers = await this.getPlayers() // Get players from multiple teams
        console.log(`Found ${allPlayers.length} total players, generating stats for all`)
        
        const playerStats: PlayerStats[] = []
        for (const player of allPlayers) {
          playerStats.push(...this.getSamplePlayerStats(player.id))
        }
        
        console.log(`Generated ${playerStats.length} player stats for all players`)
        return playerStats
      }
    } catch (error) {
      console.error('Error fetching player stats:', error)
      console.log('Returning sample player stats due to error')
      return this.getSamplePlayerStatsForMultiplePlayers()
    }
  }

  private getSamplePlayerStats(playerId?: string): PlayerStats[] {
    if (playerId) {
      return [{
        playerId: playerId,
        season: new Date().getFullYear().toString(),
        games: 12,
        passingYards: Math.floor(Math.random() * 3000 + 1000),
        passingTouchdowns: Math.floor(Math.random() * 25 + 5),
        interceptions: Math.floor(Math.random() * 10 + 2),
        rushingYards: Math.floor(Math.random() * 1000 + 100),
        rushingTouchdowns: Math.floor(Math.random() * 10 + 1),
        receivingYards: Math.floor(Math.random() * 800 + 200),
        receivingTouchdowns: Math.floor(Math.random() * 8 + 1),
        receptions: Math.floor(Math.random() * 50 + 10),
        tackles: Math.floor(Math.random() * 80 + 20),
        sacks: Math.floor(Math.random() * 8 + 1)
      }]
    }
    return []
  }

  private getSamplePlayerStatsForMultiplePlayers(): PlayerStats[] {
    const samplePlayerIds = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8', 'player9', 'player10']
    const allStats: PlayerStats[] = []
    
    samplePlayerIds.forEach(playerId => {
      allStats.push(...this.getSamplePlayerStats(playerId))
    })
    
    return allStats
  }

  async getPlayerGameStats(eventId: string): Promise<any> {
    try {
      const endpoint = `/v2/events/${eventId}/players/stats`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching player game stats:', error)
      return null
    }
  }

  async getTeamGameStats(eventId: string): Promise<any> {
    try {
      const endpoint = `/v2/events/${eventId}/stats`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching team game stats:', error)
      return null
    }
  }

  async getTeamSeasonStats(teamId: string): Promise<any> {
    try {
      const endpoint = `/v2/teams/${teamId}/stats`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching team season stats:', error)
      return null
    }
  }

  async getPlayerSeasonStats(teamId: string): Promise<any> {
    try {
      const endpoint = `/v2/teams/${teamId}/players/stats`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching player season stats:', error)
      return null
    }
  }

  async getHeadToHeadHistory(team1Id: string, team2Id: string): Promise<any[]> {
    try {
      // TheRundown API doesn't have direct H2H endpoint, so we'll simulate this
      // In a real implementation, you might need to fetch historical games and filter
      console.log(`Getting H2H history for teams ${team1Id} vs ${team2Id}`)
      return []
    } catch (error) {
      console.error('Error fetching head-to-head history:', error)
      return []
    }
  }

  async getMatchupAnalysis(homeTeamId: string, awayTeamId: string): Promise<any> {
    try {
      // Get both teams' season stats for comparison
      const [homeStats, awayStats] = await Promise.allSettled([
        this.getTeamSeasonStats(homeTeamId),
        this.getTeamSeasonStats(awayTeamId)
      ])

      const homeTeamStats = homeStats.status === 'fulfilled' ? homeStats.value : null
      const awayTeamStats = awayStats.status === 'fulfilled' ? awayStats.value : null

      // Generate analytical insights based on team stats
      const insights = this.generateMatchupInsights(homeTeamStats, awayTeamStats)

      return {
        homeTeamStats,
        awayTeamStats,
        insights,
        keyMatchups: this.identifyKeyMatchups(homeTeamStats, awayTeamStats)
      }
    } catch (error) {
      console.error('Error generating matchup analysis:', error)
      return null
    }
  }

  private generateMatchupInsights(homeStats: any, awayStats: any): string[] {
    const insights: string[] = []
    
    if (homeStats && awayStats) {
      // Offensive vs Defensive matchups
      if (homeStats.rushing_yards_per_game > awayStats.rushing_defense_yards_per_game) {
        insights.push(`Home team's rushing offense (${homeStats.rushing_yards_per_game} YPG) vs away team's rushing defense (${awayStats.rushing_defense_yards_per_game} YPG allowed) - Advantage: Home`)
      }
      
      if (awayStats.passing_yards_per_game > homeStats.passing_defense_yards_per_game) {
        insights.push(`Away team's passing offense (${awayStats.passing_yards_per_game} YPG) vs home team's passing defense (${homeStats.passing_defense_yards_per_game} YPG allowed) - Advantage: Away`)
      }
      
      // Turnover analysis
      if (homeStats.turnover_margin > awayStats.turnover_margin) {
        insights.push(`Home team has better turnover margin (+${homeStats.turnover_margin} vs ${awayStats.turnover_margin})`)
      }
    }
    
    return insights
  }

  private identifyKeyMatchups(homeStats: any, awayStats: any): any[] {
    return [
      {
        category: 'Rushing Offense vs Rushing Defense',
        homeAdvantage: homeStats?.rushing_yards_per_game || 0,
        awayAdvantage: awayStats?.rushing_defense_yards_per_game || 0,
        advantage: 'home' // Simplified logic
      },
      {
        category: 'Passing Offense vs Passing Defense', 
        homeAdvantage: homeStats?.passing_yards_per_game || 0,
        awayAdvantage: awayStats?.passing_defense_yards_per_game || 0,
        advantage: 'away'
      }
    ]
  }

  async getPredictions(date?: string): Promise<any[]> {
    const endpoint = `/sports/${this.sportId}/predictions`
    const params = date ? { date } : {}
    const data = await this.makeRequest(endpoint, params)
    
    return data.predictions?.map((prediction: any) => ({
      gameId: prediction.event_id,
      homeTeamWinProbability: prediction.home_team_win_probability || 0.5,
      awayTeamWinProbability: prediction.away_team_win_probability || 0.5,
      predictedScore: {
        home: prediction.predicted_home_score || 0,
        away: prediction.predicted_away_score || 0
      },
      confidence: prediction.confidence || 'medium',
      factors: prediction.key_factors || []
    })) || []
  }

  private mapEventStatus(status?: string): Game['status'] {
    if (!status) {
      console.warn('⚠️ Missing status in API response, defaulting to scheduled');
      return 'scheduled';
    }
  
    switch (status.toLowerCase()) {
      case 'status_scheduled':
      case 'scheduled':
      case 'upcoming':
        return 'scheduled';
      case 'status_inprogress':
      case 'status_live':
      case 'inprogress':
      case 'live':
        return 'live';
      case 'status_final':
      case 'status_completed':
      case 'final':
      case 'completed':
        return 'final';
      case 'status_postponed':
      case 'postponed':
        return 'postponed';
      case 'status_cancelled':
      case 'cancelled':
        return 'cancelled';
      default:
        //console.warn(`⚠️ Unknown status: ${status}, defaulting to scheduled`);
        return 'scheduled';
    }
  }
}



// Multi-Sport API service using TheRundown
export class SportsAPI {
  private theRundownCFB: TheRundownAPI
  private theRundownNFL: TheRundownAPI

  constructor() {
    const apiKey = process.env.THERUNDOWN_API_KEY || 'daebc01578mshf1b6929ad17a9f8p19c30bjsn5ab4b86b16e7'
    this.theRundownCFB = new TheRundownAPI(apiKey, '1') // College Football
    this.theRundownNFL = new TheRundownAPI(apiKey, '2') // NFL
  }

  private getAPIClient(sport: SportType): TheRundownAPI {
    switch (sport) {
      case 'CFB':
        return this.theRundownCFB
      case 'NFL':
        return this.theRundownNFL
      default:
        return this.theRundownCFB
    }
  }

  // Games and schedules
  async getGames(sport: SportType = 'CFB', date?: string, limit?: number): Promise<Game[]> {
    const client = this.getAPIClient(sport)
    
    // Get games directly from API - division filtering is now handled at API level for CFB
    const games = await client.getGames(date, limit)
    
    // For CFB, enrich games with additional team data from our teams endpoint
    if (sport === 'CFB') {
      // Get teams data to enrich with division, conference, and other details
      const teams = await this.getTeams(sport)
      const teamsMap = new Map(teams.map(team => [team.id, team]))
      
      // Enrich games with team division data
      const enrichedGames = games.map(game => {
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
      
      return enrichedGames
    }
    
    return games
  }

  // Betting data
  async getBettingData(sport: SportType = 'CFB', eventId: string): Promise<BettingData | null> {
    const client = this.getAPIClient(sport)
    return client.getBettingData(eventId)
  }

  // Get all sportsbook lines for comparison
  async getAllBettingLines(sport: SportType = 'CFB', eventId: string): Promise<any[]> {
    const client = this.getAPIClient(sport)
    return client.getAllBettingLines(eventId)
  }

  // Teams
  async getTeams(sport: SportType = 'CFB'): Promise<Team[]> {
    const client = this.getAPIClient(sport)
    const teams = await client.getTeams()
    
    // Filter CFB teams to only show FBS (division_id: 1) and FCS (division_id: 4)
    if (sport === 'CFB') {
      return teams.filter(team => {
        const divisionId = team.division?.division_id
        return divisionId === 1 || divisionId === 4
      })
    }
    
    return teams
  }

  // Team statistics
  async getTeamStats(sport: SportType = 'CFB'): Promise<TeamStats[]> {
    const client = this.getAPIClient(sport)
    return client.getTeamStats()
  }

  // Individual team statistics by team ID
  async getTeamStatsByTeamId(sport: SportType = 'CFB', teamId: string): Promise<TeamStats | null> {
    const client = this.getAPIClient(sport)
    return client.getTeamStatsByTeamId(teamId)
  }

  // Detailed team statistics by team ID
  async getDetailedTeamStats(sport: SportType = 'CFB', teamId: string): Promise<DetailedTeamStat[]> {
    const client = this.getAPIClient(sport)
    return client.getDetailedTeamStats(teamId)
  }

  // Players
  async getPlayers(sport: SportType = 'CFB', teamId?: string): Promise<Player[]> {
    const client = this.getAPIClient(sport)
    return client.getPlayers(teamId)
  }

  // Player statistics
  async getPlayerStats(sport: SportType = 'CFB', teamId?: string, playerId?: string): Promise<PlayerStats[]> {
    const client = this.getAPIClient(sport)
    return client.getPlayerStats(teamId, playerId)
  }

  // Predictions
  async getPredictions(sport: SportType = 'CFB', date?: string): Promise<any[]> {
    const client = this.getAPIClient(sport)
    return client.getPredictions(date)
  }

  // Enhanced analytics and matchup data
  async getPlayerGameStats(sport: SportType = 'CFB', eventId: string): Promise<any> {
    const client = this.getAPIClient(sport)
    return client.getPlayerGameStats(eventId)
  }

  async getTeamGameStats(sport: SportType = 'CFB', eventId: string): Promise<any> {
    const client = this.getAPIClient(sport)
    return client.getTeamGameStats(eventId)
  }

  async getTeamSeasonStats(sport: SportType = 'CFB', teamId: string): Promise<any> {
    const client = this.getAPIClient(sport)
    return client.getTeamSeasonStats(teamId)
  }

  async getPlayerSeasonStats(sport: SportType = 'CFB', teamId: string): Promise<any> {
    const client = this.getAPIClient(sport)
    return client.getPlayerSeasonStats(teamId)
  }

  async getHeadToHeadHistory(sport: SportType = 'CFB', team1Id: string, team2Id: string): Promise<any[]> {
    const client = this.getAPIClient(sport)
    return client.getHeadToHeadHistory(team1Id, team2Id)
  }

  async getMatchupAnalysis(sport: SportType = 'CFB', homeTeamId: string, awayTeamId: string): Promise<any> {
    const client = this.getAPIClient(sport)
    return client.getMatchupAnalysis(homeTeamId, awayTeamId)
  }
}

export const sportsAPI = new SportsAPI()