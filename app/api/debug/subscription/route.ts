import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    console.log(`\n=== Debug Subscription for User ${userId} ===`)

    // Check WordPress data
    let wpData = null
    try {
      const wpResponse = await fetch(
        `${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/get-user-subscription/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
          }
        }
      )
      
      if (wpResponse.ok) {
        wpData = await wpResponse.json()
        console.log('WordPress Data:', JSON.stringify(wpData, null, 2))
      } else {
        console.log('WordPress fetch failed:', wpResponse.status, wpResponse.statusText)
      }
    } catch (error) {
      console.error('WordPress fetch error:', error)
    }

    // Check what subscription status endpoint returns
    let statusData = null
    try {
      const statusResponse = await fetch(
        `http://localhost:3001/api/subscriptions/status?userId=${userId}`
      )
      statusData = await statusResponse.json()
      console.log('Status Endpoint Data:', JSON.stringify(statusData, null, 2))
    } catch (error) {
      console.error('Status endpoint error:', error)
    }

    return NextResponse.json({
      userId,
      wordpress: wpData,
      statusEndpoint: statusData,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
