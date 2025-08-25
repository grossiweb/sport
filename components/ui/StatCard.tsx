import React from 'react'
import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '@heroicons/react/24/solid'

interface StatCardProps {
  title: string
  value: string | number
  rank?: number
  trend?: 'up' | 'down' | 'neutral'
  advantage?: boolean
  teamColor?: 'blue' | 'red' | 'green' | 'yellow' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  format?: 'percentage' | 'decimal' | 'currency' | 'integer'
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  rank,
  trend = 'neutral',
  advantage = false,
  teamColor = 'gray',
  size = 'md',
  format = 'integer'
}) => {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val
    
    switch (format) {
      case 'percentage':
        return `${(numVal * 100).toFixed(1)}%`
      case 'decimal':
        return numVal.toFixed(3)
      case 'currency':
        return `$${numVal.toLocaleString()}`
      default:
        return val.toString()
    }
  }

  const getColorClasses = () => {
    const baseClasses = {
      blue: advantage ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-blue-50 border-blue-200 text-blue-800',
      red: advantage ? 'bg-red-100 border-red-300 text-red-900' : 'bg-red-50 border-red-200 text-red-800',
      green: advantage ? 'bg-green-100 border-green-300 text-green-900' : 'bg-green-50 border-green-200 text-green-800',
      yellow: advantage ? 'bg-yellow-100 border-yellow-300 text-yellow-900' : 'bg-yellow-50 border-yellow-200 text-yellow-800',
      gray: advantage ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-800'
    }
    
    return baseClasses[teamColor]
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3'
      case 'lg':
        return 'p-6'
      default:
        return 'p-4'
    }
  }

  const getTrendIcon = () => {
    const iconClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    
    switch (trend) {
      case 'up':
        return <ChevronUpIcon className={`${iconClasses} text-green-500`} />
      case 'down':
        return <ChevronDownIcon className={`${iconClasses} text-red-500`} />
      default:
        return <MinusIcon className={`${iconClasses} text-gray-400`} />
    }
  }

  const getValueSize = () => {
    switch (size) {
      case 'sm':
        return 'text-lg'
      case 'lg':
        return 'text-3xl'
      default:
        return 'text-2xl'
    }
  }

  return (
    <div className={`
      ${getColorClasses()} 
      ${getSizeClasses()}
      border-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md
      ${advantage ? 'ring-2 ring-offset-2 ring-blue-400' : ''}
    `}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-medium ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {title}
        </h3>
        <div className="flex items-center space-x-1">
          {rank && (
            <span className={`
              text-xs px-2 py-1 rounded-full bg-white/70 
              ${size === 'sm' ? 'text-xs' : 'text-sm'}
            `}>
              #{rank}
            </span>
          )}
          {getTrendIcon()}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className={`font-bold ${getValueSize()}`}>
          {formatValue(value)}
        </div>
        
        {advantage && (
          <div className="text-xs font-medium px-2 py-1 bg-white/80 rounded-full">
            EDGE
          </div>
        )}
      </div>
      
      {trend !== 'neutral' && (
        <div className={`text-xs mt-1 flex items-center space-x-1 ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          <span>
            {trend === 'up' ? 'Improving' : 'Declining'}
          </span>
        </div>
      )}
    </div>
  )
}

export default StatCard