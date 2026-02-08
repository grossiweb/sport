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
  'avgInterceptionYards',
  'passingFumblesLost',
  'rushingFumblesLost',
  'receivingFumblesLost',
  'fumblesLost',
  'fumblesRecovered',
  'fumblesTouchdowns',
  'rushingFumbles',
  'receivingFumbles',
  'kickReturnFumblesLost',
  'puntReturnFumblesLost',
  'receivingYardsPerGame',
  'totalKickingPoints',
  'totalTouchdowns',
  'completions',
  'totalPenalties'
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
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Pass', category: 'Offense', description: 'Yards per completion/attempt', priority: 16 },
  { stat_id: -1, abbreviation: '', display_name: 'Yards Per Rush', category: 'Offense', description: 'Yards per rush attempt', priority: 17 },
  { stat_id: -1, abbreviation: '', display_name: 'Sacks', category: 'Offense', description: 'QB sacks per game (allowed)', priority: 19 },

  // Defensive (best-effort mapping based on available fields)
  { stat_id: -1, abbreviation: '', display_name: 'Sacks', category: 'Defensive', description: 'Sacks per game', priority: 30 },

  // Turnovers & Penalties (Other)
  { stat_id: -1, abbreviation: '', display_name: 'Field Goal Percentage', category: 'Turnovers & Penalties', description: 'FG Conversion %', priority: 41 },
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
  { stat_id: -1, abbreviation: 'YPA', display_name: 'Yards Per Pass', category: 'Offense', description: 'Yards per pass', priority: 19 },
  { stat_id: -1, abbreviation: 'YPRA', display_name: 'Yards Per Rush', category: 'Offense', description: 'Yards per rushing', priority: 20 },
  { stat_id: -1, abbreviation: 'PEN', display_name: 'Total Penalties', category: 'Offense', description: 'Total penalties', priority: 21 },
  
  // Turnovers & Penalties (Other)
  { stat_id: -1, abbreviation: 'FG%', display_name: 'Field Goal Percentage', category: 'Turnovers & Penalties', description: 'Field goal percentage', priority: 30 },
  { stat_id: -1, abbreviation: 'FUM', display_name: 'Fumbles', category: 'Turnovers & Penalties', description: 'Total fumbles', priority: 45 },
  { stat_id: -1, abbreviation: 'FF', display_name: 'Forced Fumbles', category: 'Turnovers & Penalties', description: 'Forced fumbles', priority: 46 },
  // Removed KRFL, PFL, RUFL, REFL, FL, FR, FTD, RUFUM, RECFUM per requirements
  { stat_id: -1, abbreviation: 'INT', display_name: 'Interceptions', category: 'Turnovers & Penalties', description: 'Interceptions thrown', priority: 51 },
  { stat_id: -1, abbreviation: 'PENYDS', display_name: 'Total Penalty Yards', category: 'Turnovers & Penalties', description: 'Total penalty yards', priority: 52 },
]

