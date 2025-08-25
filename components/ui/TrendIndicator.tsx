import React from 'react'
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon 
} from '@heroicons/react/24/solid'

interface TrendIndicatorProps {
  type: 'icon' | 'arrow' | 'badge' | 'line'
  trend: 'up' | 'down' | 'neutral'
  value?: number
  previousValue?: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  type = 'icon',
  trend,
  value,
  previousValue,
  label,
  size = 'md',
  showPercentage = false
}) => {
  const calculatePercentageChange = () => {
    if (!value || !previousValue || previousValue === 0) return 0
    return ((value - previousValue) / previousValue) * 100
  }

  const percentageChange = calculatePercentageChange()
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 text-xs'
      case 'lg':
        return 'w-8 h-8 text-lg'
      default:
        return 'w-6 h-6 text-sm'
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  const getBadgeColor = () => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const renderIcon = () => {
    const iconClasses = `${getSizeClasses()} ${getTrendColor()}`
    
    switch (trend) {
      case 'up':
        return <ChevronUpIcon className={iconClasses} />
      case 'down':
        return <ChevronDownIcon className={iconClasses} />
      default:
        return <MinusIcon className={iconClasses} />
    }
  }

  const renderArrow = () => {
    const iconClasses = `${getSizeClasses()} ${getTrendColor()}`
    
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className={iconClasses} />
      case 'down':
        return <ArrowTrendingDownIcon className={iconClasses} />
      default:
        return <MinusIcon className={iconClasses} />
    }
  }

  const renderBadge = () => {
    const badgeText = trend === 'up' ? 'UP' : trend === 'down' ? 'DOWN' : 'STABLE'
    
    return (
      <span className={`
        inline-flex items-center px-2 py-1 rounded-full border
        ${getBadgeColor()}
        ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}
      `}>
        {renderIcon()}
        <span className="ml-1">
          {badgeText}
          {showPercentage && percentageChange !== 0 && (
            <span className="ml-1">
              {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
          )}
        </span>
      </span>
    )
  }

  const renderLine = () => {
    const getLineDirection = () => {
      if (trend === 'up') return 'rotate-45'
      if (trend === 'down') return '-rotate-45'
      return 'rotate-0'
    }

    const lineLength = size === 'sm' ? 'w-8' : size === 'lg' ? 'w-16' : 'w-12'
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`h-0.5 ${lineLength} ${getTrendColor()} bg-current transform ${getLineDirection()}`} />
        {label && (
          <span className={`${getTrendColor()} font-medium ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          }`}>
            {label}
          </span>
        )}
      </div>
    )
  }

  switch (type) {
    case 'arrow':
      return (
        <div className="flex items-center space-x-1">
          {renderArrow()}
          {label && (
            <span className={`${getTrendColor()} font-medium ${
              size === 'sm' ? 'text-xs' : 'text-sm'
            }`}>
              {label}
            </span>
          )}
          {showPercentage && percentageChange !== 0 && (
            <span className={`${getTrendColor()} ${
              size === 'sm' ? 'text-xs' : 'text-sm'
            }`}>
              ({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
            </span>
          )}
        </div>
      )
    case 'badge':
      return renderBadge()
    case 'line':
      return renderLine()
    default:
      return (
        <div className="flex items-center space-x-1">
          {renderIcon()}
          {label && (
            <span className={`${getTrendColor()} font-medium ${
              size === 'sm' ? 'text-xs' : 'text-sm'
            }`}>
              {label}
            </span>
          )}
          {showPercentage && percentageChange !== 0 && (
            <span className={`${getTrendColor()} ${
              size === 'sm' ? 'text-xs' : 'text-sm'
            }`}>
              ({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
            </span>
          )}
        </div>
      )
  }
}

export default TrendIndicator