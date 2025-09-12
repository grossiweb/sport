import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { determineSubscriptionStatus, getSubscriptionExpiry, getSubscriptionTier } from '@/lib/subscription-utils'

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

/**
 * API endpoint to sync user subscription status with WordPress
 * This can be called periodically or when subscription status needs to be refreshed
 */
export async function POST(request: NextRequest) {
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
      process.env.WORDPRESS_API_URL || 'http://headless.grossiweb.com/graphql',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    console.log('Syncing subscription status with WordPress...')
    const data = await client.request(VALIDATE_TOKEN_QUERY) as any

    if (data && data.viewer) {
      const user = data.viewer
      
      // Debug: Log user roles for troubleshooting
      if (user.roles) {
        console.log('Sync - User roles:', user.roles.nodes.map((role: any) => role.name))
      }
      
      // Map WordPress user to your User type with fresh subscription data
      const subscriptionStatus = determineSubscriptionStatus(user.roles?.nodes || [])
      const subscriptionExpiry = getSubscriptionExpiry(user.roles?.nodes || [])
      const subscriptionTier = getSubscriptionTier(user.roles?.nodes || [])
      
      console.log('Sync - Updated subscription status:', subscriptionStatus)
      console.log('Sync - Updated subscription tier:', subscriptionTier)
      console.log('Sync - Updated subscription expiry:', subscriptionExpiry)
      
      const mappedUser = {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim() || user.nicename || user.username,
        subscriptionStatus,
        subscriptionTier,
        subscriptionExpiry,
        role: user.roles?.nodes?.some((role: any) => role.name === 'administrator') ? 'admin' : 'user'
      }

      return NextResponse.json({
        success: true,
        user: mappedUser,
        syncedAt: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid token or user not found' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Subscription sync error:', error)
    
    // Check if it's a GraphQL error
    if (error.response?.errors) {
      const errorMessage = error.response.errors[0]?.message || 'Subscription sync failed'
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