// NBA Preferred Stats Configuration - Updated with new categorization
export const NBA_PREFERRED_STATS: StatConfig[] = [
  // Defensive Stats
  { stat_id: -1, abbreviation: 'OPP PTS', display_name: 'Opponent Points', category: 'Defensive', description: 'Opponent points.', priority: 1 },
  { stat_id: -1, abbreviation: 'OPP AST', display_name: 'Opponent Assists', category: 'Defensive', description: 'Opponent assists.', priority: 2 },
  { stat_id: 1287, abbreviation: 'BLK', display_name: 'Blocks', category: 'Defensive', description: 'Total blocks.', priority: 3 },
  { stat_id: -1, abbreviation: 'OPP FG%', display_name: 'Opponent Field Goal %', category: 'Defensive', description: 'Opponent field goal percentage.', priority: 4 },
  { stat_id: -1, abbreviation: 'OPP 3P%', display_name: 'Opponent 3-Point Field Goal Percentage', category: 'Defensive', description: 'Opponent 3-point field goal percentage.', priority: 5 },
  { stat_id: -1, abbreviation: 'OPP FT%', display_name: 'Opponent Free Throw %', category: 'Defensive', description: 'Opponent free throw percentage.', priority: 6 },

  // Key Stats
  { stat_id: 1272, abbreviation: 'TO', display_name: 'Turnovers', category: 'Key', description: 'Total turnovers.', priority: 10 },
  { stat_id: -1, abbreviation: 'OPP TO', display_name: 'Opponent Turnovers', category: 'Key', description: 'Opponent turnovers.', priority: 11 },
  { stat_id: 1270, abbreviation: 'OREB', display_name: 'Offensive Rebounds', category: 'Key', description: 'Offensive rebounds total.', priority: 12 },
  { stat_id: -1, abbreviation: 'DREB', display_name: 'Defensive Rebounds', category: 'Key', description: 'Defensive rebounds total.', priority: 13 },
  { stat_id: 1251, abbreviation: 'FT%', display_name: 'Free Throw %', category: 'Key', description: 'FTM / FTA.', priority: 14 },
  { stat_id: 1264, abbreviation: 'SC-EFF', display_name: 'Scoring Efficiency', category: 'Key', description: 'Scoring efficiency.', priority: 15 },

  // Offensive Stats
  { stat_id: 1266, abbreviation: 'FG%', display_name: 'Field Goal %', category: 'Offensive', description: 'FGM / FGA.', priority: 20 },
  { stat_id: 1252, abbreviation: '3P%', display_name: '3-Point Field Goal Percentage', category: 'Offensive', description: '3PM / 3PA.', priority: 21 },
  { stat_id: 1265, abbreviation: 'SH-EFF', display_name: 'Shooting Efficiency', category: 'Offensive', description: 'Shooting efficiency.', priority: 22 },
  { stat_id: 1271, abbreviation: 'AST', display_name: 'Assists', category: 'Offensive', description: 'Total assists.', priority: 23 },
  { stat_id: -1, abbreviation: 'OPP BLK', display_name: 'Opponent Blocks', category: 'Offensive', description: 'Opponent blocks.', priority: 24 },

  // Other Stats
  { stat_id: 1243, abbreviation: 'AST/TO', display_name: 'Assist To Turnover Ratio', category: 'Other', description: 'Assists per turnover.', priority: 30 },
  { stat_id: -1, abbreviation: 'OPP AST/TO', display_name: 'Opponent Assist To Turnover Ratio', category: 'Other', description: 'Opponent assist to turnover ratio.', priority: 31 },
  { stat_id: 1244, abbreviation: 'PF', display_name: 'Fouls', category: 'Other', description: 'Total fouls.', priority: 32 },
  { stat_id: -1, abbreviation: 'OPP PF', display_name: 'Opponent Fouls', category: 'Other', description: 'Opponent fouls.', priority: 33 },
  { stat_id: 1286, abbreviation: 'STL', display_name: 'Steals', category: 'Other', description: 'Total steals.', priority: 34 },
  { stat_id: -1, abbreviation: 'OPP STL', display_name: 'Opponent Steals', category: 'Other', description: 'Opponent steals.', priority: 35 },

  // Additional stats for compatibility (lower priority)
  // Note: many basketball feeds store core production as "Per Game"; include those so they aren't filtered out.
  { stat_id: 1242, abbreviation: 'REB', display_name: 'Rebounds Per Game', category: 'Key', description: 'Average rebounds per game.', priority: 50 },
  { stat_id: 1249, abbreviation: 'REB', display_name: 'Rebounds', category: 'Key', description: 'Total rebounds.', priority: 51 },
  { stat_id: 1250, abbreviation: 'REB', display_name: 'Rebounds', category: 'Key', description: 'Total rebounds (off+def).', priority: 52 },
  { stat_id: 1259, abbreviation: 'PTS', display_name: 'Points Per Game', category: 'Offensive', description: 'Average points per game.', priority: 53 },
  { stat_id: 1260, abbreviation: 'OR', display_name: 'Offensive Rebounds Per Game', category: 'Key', description: 'Average offensive rebounds per game.', priority: 54 },
  { stat_id: 1262, abbreviation: 'TO', display_name: 'Turnovers Per Game', category: 'Key', description: 'Average turnovers per game.', priority: 55 },
  { stat_id: 1263, abbreviation: '2P%', display_name: '2-Point Field Goal Percentage', category: 'Offensive', description: '2P FG%.', priority: 56 },
  { stat_id: 1269, abbreviation: 'PTS', display_name: 'Points', category: 'Offensive', description: 'Total points.', priority: 57 },
  { stat_id: 1279, abbreviation: '3P%', display_name: 'Three Point %', category: 'Offensive', description: '3PM / 3PA.', priority: 58 },
  { stat_id: 1282, abbreviation: 'DR', display_name: 'Defensive Rebounds Per Game', category: 'Key', description: 'Average defensive rebounds per game.', priority: 59 },
  { stat_id: 1261, abbreviation: 'AST', display_name: 'Assists Per Game', category: 'Offensive', description: 'Average assists per game.', priority: 60 },
  { stat_id: 1283, abbreviation: 'BLK', display_name: 'Blocks Per Game', category: 'Defensive', description: 'Average blocks per game.', priority: 61 },
  { stat_id: 1284, abbreviation: 'STL', display_name: 'Steals Per Game', category: 'Other', description: 'Average steals per game.', priority: 62 },
  { stat_id: 1244, abbreviation: 'PF', display_name: 'Fouls Per Game', category: 'Other', description: 'Average fouls per game.', priority: 63 },
]

