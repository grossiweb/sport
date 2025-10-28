// Team Stats Configuration based on team_363__detail_stats.xlsx
// This configuration determines which stats to display and in what order

// Stats to explicitly exclude by their internal name
export const EXCLUDED_STAT_NAMES = [
  'redzoneFieldGoalPct',
  'netPassingYardsPerGame',
  // NFL exclusions to match CFB list
  'touchdowns',
  'sackYardsLost',
  'puntYards',
  'totalYards',
  'passingYards',
  'rushingYards',
  'receivingYards',
  'receivingYardsAfterCatch',
  'yardsPerReception',
  'sackYards',
  'yardsPerKickReturn',
  'yardsPerPuntReturn',
  'interceptionYards',
  'averageKickoffReturnYards',
  'avgKickoffReturnYards',
  'kickoffReturnYards',
  'kickReturnYards',
  'averagePuntYards',
  'avgPuntYards',
  'netAveragePuntYards',
  'netAvgPuntYards',
  'puntReturnYards',
  'averagePuntReturnYards',
  'avgPuntReturnYards',
  'averageInterceptionYards',
  'avgInterceptionYards'
]

export interface StatConfig {
  stat_id: number
  abbreviation: string
  display_name: string
  category: string
  description: string
  priority: number // Lower number = higher priority
  stat_key?: string // Key to identify the stat in team_stats collection (e.g., 'totalPoints')
  display_field?: string // Field to use for display value (e.g., 'per_game_display_value')
}

