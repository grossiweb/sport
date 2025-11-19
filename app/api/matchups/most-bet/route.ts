import { NextRequest, NextResponse } from 'next/server'
import { mongoSportsAPI } from '@/lib/api/mongodb-sports-api'
import { isValidSportType } from '@/lib/constants/sports'
import { SportType } from '@/types'
import { getBettingDataCollection } from '@/lib/mongodb'

function avg(values: number[]): number | null {
  if (!values.length) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function toISODateOnly(d: Date): string {
  return d.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = (searchParams.get('sport') || 'CFB').toUpperCase() as SportType
    const limit = Number(searchParams.get('limit') || 3)
    const days = Number(searchParams.get('days') || 7)
    const startParam = searchParams.get('date') // optional explicit date
    const endParam = searchParams.get('endDate') // optional explicit end date

    if (!isValidSportType(sport)) {
      return NextResponse.json({ success: false, error: 'Invalid sport parameter' }, { status: 400 })
    }

    // Determine date range: default is today -> today + days
    let startDateISO: string
    let endDateISO: string | undefined

    if (startParam) {
      startDateISO = startParam
      endDateISO = endParam || undefined
    } else {
      const now = new Date()
      startDateISO = toISODateOnly(now)
      const end = new Date(now)
      end.setDate(end.getDate() + days)
      endDateISO = toISODateOnly(end)
    }

    // Fetch upcoming games in range from our Mongo-backed API
    const games = await mongoSportsAPI.getGames(sport, startDateISO, undefined, endDateISO)

    if (!games.length) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { sport, startDate: startDateISO, endDate: endDateISO, total: 0 }
      })
    }

    // Pull betting_data for those event_ids and compute consensus spreads
    const bettingCollection = await getBettingDataCollection()
    const eventIds = games.map((g) => g.id)
    const bettingDocs = await bettingCollection.find({ event_id: { $in: eventIds } }).toArray()
    const bettingByEvent = new Map(bettingDocs.map((d: any) => [d.event_id, d]))

    type RankedItem = {
      gameId: string
      absMaxSpread: number | null
      spreadHome: number | null
      spreadAway: number | null
      winProbHome: number | null
      winProbAway: number | null
    }

    const ranked: RankedItem[] = []

    for (const game of games) {
      const doc: any = bettingByEvent.get(game.id)
      if (!doc || !doc.lines) {
        ranked.push({
          gameId: game.id,
          absMaxSpread: null,
          spreadHome: null,
          spreadAway: null,
          winProbHome: null,
          winProbAway: null
        })
        continue
      }
      const lines = Object.values(doc.lines) as any[]
      const homeVals: number[] = []
      const awayVals: number[] = []
      const moneyHomeVals: number[] = []
      const moneyAwayVals: number[] = []

      for (const l of lines) {
        const h = typeof l?.spread?.point_spread_home === 'number' && isFinite(l.spread.point_spread_home)
          ? Number(l.spread.point_spread_home)
          : (typeof l?.spread?.point_spread_home_delta === 'number' ? Number(l.spread.point_spread_home_delta) : null)
        const a = typeof l?.spread?.point_spread_away === 'number' && isFinite(l.spread.point_spread_away)
          ? Number(l.spread.point_spread_away)
          : (typeof l?.spread?.point_spread_away_delta === 'number' ? Number(l.spread.point_spread_away_delta) : null)
        if (typeof h === 'number' && isFinite(h)) homeVals.push(h)
        if (typeof a === 'number' && isFinite(a)) awayVals.push(a)

        const mh = typeof l?.moneyline?.moneyline_home === 'number' && isFinite(l.moneyline.moneyline_home)
          ? Number(l.moneyline.moneyline_home)
          : (typeof l?.moneyline?.moneyline_home_delta === 'number' ? Number(l.moneyline.moneyline_home_delta) : null)
        const ma = typeof l?.moneyline?.moneyline_away === 'number' && isFinite(l.moneyline.moneyline_away)
          ? Number(l.moneyline.moneyline_away)
          : (typeof l?.moneyline?.moneyline_away_delta === 'number' ? Number(l.moneyline.moneyline_away_delta) : null)
        if (typeof mh === 'number' && isFinite(mh)) moneyHomeVals.push(mh)
        if (typeof ma === 'number' && isFinite(ma)) moneyAwayVals.push(ma)
      }

      const avgHome = avg(homeVals)
      const avgAway = avg(awayVals)
      const absMax = avgHome == null && avgAway == null
        ? null
        : Math.max(Math.abs(avgHome ?? 0), Math.abs(avgAway ?? 0))

      const avgMoneyHome = avg(moneyHomeVals)
      const avgMoneyAway = avg(moneyAwayVals)
      const probs = mongoSportsAPI.computeWinProbFromMoneylines(avgMoneyHome, avgMoneyAway)

      ranked.push({
        gameId: game.id,
        absMaxSpread: absMax,
        spreadHome: avgHome,
        spreadAway: avgAway,
        winProbHome: probs.winProbHome,
        winProbAway: probs.winProbAway
      })
    }

    // Only consider scheduled future games
    const futureGames = games.filter((g) => g.status === 'scheduled' && new Date(g.gameDate).getTime() >= Date.now())
    const indexById = new Map(futureGames.map((g, i) => [g.id, i]))

    // Sort by absMaxSpread desc, nulls last
    ranked.sort((a, b) => {
      const av = a.absMaxSpread
      const bv = b.absMaxSpread
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return bv - av
    })

    const selected: Array<{
      game: (typeof futureGames)[number]
      consensusSpread: { home: number | null; away: number | null; absMax: number | null; winProbHome: number | null; winProbAway: number | null }
    }> = []

    for (const r of ranked) {
      const idx = indexById.get(r.gameId)
      if (idx == null) continue
      selected.push({
        game: futureGames[idx],
        consensusSpread: {
          home: r.spreadHome,
          away: r.spreadAway,
          absMax: r.absMaxSpread,
          winProbHome: r.winProbHome,
          winProbAway: r.winProbAway
        }
      })
      if (selected.length >= limit) break
    }

    return NextResponse.json({
      success: true,
      data: selected,
      meta: {
        sport,
        startDate: startDateISO,
        endDate: endDateISO,
        total: selected.length
      }
    })
  } catch (error) {
    console.error('Most Bet Matchups API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load most bet matchups' }, { status: 500 })
  }
}


