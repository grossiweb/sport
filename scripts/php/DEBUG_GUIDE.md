# Debugging ATS Records - Getting 0-0-0

## Problem: All ATS records showing 0-0-0

This means the script isn't finding betting data or spreads. Let's debug step by step.

---

## Step 1: Run the Test Script

```bash
cd scripts/php
php test-data.php
```

This will show you exactly what's wrong:
- ✅ Are games found?
- ✅ Do games have betting data?
- ✅ Is the spread structure correct?
- ✅ Can spreads be extracted?

---

## Common Issues & Solutions

### Issue 1: No Final Games Found

**Symptoms:**
```
Found 0 final CFB games for 2025
```

**Solutions:**

Check your games:
```javascript
// In mongosh:
db.games.find({ 
  sport_id: 1,  // 1=CFB, 2=NFL, 3=NCAAB, 4=NBA
  season_year: 2025 
}).count()

// Check game status
db.games.distinct("status")

// If status is something other than "final":
db.games.find({ 
  sport_id: 1,
  season_year: 2025,
  status: { $ne: "final" }
}).count()
```

**Fix:**
- Make sure games have `status: "final"`
- Or change the script to accept other statuses like "completed"

---

### Issue 2: No Betting Data

**Symptoms:**
```
❌ No betting data found for event XXX
Out of 10 sample games, 0 have betting data
```

**Solutions:**

Check betting_data collection:
```javascript
// In mongosh:
db.betting_data.find().limit(1).pretty()

// Check if event IDs match
db.games.findOne({ sport_id: 1, season_year: 2025 })
// Note the event_id, then:
db.betting_data.findOne({ event_id: "THE_EVENT_ID_FROM_ABOVE" })
```

**Fix:**
- Ensure `betting_data` collection exists
- Ensure `event_id` in betting_data matches `event_id` in games
- Load betting data into your database

---

### Issue 3: Wrong Spread Structure

**Symptoms:**
```
❌ No 'spread' key in betting line
OR
❌ No valid spreads found!
```

**Check your betting data structure:**

```javascript
// In mongosh:
db.betting_data.findOne()
```

Your structure should look like:
```javascript
{
  event_id: "abc123",
  lines: {
    "22": {  // Sportsbook ID
      spread: {
        point_spread_home: -7.5,
        point_spread_away: 7.5,
        point_spread_home_delta: -7.5,  // Closing line
        point_spread_away_delta: 7.5
      },
      // ... other line data
    },
    "23": { /* another book */ }
  }
}
```

**If your structure is different**, update the `getGameSpread()` function in `compute-ats-records.php` to match YOUR structure.

---

## Step 2: Manual Test with One Game

Create `scripts/php/test-one-game.php`:

```php
<?php
require_once __DIR__ . '/../../vendor/autoload.php';
use MongoDB\Client;

$mongoUri = getenv('MONGODB_URI') ?: 'mongodb://localhost:27017';
$client = new Client($mongoUri);
$db = $client->selectDatabase('statspro_sport');

// Get one CFB game
$game = $db->games->findOne([
    'sport_id' => 1,
    'season_year' => 2025,
    'status' => 'final'
]);

if (!$game) {
    die("No game found\n");
}

echo "Game: {$game['event_id']}\n";
echo "Home: {$game['home_team_id']} ({$game['home_score']})\n";
echo "Away: {$game['away_team_id']} ({$game['away_score']})\n\n";

// Get betting data
$betting = $db->betting_data->findOne(['event_id' => $game['event_id']]);

if (!$betting) {
    die("No betting data found!\n");
}

echo "Betting lines found: " . count((array)$betting['lines']) . "\n";

// Extract spreads
$lines = json_decode(json_encode($betting['lines']), true);
$spreads = [];

foreach ($lines as $bookKey => $line) {
    echo "\nBook: {$bookKey}\n";
    
    if (isset($line['spread'])) {
        $spread = $line['spread'];
        echo "  Home spread: " . ($spread['point_spread_home'] ?? 'null') . "\n";
        echo "  Away spread: " . ($spread['point_spread_away'] ?? 'null') . "\n";
        echo "  Home delta: " . ($spread['point_spread_home_delta'] ?? 'null') . "\n";
        echo "  Away delta: " . ($spread['point_spread_away_delta'] ?? 'null') . "\n";
        
        $h = $spread['point_spread_home_delta'] ?? $spread['point_spread_home'] ?? null;
        $a = $spread['point_spread_away_delta'] ?? $spread['point_spread_away'] ?? null;
        
        if (is_numeric($h)) $spreads[] = (float)$h;
        if (is_numeric($a)) $spreads[] = (float)$a;
    } else {
        echo "  No spread key!\n";
        echo "  Keys available: " . implode(', ', array_keys($line)) . "\n";
    }
}

echo "\nTotal spreads extracted: " . count($spreads) . "\n";

if (count($spreads) > 0) {
    $avgSpread = array_sum($spreads) / count($spreads);
    echo "Average spread: {$avgSpread}\n";
    
    // Test ATS
    $homeScore = $game['home_score'];
    $awayScore = $game['away_score'];
    $homeAdjusted = $homeScore + $avgSpread;
    
    echo "\nATS Test:\n";
    echo "  Home {$homeScore} + ({$avgSpread}) = {$homeAdjusted}\n";
    echo "  vs Away {$awayScore}\n";
    
    if ($homeAdjusted > $awayScore) {
        echo "  Result: Home covers!\n";
    } elseif ($homeAdjusted < $awayScore) {
        echo "  Result: Home doesn't cover\n";
    } else {
        echo "  Result: Push\n";
    }
} else {
    echo "ERROR: Could not extract any spreads!\n";
}
?>
```

