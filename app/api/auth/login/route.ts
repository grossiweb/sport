import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://bpheadlessb852.wpenginepowered.com/graphql')

// WordPress GraphQL mutation for login
const LOGIN_MUTATION = `
  mutation LoginUser($username: String!, $password: String!) {
    login(input: {
      username: $username
      password: $password
    }) {
      authToken
      refreshToken
      user {
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
  }
`

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Attempt login with WordPress
    const data = await client.request(LOGIN_MUTATION, {
      username: email, // WordPress can use email as username
      password: password
    }) as any

    if (data.login?.authToken && data.login?.user) {
      const user = data.login.user
      
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
        token: data.login.authToken,
        refreshToken: data.login.refreshToken,
        user: mappedUser
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Check if it's a GraphQL error
    if (error.response?.errors) {
      const errorMessage = error.response.errors[0]?.message || 'Authentication failed'
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

// Helper function to determine subscription status based on WordPress roles
function determineSubscriptionStatus(roles: any[]): 'active' | 'inactive' | 'trial' {
  const roleNames = roles.map(role => role.name.toLowerCase())
  
  if (roleNames.includes('premium_member') || roleNames.includes('subscriber')) {
    return 'active'
  } else if (roleNames.includes('trial_member')) {
    return 'trial'
  }
  
  return 'inactive'
}

// Helper function to get subscription expiry
function getSubscriptionExpiry(roles: any[]): Date | undefined {
  // You can implement custom logic here based on your WordPress user meta
  // For now, return a default trial period
  const roleNames = roles.map(role => role.name.toLowerCase())
  
  if (roleNames.includes('trial_member')) {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 14) // 14 day trial
    return expiry
  }
  
  return undefined
}
