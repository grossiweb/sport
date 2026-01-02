import type { SportType, DetailedTeamStat, Team } from '@/types'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SPORTS: Array<{ sport: SportType; label: string }> = [
  { sport: 'CFB', label: 'NCAAF / CFB' },
  { sport: 'NFL', label: 'NFL' },
  { sport: 'NCAAB', label: 'NCAAB' },
  { sport: 'NBA', label: 'NBA' },
]

function uniqueStats(stats: DetailedTeamStat[]): DetailedTeamStat[] {
  const seen = new Set<number>()
  const out: DetailedTeamStat[] = []
  for (const s of stats) {
    const id = s?.stat?.id ?? s.stat_id
    if (seen.has(id)) continue
    seen.add(id)
    out.push(s)
  }
  return out
}

async function getSampleForSport(sport: SportType): Promise<{
  sport: SportType
  team: Team | null
  stats: DetailedTeamStat[]
  error?: string
}> {
  try {
    const teams = await mongoSportsAPI.getTeams(sport)
    const team = teams?.[0] ?? null
    if (!team) return { sport, team: null, stats: [], error: 'No teams found in database.' }

    const detailed = await mongoSportsAPI.getDetailedTeamStats(sport, team.id)
    return { sport, team, stats: uniqueStats(detailed) }
  } catch (e: any) {
    return { sport, team: null, stats: [], error: e?.message ? String(e.message) : 'Failed to load.' }
  }
}

export default async function StatsCatalogPage() {
  const results = await Promise.all(SPORTS.map(({ sport }) => getSampleForSport(sport)))

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Stats Catalog (Documentation)
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          One real sample team per sport, showing the full list of available team-stat fields from MongoDB.
        </p>
      </div>

      <div className="space-y-6">
        {SPORTS.map(({ sport, label }) => {
          const r = results.find((x) => x.sport === sport)!
          return (
            <section
              key={sport}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {label}
                    </div>
                    <div className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      {r.team ? `${r.team.city ? `${r.team.city} ` : ''}${r.team.name}` : 'No team available'}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {r.team ? `Team ID: ${r.team.id} • Abbr: ${r.team.abbreviation || '—'}` : r.error || '—'}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Stats found: <span className="font-semibold text-gray-900 dark:text-white">{r.stats.length}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {r.stats.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No stats available for this sport/team.
                  </div>
                ) : (
                  <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/40">
                        <tr className="text-left">
                          <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Stat ID</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Category</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Display Name</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Name</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Abbr</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Description</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Example</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {r.stats.map((s) => (
                          <tr key={s.stat_id} className="align-top">
                            <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                              {s.stat_id}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                              {s.stat?.category || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {s.stat?.display_name || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                              {s.stat?.name || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                              {s.stat?.abbreviation || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 min-w-[18rem]">
                              {s.stat?.description || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                              {s.display_value || String(s.value ?? '—')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Suggested API endpoints</div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-mono">GET</span> <span className="font-mono">/api/external/teams?sport={sport}</span>
                      </div>
                      <div className="mt-1">
                        <span className="font-mono">GET</span> <span className="font-mono">/api/external/games?sport={sport}&amp;date=YYYY-MM-DD</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        (Team stats external endpoints can be added next, e.g. <span className="font-mono">/api/external/teams/{'{teamId}'}/stats</span>.)
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Example curl (API key)</div>
                    <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900/40 rounded p-3 overflow-auto">
{`curl -H "x-api-key: YOUR_API_KEY" \\
  "https://api.bigballsbets.com/api/external/teams?sport=${sport}"`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}


