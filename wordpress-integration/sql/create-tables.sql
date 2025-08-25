-- StatsPro Sports Data Tables for WordPress Database
-- Run these queries in phpMyAdmin to create the tables

-- Main historical games data table
CREATE TABLE IF NOT EXISTS wp_sports_historical_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(255) UNIQUE NOT NULL,
    sport VARCHAR(10) NOT NULL,
    game_date DATE NOT NULL,
    game_time TIME,
    home_team_id VARCHAR(100),
    home_team_name VARCHAR(255),
    home_team_city VARCHAR(255),
    home_team_abbreviation VARCHAR(10),
    away_team_id VARCHAR(100),
    away_team_name VARCHAR(255),
    away_team_city VARCHAR(255),
    away_team_abbreviation VARCHAR(10),
    venue VARCHAR(255),
    game_status VARCHAR(20) DEFAULT 'scheduled',
    season VARCHAR(10),
    week_number INT,
    
    -- Opening betting lines
    opening_spread_home DECIMAL(4,1),
    opening_spread_away DECIMAL(4,1),
    opening_total DECIMAL(5,1),
    opening_moneyline_home INT,
    opening_moneyline_away INT,
    
    -- Closing betting lines
    closing_spread_home DECIMAL(4,1),
    closing_spread_away DECIMAL(4,1),
    closing_total DECIMAL(5,1),
    closing_moneyline_home INT,
    closing_moneyline_away INT,
    
    -- Final scores
    final_score_home INT,
    final_score_away INT,
    
    -- Betting outcome data
    spread_result VARCHAR(20), -- 'home_cover', 'away_cover', 'push'
    total_result VARCHAR(20),  -- 'over', 'under', 'push'
    
    -- Weather data
    temperature INT,
    weather_condition VARCHAR(100),
    wind_speed INT,
    wind_direction VARCHAR(10),
    humidity INT,
    precipitation DECIMAL(3,2),
    
    -- JSON fields for flexible data storage
    team_stats_home LONGTEXT, -- JSON string
    team_stats_away LONGTEXT, -- JSON string
    player_stats LONGTEXT,    -- JSON string
    betting_data LONGTEXT,    -- JSON string
    trends_data LONGTEXT,     -- JSON string
    injuries LONGTEXT,        -- JSON string
    
    -- Metadata
    data_source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_sport_date (sport, game_date),
    INDEX idx_game_date (game_date),
    INDEX idx_sport (sport),
    INDEX idx_teams (home_team_id, away_team_id),
    INDEX idx_season (season, sport)
);

-- Line movements tracking table
CREATE TABLE IF NOT EXISTS wp_line_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    
    -- Spread data
    spread_home DECIMAL(4,1),
    spread_away DECIMAL(4,1),
    spread_juice_home INT DEFAULT -110,
    spread_juice_away INT DEFAULT -110,
    
    -- Total data
    total_points DECIMAL(5,1),
    total_over_juice INT DEFAULT -110,
    total_under_juice INT DEFAULT -110,
    
    -- Moneyline data
    moneyline_home INT,
    moneyline_away INT,
    
    -- Public betting percentages
    public_bets_home_percent DECIMAL(5,2),
    public_bets_away_percent DECIMAL(5,2),
    public_bets_over_percent DECIMAL(5,2),
    public_bets_under_percent DECIMAL(5,2),
    
    -- Handle percentages (money wagered)
    handle_home_percent DECIMAL(5,2),
    handle_away_percent DECIMAL(5,2),
    handle_over_percent DECIMAL(5,2),
    handle_under_percent DECIMAL(5,2),
    
    -- Flags
    reverse_line_movement BOOLEAN DEFAULT FALSE,
    sharp_action BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    sportsbook VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_game_timestamp (game_id, timestamp),
    INDEX idx_timestamp (timestamp),
    INDEX idx_rlm (reverse_line_movement),
    FOREIGN KEY (game_id) REFERENCES wp_sports_historical_data(game_id) ON DELETE CASCADE
);

-- Team performance statistics table
CREATE TABLE IF NOT EXISTS wp_team_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(255) NOT NULL,
    team_id VARCHAR(100) NOT NULL,
    team_type VARCHAR(10) NOT NULL, -- 'home' or 'away'
    sport VARCHAR(10) NOT NULL,
    
    -- Universal stats
    points_scored INT,
    points_allowed INT,
    
    -- Baseball specific stats
    runs INT,
    hits INT,
    errors INT,
    batting_average DECIMAL(4,3),
    on_base_percentage DECIMAL(4,3),
    slugging_percentage DECIMAL(4,3),
    ops DECIMAL(4,3),
    era DECIMAL(4,2),
    whip DECIMAL(4,2),
    fip DECIMAL(4,2),
    
    -- Football specific stats
    total_yards INT,
    passing_yards INT,
    rushing_yards INT,
    turnovers INT,
    time_of_possession TIME,
    third_down_conversions VARCHAR(10), -- "5/12" format
    red_zone_efficiency VARCHAR(10),
    
    -- Basketball specific stats
    field_goals_made INT,
    field_goals_attempted INT,
    field_goal_percentage DECIMAL(4,3),
    three_pointers_made INT,
    three_pointers_attempted INT,
    three_point_percentage DECIMAL(4,3),
    free_throws_made INT,
    free_throws_attempted INT,
    free_throw_percentage DECIMAL(4,3),
    rebounds INT,
    assists INT,
    steals INT,
    blocks INT,
    
    -- Additional JSON field for sport-specific stats
    additional_stats LONGTEXT, -- JSON string
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_game_team (game_id, team_id),
    INDEX idx_sport_team (sport, team_id),
    FOREIGN KEY (game_id) REFERENCES wp_sports_historical_data(game_id) ON DELETE CASCADE
);

