'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { formatToEasternTime, formatToEasternDate } from '@/lib/utils/time'

export function SessionDebug() {
  const { isAuthenticated } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<{
    hasToken: boolean
    hasRefreshToken: boolean
    loginTime: string | null
    hoursLoggedIn: number
    nextRefresh: string
  } | null>(null)

  useEffect(() => {
    const updateSessionInfo = () => {
      const token = localStorage.getItem('authToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const loginTime = localStorage.getItem('loginTime')
      
      if (loginTime) {
        const loginDate = new Date(parseInt(loginTime))
        const now = new Date()
        const hoursLoggedIn = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
        
        // Calculate next refresh (every 30 minutes)
        const minutesSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60)
        const nextRefreshMinutes = Math.ceil(minutesSinceLogin / 30) * 30
        const nextRefreshTime = new Date(loginDate.getTime() + (nextRefreshMinutes * 60 * 1000))
        
        setSessionInfo({
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          loginTime: `${formatToEasternDate(loginDate)} ${formatToEasternTime(loginDate)}`,
          hoursLoggedIn: Math.round(hoursLoggedIn * 100) / 100,
          nextRefresh: formatToEasternTime(nextRefreshTime)
        })
      } else {
        setSessionInfo(null)
      }
    }

    if (isAuthenticated) {
      updateSessionInfo()
      const interval = setInterval(updateSessionInfo, 60000) // Update every minute
      return () => clearInterval(interval)
    } else {
      setSessionInfo(null)
    }
  }, [isAuthenticated])

  if (!isAuthenticated || !sessionInfo) {
    return null
  }

  return (
    <div className="hidden fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">Session Debug</div>
      <div className="space-y-1">
        <div>🔑 Token: {sessionInfo.hasToken ? '✅' : '❌'}</div>
        <div>🔄 Refresh: {sessionInfo.hasRefreshToken ? '✅' : '❌'}</div>
        <div>⏰ Login: {sessionInfo.loginTime}</div>
        <div>📊 Hours: {sessionInfo.hoursLoggedIn}/24</div>
        <div>🔄 Next Refresh: {sessionInfo.nextRefresh}</div>
        <div className="mt-2 text-xs opacity-75">
          {sessionInfo.hoursLoggedIn >= 24 ? 
            '⚠️ Session will expire soon' : 
            `✅ ${Math.round((24 - sessionInfo.hoursLoggedIn) * 10) / 10}h remaining`
          }
        </div>
      </div>
    </div>
  )
}
