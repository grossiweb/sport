import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MRQXS58L');`}
        </Script>
      </head>
      <body className={inter.className}>
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MRQXS58L"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
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