-- Player statistics table
CREATE TABLE IF NOT EXISTS wp_player_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(255) NOT NULL,
    player_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(255) NOT NULL,
    team_id VARCHAR(100) NOT NULL,
    position VARCHAR(20),
    jersey_number INT,
    sport VARCHAR(10) NOT NULL,
    
    -- Universal stats
    minutes_played DECIMAL(5,2),
    
    -- Baseball specific stats
    at_bats INT,
    hits INT,
    home_runs INT,
    rbi INT,
    walks INT,
    strikeouts INT,
    batting_average DECIMAL(4,3),
    
    -- Pitching stats
    innings_pitched DECIMAL(4,1),
    earned_runs INT,
    strikeouts_pitched INT,
    walks_pitched INT,
    hits_allowed INT,
    
    -- Football specific stats
    passing_attempts INT,
    passing_completions INT,
    passing_yards INT,
    passing_touchdowns INT,
    interceptions INT,
    rushing_attempts INT,
    rushing_yards INT,
    rushing_touchdowns INT,
    receptions INT,
    receiving_yards INT,
    receiving_touchdowns INT,
    tackles INT,
    sacks DECIMAL(3,1),
    
    -- Basketball specific stats
    points INT,
    rebounds INT,
    assists INT,
    steals INT,
    blocks INT,
    field_goals_made INT,
    field_goals_attempted INT,
    three_pointers_made INT,
    three_pointers_attempted INT,
    free_throws_made INT,
    free_throws_attempted INT,
    turnovers INT,
    fouls INT,
    
    -- Additional JSON field for sport-specific stats
    additional_stats LONGTEXT, -- JSON string
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_game_player (game_id, player_id),
    INDEX idx_player_sport (player_id, sport),
    INDEX idx_team_player (team_id, player_id),
    FOREIGN KEY (game_id) REFERENCES wp_sports_historical_data(game_id) ON DELETE CASCADE
);

-- Data collection log table
CREATE TABLE IF NOT EXISTS wp_sports_data_collection_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_date DATE NOT NULL,
    sport VARCHAR(10),
    data_type VARCHAR(50), -- 'games', 'lines', 'stats', 'players'
    api_source VARCHAR(50), -- 'therundown', 'sportsdata'
    games_processed INT DEFAULT 0,
    games_successful INT DEFAULT 0,
    games_failed INT DEFAULT 0,
    error_messages LONGTEXT,
    execution_time DECIMAL(8,3), -- seconds
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_collection_date (collection_date),
    INDEX idx_sport_date (sport, collection_date),
    INDEX idx_status (status)
);

-- Settings table for data collection configuration
CREATE TABLE IF NOT EXISTS wp_sports_data_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value LONGTEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- 'string', 'json', 'boolean', 'integer'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO wp_sports_data_settings (setting_key, setting_value, setting_type, description) VALUES
('collection_enabled', 'true', 'boolean', 'Enable automatic data collection'),
('collection_frequency', '3600', 'integer', 'Collection frequency in seconds (3600 = 1 hour)'),
('sports_enabled', '["MLB","NFL","NBA","CFB","CBB"]', 'json', 'List of sports to collect data for'),
('therundown_api_key', '', 'string', 'TheRundown.io API key'),
('sportsdata_api_key', '', 'string', 'SportsData.io API key'),
('line_movement_threshold', '1.0', 'string', 'Minimum line movement to track (points)'),
('rlm_detection_enabled', 'true', 'boolean', 'Enable reverse line movement detection'),
('retain_data_days', '365', 'integer', 'Number of days to retain historical data (0 = forever)'),
('last_collection_run', '', 'string', 'Timestamp of last successful collection'),
('debug_mode', 'false', 'boolean', 'Enable debug logging');

-- Create views for easy analysis
CREATE OR REPLACE VIEW vw_game_analysis AS
SELECT 
    h.game_id,
    h.sport,
    h.game_date,
    h.home_team_name,
    h.away_team_name,
    h.opening_spread_home,
    h.closing_spread_home,
    (h.closing_spread_home - h.opening_spread_home) AS spread_movement,
    h.opening_total,
    h.closing_total,
    (h.closing_total - h.opening_total) AS total_movement,
    h.final_score_home,
    h.final_score_away,
    (h.final_score_home + h.final_score_away) AS total_points,
    h.spread_result,
    h.total_result,
    CASE 
        WHEN ABS(h.closing_spread_home - h.opening_spread_home) >= 2.0 THEN 'High'
        WHEN ABS(h.closing_spread_home - h.opening_spread_home) >= 1.0 THEN 'Medium'
        ELSE 'Low'
    END AS line_movement_category
FROM wp_sports_historical_data h
WHERE h.game_status = 'final';

-- Create view for betting trends
CREATE OR REPLACE VIEW vw_betting_trends AS
SELECT 
    sport,
    DATE_FORMAT(game_date, '%Y-%m') AS month_year,
    COUNT(*) AS total_games,
    AVG(ABS(closing_spread_home - opening_spread_home)) AS avg_spread_movement,
    AVG(ABS(closing_total - opening_total)) AS avg_total_movement,
    SUM(CASE WHEN spread_result = 'home_cover' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS home_cover_rate,
    SUM(CASE WHEN total_result = 'over' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS over_rate
FROM wp_sports_historical_data
WHERE game_status = 'final'
GROUP BY sport, DATE_FORMAT(game_date, '%Y-%m')
ORDER BY sport, month_year;