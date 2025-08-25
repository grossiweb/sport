'use client'

import React from 'react'
import AdvancedGameAnalysis from '@/components/matchups/AdvancedGameAnalysis'
import StartingPitchersSection from '@/components/matchups/StartingPitchersSection'

// Sample data matching the uploaded image structure
const sampleGameData = {
  gameInfo: {
    awayTeam: "Royals",
    homeTeam: "Blue Jays", 
    date: "8/01/2025",
    time: "7:07 PM ET"
  },
  offensiveStats: {
    runsPerGame: [
      { team: "Royals", rank: 15, value: 5.0, trend: "neutral" as const },
      { team: "Blue Jays", rank: 14, value: 5.0, trend: "up" as const }
    ],
    ops: [
      { team: "Royals", rank: 14, value: 0.820, trend: "up" as const, advantage: true },
      { team: "Blue Jays", rank: 3, value: 0.815, trend: "neutral" as const }
    ],
    slg: [
      { team: "Royals", rank: 11, value: 0.425, trend: "up" as const },
      { team: "Blue Jays", rank: 7, value: 0.415, trend: "neutral" as const }
    ],
    battingAverage: [
      { team: "Royals", rank: 16, value: 0.255, trend: "neutral" as const },
      { team: "Blue Jays", rank: 3, value: 0.306, trend: "up" as const, advantage: true }
    ],
    era: [
      { team: "Royals", rank: 15, value: 4.080, trend: "neutral" as const },
      { team: "Blue Jays", rank: 24, value: 4.620, trend: "down" as const }
    ]
  },
  battingStats: {
    strikeoutsPerGame: [
      { team: "Royals", rank: 5, value: 6.83, trend: "down" as const },
      { team: "Blue Jays", rank: 6, value: 7.45, trend: "neutral" as const }
    ],
    walksPerGame: [
      { team: "Royals", rank: 5, value: 4.00, trend: "down" as const },
      { team: "Blue Jays", rank: 11, value: 3.45, trend: "neutral" as const }
    ]
  },
  pitchingStats: {
    whip: [
      { team: "Royals", rank: 27, value: 1.460, trend: "up" as const },
      { team: "Blue Jays", rank: 20, value: 1.410, trend: "neutral" as const }
    ],
    oppBattingAverage: [
      { team: "Royals", rank: 14, value: 0.248, trend: "down" as const },
      { team: "Blue Jays", rank: 28, value: 0.263, trend: "neutral" as const }
    ],
    oppRunsPerGame: [
      { team: "Royals", rank: 16, value: 4.533, trend: "down" as const },
      { team: "Blue Jays", rank: 23, value: 4.786, trend: "neutral" as const }
    ],
    oppStrikeoutsPerGame: [
      { team: "Royals", rank: 23, value: 7.554, trend: "up" as const },
      { team: "Blue Jays", rank: 2, value: 10.576, trend: "neutral" as const, advantage: true }
    ]
  },
  record: {
    overall: ["26-27", "64-46"],
    away: ["26-27", "37-17"],
    home: ["28-28", "27-19"],
    last10: ["3-7", "5-5"],
    streak: ["W2", "W1"]
  },
  totalRunsScored: [10.0, 11.1],
  startingPitchers: {
    away: {
      name: "Michael Wacha",
      record: "4-5",
      era: 3.53,
      so: 50
    },
    home: {
      name: "Not Listed",
      record: "0",
      era: 0,
      so: 0
    }
  }
}

