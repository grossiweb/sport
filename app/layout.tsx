import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/layout/Navigation'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { SessionDebug } from '@/components/auth/SessionDebug'
import { SportSelectionWrapper } from '@/components/sport/SportSelectionWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Big Balls Bets',
  description: 'Big Balls Bets – bold sports betting analytics with advanced stats, AI predictions, and betting insights.',
  keywords: 'big balls bets, sports betting, sports analytics, college football, CFB, betting, predictions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation />
              <main className="transition-colors duration-200">
                {children}
              </main>
              <SessionDebug />
              <SportSelectionWrapper />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}