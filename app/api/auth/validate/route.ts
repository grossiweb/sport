import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'

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
      process.env.WORDPRESS_API_URL || 'http://headless.grossiweb.com/graphql',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await client.request(VALIDATE_TOKEN_QUERY) as any
    console.log('Validation response:', JSON.stringify(data, null, 2))

    if (data && data.viewer) {
      const user = data.viewer
      
      // Map WordPress user to your User type
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