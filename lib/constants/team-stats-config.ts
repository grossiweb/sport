// Team Stats Configuration based on team_363__detail_stats.xlsx
// This configuration determines which stats to display and in what order

export interface StatConfig {
  stat_id: number
  abbreviation: string
  display_name: string
  category: string
  description: string
  priority: number // Lower number = higher priority
}

// CFB/NCAAF Preferred Stats Configuration (based on Excel file)
// These stats are ordered by importance and relevance for matchup analysis
// Note: IDs in Mongo vary per stat; we prioritize by display_name patterns for CFB
export const CFB_PREFERRED_STATS: StatConfig[] = [
  // Key Factors
  { stat_id: -1, abbreviation: '', display_name: 'Total Points Per Game', category: 'Key Factors', description: 'Points per game', priority: 1 },
  { stat_id: -1, abbreviation: '', display_name: 'Scoring Margin', category: 'Key Factors', description: 'Average scoring margin', priority: 2 },
  { stat_id: -1, abbreviation: '', display_name: 'Third Down', category: 'Key Factors', description: 'Third down efficiency metrics', priority: 3 },
  { stat_id: -1, abbreviation: '', display_name: 'Fourth Down', category: 'Key Factors', description: 'Fourth down efficiency metrics', priority: 4 },
  { stat_id: -1, abbreviation: '', display_name: 'Red Zone', category: 'Key Factors', description: 'Red zone efficiency metrics', priority: 5 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Play', category: 'Key Factors', description: 'Yards gained per offensive play', priority: 6 },
  { stat_id: -1, abbreviation: '', display_name: 'Turnover Ratio', category: 'Key Factors', description: 'Turnover margin/ratio', priority: 7 },

  // Offense
  { stat_id: -1, abbreviation: '', display_name: 'Total Touchdowns', category: 'Offense', description: 'Touchdowns per game', priority: 10 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Game', category: 'Offense', description: 'Total yards per game', priority: 11 },
  { stat_id: -1, abbreviation: '', display_name: 'Passing Yards Per Game', category: 'Offense', description: 'Passing yards per game', priority: 12 },
  { stat_id: -1, abbreviation: '', display_name: 'Rushing Yards Per Game', category: 'Offense', description: 'Rushing yards per game', priority: 13 },
  { stat_id: -1, abbreviation: '', display_name: 'Completion Percentage', category: 'Offense', description: 'Completion %', priority: 14 },
  { stat_id: -1, abbreviation: '', display_name: 'Completions', category: 'Offense', description: 'Completions per game', priority: 15 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Pass Attempt', category: 'Offense', description: 'Yards per completion/attempt', priority: 16 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Rushing Attempt', category: 'Offense', description: 'Yards per rush attempt', priority: 17 },
  { stat_id: -1, abbreviation: '', display_name: 'Net Passing Yards Per Game', category: 'Offense', description: 'Net passing yards per game', priority: 18 },
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
  { stat_id: -1, abbreviation: '', display_name: 'Total Penalties', category: 'Turnovers & Penalties', description: 'Penalties per game', priority: 53 },
  { stat_id: -1, abbreviation: '', display_name: 'Total Penalty Yards', category: 'Turnovers & Penalties', description: 'Penalty yards per game', priority: 54 }
]

// NFL Preferred Stats Configuration (similar structure but different priorities)
export const NFL_PREFERRED_STATS: StatConfig[] = [
  // Offense
  { stat_id: 1, abbreviation: 'PTS', display_name: 'Points', category: 'Offense', description: 'Total points scored', priority: 1 },
  { stat_id: 2, abbreviation: 'YDS', display_name: 'Total Yards', category: 'Offense', description: 'Total offensive yards', priority: 2 },
  { stat_id: 3, abbreviation: 'PYDS', display_name: 'Passing Yards', category: 'Offense', description: 'Total passing yards', priority: 3 },
  { stat_id: 4, abbreviation: 'RYDS', display_name: 'Rushing Yards', category: 'Offense', description: 'Total rushing yards', priority: 4 },
  { stat_id: 5, abbreviation: 'TD', display_name: 'Touchdowns', category: 'Offense', description: 'Total touchdowns scored', priority: 5 },
  
  // Defense
  { stat_id: 10, abbreviation: 'SACKS', display_name: 'Sacks', category: 'Defense', description: 'Total sacks', priority: 6 },
  { stat_id: 11, abbreviation: 'INT', display_name: 'Interceptions', category: 'Defense', description: 'Total interceptions', priority: 7 },
  { stat_id: 12, abbreviation: 'FUM', display_name: 'Fumbles Recovered', category: 'Defense', description: 'Total fumbles recovered', priority: 8 },
  
  // Special Teams
  { stat_id: 20, abbreviation: 'FGM', display_name: 'Field Goals Made', category: 'Special Teams', description: 'Field goals made', priority: 9 },
  { stat_id: 21, abbreviation: 'FGA', display_name: 'Field Goals Attempted', category: 'Special Teams', description: 'Field goals attempted', priority: 10 },
  { stat_id: 22, abbreviation: 'FG%', display_name: 'Field Goal %', category: 'Special Teams', description: 'Field goal percentage', priority: 11 },
  
  // Advanced Metrics
  { stat_id: 30, abbreviation: '3RDC', display_name: '3rd Down Conversions', category: 'Efficiency', description: '3rd down conversions', priority: 12 },
  { stat_id: 31, abbreviation: '3RDA', display_name: '3rd Down Attempts', category: 'Efficiency', description: '3rd down attempts', priority: 13 },
  { stat_id: 32, abbreviation: '3RDC%', display_name: '3rd Down %', category: 'Efficiency', description: '3rd down conversion percentage', priority: 14 },
  { stat_id: 33, abbreviation: 'RZ%', display_name: 'Red Zone %', category: 'Efficiency', description: 'Red zone scoring percentage', priority: 15 },
  { stat_id: 34, abbreviation: 'TO', display_name: 'Turnovers', category: 'Efficiency', description: 'Total turnovers', priority: 16 },
  { stat_id: 35, abbreviation: 'DIFF', display_name: 'Turnover Differential', category: 'Efficiency', description: 'Turnover differential', priority: 17 },
]

// Helper function to get preferred stats by sport
export function getPreferredStats(sport: 'CFB' | 'NFL'): StatConfig[] {
  return sport === 'NFL' ? NFL_PREFERRED_STATS : CFB_PREFERRED_STATS
}

// Helper function to filter and sort stats based on preferred configuration
export function filterAndSortStats(stats: any[], sport: 'CFB' | 'NFL'): any[] {
  const preferredStats = getPreferredStats(sport)
  // For CFB, prefer matching by display_name keywords since stat_ids vary
  if (sport === 'CFB') {
    const byPriority = (stat: any): number => {
      const name = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
      const entry = preferredStats.find(p => name.includes(p.display_name.toLowerCase().replace('%', '')))
      return entry?.priority ?? 999
    }
    const filtered = stats.filter(stat => byPriority(stat) !== 999)
    return filtered.sort((a, b) => byPriority(a) - byPriority(b))
  }

  // NFL legacy behavior: by stat_id/abbreviation
  const preferredStatIds = new Set(preferredStats.map(s => s.stat_id))
  const preferredAbbreviations = new Set(preferredStats.map(s => s.abbreviation))
  const filteredStats = stats.filter(stat => 
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

  // Key Factors
  if (label.includes('points per game') || label.includes('total points per game')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('scoring margin')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('third down') || label.includes('fourth down')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('red zone')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('yards per play')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('turnover ratio') || label.includes('turnover margin')) return STAT_CATEGORIES.KEY_FACTORS

  // Special Teams
  if (label.includes('field goal') || label.includes('punting') || label.includes('punt')) return STAT_CATEGORIES.SPECIAL_TEAMS

  // Turnovers & Penalties
  if (label.includes('fumble') || label.includes('interception') || label.includes('penalty')) return STAT_CATEGORIES.TURNOVERS_PENALTIES

  // Defensive (best-effort)
  if (label.includes('sacks') || label.includes('tackles') || label.includes('tfl')) return STAT_CATEGORIES.DEFENSIVE

  // Offense by default
  return STAT_CATEGORIES.OFFENSE
}
