import React from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

interface TeamStats {
  team: string
  rank: number
  value: number
  trend: 'up' | 'down' | 'neutral'
  advantage?: boolean
}

interface GameAnalysisData {
  gameInfo: {
    awayTeam: string
    homeTeam: string
    date: string
    time: string
  }
  offensiveStats: {
    runsPerGame: TeamStats[]
    ops: TeamStats[]
    slg: TeamStats[]
    battingAverage: TeamStats[]
    era: TeamStats[]
  }
  battingStats: {
    strikeoutsPerGame: TeamStats[]
    walksPerGame: TeamStats[]
  }
  pitchingStats: {
    whip: TeamStats[]
    oppBattingAverage: TeamStats[]
    oppRunsPerGame: TeamStats[]
    oppStrikeoutsPerGame: TeamStats[]
  }
  record: {
    overall: string[]
    away: string[]
    home: string[]
    last10: string[]
    streak: string[]
  }
  totalRunsScored: number[]
  startingPitchers: {
    away: {
      name: string
      record: string
      era: number
      so: number
    }
    home: {
      name: string
      record: string
      era: number
      so: number
    }
  }
}

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'neutral' }> = ({ trend }) => {
  if (trend === 'up') {
    return <ChevronUpIcon className="w-4 h-4 text-green-500" />
  }
  if (trend === 'down') {
    return <ChevronDownIcon className="w-4 h-4 text-red-500" />
  }
  return <div className="w-4 h-4" />
}