// NCAAB Preferred Stats Configuration - Exact order as specified by user
export const NCAAB_PREFERRED_STATS: StatConfig[] = [
  // Exact order from user requirements (priority matches display order)
  { stat_id: -1, abbreviation: 'PF', display_name: 'Fouls Per Game', category: 'Key Factors', description: 'Average fouls per game.', priority: 1 },
  { stat_id: -1, abbreviation: 'REB', display_name: 'Rebounds Per Game', category: 'Key Factors', description: 'Average rebounds per game.', priority: 2 },
  { stat_id: -1, abbreviation: 'AST/TO', display_name: 'Assist To Turnover Ratio', category: 'Key Factors', description: 'Assist to turnover ratio.', priority: 3 },
  { stat_id: -1, abbreviation: 'REB', display_name: 'Rebounds', category: 'Key Factors', description: 'Total rebounds.', priority: 4 },
  { stat_id: -1, abbreviation: 'FT%', display_name: 'Free Throw %', category: 'Key Factors', description: 'Free throw percentage.', priority: 5 },
  { stat_id: -1, abbreviation: '3P%', display_name: '3-Point Field Goal Percentage', category: 'Key Factors', description: '3-point field goal percentage.', priority: 6 },
  { stat_id: -1, abbreviation: 'PTS', display_name: 'Points Per Game', category: 'Key Factors', description: 'Average points per game.', priority: 7 },
  { stat_id: -1, abbreviation: 'OR', display_name: 'Offensive Rebounds Per Game', category: 'Key Factors', description: 'Average offensive rebounds per game.', priority: 8 },
  { stat_id: -1, abbreviation: 'TO', display_name: 'Turnovers Per Game', category: 'Key Factors', description: 'Average turnovers per game.', priority: 9 },
  { stat_id: -1, abbreviation: '2P%', display_name: '2-Point Field Goal Percentage', category: 'Key Factors', description: '2-point field goal percentage.', priority: 10 },
  { stat_id: -1, abbreviation: 'SC-EFF', display_name: 'Scoring Efficiency', category: 'Key Factors', description: 'Scoring efficiency.', priority: 11 },
  { stat_id: -1, abbreviation: 'SH-EFF', display_name: 'Shooting Efficiency', category: 'Key Factors', description: 'Shooting efficiency.', priority: 12 },
  { stat_id: -1, abbreviation: 'FG%', display_name: 'Field Goal %', category: 'Key Factors', description: 'Field goal percentage.', priority: 13 },
  { stat_id: -1, abbreviation: 'TO', display_name: 'Turnovers', category: 'Key Factors', description: 'Total turnovers.', priority: 14 },
  { stat_id: -1, abbreviation: '3P%', display_name: 'Three Point %', category: 'Key Factors', description: 'Three point percentage.', priority: 15 },
  { stat_id: -1, abbreviation: 'DR', display_name: 'Defensive Rebounds Per Game', category: 'Key Factors', description: 'Average defensive rebounds per game.', priority: 16 },
  { stat_id: -1, abbreviation: 'AST', display_name: 'Assists Per Game', category: 'Key Factors', description: 'Average assists per game.', priority: 17 },
  { stat_id: -1, abbreviation: 'PTS', display_name: 'Points', category: 'Offensive', description: 'Total points.', priority: 18 },
  { stat_id: -1, abbreviation: 'OREB', display_name: 'Offensive Rebounds', category: 'Offensive', description: 'Total offensive rebounds.', priority: 19 },
  { stat_id: -1, abbreviation: 'AST', display_name: 'Assists', category: 'Offensive', description: 'Total assists.', priority: 20 },
  { stat_id: -1, abbreviation: 'BLK', display_name: 'Blocks', category: 'Offensive', description: 'Total blocks.', priority: 21 },
  { stat_id: -1, abbreviation: 'BLK', display_name: 'Blocks Per Game', category: 'Defense', description: 'Average blocks per game.', priority: 22 },
  { stat_id: -1, abbreviation: 'STL', display_name: 'Steals Per Game', category: 'Defense', description: 'Average steals per game.', priority: 23 },
  { stat_id: -1, abbreviation: 'STL', display_name: 'Steals', category: 'Defense', description: 'Total steals.', priority: 24 },
  
  // Opponent stats (lower priority, will be filtered out if not present)
  { stat_id: -1, abbreviation: 'OPP PTS', display_name: 'Opponent Points', category: 'Key Factors', description: 'Opponent points per game.', priority: 100 },
  { stat_id: -1, abbreviation: 'OPP TO', display_name: 'Opponent Turnovers', category: 'Key Factors', description: 'Opponent turnovers per game.', priority: 101 },
  { stat_id: -1, abbreviation: 'OPP AST/TO', display_name: 'Opponent Assist To Turnover Ratio', category: 'Key Factors', description: 'Opponent assist to turnover ratio.', priority: 102 },
  { stat_id: -1, abbreviation: 'OPP AST', display_name: 'Opponent Assists', category: 'Key Factors', description: 'Opponent assists per game.', priority: 103 },
  { stat_id: -1, abbreviation: 'OPP BLK', display_name: 'Opponent Blocks', category: 'Key Factors', description: 'Opponent blocks per game.', priority: 104 },
  { stat_id: -1, abbreviation: 'OPP PF', display_name: 'Opponent Fouls', category: 'Key Factors', description: 'Opponent fouls per game.', priority: 105 },
  { stat_id: -1, abbreviation: 'OPP STL', display_name: 'Opponent Steals', category: 'Key Factors', description: 'Opponent steals per game.', priority: 106 },
  { stat_id: -1, abbreviation: 'OPP FG%', display_name: 'Opponent Field Goal %', category: 'Key Factors', description: 'Opponent field goal percentage.', priority: 107 },
  { stat_id: -1, abbreviation: 'OPP 3P%', display_name: 'Opponent 3-Point Field Goal Percentage', category: 'Key Factors', description: 'Opponent 3-point field goal percentage.', priority: 108 },
  { stat_id: -1, abbreviation: 'OPP FT%', display_name: 'Opponent Free Throw %', category: 'Key Factors', description: 'Opponent free throw percentage.', priority: 109 },
]

