import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get subscription status from WordPress and Stripe
    try {
      // First try to get user data from custom WordPress endpoint
      let wordpressUserData = null
      try {
        const wpResponse = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/statspro/v1/get-user-subscription/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
          }
        })
        
        if (wpResponse.ok) {
          wordpressUserData = await wpResponse.json()
          console.log('Retrieved WordPress user data:', wordpressUserData)
        }
      } catch (wpError) {
        console.warn('Could not fetch from custom WordPress endpoint:', wpError)
      }
      // Check if user has an active subscription in Stripe by looking up by email
      // First, get user email from the userId (this should come from your auth system)
      
      // For now, let's use a simple role-based approach
      // In a real implementation, you'd get the user's email and check Stripe
      
      let subscriptionStatus = 'inactive'
      let subscriptionPlan = 'free'
      let stripeSubscriptionId = null
      
      // Use WordPress data as source of truth if available
      if (wordpressUserData && wordpressUserData.success) {
        const wpMeta = wordpressUserData.subscription_meta
        subscriptionStatus = wpMeta.subscription_status || 'inactive'
        subscriptionPlan = wpMeta.subscription_plan || 'free'
        stripeSubscriptionId = wpMeta.stripe_subscription_id
        
        console.log('WordPress User Data:', JSON.stringify(wordpressUserData, null, 2))
        console.log('Using WordPress subscription data:', { subscriptionStatus, subscriptionPlan, stripeSubscriptionId })
        
        // If subscription plan is set in WordPress, mark as active
        if (subscriptionPlan && subscriptionPlan !== 'free') {
          subscriptionStatus = 'active'
          console.log(`Subscription plan is ${subscriptionPlan}, setting status to active`)
        }
      } else {
        console.log('No WordPress user data available or success=false')
      }

      // Get subscription details from Stripe if available
      let stripeSubscription = null
      if (stripeSubscriptionId) {
        try {
          stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
        } catch (stripeError) {
          console.warn('Failed to retrieve Stripe subscription:', stripeError)
        }
      }

      // Determine plan details based on subscription plan
      let planDetails, limits
      
      if (subscriptionPlan === 'pro') {
        planDetails = {
          id: 'pro',
          name: 'Pro',
          price: 29.99,
          interval: 'month',
          features: [
            'Unlimited team pages',
            'Unlimited matchup pages',
            '1,000 API requests per hour',
            'Advanced analytics',
            'Premium predictions',
            'Email support',
            'Export data to CSV'
          ]
        }
        limits = {
          apiRateLimit: 1000,
          teamLimit: -1,
          matchupLimit: -1
        }
      } else if (subscriptionPlan === 'enterprise') {
        planDetails = {
          id: 'enterprise',
          name: 'Enterprise',
          price: 99.99,
          interval: 'month',
          features: [
            'Everything in Pro',
            '5,000 API requests per hour',
            'Custom integrations',
            'Priority support',
            'Custom analytics dashboard',
            'White-label options',
            'Dedicated account manager'
          ]
        }
        limits = {
          apiRateLimit: 5000,
          teamLimit: -1,
          matchupLimit: -1
        }
      } else {
        // Free plan
        planDetails = 'free'
        limits = {
          apiRateLimit: 10,
          teamLimit: 3,
          matchupLimit: 5
        }
      }

      // Check if we should return free tier (only if no WordPress data AND no Stripe subscription)
      const hasWordPressSubscription = wordpressUserData && wordpressUserData.success && subscriptionPlan !== 'free'
      const hasStripeSubscription = stripeSubscription && stripeSubscription.status === 'active'
      
      if (!hasWordPressSubscription && !hasStripeSubscription) {
        // No subscription found anywhere, return free tier
        console.log('No subscription found in WordPress or Stripe, returning free tier')
        return NextResponse.json({
          success: true,
          subscription: null,
          plan: 'free',
          limits: {
            apiRateLimit: 10,
            teamLimit: 3,
            matchupLimit: 5
          }
        })
      }
      
      // If we have WordPress subscription data, use it (WordPress is source of truth)
      if (hasWordPressSubscription) {
        console.log('Using WordPress subscription data (WordPress is source of truth)')
      }

      // Build subscription response
      const subscriptionResponse: any = {
        success: true,
        plan: planDetails,
        limits: limits
      }

      // Add subscription details if we have them
      if (stripeSubscription && stripeSubscription.status === 'active') {
        subscriptionResponse.subscription = {
          id: stripeSubscriptionId,
          stripeId: stripeSubscriptionId,
          status: stripeSubscription.status,
          startDate: new Date(stripeSubscription.start_date * 1000).toISOString(),
          endDate: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          apiUsageCount: 0,
          currentPeriodEnd: stripeSubscription.current_period_end,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
        }
      } else if (wordpressUserData && wordpressUserData.success && subscriptionPlan !== 'free') {
        // Use WordPress data even if Stripe subscription not retrieved
        const wpMeta = wordpressUserData.subscription_meta
        subscriptionResponse.subscription = {
          id: stripeSubscriptionId,
          stripeId: stripeSubscriptionId,
          status: subscriptionStatus,
          startDate: wpMeta.subscription_start_date || new Date().toISOString(),
          endDate: wpMeta.subscription_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          apiUsageCount: 0,
          currentPeriodEnd: Math.floor(new Date(wpMeta.subscription_end_date || Date.now() + 30 * 24 * 60 * 60 * 1000).getTime() / 1000),
          cancelAtPeriodEnd: false,
        }
      } else {
        subscriptionResponse.subscription = null
      }

      return NextResponse.json(subscriptionResponse)

    } catch (error) {
      console.error('Subscription status error:', error)
      
      // Fallback to free tier if there's any error
      return NextResponse.json({
        success: true,
        subscription: null,
        plan: 'free',
        limits: {
          apiRateLimit: 10,
          teamLimit: 3,
          matchupLimit: 5
        },
        warning: 'Could not retrieve subscription data'
      })
    }

  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve subscription status' },
      { status: 500 }
    )
  }
}
