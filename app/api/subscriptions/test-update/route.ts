import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to manually update a user's subscription status
// This is for testing purposes only - remove in production
export async function POST(request: NextRequest) {
  try {
    const { userId, plan, status } = await request.json()

    if (!userId || !plan || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, plan, status' },
        { status: 400 }
      )
    }

    // Update user meta fields in WordPress
    const meta = {
      subscription_status: status,
      subscription_plan: plan,
      stripe_subscription_id: 'test_subscription_id',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    }

    const response = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
      },
      body: JSON.stringify({
        meta: meta,
        roles: [status === 'active' ? `${plan}_subscriber` : 'subscriber']
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to update user:', response.statusText, errorText)
      return NextResponse.json(
        { error: 'Failed to update WordPress user', details: errorText },
        { status: 500 }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: `Updated user ${userId} to ${plan} plan with ${status} status`,
      wpResponse: result
    })

  } catch (error: any) {
    console.error('Test update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