// CFB/NCAAF Preferred Stats Configuration (based on Excel file)
// These stats are ordered by importance and relevance for matchup analysis
// Note: IDs in Mongo vary per stat; we prioritize by display_name patterns for CFB
export const CFB_PREFERRED_STATS: StatConfig[] = [
  // Key Factors
  { stat_id: -1, abbreviation: 'PTS', display_name: 'Total Points Per Game', category: 'Key Factors', description: 'Points per game', priority: 1, stat_key: 'totalPoints', display_field: 'display_value' },
  // Use percentage stat and prefer per-game display for H2H
  { stat_id: -1, abbreviation: '3RDC%', display_name: 'Third Down Conversion Percentage', category: 'Key Factors', description: 'Third down conversion percentage', priority: 2, display_field: 'per_game_display_value' },
  { stat_id: -1, abbreviation: '', display_name: 'Red Zone Efficiency Percentage', category: 'Key Factors', description: 'Red zone scoring efficiency', priority: 3, display_field: 'per_game_display_value' },
  { stat_id: -1, abbreviation: '', display_name: 'Turnover Ratio', category: 'Key Factors', description: 'Turnover ratio', priority: 4, display_field: 'per_game_display_value' },
  // Calculated opponent/defensive stats
  { stat_id: -1, abbreviation: 'OPP 3RDC%', display_name: 'Opponent Third Down Conversion Percentage', category: 'Key Factors', description: 'Average third down conversion percentage of opponents faced', priority: 5 },
  { stat_id: -2, abbreviation: 'DEF 3RDC%', display_name: 'Defensive Third Down Conversion Percentage', category: 'Key Factors', description: 'Third down conversion percentage allowed to opponents', priority: 6 },
  { stat_id: -3, abbreviation: 'OPP RZ%', display_name: 'Opponent Red Zone Efficiency Percentage', category: 'Key Factors', description: 'Average red zone efficiency percentage of opponents faced', priority: 7 },

  // Offense
  { stat_id: -1, abbreviation: '', display_name: 'Total Touchdowns', category: 'Offense', description: 'Touchdowns per game', priority: 10 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Game', category: 'Offense', description: 'Total yards per game', priority: 11 },
  { stat_id: -1, abbreviation: '', display_name: 'Passing Yards Per Game', category: 'Offense', description: 'Passing yards per game', priority: 12 },
  { stat_id: -1, abbreviation: '', display_name: 'Rushing Yards Per Game', category: 'Offense', description: 'Rushing yards per game', priority: 13 },
  { stat_id: -1, abbreviation: '', display_name: 'Completion Percentage', category: 'Offense', description: 'Completion %', priority: 14 },
  { stat_id: -1, abbreviation: '', display_name: 'Completions', category: 'Offense', description: 'Completions per game', priority: 15 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Pass Attempt', category: 'Offense', description: 'Yards per completion/attempt', priority: 16 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Rushing Attempt', category: 'Offense', description: 'Yards per rush attempt', priority: 17 },
  { stat_id: -1, abbreviation: '', display_name: 'Sacks', category: 'Offense', description: 'QB sacks per game (allowed)', priority: 19 },

  // Defensive (best-effort mapping based on available fields)
  { stat_id: -1, abbreviation: '', display_name: 'Sacks', category: 'Defensive', description: 'Sacks per game', priority: 30 },

  // Special Teams
  { stat_id: -1, abbreviation: '', display_name: 'Field Goal Attempts', category: 'Special Teams', description: 'FG Attempts per game', priority: 40 },
  { stat_id: -1, abbreviation: '', display_name: 'Field Goal Percentage', category: 'Special Teams', description: 'FG Conversion %', priority: 41 },

  // Turnovers & Penalties
  { stat_id: -1, abbreviation: '', display_name: 'Fumbles Lost', category: 'Turnovers & Penalties', description: 'Fumbles lost per game', priority: 50 },
  { stat_id: -1, abbreviation: '', display_name: 'Fumbles', category: 'Turnovers & Penalties', description: 'Total fumbles per game', priority: 51 },
  { stat_id: -1, abbreviation: '', display_name: 'Interceptions', category: 'Turnovers & Penalties', description: 'Thrown interceptions per game', priority: 52 },
  { stat_id: -1, abbreviation: '', display_name: 'TO Margin', category: 'Turnovers & Penalties', description: 'Turnover margin', priority: 53 },
  { stat_id: -1, abbreviation: '', display_name: 'Total Penalties', category: 'Turnovers & Penalties', description: 'Penalties per game', priority: 54 },
  { stat_id: -1, abbreviation: '', display_name: 'Total Penalty Yards', category: 'Turnovers & Penalties', description: 'Penalty yards per game', priority: 55 }
]

// NFL Preferred Stats Configuration (similar structure but different priorities)
export const NFL_PREFERRED_STATS: StatConfig[] = [
  // Key Factors - for NFL H2H (Third Down Conversions & Attempts excluded from H2H view)
  // Turnover Ratio is last in the list
  { stat_id: 1106, abbreviation: 'PTS', display_name: 'Total Points', category: 'Key Factors', description: 'Total points scored', priority: 1 },
  { stat_id: 32, abbreviation: '3RDC%', display_name: 'Third Down Conversion Percentage', category: 'Key Factors', description: 'Third down conversion percentage', priority: 2, display_field: 'per_game_display_value' },
  { stat_id: -101, abbreviation: 'OPP 3RDC%', display_name: 'Opponent Third Down Conversion Percentage', category: 'Key Factors', description: 'Average third down conversion percentage of opponents faced', priority: 3 },
  { stat_id: 1156, abbreviation: 'RZEFF%', display_name: 'Red Zone Efficiency Percentage', category: 'Key Factors', description: 'Red zone efficiency percentage', priority: 4, stat_key: 'redzoneEfficiencyPct', display_field: 'per_game_display_value' },
  { stat_id: -103, abbreviation: 'OPP RZ%', display_name: 'Opponent Red Zone Efficiency Percentage', category: 'Key Factors', description: 'Average red zone efficiency percentage of opponents faced', priority: 5 },
  { stat_id: 34, abbreviation: 'TO', display_name: 'Turnover Ratio', category: 'Key Factors', description: 'Turnover ratio', priority: 6, display_field: 'per_game_display_value' },
  // Third Down raw counts (excluded from H2H but available in config)
  { stat_id: 30, abbreviation: '3RDC', display_name: 'Third Down Conversions', category: 'Key Factors', description: '3rd down conversions', priority: 50 },
  { stat_id: 31, abbreviation: '3RDA', display_name: 'Third Down Attempts', category: 'Key Factors', description: '3rd down attempts', priority: 51 },
  
  // Offense
  { stat_id: -1, abbreviation: 'PTS', display_name: 'Total Points', category: 'Offense', description: 'Total points scored', priority: 10 },
  { stat_id: -1, abbreviation: 'KPTS', display_name: 'Kicking Points', category: 'Offense', description: 'Points from kicking', priority: 11 },
  { stat_id: -1, abbreviation: 'TD', display_name: 'Total Touchdowns', category: 'Offense', description: 'Total touchdowns scored', priority: 12 },
  { stat_id: -1, abbreviation: 'YDS', display_name: 'Yards', category: 'Offense', description: 'Total yards', priority: 13 },
  { stat_id: -1, abbreviation: 'PYDS', display_name: 'Passing Yards', category: 'Offense', description: 'Total passing yards', priority: 14 },
  { stat_id: -1, abbreviation: 'RYDS', display_name: 'Rushing Yards', category: 'Offense', description: 'Total rushing yards', priority: 15 },
  { stat_id: -1, abbreviation: 'RECYDS', display_name: 'Receiving Yards', category: 'Offense', description: 'Total receiving yards', priority: 16 },
  { stat_id: -1, abbreviation: 'CMP%', display_name: 'Completion Percentage', category: 'Offense', description: 'Pass completion percentage', priority: 17 },
  { stat_id: -1, abbreviation: 'CMP', display_name: 'Completions', category: 'Offense', description: 'Pass completions', priority: 18 },
  { stat_id: -1, abbreviation: 'YPA', display_name: 'Yards Per Pass Attempt', category: 'Offense', description: 'Yards per pass attempt', priority: 19 },
  { stat_id: -1, abbreviation: 'YPRA', display_name: 'Yards Per Rushing Attempt', category: 'Offense', description: 'Yards per rushing attempt', priority: 20 },
  { stat_id: -1, abbreviation: 'PEN', display_name: 'Total Penalties', category: 'Offense', description: 'Total penalties', priority: 21 },
  
  // Special Teams
  { stat_id: -1, abbreviation: 'FG%', display_name: 'Field Goal Percentage', category: 'Special Teams', description: 'Field goal percentage', priority: 30 },
  { stat_id: -1, abbreviation: 'FGA', display_name: 'Field Goal Attempts', category: 'Special Teams', description: 'Field goal attempts', priority: 31 },
  { stat_id: -1, abbreviation: 'FGA1-19', display_name: 'Field Goal Attempts 1-19', category: 'Special Teams', description: 'Field goal attempts 1-19 yards', priority: 32 },
  { stat_id: -1, abbreviation: 'FGA20-29', display_name: 'Field Goal Attempts 20-29', category: 'Special Teams', description: 'Field goal attempts 20-29 yards', priority: 33 },
  { stat_id: -1, abbreviation: 'FGA30-39', display_name: 'Field Goal Attempts 30-39', category: 'Special Teams', description: 'Field goal attempts 30-39 yards', priority: 34 },
  { stat_id: -1, abbreviation: 'FGA40-49', display_name: 'Field Goal Attempts 40-49', category: 'Special Teams', description: 'Field goal attempts 40-49 yards', priority: 35 },
  { stat_id: -1, abbreviation: 'FGA50+', display_name: 'Field Goal Attempts 50+', category: 'Special Teams', description: 'Field goal attempts 50+ yards', priority: 36 },
  { stat_id: -1, abbreviation: 'PRFL', display_name: 'Punt Return Fumbles Lost', category: 'Special Teams', description: 'Punt return fumbles lost', priority: 37 },
  
  // Turnovers & Penalties
  { stat_id: -1, abbreviation: 'KRFL', display_name: 'Kick Return Fumbles Lost', category: 'Turnovers & Penalties', description: 'Kick return fumbles lost', priority: 40 },
  { stat_id: -1, abbreviation: 'PFL', display_name: 'Passing Fumbles Lost', category: 'Turnovers & Penalties', description: 'Passing fumbles lost', priority: 41 },
  { stat_id: -1, abbreviation: 'RUFL', display_name: 'Rushing Fumbles Lost', category: 'Turnovers & Penalties', description: 'Rushing fumbles lost', priority: 42 },
  { stat_id: -1, abbreviation: 'REFL', display_name: 'Receiving Fumbles Lost', category: 'Turnovers & Penalties', description: 'Receiving fumbles lost', priority: 43 },
  { stat_id: -1, abbreviation: 'FL', display_name: 'Fumbles Lost', category: 'Turnovers & Penalties', description: 'Total fumbles lost', priority: 44 },
  { stat_id: -1, abbreviation: 'FUM', display_name: 'Fumbles', category: 'Turnovers & Penalties', description: 'Total fumbles', priority: 45 },
  { stat_id: -1, abbreviation: 'FF', display_name: 'Forced Fumbles', category: 'Turnovers & Penalties', description: 'Forced fumbles', priority: 46 },
  { stat_id: -1, abbreviation: 'FR', display_name: 'Fumbles Recovered', category: 'Turnovers & Penalties', description: 'Fumbles recovered', priority: 47 },
  { stat_id: -1, abbreviation: 'FTD', display_name: 'Fumbles Touchdowns', category: 'Turnovers & Penalties', description: 'Fumbles returned for touchdowns', priority: 48 },
  { stat_id: -1, abbreviation: 'RUFUM', display_name: 'Rushing Fumbles', category: 'Turnovers & Penalties', description: 'Rushing fumbles', priority: 49 },
  { stat_id: -1, abbreviation: 'RECFUM', display_name: 'Receiving Fumbles', category: 'Turnovers & Penalties', description: 'Receiving fumbles', priority: 50 },
  { stat_id: -1, abbreviation: 'INT', display_name: 'Interceptions', category: 'Turnovers & Penalties', description: 'Interceptions thrown', priority: 51 },
  { stat_id: -1, abbreviation: 'PENYDS', display_name: 'Total Penalty Yards', category: 'Turnovers & Penalties', description: 'Total penalty yards', priority: 52 },
]

// NBA Preferred Stats Configuration (from NBA_Stats_list.txt)
export const NBA_PREFERRED_STATS: StatConfig[] = [
  // General
  { stat_id: -1, abbreviation: '', display_name: 'Rebounds Per Game', category: 'General', description: 'The average rebounds per game.', priority: 1 },
  { stat_id: -1, abbreviation: '', display_name: 'Assist To Turnover Ratio', category: 'General', description: 'Assists per turnover.', priority: 2 },
  { stat_id: -1, abbreviation: '', display_name: 'Fouls Per Game', category: 'General', description: 'The average fouls committed per game.', priority: 3 },
  { stat_id: -1, abbreviation: '', display_name: 'Games Played', category: 'General', description: 'Games Played.', priority: 4 },
  { stat_id: -1, abbreviation: '', display_name: 'Games Started', category: 'General', description: 'The number of games started.', priority: 5 },
  { stat_id: -1, abbreviation: '', display_name: 'Minutes', category: 'General', description: 'The total number of minutes played.', priority: 6 },
  { stat_id: -1, abbreviation: '', display_name: 'Minutes Per Game', category: 'General', description: 'The average number of minutes per game.', priority: 7 },
  { stat_id: -1, abbreviation: '', display_name: 'Rebounds', category: 'General', description: 'Total rebounds.', priority: 8 },
  
  // Offense
  { stat_id: -1, abbreviation: '', display_name: 'Free Throw %', category: 'Offense', description: 'FTM / FTA.', priority: 20 },
  { stat_id: -1, abbreviation: '', display_name: '3-Point Field Goal Percentage', category: 'Offense', description: '3PM / 3PA.', priority: 21 },
  { stat_id: -1, abbreviation: '', display_name: 'Average Field Goals Made', category: 'Offense', description: 'FGM per game.', priority: 22 },
  { stat_id: -1, abbreviation: '', display_name: 'Average Field Goals Attempted', category: 'Offense', description: 'FGA per game.', priority: 23 },
  { stat_id: -1, abbreviation: '', display_name: 'Average 3-Point Field Goals Made', category: 'Offense', description: '3PM per game.', priority: 24 },
  { stat_id: -1, abbreviation: '', display_name: 'Average 3-Point Field Goals Attempted', category: 'Offense', description: '3PA per game.', priority: 25 },
  { stat_id: -1, abbreviation: '', display_name: 'Average Free Throws Made', category: 'Offense', description: 'FTM per game.', priority: 26 },
  { stat_id: -1, abbreviation: '', display_name: 'Average Free Throws Attempted', category: 'Offense', description: 'FTA per game.', priority: 27 },
  { stat_id: -1, abbreviation: '', display_name: 'Points Per Game', category: 'Offense', description: 'Average points per game.', priority: 28 },
  { stat_id: -1, abbreviation: '', display_name: 'Offensive Rebounds Per Game', category: 'Offense', description: 'Average offensive rebounds per game.', priority: 29 },
  { stat_id: -1, abbreviation: '', display_name: 'Assists Per Game', category: 'Offense', description: 'Average assists per game.', priority: 30 },
  { stat_id: -1, abbreviation: '', display_name: 'Turnovers Per Game', category: 'Offense', description: 'Average turnovers per game.', priority: 31 },
  { stat_id: -1, abbreviation: '', display_name: '2-Point Field Goal Percentage', category: 'Offense', description: 'Two-point FG%.', priority: 32 },
  { stat_id: -1, abbreviation: '', display_name: 'Scoring Efficiency', category: 'Offense', description: 'Scoring efficiency.', priority: 33 },
  { stat_id: -1, abbreviation: '', display_name: 'Shooting Efficiency', category: 'Offense', description: 'Shooting efficiency.', priority: 34 },
  { stat_id: -1, abbreviation: '', display_name: 'Field Goal %', category: 'Offense', description: 'FGM / FGA.', priority: 35 },
  { stat_id: -1, abbreviation: '', display_name: '2-Point Field Goals Made', category: 'Offense', description: '2PM.', priority: 36 },
  { stat_id: -1, abbreviation: '', display_name: '2-Point Field Goals Attempted', category: 'Offense', description: '2PA.', priority: 37 },
  { stat_id: -1, abbreviation: '', display_name: 'Points', category: 'Offense', description: 'Total points.', priority: 38 },
  { stat_id: -1, abbreviation: '', display_name: 'Offensive Rebounds', category: 'Offense', description: 'Offensive rebounds total.', priority: 39 },
  { stat_id: -1, abbreviation: '', display_name: 'Assists', category: 'Offense', description: 'Assists total.', priority: 40 },
  { stat_id: -1, abbreviation: '', display_name: 'Turnovers', category: 'Offense', description: 'Turnovers total.', priority: 41 },
  { stat_id: -1, abbreviation: '', display_name: 'Field Goals Made', category: 'Offense', description: 'FGM.', priority: 42 },
  { stat_id: -1, abbreviation: '', display_name: 'Field Goals Attempted', category: 'Offense', description: 'FGA.', priority: 43 },
  { stat_id: -1, abbreviation: '', display_name: 'Free Throws Made', category: 'Offense', description: 'FTM.', priority: 44 },
  { stat_id: -1, abbreviation: '', display_name: 'Free Throws Attempted', category: 'Offense', description: 'FTA.', priority: 45 },
  { stat_id: -1, abbreviation: '', display_name: '3-Point Field Goals Made', category: 'Offense', description: '3PM.', priority: 46 },
  { stat_id: -1, abbreviation: '', display_name: '3-Point Field Goals Attempted', category: 'Offense', description: '3PA.', priority: 47 },
  { stat_id: -1, abbreviation: '', display_name: 'Three Point %', category: 'Offense', description: '3PM / 3PA.', priority: 48 },
  { stat_id: -1, abbreviation: '', display_name: '2-Point Field Goals Made per Game', category: 'Offense', description: '2PM per game.', priority: 49 },
  { stat_id: -1, abbreviation: '', display_name: '2-Point Field Goals Attempted per Game', category: 'Offense', description: '2PA per game.', priority: 50 },

  // Defense
  { stat_id: -1, abbreviation: '', display_name: 'Defensive Rebounds Per Game', category: 'Defense', description: 'Average defensive rebounds per game.', priority: 60 },
  { stat_id: -1, abbreviation: '', display_name: 'Blocks Per Game', category: 'Defense', description: 'Average blocks per game.', priority: 61 },
  { stat_id: -1, abbreviation: '', display_name: 'Steals Per Game', category: 'Defense', description: 'Average steals per game.', priority: 62 },
  { stat_id: -1, abbreviation: '', display_name: 'Defensive Rebounds', category: 'Defense', description: 'Defensive rebounds total.', priority: 63 },
  { stat_id: -1, abbreviation: '', display_name: 'Steals', category: 'Defense', description: 'Steals total.', priority: 64 },
  { stat_id: -1, abbreviation: '', display_name: 'Blocks', category: 'Defense', description: 'Blocks total.', priority: 65 },
]

// Helper function to get preferred stats by sport
export function getPreferredStats(sport: 'CFB' | 'NFL' | 'NBA'): StatConfig[] {
  if (sport === 'NFL') return NFL_PREFERRED_STATS
  if (sport === 'NBA') return NBA_PREFERRED_STATS
  return CFB_PREFERRED_STATS
}

// Display names to explicitly exclude (for NFL to match CFB)
export const EXCLUDED_DISPLAY_NAMES = [
  'Touchdowns',  // Different from "Total Touchdowns"
  'Sack Yards Lost',
  'Total Yards',  // Different from "Yards"
  'Receiving Yards After Catch',
  'Yards Per Reception',
  'Sack Yards',
  'Yards Per Kick Return',
  'Yards Per Punt Return',
  'Average Kickoff Return Yards',
  'Kickoff Return Yards',
  'Average Punt Yards',
  'Net Average Punt Yards',
  'Punt Return Yards',
  'Average Punt Return Yards',
  'Average Interception Yards'
]

// Helper function to filter and sort stats based on preferred configuration
export function filterAndSortStats(stats: any[], sport: 'CFB' | 'NFL' | 'NBA'): any[] {
  // First, filter out explicitly excluded stats (by internal name and display name)
  const nonExcluded = stats.filter(stat => {
    const statName = stat?.stat?.name
    const displayName = stat?.stat?.display_name
    return (!statName || !EXCLUDED_STAT_NAMES.includes(statName)) &&
           (!displayName || !EXCLUDED_DISPLAY_NAMES.includes(displayName))
  })
  
  const preferredStats = getPreferredStats(sport)
  // For CFB, prefer matching by display_name keywords since stat_ids vary
  if (sport === 'CFB') {
    const byPriority = (stat: any): number => {
      const labelLower = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
      const abbrLower = (stat?.stat?.abbreviation || '').toLowerCase()
      const internalNameLower = (stat?.stat?.name || '').toLowerCase()
      
      // Try exact internal name matches first
      if (internalNameLower === 'thirddownconvpct') {
        const match = preferredStats.find(p => p.abbreviation?.toLowerCase() === '3rdc%')
        return match?.priority ?? 999
      }
      if (internalNameLower === 'totalpointspergame') {
        const match = preferredStats.find(p => p.abbreviation?.toLowerCase() === 'pts')
        return match?.priority ?? 999
      }
      
      const entry = preferredStats.find(p => {
        const prefLabel = p.display_name.toLowerCase().replace('%', '')
        const prefAbbr = (p.abbreviation || '').toLowerCase()
        return (
          (prefLabel && labelLower.includes(prefLabel)) ||
          (prefAbbr && abbrLower === prefAbbr)
        )
      })
      return entry?.priority ?? 999
    }
    const filtered = nonExcluded.filter(stat => byPriority(stat) !== 999)
    return filtered.sort((a, b) => byPriority(a) - byPriority(b))
  }

  if (sport === 'NBA') {
    const loweredToPriority = new Map<string, number>()
    preferredStats.forEach(p => loweredToPriority.set(p.display_name.toLowerCase(), p.priority))
    const byPriority = (stat: any): number => {
      const name = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
      if (!name) return 999
      return loweredToPriority.get(name) ?? 999
    }
    const filtered = nonExcluded.filter(stat => byPriority(stat) !== 999)
    return filtered.sort((a, b) => byPriority(a) - byPriority(b))
  }

  if (sport === 'NFL') {
    const byPriority = (stat: any): number => {
      const labelLower = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
      const abbrLower = (stat?.stat?.abbreviation || '').toLowerCase()
      const internalNameLower = (stat?.stat?.name || '').toLowerCase()

      // Helpful exact internal name matches
      if (internalNameLower === 'thirddownconvpct') {
        const match = preferredStats.find(p => (p.display_name.toLowerCase().includes('third down conversion percentage')))
        return match?.priority ?? 999
      }

      // Try exact display name match first (most specific)
      const exactMatch = preferredStats.find(p => {
        const prefLabel = p.display_name.toLowerCase()
        return prefLabel === labelLower
      })
      if (exactMatch) return exactMatch.priority

      // Then try abbreviation match
      const abbrMatch = preferredStats.find(p => {
        const prefAbbr = (p.abbreviation || '').toLowerCase()
        return prefAbbr && abbrLower === prefAbbr
      })
      if (abbrMatch) return abbrMatch.priority

      // Finally try partial match (least specific)
      const partialMatch = preferredStats.find(p => {
        const prefLabel = p.display_name.toLowerCase()
        return prefLabel && labelLower.includes(prefLabel)
      })
      return partialMatch?.priority ?? 999
    }
    const filtered = nonExcluded.filter(stat => byPriority(stat) !== 999)
    return filtered.sort((a, b) => byPriority(a) - byPriority(b))
  }

  // Default behavior: by stat_id/abbreviation (for other sports)
  const preferredStatIds = new Set(preferredStats.map(s => s.stat_id))
  const preferredAbbreviations = new Set(preferredStats.map(s => s.abbreviation))
  const filteredStats = nonExcluded.filter(stat =>
    preferredStatIds.has(stat.stat_id) ||
    preferredAbbreviations.has(stat.stat?.abbreviation)
  )
  return filteredStats.sort((a, b) => {
    const aPriority = preferredStats.find(p =>
      p.stat_id === a.stat_id || p.abbreviation === a.stat?.abbreviation
    )?.priority || 999
    const bPriority = preferredStats.find(p =>
      p.stat_id === b.stat_id || p.abbreviation === b.stat?.abbreviation
    )?.priority || 999
    return aPriority - bPriority
  })
}

// Categories for grouping stats
export const STAT_CATEGORIES = {
  // New CFB categories
  KEY_FACTORS: 'Key Factors',
  OFFENSE: 'Offense',
  DEFENSIVE: 'Defensive',
  SPECIAL_TEAMS: 'Special Teams',
  TURNOVERS_PENALTIES: 'Turnovers & Penalties',

  // Legacy categories (NFL and fallback)
  DEFENSE: 'Defense',
  EFFICIENCY: 'Efficiency',
  DISCIPLINE: 'Discipline',
  CONTROL: 'Control'
} as const

// Map a CFB stat to one of the requested categories using display_name heuristics
export function mapCfbStatToCategory(stat: any): string {
  const label = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
  if (!label) return STAT_CATEGORIES.OFFENSE

  // Key Factors (only 4 stats)
  if (label.includes('points per game') || label.includes('total points per game')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('third down conversion') || label.includes('3rd down %') || label.includes('third down conversion percentage')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('red zone efficiency') || (label.includes('red zone') && label.includes('percentage'))) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('turnover ratio')) return STAT_CATEGORIES.KEY_FACTORS

  // Special Teams
  if (label.includes('field goal') || label.includes('punting') || label.includes('punt')) return STAT_CATEGORIES.SPECIAL_TEAMS

  // Turnovers & Penalties
  if (label.includes('fumble') || label.includes('interception') || label.includes('penalty')) return STAT_CATEGORIES.TURNOVERS_PENALTIES

  // Defensive (best-effort)
  if (label.includes('sacks') || label.includes('tackles') || label.includes('tfl')) return STAT_CATEGORIES.DEFENSIVE

  // Offense by default
  return STAT_CATEGORIES.OFFENSE
}

