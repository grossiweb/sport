'use client'

import { CalendarIcon, TrophyIcon, ChartBarIcon, StarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface MatchupHeroProps {
  totalGames: number
  highConfidencePicks: number
  date: string
}

export function MatchupHero({ totalGames, highConfidencePicks, date }: MatchupHeroProps) {
  const formattedDate = format(new Date(date), 'EEEE, MMMM do, yyyy')
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <CalendarIcon className="h-6 w-6" />
            <span className="text-purple-100">{formattedDate}</span>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Daily Game Analysis
          </h1>
          
          <p className="text-purple-100 text-lg mb-6 max-w-2xl">
            Expert insights, AI predictions, and betting intelligence for today's games. 
            Get the edge you need with our comprehensive matchup analysis.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrophyIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalGames}</div>
                <div className="text-purple-200 text-sm">Total Games</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <StarIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{highConfidencePicks}</div>
                <div className="text-purple-200 text-sm">High Confidence</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">AI</div>
                <div className="text-purple-200 text-sm">Powered Analysis</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 lg:mt-0 lg:ml-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">
              {totalGames > 0 ? Math.round((highConfidencePicks / totalGames) * 100) : 0}%
            </div>
            <div className="text-purple-200 text-sm">
              High Confidence Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}