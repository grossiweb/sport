import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  CircleStackIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'SportStats API | Big Balls Sport Data',
  description:
    'SportStats API by Big Balls — sports data for CFB, NFL, NBA, and NCAAB. Games, teams, players, matchups, predictions, betting insights, and trends — served fast from MongoDB.',
}

const sports = [
  { name: 'NCAAF (CFB)', icon: '/ncaaf.svg' },
  { name: 'NFL', icon: '/nfl.svg' },
  { name: 'NBA', icon: '/nba.svg' },
  { name: 'NCAAB', icon: '/ncaab.svg' },
]

const featureCards = [
  {
    title: 'MongoDB-backed delivery',
    description: 'Structured data served quickly from MongoDB with caching and quotas.',
    icon: CircleStackIcon,
  },
  {
    title: 'Production-friendly auth',
    description: 'API key auth via headers (x-api-key / Authorization) plus CORS support.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Games → insights',
    description: 'Games, teams, players, matchups, predictions, betting lines, trends, and more.',
    icon: BoltIcon,
  },
  {
    title: 'Built for dashboards',
    description: 'Consistent parameters (sport/date) designed for analytics + automation.',
    icon: ChartBarIcon,
  },
]

type Endpoint = {
  method: 'GET' | 'POST'
  path: string
  access: 'Public API' | 'App API'
  params?: string
  note?: string
}

const endpoints: Array<{ section: string; items: Endpoint[] }> = [
  {
    section: 'Public API (API-key protected)',
    items: [
      { method: 'GET', path: '/api/external/health', access: 'Public API', note: 'CORS-enabled health check' },
      {
        method: 'GET',
        path: '/api/external/games',
        access: 'Public API',
        params: 'sport=CFB|NFL|NBA|NCAAB, date=YYYY-MM-DD (optional)',
        note: 'Returns games for a sport/date',
      },
      {
        method: 'GET',
        path: '/api/external/teams',
        access: 'Public API',
        params: 'sport=CFB|NFL|NBA|NCAAB',
        note: 'Team directory for a sport',
      },
    ],
  },
  {
    section: 'App API (existing internal routes)',
    items: [
      { method: 'GET', path: '/api/games', access: 'App API', params: 'sport=CFB|NFL|NBA|NCAAB, date=YYYY-MM-DD (optional)' },
      { method: 'GET', path: '/api/teams', access: 'App API', params: 'sport=CFB|NFL|NBA|NCAAB' },
      { method: 'GET', path: '/api/teams/stats', access: 'App API', params: 'sport=CFB|NFL|NBA|NCAAB' },
      { method: 'GET', path: '/api/teams/[teamId]/stats', access: 'App API', note: 'Detailed team stats' },
      { method: 'GET', path: '/api/teams/[teamId]/opponent-stats', access: 'App API', note: 'Opponent splits / matchup context' },

      { method: 'GET', path: '/api/players', access: 'App API', params: 'sport=CFB|NFL|NBA|NCAAB, team=<teamId> (optional)' },
      { method: 'GET', path: '/api/players/stats', access: 'App API', params: 'sport=CFB|NFL|NBA|NCAAB, teamId=<id> (optional), playerId=<id> (optional)' },
      { method: 'GET', path: '/api/players/[playerId]/stats', access: 'App API', note: 'Player detail stats' },
      { method: 'GET', path: '/api/player-leaders', access: 'App API', params: 'sport=..., stat=passing|rushing|receiving|tackles|sacks|interceptions, limit=50' },
      { method: 'GET', path: '/api/player-insights', access: 'App API', params: 'sport=CFB|NFL|NBA|NCAAB' },

      { method: 'GET', path: '/api/matchups', access: 'App API', params: 'sport=..., date=YYYY-MM-DD, endDate=YYYY-MM-DD, limit=10, status=scheduled|live|final, dateRange=past|future' },
      { method: 'GET', path: '/api/matchups/most-bet', access: 'App API', params: 'sport=..., limit=3, days=7, date=YYYY-MM-DD, endDate=YYYY-MM-DD' },
      { method: 'GET', path: '/api/matchups/[gameId]/details', access: 'App API', note: 'Matchup deep dive' },

      { method: 'GET', path: '/api/predictions', access: 'App API', params: 'sport=..., date=YYYY-MM-DD (optional)' },
      { method: 'GET', path: '/api/predictions/stats', access: 'App API', note: 'Prediction performance summaries' },

      { method: 'GET', path: '/api/betting', access: 'App API', params: 'eventId=<gameId>, sport=...' },
      { method: 'GET', path: '/api/betting/data', access: 'App API', params: 'sport=..., date=YYYY-MM-DD (optional)' },
      { method: 'GET', path: '/api/betting-lines/[gameId]', access: 'App API', note: 'Raw sportsbook lines for a game' },

      { method: 'GET', path: '/api/trends', access: 'App API', params: 'sport=..., category=betting|team|player|weather|all, timeframe=7d|15d|30d|season' },
      { method: 'GET', path: '/api/seasons', access: 'App API', params: 'sport_id=<number> (optional), season=<number> (optional)' },

      { method: 'POST', path: '/api/subscriptions/create', access: 'App API' },
      { method: 'POST', path: '/api/subscriptions/cancel', access: 'App API' },
      { method: 'GET', path: '/api/subscriptions/status', access: 'App API' },
    ],
  },
]

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <code className="font-mono">{children}</code>
    </pre>
  )
}

