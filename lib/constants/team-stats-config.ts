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
export const CFB_PREFERRED_STATS: StatConfig[] = [
  // Offense - Most Important
  { stat_id: 1, abbreviation: 'PTS', display_name: 'Points', category: 'Offense', description: 'Total points scored', priority: 1 },
  { stat_id: 2, abbreviation: 'YDS', display_name: 'Total Yards', category: 'Offense', description: 'Total offensive yards', priority: 2 },
  { stat_id: 3, abbreviation: 'PYDS', display_name: 'Passing Yards', category: 'Offense', description: 'Total passing yards', priority: 3 },
  { stat_id: 4, abbreviation: 'RYDS', display_name: 'Rushing Yards', category: 'Offense', description: 'Total rushing yards', priority: 4 },
  { stat_id: 5, abbreviation: 'TD', display_name: 'Touchdowns', category: 'Offense', description: 'Total touchdowns scored', priority: 5 },
  
  // Defense - Critical
  { stat_id: 10, abbreviation: 'SACKS', display_name: 'Sacks', category: 'Defense', description: 'Total sacks', priority: 6 },
  { stat_id: 11, abbreviation: 'INT', display_name: 'Interceptions', category: 'Defense', description: 'Total interceptions', priority: 7 },
  { stat_id: 12, abbreviation: 'FUM', display_name: 'Fumbles Recovered', category: 'Defense', description: 'Total fumbles recovered', priority: 8 },
  { stat_id: 13, abbreviation: 'TFL', display_name: 'Tackles for Loss', category: 'Defense', description: 'Total tackles for loss', priority: 9 },
  
  // Special Teams
  { stat_id: 20, abbreviation: 'FGM', display_name: 'Field Goals Made', category: 'Special Teams', description: 'Field goals made', priority: 10 },
  { stat_id: 21, abbreviation: 'FGA', display_name: 'Field Goals Attempted', category: 'Special Teams', description: 'Field goals attempted', priority: 11 },
  { stat_id: 22, abbreviation: 'FG%', display_name: 'Field Goal %', category: 'Special Teams', description: 'Field goal percentage', priority: 12 },
  
  // Advanced Metrics
  { stat_id: 30, abbreviation: '3RDC', display_name: '3rd Down Conversions', category: 'Efficiency', description: '3rd down conversions', priority: 13 },
  { stat_id: 31, abbreviation: '3RDA', display_name: '3rd Down Attempts', category: 'Efficiency', description: '3rd down attempts', priority: 14 },
  { stat_id: 32, abbreviation: '3RDC%', display_name: '3rd Down %', category: 'Efficiency', description: '3rd down conversion percentage', priority: 15 },
  { stat_id: 33, abbreviation: 'RZ%', display_name: 'Red Zone %', category: 'Efficiency', description: 'Red zone scoring percentage', priority: 16 },
  { stat_id: 34, abbreviation: 'TO', display_name: 'Turnovers', category: 'Efficiency', description: 'Total turnovers', priority: 17 },
  { stat_id: 35, abbreviation: 'DIFF', display_name: 'Turnover Differential', category: 'Efficiency', description: 'Turnover differential', priority: 18 },
  
  // Additional Important Stats
  { stat_id: 40, abbreviation: 'TPEN', display_name: 'Total Penalties', category: 'Discipline', description: 'Total penalties', priority: 19 },
  { stat_id: 41, abbreviation: 'TPY', display_name: 'Total Penalty Yards', category: 'Discipline', description: 'Total penalty yards', priority: 20 },
  { stat_id: 42, abbreviation: 'POSS', display_name: 'Time of Possession', category: 'Control', description: 'Average time of possession', priority: 21 },
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
  const preferredStatIds = new Set(preferredStats.map(s => s.stat_id))
  const preferredAbbreviations = new Set(preferredStats.map(s => s.abbreviation))
  
  // Filter stats to only include preferred ones (by stat_id or abbreviation)
  const filteredStats = stats.filter(stat => 
    preferredStatIds.has(stat.stat_id) || 
    preferredAbbreviations.has(stat.stat?.abbreviation)
  )
  
  // Sort by priority from configuration
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
  OFFENSE: 'Offense',
  DEFENSE: 'Defense',
  SPECIAL_TEAMS: 'Special Teams',
  EFFICIENCY: 'Efficiency',
  DISCIPLINE: 'Discipline',
  CONTROL: 'Control'
} as const
