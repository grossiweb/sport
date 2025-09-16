import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { determineSubscriptionStatus, getSubscriptionExpiry, hasActiveSubscription, getSubscriptionTier } from '@/lib/subscription-utils'

const VALIDATE_TOKEN_QUERY = `
  query ValidateToken {
    viewer {
      id
      username
      email
      firstName
      lastName
      nicename
      roles {
        nodes {
          name
        }
      }
    }
  }
`

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Create GraphQL client with the token
    const client = new GraphQLClient(
      process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await client.request(VALIDATE_TOKEN_QUERY) as any

    if (data && data.viewer) {
      const user = data.viewer
      const roles = user.roles?.nodes || []
      
      // Get subscription details
      const subscriptionStatus = determineSubscriptionStatus(roles)
      const subscriptionExpiry = getSubscriptionExpiry(roles)
      const hasValidSubscription = hasActiveSubscription(subscriptionStatus, subscriptionExpiry)
      const subscriptionTier = getSubscriptionTier(roles)

      return NextResponse.json({
        success: true,
        debug: {
          userId: user.id,
          email: user.email,
          username: user.username,
          roles: roles.map((role: any) => role.name),
          subscriptionStatus,
          subscriptionTier,
          subscriptionExpiry,
          hasValidSubscription,
          currentTime: new Date().toISOString(),
          explanation: {
            free_subscriber: 'Default registration role - limited access',
            pro_subscriber: 'Paid subscription - full access',
            enterprise_subscriber: 'Enterprise subscription - full access + enterprise features'
          }
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Debug subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
