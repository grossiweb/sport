#!/usr/bin/env node
/**
 * Node.js script to compute ATS (Against The Spread) records
 * and populate the ats_records collection in MongoDB
 */

const { MongoClient } = require('mongodb')

// Sport ID mappings
const SPORT_MAP = {
  NFL: 2,
  CFB: 1,
  NCAAB: 5,
  NBA: 4
}

class ATSRecordComputer {
  constructor(mongoUri, dbName = 'sportStats') {
    this.mongoUri = mongoUri
    this.dbName = dbName
    this.client = null
    this.db = null
  }

  async connect() {
    this.client = await MongoClient.connect(this.mongoUri)
    this.db = this.client.db(this.dbName)
    console.log(`✓ Connected to MongoDB: ${this.dbName}`)
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      console.log('✓ Disconnected from MongoDB')
    }
  }

  async computeForSport(sportName, season) {
    const sportId = SPORT_MAP[sportName]
    if (!sportId) {
      throw new Error(`Invalid sport: ${sportName}`)
    }

    console.log(`\n=== Computing ATS records for ${sportName} (season ${season}) ===`)

    const gamesCol = this.db.collection('games')
    const bettingCol = this.db.collection('betting_data')
    const atsCol = this.db.collection('ats_records')
    const teamsCol = this.db.collection('teams')

    // Get all teams for this sport
    const teams = await teamsCol.find({ sport_id: sportId }).toArray()
    console.log(`Found ${teams.length} teams`)

    let processed = 0
    let skipped = 0

    for (const team of teams) {
      const teamId = team.team_id

      // Get all games for this team this season
      const games = await gamesCol
        .find({
          sport_id: sportId,
          season_year: season, // games collection uses season_year
          $or: [{ home_team_id: teamId }, { away_team_id: teamId }]
        })
        .sort({ date_event: -1 })
        .toArray()

      if (games.length === 0) {
        skipped++
        continue
      }

      // Compute ATS records
      const records = {
        overall: { wins: 0, losses: 0, pushes: 0, gamesPlayed: 0 },
        home: { wins: 0, losses: 0, pushes: 0, gamesPlayed: 0 },
        road: { wins: 0, losses: 0, pushes: 0, gamesPlayed: 0 },
        lastTen: { wins: 0, losses: 0, pushes: 0, gamesPlayed: 0 }
      }

      let lastTenCount = 0

      for (const game of games) {
        // Only process final games
        if (game.status !== 'final') continue

        const isHome = game.home_team_id === teamId
        const teamScore = isHome ? game.home_score : game.away_score
        const oppScore = isHome ? game.away_score : game.home_score

        // Skip if no scores
        if (teamScore == null || oppScore == null) continue

        // Get betting data
        const betting = await bettingCol.findOne({ event_id: game.event_id })
        if (!betting) continue

        const spread = isHome ? betting.spread_home : betting.spread_away
        if (spread == null) continue

        // Compute ATS result
        const scoreDiff = teamScore - oppScore
        const atsResult = scoreDiff + spread

        let result
        if (Math.abs(atsResult) < 0.5) {
          result = 'push'
          records.overall.pushes++
          if (isHome) records.home.pushes++
          else records.road.pushes++
          if (lastTenCount < 10) records.lastTen.pushes++
        } else if (atsResult > 0) {
          result = 'win'
          records.overall.wins++
          if (isHome) records.home.wins++
          else records.road.wins++
          if (lastTenCount < 10) records.lastTen.wins++
        } else {
          result = 'loss'
          records.overall.losses++
          if (isHome) records.home.losses++
          else records.road.losses++
          if (lastTenCount < 10) records.lastTen.losses++
        }

        records.overall.gamesPlayed++
        if (isHome) records.home.gamesPlayed++
        else records.road.gamesPlayed++
        if (lastTenCount < 10) {
          records.lastTen.gamesPlayed++
          lastTenCount++
        }
      }

      // Skip teams with no ATS games
      if (records.overall.gamesPlayed === 0) {
        skipped++
        continue
      }

      // Save to ats_records collection
      // Schema must match Next.js `getBulkAtsRecords()` expectations:
      // { sport_id, season, team_id, ats: { overall, home, road, lastTen } }
      await atsCol.updateOne(
        {
          sport_id: sportId,
          team_id: teamId,
          season: season
        },
        {
          $set: {
            sport_id: sportId,
            team_id: teamId,
            season: season,
            ats: {
              overall: records.overall,
              home: records.home,
              road: records.road,
              lastTen: records.lastTen
            },
            updated_at: new Date()
          }
        },
        { upsert: true }
      )

      processed++
      if (processed % 10 === 0) {
        process.stdout.write(`\rProcessed: ${processed}/${teams.length} teams`)
      }
    }

    console.log(`\n✓ Completed: ${processed} teams processed, ${skipped} skipped`)
  }

  async createIndexes() {
    console.log('\n=== Creating indexes ===')
    const atsCol = this.db.collection('ats_records')

    await atsCol.createIndex({ sport_id: 1, team_id: 1, season: 1 }, { unique: true })
    await atsCol.createIndex({ sport_id: 1, season: 1 })
    await atsCol.createIndex({ team_id: 1 })

    console.log('✓ Indexes created')
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const dbName = process.env.MONGODB_DB || 'sportStats'

  const computer = new ATSRecordComputer(mongoUri, dbName)

  try {
    await computer.connect()

    // Parse arguments
    const sportArg = args.find(a => a.startsWith('--sport='))
    const seasonArg = args.find(a => a.startsWith('--season='))
    const allFlag = args.includes('--all')
    const indexFlag = args.includes('--create-indexes')

    const season = seasonArg ? parseInt(seasonArg.split('=')[1]) : new Date().getFullYear()

    if (indexFlag) {
      await computer.createIndexes()
    }

    if (allFlag) {
      for (const sport of Object.keys(SPORT_MAP)) {
        await computer.computeForSport(sport, season)
      }
    } else if (sportArg) {
      const sport = sportArg.split('=')[1].toUpperCase()
      await computer.computeForSport(sport, season)
    } else {
      console.log(`
Usage:
  node compute-ats-records.js --sport=NFL --season=2025
  node compute-ats-records.js --sport=CFB --season=2025
  node compute-ats-records.js --sport=NCAAB --season=2026
  node compute-ats-records.js --sport=NBA --season=2025
  node compute-ats-records.js --all --season=2025
  node compute-ats-records.js --create-indexes

Environment variables:
  MONGODB_URI - MongoDB connection string (default: mongodb://localhost:27017)
  MONGODB_DB - Database name (default: sportStats)
      `)
    }

    console.log('\n✅ All done!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await computer.disconnect()
  }
}

main()