function EndpointRow({ e }: { e: Endpoint }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
            {e.method}
          </span>
          <span className="font-mono text-sm text-gray-900 dark:text-white">{e.path}</span>
        </div>
        <span
          className={
            e.access === 'Public API'
              ? 'inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-200 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800'
              : 'inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:ring-gray-700'
          }
        >
          {e.access}
        </span>
      </div>
      {e.params ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Params: <span className="font-mono">{e.params}</span>
        </div>
      ) : null}
      {e.note ? <div className="text-sm text-gray-600 dark:text-gray-300">{e.note}</div> : null}
    </div>
  )
}

export default function SportStatsApiMarketingPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-200 blur-3xl dark:bg-primary-900/30" />
          <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-primary-100 blur-3xl dark:bg-primary-800/20" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-40">
                  <Image
                    src="/logo_light.png"
                    alt="Big Balls"
                    fill
                    sizes="160px"
                    className="object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/logo_dark.png"
                    alt="Big Balls"
                    fill
                    sizes="160px"
                    className="hidden object-contain dark:block"
                    priority
                  />
                </div>
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-200 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800">
                  SportStats API
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Sports data that ships fast.
                <span className="block gradient-text">Built for bettors & builders.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg text-gray-600 dark:text-gray-300">
                SportStats API by Big Balls delivers games, teams, players, matchups, predictions, betting lines, and trends for
                CFB, NFL, NBA, and NCAAB — served from MongoDB with authentication, CORS, and rate limits.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#endpoints" className="btn-primary inline-flex items-center justify-center">
                  <CodeBracketIcon className="mr-2 h-5 w-5" />
                  View endpoints
                </Link>
                <Link href="/subscribe" className="btn-secondary inline-flex items-center justify-center">
                  View plans
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {sports.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <Image src={s.icon} alt="" width={18} height={18} />
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/40">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary-50 p-2 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                    <CodeBracketIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Quick start</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Use <span className="font-mono">x-api-key</span> or <span className="font-mono">Authorization</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/api/external/health"
                  className="text-sm font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
                >
                  Health check →
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                <CodeBlock>{`curl -s "https://YOUR_DOMAIN.com/api/external/health"`}</CodeBlock>
                <CodeBlock>
                  {`curl -s "https://YOUR_DOMAIN.com/api/external/games?sport=CFB&date=2025-09-01" \\
  -H "x-api-key: YOUR_API_KEY"`}
                </CodeBlock>
                <CodeBlock>
                  {`curl -s "https://YOUR_DOMAIN.com/api/external/teams?sport=NFL" \\
  -H "Authorization: ApiKey YOUR_API_KEY"`}
                </CodeBlock>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900/50 dark:text-gray-200">
                Responses include rate/quota headers like <span className="font-mono">X-RateLimit-Limit-Minute</span> and{' '}
                <span className="font-mono">X-Quota-Used-Day</span>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What you get</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            A consistent sports data layer you can use in dashboards, scripts, newsletters, and downstream products.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-50 p-2 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                  <f.icon className="h-6 w-6" />
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">{f.title}</div>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ENDPOINTS */}
      <section id="endpoints" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">API surface</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Below is the full data surface currently implemented in this app. The Public API list is already API-key protected.
                If you want more endpoints exposed under <span className="font-mono">/api/external</span>, we can add them with the same auth + limits.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="text-sm font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300"
              >
                Get access →
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {endpoints.map((group) => (
              <div key={group.section} className="space-y-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{group.section}</div>
                <div className="space-y-3">
                  {group.items.map((e) => (
                    <EndpointRow key={`${e.method}:${e.path}`} e={e} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-primary-50 p-6 text-gray-900 dark:bg-primary-900/20 dark:text-white">
            <div className="text-sm font-semibold">Next step: publish more endpoints</div>
            <p className="mt-2 text-sm opacity-90">
              Want players, matchups, predictions, betting, and trends available publicly? We can mirror any internal route under
              <span className="font-mono"> /api/external</span> and lock it down with the same API-client auth + quotas.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}