// Strict allowlist: only stats present in uploaded NBA stats list
export const NBA_ALLOWED_DISPLAY_NAMES = new Set<string>([
  'Rebounds Per Game',
  'Assist To Turnover Ratio',
  'Fouls Per Game',
  'Fouls',
  'Games Played',
  'Games Started',
  'Minutes',
  'Minutes Per Game',
  'Rebounds',
  'Free Throw %',
  '3-Point Field Goal Percentage',
  'Average Field Goals Made',
  'Average Field Goals Attempted',
  'Average 3-Point Field Goals Made',
  'Average 3-Point Field Goals Attempted',
  'Average Free Throws Made',
  'Average Free Throws Attempted',
  'Points Per Game',
  'Offensive Rebounds Per Game',
  'Assists Per Game',
  'Turnovers Per Game',
  '2-Point Field Goal Percentage',
  'Scoring Efficiency',
  'Shooting Efficiency',
  'Field Goal %',
  '2-Point Field Goals Made',
  '2-Point Field Goals Attempted',
  'Points',
  'Offensive Rebounds',
  'Assists',
  'Turnovers',
  'Field Goals Made',
  'Field Goals Attempted',
  'Free Throws Made',
  'Free Throws Attempted',
  '3-Point Field Goals Made',
  '3-Point Field Goals Attempted',
  'Three Point %',
  '2-Point Field Goals Made per Game',
  '2-Point Field Goals Attempted per Game',
  'Defensive Rebounds Per Game',
  'Defensive Rebounds',
  'Blocks Per Game',
  'Steals Per Game',
  'Steals',
  'Blocks',
  // Opponent stats
  'Opponent Points',
  'Opponent Assists',
  'Opponent Blocks',
  'Opponent Field Goal %',
  'Opponent 3-Point Field Goal Percentage',
  'Opponent Free Throw %',
  'Opponent Turnovers',
  'Opponent Assist To Turnover Ratio',
  'Opponent Fouls',
  'Opponent Steals'
])

