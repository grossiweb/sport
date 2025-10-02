'use server'

import { NextRequest } from 'next/server'
import { getSportSeasonsCollection } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sportIdParam = searchParams.get('sport_id')
    const seasonParam = searchParams.get('season')

    const collection = await getSportSeasonsCollection()
    const query: any = {}
    if (sportIdParam) query.sport_id = parseInt(sportIdParam, 10)
    if (seasonParam) query.season = parseInt(seasonParam, 10)

    const seasons = await collection.find(query).sort({ season: -1 }).toArray()
    // Normalize dates to ISO strings for client
    const normalized = seasons.map((s: any) => ({
      ...s,
      start_date: s.start_date instanceof Date ? s.start_date.toISOString() : s.start_date,
      end_date: s.end_date instanceof Date ? s.end_date.toISOString() : s.end_date
    }))
    return new Response(JSON.stringify({ data: normalized }), { status: 200 })
  } catch (err) {
    console.error('GET /api/seasons error', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch seasons' }), { status: 500 })
  }
}


