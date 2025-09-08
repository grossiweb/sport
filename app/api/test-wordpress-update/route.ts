import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to check WordPress REST API connection and update user role
export async function POST(request: NextRequest) {
  try {
    const { userId, role, plan } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    console.log(`Testing WordPress update for user ${userId} with role ${role}`)

    // Test using custom WordPress plugin endpoint
    const metaData = {
      subscription_status: 'active',
      subscription_plan: plan || 'pro',
      stripe_subscription_id: 'test_sub_id',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const customResponse = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/update-user-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
      },
      body: JSON.stringify({
        user_id: parseInt(userId),
        role: role || 'pro_subscriber',
        subscription_data: metaData
      })
    })

    let metaResult = null
    let metaError = null
    let roleResult = null
    let roleError = null

    if (!customResponse.ok) {
      const errorText = await customResponse.text()
      metaError = `Failed to update via custom endpoint: ${customResponse.status} ${customResponse.statusText} - ${errorText}`
      roleError = metaError
      console.error(metaError)
    } else {
      const result = await customResponse.json()
      metaResult = result
      roleResult = result
      console.log(`Successfully updated user ${userId} via custom endpoint:`, result)
    }

    // Test 3: Get current user data to verify using custom endpoint
    const getUserResponse = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/get-user-subscription/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
      }
    })

    let currentUser = null
    if (getUserResponse.ok) {
      currentUser = await getUserResponse.json()
    }

    return NextResponse.json({
      success: true,
      userId,
      environment: {
        WORDPRESS_REST_URL: process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json',
        hasAdminUser: !!process.env.WORDPRESS_ADMIN_USER,
        hasAdminPass: !!process.env.WORDPRESS_ADMIN_PASS
      },
      metaUpdate: {
        success: !metaError,
        error: metaError,
        result: metaResult
      },
      roleUpdate: {
        success: !roleError,
        error: roleError,
        result: roleResult
      },
      currentUser: currentUser
    })

  } catch (error: any) {
    console.error('WordPress test error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
