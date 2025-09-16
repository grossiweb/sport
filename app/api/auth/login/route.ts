import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { determineSubscriptionStatus, getSubscriptionExpiry, getSubscriptionTier } from '@/lib/subscription-utils'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql')

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
      
      // Debug: Log user roles for troubleshooting
      if (user.roles) {
        console.log('Login - User roles:', user.roles.nodes.map((role: any) => role.name))
      }
      
      // Map WordPress user to your User type
      const subscriptionStatus = determineSubscriptionStatus(user.roles?.nodes || [])
      const subscriptionExpiry = getSubscriptionExpiry(user.roles?.nodes || [])
      const subscriptionTier = getSubscriptionTier(user.roles?.nodes || [])
      
      console.log('Login - Mapped subscription status:', subscriptionStatus)
      console.log('Login - Mapped subscription tier:', subscriptionTier)
      console.log('Login - Mapped subscription expiry:', subscriptionExpiry)
      
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

// Helper functions moved to centralized subscription-utils.ts