// Map an NFL stat to categories using Key Factors and other groupings
export function mapNflStatToCategory(stat: any): string {
  const label = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
  const internalName = (stat?.stat?.name || '').toLowerCase()
  const originalCategory = stat.stat?.category || 'Offense'
  
  if (!label) return originalCategory === 'miscellaneous' ? 'Offense' : originalCategory

  // Key Factors (8 stats in exact order) - match by display name or internal name
  // 1. Total Points (not "per game")
  if (label === 'total points' || internalName === 'totalpoints') return STAT_CATEGORIES.KEY_FACTORS
  // 2. Third Down Conversion Percentage (includes "3rd down %")
  if ((label.includes('third down conversion percentage') || label.includes('3rd down conversion percentage') || label.includes('3rd down %') || internalName === 'thirddownconvpct') && !label.includes('opponent')) return STAT_CATEGORIES.KEY_FACTORS
  // 3. Opponent Third Down Conversion Percentage
  if (label.includes('opponent third down conversion percentage') || label.includes('opponent 3rd down conversion percentage')) return STAT_CATEGORIES.KEY_FACTORS
  // 4. Third Down Conversions
  if ((label === 'third down conversions' || label === '3rd down conversions' || internalName === 'thirddownconvs') && !label.includes('percentage') && !label.includes('%')) return STAT_CATEGORIES.KEY_FACTORS
  // 5. Third Down Attempts
  if (label === 'third down attempts' || label === '3rd down attempts' || internalName === 'thirddownattempts') return STAT_CATEGORIES.KEY_FACTORS
  // 6. Red Zone Efficiency Percentage
  if ((label.includes('red zone efficiency percentage') || internalName === 'redzoneefficiencypct') && !label.includes('opponent')) return STAT_CATEGORIES.KEY_FACTORS
  // 7. Opponent Red Zone Efficiency Percentage
  if (label.includes('opponent red zone') && (label.includes('efficiency') || label.includes('scoring')) && label.includes('percentage')) return STAT_CATEGORIES.KEY_FACTORS
  // 8. Turnover Ratio
  if (label.includes('turnover ratio') || internalName === 'turnoverdifferential') return STAT_CATEGORIES.KEY_FACTORS

  // Special Teams stats
  if (label.includes('field goal') || label.includes('punt return fumbles')) return STAT_CATEGORIES.SPECIAL_TEAMS
  
  // Turnovers & Penalties stats
  if (label.includes('fumble') || label.includes('interception') || label.includes('penalty') || label.includes('penalties')) {
    return STAT_CATEGORIES.TURNOVERS_PENALTIES
  }
  
  // Offense stats (includes points, touchdowns, yards, completions, etc.)
  if (label.includes('points') || label.includes('touchdown') || label.includes('yards') || 
      label.includes('completion') || label.includes('passing') || label.includes('rushing') || 
      label.includes('receiving') || label.includes('kick') || label.includes('attempt')) {
    // Exception: fumbles and penalties go to Turnovers & Penalties
    if (label.includes('fumble') || label.includes('penalty')) return STAT_CATEGORIES.TURNOVERS_PENALTIES
    // Exception: field goal attempts go to Special Teams
    if (label.includes('field goal')) return STAT_CATEGORIES.SPECIAL_TEAMS
    return STAT_CATEGORIES.OFFENSE
  }
  
  // Remap miscellaneous stats to appropriate categories
  if (originalCategory === 'miscellaneous') {
    // First downs → Offense
    if (label.includes('first down') || label.includes('1st down')) return STAT_CATEGORIES.OFFENSE
    // Fourth down stats → Offense
    if (label.includes('fourth down') || label.includes('4th down')) return STAT_CATEGORIES.OFFENSE
    // Possession time → Offense
    if (label.includes('possession')) return STAT_CATEGORIES.OFFENSE
    // Red zone stats (non-Key Factors) → Offense
    if (label.includes('red zone')) return STAT_CATEGORIES.OFFENSE
    
    // Default: remap to Offense instead of miscellaneous
    return STAT_CATEGORIES.OFFENSE
  }

  // Default to Offense for other categories
  return STAT_CATEGORIES.OFFENSE
}

// Map an NBA stat to categories using the configured list
export function mapNbaStatToCategory(stat: any): string {
  const label = (stat?.stat?.display_name || stat?.stat?.name || '').trim().toLowerCase()
  if (!label) return 'Offense'
  const pref = NBA_PREFERRED_STATS.find(p => p.display_name.toLowerCase() === label)
  if (pref) return pref.category
  // Heuristics fallback
  if (/rebound|assist|turnover|foul|minutes|games?\s+(played|started)/i.test(label)) return 'General'
  if (/point|field goal|free throw|scoring|shooting|offensive/i.test(label)) return 'Offense'
  if (/defensive|steal|block/i.test(label)) return 'Defense'
  return 'Offense'
}