Run it:
```bash
php test-one-game.php
```

---

## Step 3: Check Data Quality

```javascript
// In mongosh:

// 1. How many games have betting data?
var games = db.games.find({ 
  sport_id: 1, 
  season_year: 2025, 
  status: "final" 
}).toArray();

var withBetting = 0;
games.forEach(function(g) {
  if (db.betting_data.findOne({ event_id: g.event_id })) {
    withBetting++;
  }
});

print("Games with betting data: " + withBetting + " / " + games.length);

// 2. Check one betting document structure
db.betting_data.findOne({}, { lines: { $slice: 1 } });
```

---

## Step 4: Common Fixes

### Fix 1: Change Status Filter

If your games don't have status="final":

```php
// In compute-ats-records.php, line ~120
// Change:
'status' => 'final'

// To:
'status' => ['$in' => ['final', 'completed', 'closed']]
```

### Fix 2: Handle Different Spread Structure

If your spreads are stored differently:

```php
// In getGameSpread() function, adjust to match YOUR structure
// Example if spreads are at top level:
$spreadHome = $betting['spread_home'] ?? null;
$spreadAway = $betting['spread_away'] ?? null;
```

### Fix 3: Use Different Spread Field

If you don't have delta fields:

```php
// Remove delta fallback:
$spreadHome = $lineArray['spread']['point_spread_home'] ?? null;
$spreadAway = $lineArray['spread']['point_spread_away'] ?? null;
```

---

## Step 5: Add Debug Output

Add this to `compute-ats-records.php` after line 160:

```php
// After: $spread = $this->getGameSpread($eventId, $teamIdInt);
if ($spread === null) {
    // Debug: why no spread?
    static $debugCount = 0;
    if ($debugCount < 3) {  // Only show first 3
        echo "    [DEBUG] No spread for event: {$eventId}\n";
        $debugCount++;
    }
    continue;
} else {
    static $foundCount = 0;
    if ($foundCount < 1) {  // Show first successful one
        echo "    [DEBUG] Found spread: {$spread} for event: {$eventId}\n";
        $foundCount++;
    }
}
```

---

## Expected Output (When Working)

```
🏈 Computing ATS records for CFB 2025 season...

📊 Found 130 teams
  Processing: Alabama Crimson Tide (ID: 333)...
    [DEBUG] Found spread: -14.5 for event: abc123
    ✓ Computed: Overall (7-3-0), Home (4-1-0), Road (3-2-0), Last 10 (7-3-0)
  Processing: Georgia Bulldogs (ID: 257)...
    ✓ Computed: Overall (8-2-1), Home (5-0-0), Road (3-2-1), Last 10 (8-2-0)
...
```

---

## Still Having Issues?

1. **Export sample data:**
```javascript
// In mongosh:
db.games.findOne({ sport_id: 1, season_year: 2025 })
db.betting_data.findOne()
```

2. **Share the structure** so I can adjust the script

3. **Check the test scripts output** and share what you see

---

## Quick Verification Checklist

- [ ] Games collection has CFB games with season_year=2025
- [ ] Games have status="final" (or similar)
- [ ] betting_data collection exists
- [ ] betting_data has event_ids matching games
- [ ] betting_data has "lines" field
- [ ] Lines have "spread" data
- [ ] Spreads have point_spread_home and point_spread_away fields
- [ ] Spread values are numbers (not null, not 0)

If ALL checkboxes are ✅ and you still get 0-0-0, run the test scripts and share the output!