// Sample pitcher data matching the uploaded image
const samplePitcherData = {
  awayPitcher: {
    name: "Michael Wacha",
    team: "Royals",
    teamColor: "blue" as const,
    record: "4-5",
    era: 3.53,
    whip: 1.15,
    strikeouts: 85,
    innings: 102.1,
    wins: 4,
    losses: 5,
    restDays: 4,
    recentForm: "average" as const,
    lastStart: {
      date: "07/25/2025",
      opponent: "Cardinals",
      result: "W",
      innings: 6,
      runs: 2,
      strikeouts: 7
    },
    homeAwayStats: {
      home: { era: 3.21, record: "2-2" },
      away: { era: 3.85, record: "2-3" }
    },
    season2024: {
      era: 4.15,
      whip: 1.28,
      record: "13-8"
    }
  },
  homePitcher: {
    name: "Kevin Gausman",
    team: "Blue Jays",
    teamColor: "red" as const,
    record: "8-7",
    era: 3.91,
    whip: 1.22,
    strikeouts: 127,
    innings: 118.2,
    wins: 8,
    losses: 7,
    restDays: 5,
    recentForm: "hot" as const,
    lastStart: {
      date: "07/26/2025",
      opponent: "Angels",
      result: "W",
      innings: 7,
      runs: 1,
      strikeouts: 9
    },
    homeAwayStats: {
      home: { era: 3.45, record: "5-2" },
      away: { era: 4.37, record: "3-5" }
    },
    season2024: {
      era: 4.22,
      whip: 1.35,
      record: "14-11"
    }
  },
  matchupAdvantage: "home" as const
}

const AnalysisPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Game Analysis
          </h1>
          <p className="text-gray-600">
            Comprehensive statistical breakdown and team comparison
          </p>
        </div>
        
        <AdvancedGameAnalysis data={sampleGameData} />
        
        {/* Starting Pitchers Section */}
        <div className="mt-8">
          <StartingPitchersSection 
            awayPitcher={samplePitcherData.awayPitcher}
            homePitcher={samplePitcherData.homePitcher}
            matchupAdvantage={samplePitcherData.matchupAdvantage}
          />
        </div>
        
        {/* Additional Analysis Sections */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Key Insights</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Blue Jays have significant batting average advantage (.306 vs .255)</li>
              <li>• Royals showing better recent OPS performance (trending up)</li>
              <li>• Blue Jays superior in strikeouts per game (10.576 vs 7.554)</li>
              <li>• Home field advantage favors Blue Jays (27-19 record)</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Betting Trends</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm font-medium text-green-800">Over Trend</div>
                <div className="text-xs text-green-600">Combined 21.1 runs per game average</div>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-800">Home Favorite</div>
                <div className="text-xs text-blue-600">Blue Jays statistical advantage</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Weather & Conditions</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium">75°F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wind:</span>
                <span className="font-medium">5 mph out to LF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Humidity:</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Park Factor:</span>
                <span className="font-medium">Neutral</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Historical Performance */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Head-to-Head History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-center">Away</th>
                  <th className="py-3 px-4 text-center">Home</th>
                  <th className="py-3 px-4 text-center">Total</th>
                  <th className="py-3 px-4 text-center">Spread</th>
                  <th className="py-3 px-4 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">07/15/2025</td>
                  <td className="py-3 px-4 text-center">Royals 4</td>
                  <td className="py-3 px-4 text-center">Blue Jays 7</td>
                  <td className="py-3 px-4 text-center">11 (O 9.5)</td>
                  <td className="py-3 px-4 text-center">-1.5 (BJ)</td>
                  <td className="py-3 px-4 text-center text-green-600">✓ Cover</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">06/22/2025</td>
                  <td className="py-3 px-4 text-center">Royals 8</td>
                  <td className="py-3 px-4 text-center">Blue Jays 3</td>
                  <td className="py-3 px-4 text-center">11 (O 10.0)</td>
                  <td className="py-3 px-4 text-center">+2.5 (KC)</td>
                  <td className="py-3 px-4 text-center text-green-600">✓ Cover</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">05/18/2025</td>
                  <td className="py-3 px-4 text-center">Royals 2</td>
                  <td className="py-3 px-4 text-center">Blue Jays 6</td>
                  <td className="py-3 px-4 text-center">8 (U 9.0)</td>
                  <td className="py-3 px-4 text-center">-1.0 (BJ)</td>
                  <td className="py-3 px-4 text-center text-red-600">✗ No Cover</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage