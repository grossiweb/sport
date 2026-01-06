import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received manual sync request:', body)
    
    const { userId, userEmail } = body

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail', received: body },
        { status: 400 }
      )
    }

    console.log(`Manual sync for user ${userId} (${userEmail}) - Type: ${typeof userId}`)

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No Stripe customer found with this email' },
        { status: 404 }
      )
    }

    const customer = customers.data[0]
    console.log(`Found Stripe customer: ${customer.id}`)

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found for this customer' },
        { status: 404 }
      )
    }

    const subscription = subscriptions.data[0]
    const priceId = subscription.items.data[0]?.price.id

    // Determine plan type
    let planType = 'free'
    if (priceId === 'price_1SmWzsBsfc1fMnM5lpwnHNJT') {
      planType = 'pro'
    } else if (priceId === 'price_1SmWzWBsfc1fMnM57LdsAiqR') {
      planType = 'enterprise'
    }

    const role = `${planType}_subscriber`

    console.log(`Syncing subscription: ${planType} (${subscription.status})`)

    // Update WordPress - Extract numeric user ID from potentially base64-encoded GraphQL ID
    let wpUserId: number
    
    try {
      // If userId is base64 encoded (GraphQL format: "dXNlcjoxMjM="), decode it
      if (typeof userId === 'string' && !userId.match(/^\d+$/)) {
        try {
          const decoded = Buffer.from(userId, 'base64').toString('utf-8')
          console.log(`Decoded GraphQL ID: ${decoded}`)
          // Extract numeric part from "user:123" format
          const match = decoded.match(/(\d+)/)
          wpUserId = match ? parseInt(match[1]) : parseInt(userId.replace(/[^0-9]/g, ''))
        } catch {
          wpUserId = parseInt(userId.replace(/[^0-9]/g, ''))
        }
      } else {
        wpUserId = parseInt(userId.toString().replace(/[^0-9]/g, ''))
      }
      
      console.log(`Parsed WordPress User ID: ${wpUserId}`)
      
      if (isNaN(wpUserId) || wpUserId === 0) {
        throw new Error('Invalid user ID')
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid userId format', userId: userId, type: typeof userId },
        { status: 400 }
      )
    }
    
    const subscriptionData = {
      subscription_status: subscription.status,
      subscription_plan: planType,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      subscription_start_date: new Date((subscription.start_date || subscription.created) * 1000).toISOString(),
      subscription_end_date: new Date(subscription.currentPeriodEnd * 1000).toISOString(),
    }

    // Try the REST API endpoint
    const response = await fetch(
      `${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/update-user-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
        },
        body: JSON.stringify({
          user_id: wpUserId,
          role: role,
          subscription_data: subscriptionData
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress update failed:', response.status, errorText)
      
      // If the custom endpoint doesn't exist, provide helpful message
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'WordPress plugin not found', 
            details: 'The StatsPro Subscription plugin is not installed or activated. Please install it from wp-content/plugins/statspro-subscription/',
            wpResponse: errorText 
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to update WordPress', 
          details: errorText,
          userId: wpUserId,
          role: role,
          planType: planType
        },
        { status: 500 }
      )
    }

    const result = await response.json()
    console.log('WordPress updated successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      plan: planType,
      role: role,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer: customer.id
      }
    })

  } catch (error: any) {
    console.error('Manual sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

