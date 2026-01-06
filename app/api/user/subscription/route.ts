import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'

// GraphQL query to get user subscription data from WordPress
const GET_USER_SUBSCRIPTION_QUERY = `
  query GetUserSubscription($userId: Int!) {
    userSubscriptions(where: {metaQuery: {key: "user_id", value: $userId, compare: EQUAL}}) {
      nodes {
        id
        title
        acf {
          userId: user_id
          subscriptionPlanId: subscription_plan_id
          stripeSubscriptionId: stripe_subscription_id
          status
          startDate: start_date
          endDate: end_date
          apiUsageCount: api_usage_count
          lastUsageReset: last_usage_reset
        }
      }
    }
  }
`

// GraphQL query to get subscription plan details
const GET_SUBSCRIPTION_PLAN_QUERY = `
  query GetSubscriptionPlan($id: ID!) {
    subscriptionPlan(id: $id) {
      id
      title
      acf {
        planName: plan_name
        planPrice: plan_price
        planInterval: plan_interval
        stripePriceId: stripe_price_id
        apiRateLimit: api_rate_limit
        teamLimit: team_limit
        matchupLimit: matchup_limit
        features
      }
    }
  }
`

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

    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Create GraphQL client
    const client = new GraphQLClient(
      process.env.WORDPRESS_API_URL || 'http://localhost/statspro/graphql',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    try {
      // Try WordPress REST API first
      let subscriptionData = null
      try {
        const restResponse = await fetch(`${process.env.WORDPRESS_REST_URL}/statspro/v1/user-subscription/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (restResponse.ok) {
          const restData = await restResponse.json()
          if (restData.success) {
            subscriptionData = restData.data
            console.log('WordPress REST subscription data:', JSON.stringify(subscriptionData, null, 2))
          }
        }
      } catch (restError) {
        console.warn('WordPress REST API failed, trying GraphQL:', restError)
      }

      // Fallback to GraphQL if REST fails
      if (!subscriptionData) {
        const graphqlData = await client.request(GET_USER_SUBSCRIPTION_QUERY, {
          userId: parseInt(userId)
        }) as any

        console.log('WordPress GraphQL subscription data:', JSON.stringify(graphqlData, null, 2))
        const userSubscriptions = graphqlData?.userSubscriptions?.nodes || []
        
        if (userSubscriptions.length > 0) {
          const userSubscription = userSubscriptions[0]
          subscriptionData = {
            id: userSubscription.id,
            user_id: userSubscription.acf?.userId,
            subscription_plan_id: userSubscription.acf?.subscriptionPlanId,
            stripe_subscription_id: userSubscription.acf?.stripeSubscriptionId,
            status: userSubscription.acf?.status,
            start_date: userSubscription.acf?.startDate,
            end_date: userSubscription.acf?.endDate,
            api_usage_count: userSubscription.acf?.apiUsageCount,
            last_usage_reset: userSubscription.acf?.lastUsageReset
          }
        }
      }
      
      if (!subscriptionData) {
        // No subscription found - return free tier
        return NextResponse.json({
          success: true,
          subscription: null,
          plan: {
            id: 'free',
            name: 'Free',
            price: 0,
            interval: 'month',
            features: [
              'Basic team statistics',
              'Limited matchup data', 
              'Community support'
            ]
          },
          limits: {
            apiRateLimit: 10,
            teamLimit: 3,
            matchupLimit: 5
          },
          status: 'inactive'
        })
      }

      // Check if subscription is active and not expired
      const now = new Date()
      const endDate = subscriptionData.end_date ? new Date(subscriptionData.end_date) : null
      const isExpired = endDate && now > endDate
      const status = isExpired ? 'expired' : subscriptionData.status || 'inactive'

      if (status !== 'active' && status !== 'trial') {
        // Inactive or expired subscription - return free tier
        return NextResponse.json({
          success: true,
          subscription: {
            id: subscriptionData.id,
            status: status,
            startDate: subscriptionData.start_date,
            endDate: subscriptionData.end_date,
            stripeSubscriptionId: subscriptionData.stripe_subscription_id
          },
          plan: {
            id: 'free',
            name: 'Free',
            price: 0,
            interval: 'month',
            features: [
              'Basic team statistics',
              'Limited matchup data',
              'Community support'
            ]
          },
          limits: {
            apiRateLimit: 10,
            teamLimit: 3,
            matchupLimit: 5
          },
          status: status
        })
      }

      // Get subscription plan details
      let planDetails = null
      
      if (subscriptionData.plan) {
        // Plan data already included from REST API
        planDetails = subscriptionData.plan
      } else {
        // Fetch plan data separately
        const planData = await client.request(GET_SUBSCRIPTION_PLAN_QUERY, {
          id: subscriptionData.subscription_plan_id
        }) as any

        console.log('WordPress plan data:', JSON.stringify(planData, null, 2))

        const subscriptionPlan = planData?.subscriptionPlan
        
        if (!subscriptionPlan) {
          throw new Error('Subscription plan not found')
        }

        const planAcf = subscriptionPlan.acf
        planDetails = {
          id: subscriptionPlan.id,
          title: subscriptionPlan.title,
          plan_name: planAcf.planName,
          plan_price: planAcf.planPrice,
          plan_interval: planAcf.planInterval,
          stripe_price_id: planAcf.stripePriceId,
          api_rate_limit: planAcf.apiRateLimit,
          team_limit: planAcf.teamLimit,
          matchup_limit: planAcf.matchupLimit,
          features: planAcf.features ? planAcf.features.split('\n').filter((f: string) => f.trim()) : []
        }
      }

      const features = Array.isArray(planDetails.features) ? planDetails.features : 
                      (planDetails.features ? planDetails.features.split('\n').filter((f: string) => f.trim()) : [])

      // Return active subscription with plan details
      return NextResponse.json({
        success: true,
        subscription: {
          id: subscriptionData.id,
          status: status,
          startDate: subscriptionData.start_date,
          endDate: subscriptionData.end_date,
          stripeSubscriptionId: subscriptionData.stripe_subscription_id,
          apiUsageCount: subscriptionData.api_usage_count || 0,
          lastUsageReset: subscriptionData.last_usage_reset
        },
        plan: {
          id: planDetails.id,
          name: planDetails.plan_name || planDetails.title,
          price: planDetails.plan_price || 0,
          interval: planDetails.plan_interval || 'month',
          stripePriceId: planDetails.stripe_price_id,
          features: features
        },
        limits: {
          apiRateLimit: planDetails.api_rate_limit || 10,
          teamLimit: planDetails.team_limit || 3,
          matchupLimit: planDetails.matchup_limit || 5
        },
        status: status
      })

    } catch (graphqlError) {
      console.error('GraphQL error:', graphqlError)
      
      // Fallback to checking user roles if GraphQL fails
      return await fallbackToRoleBasedSubscription(token, userId)
    }

  } catch (error) {
    console.error('User subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve user subscription' },
      { status: 500 }
    )
  }
}

// Fallback function to determine subscription based on user roles
async function fallbackToRoleBasedSubscription(token: string, userId: string) {
  try {
    // Validate token and get user roles
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Token validation failed')
    }

    const userData = await response.json()
    const user = userData.user

    // Determine subscription based on user roles (fallback)
    let plan, limits, status

    // Check subscription tier from user object
    const subscriptionTier = user.subscriptionTier || 'free'
    
    if (user.subscriptionStatus === 'active') {
      // Determine plan based on subscription tier
      if (subscriptionTier === 'enterprise') {
        plan = {
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
      } else if (subscriptionTier === 'pro') {
        plan = {
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
      } else {
        // Default to free for unknown tiers
        plan = {
          id: 'free',
          name: 'Free',
          price: 0,
          interval: 'month',
          features: [
            '3 team pages per day',
            '5 matchup pages per day',
            '10 API requests per hour',
            'Basic analytics'
          ]
        }
        limits = {
          apiRateLimit: 10,
          teamLimit: 3,
          matchupLimit: 5
        }
      }
      status = 'active'
    } else if (user.subscriptionStatus === 'trial') {
      // Trial plan
      plan = {
        id: 'trial',
        name: 'Trial',
        price: 0,
        interval: 'month',
        features: [
          'Limited team statistics',
          'Limited matchup data',
          'Basic support'
        ]
      }
      limits = {
        apiRateLimit: 25,
        teamLimit: 10,
        matchupLimit: 15
      }
      status = 'trial'
    } else {
      // Free plan
      plan = {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          'Basic team statistics',
          'Limited matchup data',
          'Community support'
        ]
      }
      limits = {
        apiRateLimit: 10,
        teamLimit: 3,
        matchupLimit: 5
      }
      status = 'inactive'
    }

    return NextResponse.json({
      success: true,
      subscription: null,
      plan: plan,
      limits: limits,
      status: status,
      fallback: true
    })

  } catch (error) {
    console.error('Fallback subscription error:', error)
    
    // Ultimate fallback to free tier
    return NextResponse.json({
      success: true,
      subscription: null,
      plan: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          'Basic team statistics',
          'Limited matchup data',
          'Community support'
        ]
      },
      limits: {
        apiRateLimit: 10,
        teamLimit: 3,
        matchupLimit: 5
      },
      status: 'inactive',
      fallback: true
    })
  }
}
