import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Find betting data for the specific game
    const bettingData = await db
      .collection('betting_data')
      .findOne({ event_id: gameId })

    if (!bettingData) {
      return NextResponse.json(
        { error: 'No betting data found for this game' },
        { status: 404 }
      )
    }

    // Transform the data to match our expected format
    const transformedData = {
      event_id: bettingData.event_id,
      lines: bettingData.lines || {}
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching betting lines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch betting lines' },
      { status: 500 }
    )
  }
}