const StatRow: React.FC<{
  label: string
  awayStats: TeamStats
  homeStats: TeamStats
  format?: 'decimal' | 'integer'
}> = ({ label, awayStats, homeStats, format = 'decimal' }) => {
  const formatValue = (value: number) => {
    if (format === 'integer') return value.toString()
    return value.toFixed(3)
  }

  return (
    <tr className="border-b border-gray-200">
      <td className="py-2 px-3 text-left font-medium text-gray-800">{label}</td>
      
      {/* Away Team */}
      <td className={`py-2 px-2 text-center ${awayStats.advantage ? 'bg-blue-50' : ''}`}>
        {formatValue(awayStats.value)}
      </td>
      <td className="py-2 px-2 text-center text-sm text-gray-600">
        {awayStats.rank}
      </td>
      <td className="py-2 px-2 text-center">
        <TrendIcon trend={awayStats.trend} />
      </td>
      
      {/* Home Team */}
      <td className={`py-2 px-2 text-center ${homeStats.advantage ? 'bg-blue-50' : ''}`}>
        {formatValue(homeStats.value)}
      </td>
      <td className="py-2 px-2 text-center text-sm text-gray-600">
        {homeStats.rank}
      </td>
      <td className="py-2 px-2 text-center">
        <TrendIcon trend={homeStats.trend} />
      </td>
      
      <td className="py-2 px-3 text-center text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          awayStats.advantage ? 'bg-blue-100 text-blue-800' : 
          homeStats.advantage ? 'bg-red-100 text-red-800' : 
          'bg-gray-100 text-gray-600'
        }`}>
          {awayStats.advantage ? awayStats.team : 
           homeStats.advantage ? homeStats.team : 
           'Even'}
        </span>
      </td>
    </tr>
  )
}

const AdvancedGameAnalysis: React.FC<{ data: GameAnalysisData }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {data.gameInfo.awayTeam} at {data.gameInfo.homeTeam}
          </h2>
          <div className="text-right">
            <div className="text-lg font-semibold">{data.gameInfo.time}</div>
            <div className="text-sm text-gray-600">{data.gameInfo.date}</div>
          </div>
        </div>
      </div>

      {/* Main Statistics Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-3 text-left border-b-2 border-gray-300"></th>
              <th colSpan={3} className="py-3 px-2 text-center border-b-2 border-gray-300 bg-blue-50">
                <div className="font-bold text-blue-900">Away</div>
                <div className="text-sm font-medium text-blue-700">{data.gameInfo.awayTeam}</div>
              </th>
              <th colSpan={3} className="py-3 px-2 text-center border-b-2 border-gray-300 bg-red-50">
                <div className="font-bold text-red-900">Home</div>
                <div className="text-sm font-medium text-red-700">{data.gameInfo.homeTeam}</div>
              </th>
              <th className="py-3 px-3 text-center border-b-2 border-gray-300">
                <div className="font-bold">Edge</div>
                <div className="text-xs">Last Seven Days</div>
              </th>
            </tr>
            <tr className="bg-gray-100 text-sm">
              <th className="py-2 px-3 text-left border-b border-gray-300"></th>
              <th className="py-2 px-2 text-center border-b border-gray-300">Rank</th>
              <th className="py-2 px-2 text-center border-b border-gray-300">Home</th>
              <th className="py-2 px-2 text-center border-b border-gray-300">Rank</th>
              <th className="py-2 px-2 text-center border-b border-gray-300">Away</th>
              <th className="py-2 px-2 text-center border-b border-gray-300">Rank</th>
              <th className="py-2 px-2 text-center border-b border-gray-300">Home</th>
              <th className="py-2 px-3 text-center border-b border-gray-300">Team</th>
            </tr>
          </thead>
          <tbody>
            {/* Key Factors Section */}
            <tr className="bg-gray-200">
              <td colSpan={8} className="py-2 px-3 font-bold text-gray-800">Key Factors</td>
            </tr>
            
            <StatRow 
              label="OPS" 
              awayStats={data.offensiveStats.ops[0]} 
              homeStats={data.offensiveStats.ops[1]} 
            />
            <StatRow 
              label="ERA" 
              awayStats={data.offensiveStats.era[0]} 
              homeStats={data.offensiveStats.era[1]} 
            />
            <StatRow 
              label="SLG" 
              awayStats={data.offensiveStats.slg[0]} 
              homeStats={data.offensiveStats.slg[1]} 
            />
            <StatRow 
              label="Batting Average" 
              awayStats={data.offensiveStats.battingAverage[0]} 
              homeStats={data.offensiveStats.battingAverage[1]} 
            />

            {/* Batting Section */}
            <tr className="bg-gray-200">
              <td colSpan={8} className="py-2 px-3 font-bold text-gray-800">Batting</td>
            </tr>
            
            <StatRow 
              label="Strikeouts per Game" 
              awayStats={data.battingStats.strikeoutsPerGame[0]} 
              homeStats={data.battingStats.strikeoutsPerGame[1]} 
              format="decimal"
            />
            <StatRow 
              label="Walks per Game" 
              awayStats={data.battingStats.walksPerGame[0]} 
              homeStats={data.battingStats.walksPerGame[1]} 
              format="decimal"
            />

            {/* Pitching Section */}
            <tr className="bg-gray-200">
              <td colSpan={8} className="py-2 px-3 font-bold text-gray-800">Pitching</td>
            </tr>
            
            <StatRow 
              label="WHIP" 
              awayStats={data.pitchingStats.whip[0]} 
              homeStats={data.pitchingStats.whip[1]} 
            />
            <StatRow 
              label="Opponents Batting Average" 
              awayStats={data.pitchingStats.oppBattingAverage[0]} 
              homeStats={data.pitchingStats.oppBattingAverage[1]} 
            />
            <StatRow 
              label="Opponents Runs per Game" 
              awayStats={data.pitchingStats.oppRunsPerGame[0]} 
              homeStats={data.pitchingStats.oppRunsPerGame[1]} 
              format="decimal"
            />
            <StatRow 
              label="Opponents Strikeouts per Game" 
              awayStats={data.pitchingStats.oppStrikeoutsPerGame[0]} 
              homeStats={data.pitchingStats.oppStrikeoutsPerGame[1]} 
              format="decimal"
            />
          </tbody>
        </table>
      </div>

      {/* Record Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-800">{data.gameInfo.awayTeam} Record</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Overall:</span> {data.record.overall[0]}</div>
              <div><span className="font-medium">Away:</span> {data.record.away[0]}</div>
              <div><span className="font-medium">Games Back:</span> {data.record.home[0]}</div>
              <div><span className="font-medium">Last 10:</span> {data.record.last10[0]}</div>
              <div><span className="font-medium">Streak:</span> {data.record.streak[0]}</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-800">{data.gameInfo.homeTeam} Record</h3>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Overall:</span> {data.record.overall[1]}</div>
              <div><span className="font-medium">Home:</span> {data.record.home[1]}</div>
              <div><span className="font-medium">Games Back:</span> {data.record.away[1]}</div>
              <div><span className="font-medium">Last 10:</span> {data.record.last10[1]}</div>
              <div><span className="font-medium">Streak:</span> {data.record.streak[1]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Runs and Statistical Advantage */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-800">{data.totalRunsScored[0]}</div>
          <div className="text-sm text-blue-600">Total Runs Scored</div>
          <div className="text-xs text-blue-500">{data.gameInfo.awayTeam}</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-yellow-800">Statistical Advantage</div>
          <div className="text-2xl font-bold text-yellow-900">{data.gameInfo.homeTeam}</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-800">{data.totalRunsScored[1]}</div>
          <div className="text-sm text-red-600">Total Runs Scored</div>
          <div className="text-xs text-red-500">{data.gameInfo.homeTeam}</div>
        </div>
      </div>

      {/* Starting Pitchers */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-center">Starting Pitchers</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-lg font-bold text-blue-800">{data.startingPitchers.away.name}</div>
              <div className="text-sm text-blue-600 mt-2">
                <div>Record: {data.startingPitchers.away.record}</div>
                <div>ERA: {data.startingPitchers.away.era}</div>
                <div>SO: {data.startingPitchers.away.so}</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-lg">
              <div className="text-lg font-bold text-red-800">{data.startingPitchers.home.name}</div>
              <div className="text-sm text-red-600 mt-2">
                <div>Record: {data.startingPitchers.home.record}</div>
                <div>ERA: {data.startingPitchers.home.era}</div>
                <div>SO: {data.startingPitchers.home.so}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedGameAnalysis