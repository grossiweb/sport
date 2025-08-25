import React from 'react'
import { StarIcon, ChartBarIcon, FireIcon } from '@heroicons/react/24/solid'
import TrendIndicator from '@/components/ui/TrendIndicator'

interface PitcherStats {
  name: string
  team: string
  teamColor: 'blue' | 'red'
  record: string
  era: number
  whip: number
  strikeouts: number
  innings: number
  wins: number
  losses: number
  saves?: number
  lastStart?: {
    date: string
    opponent: string
    result: string
    innings: number
    runs: number
    strikeouts: number
  }
  season2024?: {
    era: number
    whip: number
    record: string
  }
  homeAwayStats?: {
    home: { era: number; record: string }
    away: { era: number; record: string }
  }
  recentForm?: 'hot' | 'cold' | 'average'
  restDays?: number
}

interface StartingPitchersSectionProps {
  awayPitcher: PitcherStats
  homePitcher: PitcherStats
  matchupAdvantage?: 'away' | 'home' | 'even'
}

const StartingPitchersSection: React.FC<StartingPitchersSectionProps> = ({
  awayPitcher,
  homePitcher,
  matchupAdvantage = 'even'
}) => {
  const getFormIcon = (form: 'hot' | 'cold' | 'average') => {
    switch (form) {
      case 'hot':
        return <FireIcon className="w-5 h-5 text-red-500" />
      case 'cold':
        return <ChartBarIcon className="w-5 h-5 text-blue-400" />
      default:
        return <StarIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getFormLabel = (form: 'hot' | 'cold' | 'average') => {
    switch (form) {
      case 'hot':
        return 'Hot Streak'
      case 'cold':
        return 'Struggling'
      default:
        return 'Consistent'
    }
  }

  const PitcherCard: React.FC<{ pitcher: PitcherStats; isAway?: boolean }> = ({ 
    pitcher, 
    isAway = false 
  }) => {
    const cardColor = pitcher.teamColor === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
    const textColor = pitcher.teamColor === 'blue' ? 'text-blue-800' : 'text-red-800'
    const hasAdvantage = (isAway && matchupAdvantage === 'away') || (!isAway && matchupAdvantage === 'home')

    return (
      <div className={`
        ${cardColor} border-2 rounded-lg p-6 
        ${hasAdvantage ? 'ring-2 ring-green-400 ring-offset-2' : ''}
        transition-all duration-200 hover:shadow-lg
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${textColor}`}>
              {pitcher.name}
            </h3>
            <p className="text-sm text-gray-600">{pitcher.team}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {pitcher.recentForm && (
              <div className="flex items-center space-x-1">
                {getFormIcon(pitcher.recentForm)}
                <span className="text-xs font-medium">
                  {getFormLabel(pitcher.recentForm)}
                </span>
              </div>
            )}
            {hasAdvantage && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                ADVANTAGE
              </div>
            )}
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{pitcher.record}</div>
            <div className="text-xs text-gray-600">Record</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{pitcher.era.toFixed(2)}</div>
            <div className="text-xs text-gray-600">ERA</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{pitcher.whip.toFixed(2)}</div>
            <div className="text-xs text-gray-600">WHIP</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Strikeouts:</span>
            <span className="font-medium">{pitcher.strikeouts}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Innings Pitched:</span>
            <span className="font-medium">{pitcher.innings.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Wins/Losses:</span>
            <span className="font-medium">{pitcher.wins}W - {pitcher.losses}L</span>
          </div>
          {pitcher.saves && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saves:</span>
              <span className="font-medium">{pitcher.saves}</span>
            </div>
          )}
          {pitcher.restDays && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rest Days:</span>
              <span className="font-medium">{pitcher.restDays}</span>
            </div>
          )}
        </div>

        {/* Last Start */}
        {pitcher.lastStart && (
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2 text-sm">Last Start</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>vs {pitcher.lastStart.opponent}:</span>
                <span className="font-medium">{pitcher.lastStart.result}</span>
              </div>
              <div className="flex justify-between">
                <span>IP:</span>
                <span>{pitcher.lastStart.innings}</span>
              </div>
              <div className="flex justify-between">
                <span>ER:</span>
                <span>{pitcher.lastStart.runs}</span>
              </div>
              <div className="flex justify-between">
                <span>K:</span>
                <span>{pitcher.lastStart.strikeouts}</span>
              </div>
            </div>
          </div>
        )}

        {/* Home/Away Split */}
        {pitcher.homeAwayStats && (
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2 text-sm">Home/Away Splits</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-medium">Home</div>
                <div>ERA: {pitcher.homeAwayStats.home.era.toFixed(2)}</div>
                <div>Record: {pitcher.homeAwayStats.home.record}</div>
              </div>
              <div>
                <div className="font-medium">Away</div>
                <div>ERA: {pitcher.homeAwayStats.away.era.toFixed(2)}</div>
                <div>Record: {pitcher.homeAwayStats.away.record}</div>
              </div>
            </div>
          </div>
        )}

        {/* 2024 Comparison */}
        {pitcher.season2024 && (
          <div className="bg-white/70 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">2024 vs 2025</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>ERA:</span>
                <div className="flex items-center space-x-2">
                  <span>{pitcher.era.toFixed(2)}</span>
                  <TrendIndicator 
                    type="icon" 
                    trend={pitcher.era < pitcher.season2024.era ? 'up' : 'down'}
                    size="sm"
                  />
                  <span className="text-gray-500">({pitcher.season2024.era.toFixed(2)})</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>WHIP:</span>
                <div className="flex items-center space-x-2">
                  <span>{pitcher.whip.toFixed(2)}</span>
                  <TrendIndicator 
                    type="icon" 
                    trend={pitcher.whip < pitcher.season2024.whip ? 'up' : 'down'}
                    size="sm"
                  />
                  <span className="text-gray-500">({pitcher.season2024.whip.toFixed(2)})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Starting Pitchers</h2>
          
          {matchupAdvantage !== 'even' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Pitching Matchup Edge:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                matchupAdvantage === 'away' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`}>
                {matchupAdvantage === 'away' ? awayPitcher.team : homePitcher.team}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              <span className="bg-blue-100 px-2 py-1 rounded mr-2 text-sm">AWAY</span>
              {awayPitcher.team}
            </h3>
          </div>
          <PitcherCard pitcher={awayPitcher} isAway={true} />
        </div>

        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-red-800 flex items-center">
              <span className="bg-red-100 px-2 py-1 rounded mr-2 text-sm">HOME</span>
              {homePitcher.team}
            </h3>
          </div>
          <PitcherCard pitcher={homePitcher} isAway={false} />
        </div>
      </div>

      {/* Head-to-Head Comparison */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Head-to-Head Comparison</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-sm text-gray-600 mb-2">ERA Advantage</div>
            <div className={`text-lg font-bold ${
              awayPitcher.era < homePitcher.era ? 'text-blue-600' : 'text-red-600'
            }`}>
              {awayPitcher.era < homePitcher.era ? awayPitcher.team : homePitcher.team}
            </div>
            <div className="text-xs text-gray-500">
              {Math.abs(awayPitcher.era - homePitcher.era).toFixed(2)} difference
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-2">WHIP Advantage</div>
            <div className={`text-lg font-bold ${
              awayPitcher.whip < homePitcher.whip ? 'text-blue-600' : 'text-red-600'
            }`}>
              {awayPitcher.whip < homePitcher.whip ? awayPitcher.team : homePitcher.team}
            </div>
            <div className="text-xs text-gray-500">
              {Math.abs(awayPitcher.whip - homePitcher.whip).toFixed(2)} difference
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-2">Experience Edge</div>
            <div className={`text-lg font-bold ${
              awayPitcher.innings > homePitcher.innings ? 'text-blue-600' : 'text-red-600'
            }`}>
              {awayPitcher.innings > homePitcher.innings ? awayPitcher.team : homePitcher.team}
            </div>
            <div className="text-xs text-gray-500">
              {Math.abs(awayPitcher.innings - homePitcher.innings).toFixed(1)} innings difference
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartingPitchersSection