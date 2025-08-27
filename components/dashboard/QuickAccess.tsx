'use client'

import Link from 'next/link'
import { useSport } from '@/contexts/SportContext'
import {
  UsersIcon,
  UserCircleIcon,
  TrophyIcon,
  PresentationChartLineIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export function QuickAccess() {
  const { currentSport, currentSportData } = useSport()
  
  const quickLinks = [
    {
      title: 'Team Stats',
      description: 'Advanced team analytics and performance metrics',
      href: `/sport/${currentSport.toLowerCase()}/teams`,
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Player Stats',
      description: 'Individual player performance and trends',
      href: `/sport/${currentSport.toLowerCase()}/players`,
      icon: UserCircleIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Daily Matchups',
      description: 'Today\'s games with AI-powered insights',
      href: `/sport/${currentSport.toLowerCase()}/matchups`,
      icon: TrophyIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Predictions',
      description: 'AI-generated game predictions and analysis',
      href: `/sport/${currentSport.toLowerCase()}/predictions`,
      icon: PresentationChartLineIcon,
      color: 'bg-red-500'
    },
    {
      title: 'Trends',
      description: 'Market trends and performance patterns',
      href: `/sport/${currentSport.toLowerCase()}/trends`,
      icon: ChartBarIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Betting Data',
      description: 'Money lines, spreads, and public betting info',
      href: `/sport/${currentSport.toLowerCase()}/betting`,
      icon: CurrencyDollarIcon,
      color: 'bg-indigo-500'
    },
    {
      title: `${currentSportData.shortName} Report`,
      description: `${currentSportData.shortName} analytics and insights`,
      href: `/sport/${currentSport.toLowerCase()}/analysis`,
      icon: DocumentTextIcon,
      color: 'bg-pink-500'
    },
    {
      title: 'Settings',
      description: 'Account settings and subscription management',
      href: '/settings',
      icon: Cog6ToothIcon,
      color: 'bg-gray-500'
    }
  ]

  // Filter to show only Team Stats & Daily Matchups
  const filteredLinks = quickLinks.filter(link =>
    link.title === 'Team Stats' || link.title === 'Daily Matchups'
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredLinks.map((link) => (
        <QuickAccessCard key={link.href} link={link} />
      ))}
    </div>
  )
}

function QuickAccessCard({ link }: { link: typeof quickLinks[0] }) {
  return (
    <Link
      href={link.href}
      className="group block stat-card hover:scale-105 transform transition-all duration-200"
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-3 rounded-lg ${link.color}`}>
          <link.icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {link.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {link.description}
          </p>
        </div>
      </div>
    </Link>
  )
}