// NCAAB Allowlist - Exact stats in priority order plus additional stats
export const NCAAB_ALLOWED_DISPLAY_NAMES = new Set<string>([
  // Core stats from user requirements (exact order)
  'Fouls Per Game',
  'Rebounds Per Game',
  'Assist To Turnover Ratio',
  'Rebounds',
  'Free Throw %',
  '3-Point Field Goal Percentage',
  'Points Per Game',
  'Offensive Rebounds Per Game',
  'Turnovers Per Game',
  '2-Point Field Goal Percentage',
  'Scoring Efficiency',
  'Shooting Efficiency',
  'Field Goal %',
  'Turnovers',
  'Three Point %',
  'Defensive Rebounds Per Game',
  'Assists Per Game',
  'Points',
  'Offensive Rebounds',
  'Assists',
  'Blocks',
  'Blocks Per Game',
  'Steals Per Game',
  'Steals',
  // Opponent stats
  'Opponent Points',
  'Opponent Turnovers',
  'Opponent Assist To Turnover Ratio',
  'Opponent Assists',
  'Opponent Blocks',
  'Opponent Fouls',
  'Opponent Steals',
  'Opponent Field Goal %',
  'Opponent 3-Point Field Goal Percentage',
  'Opponent Free Throw %',
  // Additional stats that might be in database
  'Games Played',
  'Games Started',
  'Minutes',
  'Minutes Per Game',
  'Defensive Rebounds',
  'Average Field Goals Made',
  'Average Field Goals Attempted',
  'Average 3-Point Field Goals Made',
  'Average 3-Point Field Goals Attempted',
  'Average Free Throws Made',
  'Average Free Throws Attempted',
  '2-Point Field Goals Made',
  '2-Point Field Goals Attempted',
  'Field Goals Made',
  'Field Goals Attempted',
  'Free Throws Made',
  'Free Throws Attempted',
  '3-Point Field Goals Made',
  '3-Point Field Goals Attempted',
  '2-Point Field Goals Made per Game',
  '2-Point Field Goals Attempted per Game',
])

