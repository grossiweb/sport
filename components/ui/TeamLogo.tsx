'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Team, SportType } from '@/types'

interface TeamLogoProps {
  team: Team
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackText?: boolean
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const fallbackSizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl'
}

export function TeamLogo({ team, size = 'md', className = '', fallbackText = true }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false)
  
  // Generate logo path based on sport and team ID
  const getLogoPath = (team: Team) => {
    const sport = team.league.toLowerCase()
    // Ensure team ID is a string and remove any extra characters
    const teamId = String(team.id).trim()
    const path = `/${sport}/${sport}-${teamId}.png`
    console.log(`TeamLogo: Attempting to load ${team.name} (${team.league}) with ID: ${teamId} from: ${path}`)
    return path
  }

  // Fallback component when image fails to load or doesn't exist
  const FallbackLogo = () => {
    const initials = team.abbreviation?.substring(0, 2) || team.name?.substring(0, 2) || '??'
    
    return (
      <div 
        className={`${fallbackSizeClasses[size]} ${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 shadow-sm`}
        style={{ 
          backgroundColor: team.primaryColor ? `${team.primaryColor}15` : undefined,
          borderColor: team.primaryColor || undefined,
          color: team.primaryColor || undefined
        }}
      >
        {fallbackText && (
          <span className="tracking-tighter uppercase">
            {initials}
          </span>
        )}
      </div>
    )
  }

  // If we already know the image failed or team doesn't have necessary info
  if (imageError || !team.id) {
    return <FallbackLogo />
  }

  const logoPath = getLogoPath(team)
console.log(`from: ${logoPath}`)
  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Image
        src={logoPath}
        alt={`${team.name} logo`}
        fill
        className="object-contain rounded"
        onError={(e) => {
          console.log(`Failed to load logo: ${logoPath}`, e)
          setImageError(true)
        }}
        onLoad={() => setImageError(false)}
        unoptimized={true} // Disable Next.js image optimization for local files
      />
      {imageError && <FallbackLogo />}
    </div>
  )
}
