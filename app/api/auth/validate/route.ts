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
    console.log('Validation response:', JSON.stringify(data, null, 2))
    
    // Debug: Log user roles for troubleshooting
    if (data && data.viewer && data.viewer.roles) {
      console.log('User roles:', data.viewer.roles.nodes.map((role: any) => role.name))
    }

    if (data && data.viewer) {
      const user = data.viewer
      
      // Map WordPress user to your User type
      const subscriptionStatus = determineSubscriptionStatus(user.roles?.nodes || [])
      const subscriptionExpiry = getSubscriptionExpiry(user.roles?.nodes || [])
      const subscriptionTier = getSubscriptionTier(user.roles?.nodes || [])
      
      console.log('Mapped subscription status:', subscriptionStatus)
      console.log('Mapped subscription tier:', subscriptionTier)
      console.log('Mapped subscription expiry:', subscriptionExpiry)
      
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
        user: mappedUser
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Token validation error:', error)
    
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 401 }
    )
  }
}

// Helper functions moved to centralized subscription-utils.ts