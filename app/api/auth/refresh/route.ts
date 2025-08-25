import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'

// WordPress GraphQL mutation for refresh token
const REFRESH_TOKEN_MUTATION = `
  mutation RefreshAuthToken($refreshToken: String!) {
    refreshJwtAuthToken(input: {
      jwtRefreshToken: $refreshToken
    }) {
      authToken
    }
  }
`

// Fallback validation query if refresh mutation is not available
const VALIDATE_REFRESH_TOKEN_QUERY = `
  query ValidateRefreshToken {
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

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const client = new GraphQLClient(
      process.env.WORDPRESS_API_URL || 'https://bpheadlessb852.wpenginepowered.com/graphql'
    )

    try {
      // Try to use the refresh token mutation first
      const refreshData = await client.request(REFRESH_TOKEN_MUTATION, {
        refreshToken: refreshToken
      }) as any

      if (refreshData.refreshJwtAuthToken?.authToken) {
        // Get user data with the new token
        const userClient = new GraphQLClient(
          process.env.WORDPRESS_API_URL || 'https://bpheadlessb852.wpenginepowered.com/graphql',
          {
            headers: {
              Authorization: `Bearer ${refreshData.refreshJwtAuthToken.authToken}`,
            },
          }
        )

        const userData = await userClient.request(VALIDATE_REFRESH_TOKEN_QUERY)

        if (userData.viewer) {
          const user = userData.viewer
          
          const mappedUser = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim() || user.nicename || user.username,
            subscriptionStatus: determineSubscriptionStatus(user.roles?.nodes || []),
            subscriptionExpiry: getSubscriptionExpiry(user.roles?.nodes || []),
            role: user.roles?.nodes?.some((role: any) => role.name === 'administrator') ? 'admin' : 'user'
          }

          return NextResponse.json({
            success: true,
            token: refreshData.refreshJwtAuthToken.authToken,
            user: mappedUser
          })
        }
      }
    } catch (refreshError) {
      console.log('Refresh token mutation not available, trying validation approach...')
      
      // Fallback: try to validate the refresh token directly
      try {
        const userClient = new GraphQLClient(
          process.env.WORDPRESS_API_URL || 'https://bpheadlessb852.wpenginepowered.com/graphql',
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        )

        const userData = await userClient.request(VALIDATE_REFRESH_TOKEN_QUERY)

        if (userData.viewer) {
          const user = userData.viewer
          
          const mappedUser = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim() || user.nicename || user.username,
            subscriptionStatus: determineSubscriptionStatus(user.roles?.nodes || []),
            subscriptionExpiry: getSubscriptionExpiry(user.roles?.nodes || []),
            role: user.roles?.nodes?.some((role: any) => role.name === 'administrator') ? 'admin' : 'user'
          }

          // Return the same token since refresh mutation isn't available
          return NextResponse.json({
            success: true,
            token: refreshToken,
            user: mappedUser
          })
        }
      } catch (validationError) {
        console.error('Token validation also failed:', validationError)
      }
    }

    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('Token refresh error:', error)
    
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}

// Helper function to determine subscription status based on WordPress roles
function determineSubscriptionStatus(roles: any[]): 'active' | 'inactive' | 'trial' {
  const roleNames = roles.map(role => role.name.toLowerCase())
  
  if (roleNames.includes('premium_member') || roleNames.includes('subscriber')) {
    return 'active'
  } else if (roleNames.includes('trial_member')) {
    return 'trial'
  }
  
  return 'trial' // Default new users to trial
}

// Helper function to get subscription expiry
function getSubscriptionExpiry(roles: any[]): Date | undefined {
  const roleNames = roles.map(role => role.name.toLowerCase())
  
  if (roleNames.includes('trial_member') || roleNames.includes('subscriber')) {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 14) // 14 day trial
    return expiry
  }
  
  return undefined
}
