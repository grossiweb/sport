'use client'

import Link from 'next/link'
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

const quickLinks = [
  {
    title: 'Team Stats',
    description: 'Advanced team analytics and performance metrics',
    href: '/teams',
    icon: UsersIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Player Stats',
    description: 'Individual player performance and trends',
    href: '/players',
    icon: UserCircleIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Daily Matchups',
    description: 'Today\'s games with AI-powered insights',
    href: '/matchups',
    icon: TrophyIcon,
    color: 'bg-purple-500'
  },
  {
    title: 'Predictions',
    description: 'AI-generated game predictions and analysis',
    href: '/predictions',
    icon: PresentationChartLineIcon,
    color: 'bg-red-500'
  },
  {
    title: 'Trends',
    description: 'Market trends and performance patterns',
    href: '/trends',
    icon: ChartBarIcon,
    color: 'bg-yellow-500'
  },
  {
    title: 'Betting Data',
    description: 'Money lines, spreads, and public betting info',
    href: '/betting',
    icon: CurrencyDollarIcon,
    color: 'bg-indigo-500'
  },
  {
    title: 'Bullpen Report',
    description: 'CFB defense efficiency and analysis',
    href: '/bullpen',
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

export function QuickAccess() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickLinks.map((link) => (
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