// Helper function to get preferred stats by sport
export function getPreferredStats(sport: 'CFB' | 'NFL' | 'NBA' | 'NCAAB'): StatConfig[] {
  if (sport === 'NFL') return NFL_PREFERRED_STATS
  if (sport === 'NBA') return NBA_PREFERRED_STATS
  if (sport === 'NCAAB') return NCAAB_PREFERRED_STATS
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
export function filterAndSortStats(stats: any[], sport: 'CFB' | 'NFL' | 'NBA' | 'NCAAB'): any[] {
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

  if (sport === 'NBA' || sport === 'NCAAB') {
    // Strict allowlist by display name - same logic for both basketball sports
    const allowedNames = sport === 'NBA' ? NBA_ALLOWED_DISPLAY_NAMES : NCAAB_ALLOWED_DISPLAY_NAMES
    const allowed = nonExcluded.filter(stat => {
      const dn = (stat?.stat?.display_name || stat?.stat?.name || '').trim()
      return dn && allowedNames.has(dn)
    })
    const loweredToPriority = new Map<string, number>()
    preferredStats.forEach(p => loweredToPriority.set(p.display_name.toLowerCase(), p.priority))
    const byPriority = (stat: any): number => {
      const name = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
      if (!name) return 999
      return loweredToPriority.get(name) ?? 999
    }
    const filtered = allowed.filter(stat => byPriority(stat) !== 999)
    const sorted = filtered.sort((a, b) => byPriority(a) - byPriority(b))
    
    // Debug logging for NCAAB to verify order
    if (sport === 'NCAAB' && sorted.length > 0) {
      console.log(`[NCAAB Stats Order] Sorted ${sorted.length} stats by priority:`)
      sorted.slice(0, 10).forEach((s, i) => {
        const name = (s?.stat?.display_name || s?.stat?.name || '').trim()
        console.log(`  ${i + 1}. ${name} (priority: ${byPriority(s)})`)
      })
    }
    
    return sorted
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

// Helper function to get display name for categories based on sport
// For CFB and NFL, rename 'Turnovers & Penalties' to 'Other'
export function getCategoryDisplayName(category: string, sport: 'CFB' | 'NFL' | 'NBA' | 'NCAAB'): string {
  if ((sport === 'CFB' || sport === 'NFL') && category === STAT_CATEGORIES.TURNOVERS_PENALTIES) {
    return 'Other'
  }
  if (sport === 'NBA') {
    if (category === 'Defensive') return 'Defensive Metrics'
    if (category === 'Key') return 'Key Metrics'
    if (category === 'Offensive') return 'Offensive Metrics'
    if (category === 'Other') return 'Other Metrics'
  }
  return category
}

// Map a CFB stat to one of the requested categories using display_name heuristics
export function mapCfbStatToCategory(stat: any): string {
  const label = (stat?.stat?.display_name || stat?.stat?.name || '').toLowerCase()
  const explicitCategory = (stat?.stat?.category || '').toLowerCase()
  if (explicitCategory === 'defensive') return STAT_CATEGORIES.DEFENSIVE
  if (!label) return STAT_CATEGORIES.OFFENSE

  // Key Factors (only 4 stats)
  if (label.includes('points per game') || label.includes('total points per game')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('third down conversion') || label.includes('3rd down %') || label.includes('third down conversion percentage')) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('red zone efficiency') || (label.includes('red zone') && label.includes('percentage'))) return STAT_CATEGORIES.KEY_FACTORS
  if (label.includes('turnover ratio')) return STAT_CATEGORIES.KEY_FACTORS

  // Special Teams (excluding Field Goal Percentage which goes to Other)
  if ((label.includes('field goal') && !label.includes('percentage') && !label.includes('%')) || label.includes('punting') || label.includes('punt')) return STAT_CATEGORIES.SPECIAL_TEAMS

  // Turnovers & Penalties (Other) - includes Field Goal Percentage
  if (label.includes('fumble') || label.includes('interception') || label.includes('penalty') || 
      (label.includes('field goal') && (label.includes('percentage') || label.includes('%')))) {
    return STAT_CATEGORIES.TURNOVERS_PENALTIES
  }

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
  if (originalCategory.toLowerCase() === 'defensive') {
    return STAT_CATEGORIES.DEFENSIVE
  }
  
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

  // Special Teams stats (excluding Field Goal Percentage which goes to Other)
  if ((label.includes('field goal') && !label.includes('percentage') && !label.includes('%')) || label.includes('punt return fumbles')) return STAT_CATEGORIES.SPECIAL_TEAMS
  
  // Turnovers & Penalties stats (Other) - includes Field Goal Percentage
  if (label.includes('fumble') || label.includes('interception') || label.includes('penalty') || label.includes('penalties') ||
      (label.includes('field goal') && (label.includes('percentage') || label.includes('%')))) {
    return STAT_CATEGORIES.TURNOVERS_PENALTIES
  }
  
  // Offense stats (includes points, touchdowns, yards, completions, etc.)
  if (label.includes('points') || label.includes('touchdown') || label.includes('yards') || 
      label.includes('completion') || label.includes('passing') || label.includes('rushing') || 
      label.includes('receiving') || label.includes('kick') || label.includes('attempt')) {
    // Exception: fumbles and penalties go to Turnovers & Penalties (Other)
    if (label.includes('fumble') || label.includes('penalty')) return STAT_CATEGORIES.TURNOVERS_PENALTIES
    // Exception: field goal stats go to appropriate categories (handled above)
    if (label.includes('field goal')) {
      // Percentage goes to Other, attempts/made would go to Special Teams (but we removed attempts)
      if (label.includes('percentage') || label.includes('%')) return STAT_CATEGORIES.TURNOVERS_PENALTIES
      return STAT_CATEGORIES.SPECIAL_TEAMS
    }
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
  if (!label) return 'Offensive'
  
  // Direct lookup in configuration
  const pref = NBA_PREFERRED_STATS.find(p => p.display_name.toLowerCase() === label)
  if (pref) return pref.category
  
  // Handle opponent stats - Defensive category
  if (label.startsWith('opponent ')) {
    // Check specific opponent stats
    if (label.includes('points') || label.includes('assists') || 
        label.includes('field goal') || label.includes('3-point') || 
        label.includes('free throw')) {
      return 'Defensive'
    }
    // Opponent turnovers is Key
    if (label.includes('turnovers') && !label.includes('ratio')) {
      return 'Key'
    }
    // Opponent blocks is Offensive
    if (label.includes('blocks')) {
      return 'Offensive'
    }
    // Other opponent stats (fouls, steals, assist/turnover ratio)
    if (label.includes('fouls') || label.includes('steals') || label.includes('assist')) {
      return 'Other'
    }
    // Default for opponent stats
    return 'Defensive'
  }
  
  // Defensive stats (non-opponent)
  if (label.includes('blocks per game') || label === 'blocks') {
    return 'Defensive'
  }
  
  // Key stats
  if (label.includes('turnovers') && !label.includes('ratio') ||
      label.includes('offensive rebounds') ||
      label.includes('defensive rebounds') ||
      label.includes('rebounds') ||
      label.includes('free throw %') ||
      label.includes('scoring efficiency')) {
    return 'Key'
  }
  
  // Offensive stats
  if (label.includes('field goal %') ||
      label.includes('3-point') || label.includes('three point') ||
      label.includes('shooting efficiency') ||
      label.includes('assists') && !label.includes('ratio') ||
      label.includes('points')) {
    return 'Offensive'
  }
  
  // Other stats
  if (label.includes('assist to turnover') || label.includes('ast/to') ||
      label.includes('fouls') ||
      label.includes('steals')) {
    return 'Other'
  }
  
  // Default fallback
  return 'Offensive'
}

// Map an NCAAB stat to categories (same logic as NBA - both are basketball)
export function mapNcaabStatToCategory(stat: any): string {
  const label = (stat?.stat?.display_name || stat?.stat?.name || '').trim().toLowerCase()
  if (!label) return 'Offensive'
  
  // Handle opponent stats - they inherit the category from the corresponding regular stat
  if (label.startsWith('opponent ')) {
    const baseLabel = label.replace('opponent ', '')
    const basePref = NCAAB_PREFERRED_STATS.find(p => p.display_name.toLowerCase() === baseLabel)
    if (basePref) return basePref.category
    // Fallback heuristics for opponent stats
    if (/efficiency|assist|turnover|points|fg%|3|three|free throw|rebound|foul/i.test(baseLabel)) return 'Key Factors'
    if (/defensive|steal|block/i.test(baseLabel)) return 'Defense'
    return 'Offensive'
  }
  
  const pref = NCAAB_PREFERRED_STATS.find(p => p.display_name.toLowerCase() === label)
  if (pref) return pref.category
  // Heuristics fallback to requested three buckets
  if (/efficiency|assist to turnover|ast\/to|points|fg%|3|three|free throw|rebound|foul/i.test(label)) return 'Key Factors'
  if (/defensive|steal|block/i.test(label)) return 'Defense'
  return 'Offensive'
}
