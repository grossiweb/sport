# Database Performance Indexes

## Critical Indexes for Matchup List Performance

Run these MongoDB index commands to dramatically speed up matchup queries:

### 1. Games Collection Indexes

```javascript
// Index for fetching games by sport and date range (most common query)
db.games.createIndex(
  { sport_id: 1, date_event: 1 },
  { name: "idx_sport_date" }
)

// Compound index for season-based queries
db.games.createIndex(
  { sport_id: 1, season_year: 1, date_event: 1 },
  { name: "idx_sport_season_date" }
)

// Index for team-based queries (used in covers summary)
db.games.createIndex(
  { sport_id: 1, home_team_id: 1, date_event: -1 },
  { name: "idx_sport_home_date_desc" }
)

db.games.createIndex(
  { sport_id: 1, away_team_id: 1, date_event: -1 },
  { name: "idx_sport_away_date_desc" }
)

// Compound index for bulk team queries
db.games.createIndex(
  { sport_id: 1, season_year: 1, home_team_id: 1 },
  { name: "idx_sport_season_home" }
)

db.games.createIndex(
  { sport_id: 1, season_year: 1, away_team_id: 1 },
  { name: "idx_sport_season_away" }
)
```

### 2. Betting Data Collection Indexes

```javascript
// Critical: Index for bulk betting summary queries
db.betting_data.createIndex(
  { event_id: 1 },
  { name: "idx_event_id" }
)

// If you query by affiliate/sportsbook
db.betting_data.createIndex(
  { event_id: 1, "lines.affiliate.affiliate_id": 1 },
  { name: "idx_event_affiliate" }
)
```

### 3. Teams Collection Indexes

```javascript
// Index for sport-specific team queries
db.teams.createIndex(
  { sport_id: 1, team_id: 1 },
  { name: "idx_sport_team" }
)

// Index for CFB division filtering
db.teams.createIndex(
  { sport_id: 1, "division.division_id": 1 },
  { name: "idx_sport_division" }
)
```

### 4. Team Stats Collection Indexes

```javascript
// Index for fetching team stats by season
db.team_stats.createIndex(
  { team_id: 1, season_year: 1 },
  { name: "idx_team_season" }
)
```

## How to Apply These Indexes

### Option 1: MongoDB Shell

```bash
mongosh "your-connection-string"
use statspro_sport
# Then paste each createIndex command above
```

### Option 2: MongoDB Compass

1. Connect to your database
2. Navigate to each collection
3. Go to "Indexes" tab
4. Click "Create Index"
5. Paste the index definition (the first parameter of createIndex)

### Option 3: Node.js Script

Create a file `scripts/create-indexes.js`:

```javascript
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createIndexes() {
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Creating games indexes...');
    await db.collection('games').createIndex(
      { sport_id: 1, date_event: 1 },
      { name: "idx_sport_date" }
    );
    await db.collection('games').createIndex(
      { sport_id: 1, season_year: 1, date_event: 1 },
      { name: "idx_sport_season_date" }
    );
    // ... add all other indexes
    
    console.log('Creating betting_data indexes...');
    await db.collection('betting_data').createIndex(
      { event_id: 1 },
      { name: "idx_event_id" }
    );
    
    console.log('All indexes created successfully!');
  } finally {
    await client.close();
  }
}

createIndexes().catch(console.error);
```

Run with:
```bash
node scripts/create-indexes.js
```

## Expected Performance Impact

- **Games queries**: 10-50x faster for date range lookups
- **Betting data bulk fetch**: 20-100x faster for getBettingSummariesForEvents
- **Covers summary**: 5-20x faster for team season queries
- **Overall page load**: Should reduce from 3-5 seconds to under 1 second

## Verify Index Usage

Check if queries are using indexes:

```javascript
// In MongoDB shell:
db.games.find({ sport_id: 2, date_event: { $gte: "2025-12-01", $lte: "2025-12-08" } }).explain("executionStats")

// Look for:
// - "IXSCAN" (index scan) instead of "COLLSCAN" (collection scan)
// - Low "totalDocsExamined" compared to "totalKeysExamined"
```

## Index Monitoring

After creating indexes, monitor:

1. Index size: `db.collection.stats().indexSizes`
2. Index usage: `db.collection.aggregate([{$indexStats:{}}])`
3. Slow queries: Enable profiling `db.setProfilingLevel(1, { slowms: 100 })`

