/**
 * Script to create performance indexes for the matchup listing page
 * 
 * Run with: node scripts/create-performance-indexes.js
 * 
 * Make sure MONGODB_URI is set in your .env file
 */

require('dotenv').config()
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('ERROR: MONGODB_URI environment variable is not set')
  process.exit(1)
}

async function createIndexes() {
  const client = new MongoClient(uri)

  try {
    console.log('Connecting to MongoDB...')
    await client.connect()
    console.log('Connected successfully!\n')

    const db = client.db()

    // ========== GAMES COLLECTION ==========
    console.log('📊 Creating indexes for GAMES collection...')
    
    console.log('  - Creating index: sport_id + date_event')
    await db.collection('games').createIndex(
      { sport_id: 1, date_event: 1 },
      { name: 'idx_sport_date', background: true }
    )
    
    console.log('  - Creating index: sport_id + season_year + date_event')
    await db.collection('games').createIndex(
      { sport_id: 1, season_year: 1, date_event: 1 },
      { name: 'idx_sport_season_date', background: true }
    )
    
    console.log('  - Creating index: sport_id + home_team_id + date_event (descending)')
    await db.collection('games').createIndex(
      { sport_id: 1, home_team_id: 1, date_event: -1 },
      { name: 'idx_sport_home_date_desc', background: true }
    )
    
    console.log('  - Creating index: sport_id + away_team_id + date_event (descending)')
    await db.collection('games').createIndex(
      { sport_id: 1, away_team_id: 1, date_event: -1 },
      { name: 'idx_sport_away_date_desc', background: true }
    )
    
    console.log('  - Creating index: sport_id + season_year + home_team_id')
    await db.collection('games').createIndex(
      { sport_id: 1, season_year: 1, home_team_id: 1 },
      { name: 'idx_sport_season_home', background: true }
    )
    
    console.log('  - Creating index: sport_id + season_year + away_team_id')
    await db.collection('games').createIndex(
      { sport_id: 1, season_year: 1, away_team_id: 1 },
      { name: 'idx_sport_season_away', background: true }
    )

    console.log('✅ Games indexes created!\n')

    // ========== BETTING DATA COLLECTION ==========
    console.log('💰 Creating indexes for BETTING_DATA collection...')
    
    console.log('  - Creating index: event_id')
    await db.collection('betting_data').createIndex(
      { event_id: 1 },
      { name: 'idx_event_id', background: true }
    )

    console.log('✅ Betting data indexes created!\n')

    // ========== TEAMS COLLECTION ==========
    console.log('🏈 Creating indexes for TEAMS collection...')
    
    console.log('  - Creating index: sport_id + team_id')
    await db.collection('teams').createIndex(
      { sport_id: 1, team_id: 1 },
      { name: 'idx_sport_team', background: true }
    )
    
    console.log('  - Creating index: sport_id + division.division_id')
    await db.collection('teams').createIndex(
      { sport_id: 1, 'division.division_id': 1 },
      { name: 'idx_sport_division', background: true }
    )

    console.log('✅ Teams indexes created!\n')

    // ========== TEAM STATS COLLECTION ==========
    console.log('📈 Creating indexes for TEAM_STATS collection...')
    
    console.log('  - Creating index: team_id + season_year')
    await db.collection('team_stats').createIndex(
      { team_id: 1, season_year: 1 },
      { name: 'idx_team_season', background: true }
    )

    console.log('✅ Team stats indexes created!\n')

    // ========== VERIFY INDEXES ==========
    console.log('🔍 Verifying created indexes...\n')

    const gamesIndexes = await db.collection('games').indexes()
    console.log(`📊 Games collection has ${gamesIndexes.length} indexes:`)
    gamesIndexes.forEach(idx => console.log(`   - ${idx.name}`))

    const bettingIndexes = await db.collection('betting_data').indexes()
    console.log(`\n💰 Betting data collection has ${bettingIndexes.length} indexes:`)
    bettingIndexes.forEach(idx => console.log(`   - ${idx.name}`))

    const teamsIndexes = await db.collection('teams').indexes()
    console.log(`\n🏈 Teams collection has ${teamsIndexes.length} indexes:`)
    teamsIndexes.forEach(idx => console.log(`   - ${idx.name}`))

    const statsIndexes = await db.collection('team_stats').indexes()
    console.log(`\n📈 Team stats collection has ${statsIndexes.length} indexes:`)
    statsIndexes.forEach(idx => console.log(`   - ${idx.name}`))

    console.log('\n✨ All indexes created successfully!')
    console.log('\n📌 Next steps:')
    console.log('   1. Test your matchup page - it should load much faster now')
    console.log('   2. Monitor query performance in MongoDB logs')
    console.log('   3. Use .explain() on slow queries to verify index usage')
    console.log('\n🎉 Performance optimization complete!')

  } catch (error) {
    console.error('\n❌ Error creating indexes:', error)
    console.error('\nIf you see "Index already exists" errors, that\'s OK - it means indexes are already created.')
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nConnection closed.')
  }
}

// Run the script
createIndexes().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

