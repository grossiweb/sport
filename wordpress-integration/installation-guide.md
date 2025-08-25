# StatsPro WordPress Database Integration Setup Guide

This guide will help you set up the WordPress database integration system for automatic sports data collection and storage.

## 📋 Prerequisites

- WordPress installed at `http://localhost/statspro/`
- phpMyAdmin access to WordPress database
- WAMP server running
- StatsPro Next.js app in `C:\wamp64\www\statspro\sport`

## 🗄️ Step 1: Create Database Tables

1. **Open phpMyAdmin**
   - Go to `http://localhost/phpmyadmin`
   - Select your WordPress database (usually named after your WordPress installation)

2. **Run SQL Script**
   - Click on the "SQL" tab
   - Copy and paste the entire contents of `sql/create-tables.sql`
   - Click "Go" to execute the script

3. **Verify Tables Created**
   You should see these new tables:
   - `wp_sports_historical_data`
   - `wp_line_movements`
   - `wp_team_statistics`
   - `wp_player_statistics`
   - `wp_sports_data_collection_log`
   - `wp_sports_data_settings`

## 🔌 Step 2: Install WordPress Plugin

1. **Copy Plugin Files**
   ```bash
   # Copy the plugin folder to your WordPress plugins directory
   cp -r wp-content/plugins/statspro-data-collector C:\wamp64\www\statspro\wp-content\plugins\
   ```

2. **Activate Plugin**
   - Go to WordPress Admin: `http://localhost/statspro/wp-admin`
   - Navigate to Plugins → Installed Plugins
   - Find "StatsPro Data Collector" and click "Activate"

## ⚙️ Step 3: Configure Plugin Settings

1. **Access Plugin Settings**
   - In WordPress admin, go to "StatsPro Data" in the sidebar
   - Click on "Settings"

2. **Add API Keys**
   - **TheRundown.io API Key**: Your betting data API key
   - **SportsData.io API Key**: Your statistics API key
   - **Enable Data Collection**: Check this box
   - **Collection Frequency**: Set to "Every hour" (recommended)
   - **Sports to Collect**: Select all sports you want (MLB, NFL, NBA, CFB, CBB)

3. **Save Settings**

## 🚀 Step 4: Test Data Collection

1. **Manual Collection Test**
   - Go to "StatsPro Data" → "Collection"
   - Click "Run Manual Collection"
   - Monitor the progress and check for any errors

2. **Verify Data in Database**
   - Open phpMyAdmin
   - Browse the `wp_sports_historical_data` table
   - You should see game records being populated

## 📊 Step 5: Accessing Your Data

### Via phpMyAdmin (SQL Queries)

```sql
-- View all games for a specific sport
SELECT * FROM wp_sports_historical_data WHERE sport = 'NFL' ORDER BY game_date DESC;

-- Check line movements for games with significant changes
SELECT * FROM wp_line_movements 
WHERE ABS(spread_home) >= 2.0 
ORDER BY timestamp DESC;

-- Get reverse line movement alerts
SELECT h.*, COUNT(l.id) as movement_count
FROM wp_sports_historical_data h
JOIN wp_line_movements l ON h.game_id = l.game_id
WHERE l.reverse_line_movement = 1
GROUP BY h.game_id
ORDER BY movement_count DESC;

-- Analyze home dog performance
SELECT 
    sport,
    COUNT(*) as total_games,
    SUM(CASE WHEN spread_result = 'home_cover' THEN 1 ELSE 0 END) as home_covers,
    ROUND(SUM(CASE WHEN spread_result = 'home_cover' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as cover_rate
FROM wp_sports_historical_data 
WHERE closing_spread_home > 0 
AND game_status = 'final'
GROUP BY sport;
```

### Via WordPress Admin

1. **Dashboard Overview**
   - Go to "StatsPro Data" for summary statistics
   - View total games, line movements, and collection status

2. **Analytics Page**
   - Go to "StatsPro Data" → "Analytics"
   - View line movement analysis and recent RLM alerts
   - Execute custom SQL queries

3. **Collection Logs**
   - Go to "StatsPro Data" → "Collection"
   - Monitor collection history and success rates

## 📁 Step 6: CSV/File Import Setup

1. **Import Historical Data**
   - Go to "StatsPro Data" → "Data Import" (if available)
   - Upload CSV files with historical data
   - Map columns to database fields
   - Import your existing data

2. **Supported File Formats**
   - CSV files (recommended)
   - Excel files (.xlsx, .xls) - requires additional setup
   - Access databases (.accdb) - requires ODBC

## 🔄 Step 7: Automated Collection

Once configured, the system will:

1. **Hourly Data Collection**
   - Automatically fetch games from APIs
   - Store betting lines and movements
   - Collect team and player statistics
   - Log all collection activities

2. **Data Processing**
   - Calculate line movements
   - Detect reverse line movement
   - Store historical trends
   - Generate analytics data

## 🔍 Step 8: Data Analysis Examples

### Find Profitable Betting Trends

```sql
-- Teams that perform better as road dogs
SELECT 
    away_team_name,
    COUNT(*) as games,
    AVG(final_score_away - final_score_home) as avg_margin,
    SUM(CASE WHEN spread_result = 'away_cover' THEN 1 ELSE 0 END) / COUNT(*) * 100 as cover_rate
FROM wp_sports_historical_data 
WHERE closing_spread_away > 0 
AND game_status = 'final'
GROUP BY away_team_name
HAVING games >= 10
ORDER BY cover_rate DESC;
```

### Line Movement Analysis

```sql
-- Games with significant line movement
SELECT 
    h.game_id,
    h.sport,
    h.home_team_name,
    h.away_team_name,
    h.opening_spread_home,
    h.closing_spread_home,
    (h.closing_spread_home - h.opening_spread_home) as spread_movement,
    h.spread_result
FROM wp_sports_historical_data h
WHERE ABS(h.closing_spread_home - h.opening_spread_home) >= 2.0
AND h.game_status = 'final'
ORDER BY ABS(h.closing_spread_home - h.opening_spread_home) DESC;
```

## 🛠️ Troubleshooting

### Common Issues

1. **API Keys Not Working**
   - Verify keys in Settings page
   - Check API rate limits
   - Ensure internet connection

2. **No Data Being Collected**
   - Check collection logs for errors
   - Verify cron jobs are running
   - Test manual collection

3. **Database Errors**
   - Check table permissions
   - Verify WordPress database connection
   - Review error logs in collection logs

### Debug Mode

Enable debug mode in Settings to get detailed error logging:
```sql
UPDATE wp_sports_data_settings 
SET setting_value = 'true' 
WHERE setting_key = 'debug_mode';
```

## 📈 Benefits of This System

1. **Complete Historical Dataset**
   - Every game, line movement, and statistic stored
   - Permanent record for analysis
   - No data loss from API limitations

2. **Advanced Analysis Capabilities**
   - Custom SQL queries for any analysis
   - Trend identification over time
   - Market inefficiency detection

3. **Automated Data Collection**
   - Set it and forget it operation
   - Consistent data gathering
   - Real-time line movement tracking

4. **Easy Data Access**
   - phpMyAdmin for power users
   - WordPress admin for basic users
   - Export capabilities for external analysis

## 🔐 Security Notes

- Keep API keys secure and private
- Regularly backup your database
- Monitor collection logs for suspicious activity
- Use strong WordPress admin passwords

Your WordPress database is now configured as a comprehensive sports data warehouse! You can analyze trends, track line movements, and identify profitable betting patterns using the stored historical data.