# Quick Start Guide - ATS Pre-computation

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (One-time)

```bash
cd scripts/php
chmod +x setup.sh
./setup.sh
```

### Step 2: Set MongoDB Connection

```bash
# Windows (PowerShell)
$env:MONGODB_URI = "mongodb://localhost:27017"

# Windows (CMD)
set MONGODB_URI=mongodb://localhost:27017

# Linux/Mac
export MONGODB_URI="mongodb://localhost:27017"
```

### Step 3: Run the Script

```bash
# Test with one sport first
php compute-ats-records.php --sport=NFL --season=2025

# If it works, run for all sports
php compute-ats-records.php --all --season=2025
```

### Step 4: Verify Data

```bash
mongosh
use statspro_sport
db.ats_records.find({ sport: "NFL" }).limit(1).pretty()
```

You should see something like:

```javascript
{
  sport: "NFL",
  season: 2025,
  team_id: 123,
  team_name: "Dallas Cowboys",
  ats: {
    overall: { wins: 8, losses: 5, pushes: 1, gamesPlayed: 14 },
    home: { wins: 5, losses: 2, pushes: 0, gamesPlayed: 7 },
    road: { wins: 3, losses: 3, pushes: 1, gamesPlayed: 7 },
    lastTen: { wins: 6, losses: 3, pushes: 1, gamesPlayed: 10 }
  }
}
```

---

## ✅ That's It!

Now your ATS data is pre-computed and stored in MongoDB.

### Next: Update Your Next.js App

See the main README.md for how to:
1. Create API endpoint to read from `ats_records` collection
2. Remove old ATS computation code
3. Enjoy 95% faster page loads!

### Optional: Set Up Auto-Updates

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM)
0 3 * * * cd /path/to/scripts/php && ./run-daily.sh
```

---

## Troubleshooting

### "Composer not found"

Install Composer: https://getcomposer.org/

### "MongoDB extension not found"

```bash
# Ubuntu/Debian
sudo apt-get install php-mongodb

# macOS
pecl install mongodb

# Windows
# Download php_mongodb.dll and enable in php.ini
```

### "No games found"

Check that:
1. Games exist in your `games` collection
2. Games have `status: 'final'`
3. You're using the correct season year

### Need Help?

See full README.md for detailed documentation.

