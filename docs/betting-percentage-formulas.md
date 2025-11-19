                ┌────────────────────────────┐
                │  Start with all sportsbooks │
                └───────────────┬────────────┘
                                │
                                ▼
         ┌───────────────────────────────────────────┐
         │  Collect moneyline odds for HOME & AWAY   │
         └───────────────────────┬───────────────────┘
                                 │
                                 ▼
               ┌────────────────────────────────┐
               │   Average the moneylines       │
               │  (ignore missing values)       │
               └─────────────────┬──────────────┘
                                 │
                                 ▼
         ┌───────────────────────────────────────────┐
         │ Convert average American odds →           │
         │ implied probabilities using standard      │
         │ formulas for + and - odds                 │
         └────────────────────────┬──────────────────┘
                                  │
                                  ▼
           ┌──────────────────────────────────────┐
           │ Combine probabilities (p_home, p_away)│
           │ and normalize so they sum to 1        │
           └────────────────┬──────────────────────┘
                            │
                            ▼
         ┌───────────────────────────────────────────┐
         │ Final win probabilities:                  │
         │ WinProbHome = p_home / (p_home + p_away) │
         │ WinProbAway = p_away / (p_home + p_away) │
         └─────────────────┬────────────────────────┘
                           │
                           ▼
       ┌─────────────────────────────────────────────┐
       │ Multiply by 100 → Home% and Away%           │
       │ Show on UI with red/green styling           │
       └─────────────────────────────────────────────┘
