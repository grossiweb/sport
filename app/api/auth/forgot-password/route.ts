import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql')

// WordPress GraphQL mutation for sending password reset email
const SEND_PASSWORD_RESET_EMAIL_MUTATION = `
  mutation SendPasswordResetEmail($username: String!) {
    sendPasswordResetEmail(input: {
      username: $username
    }) {
      success
      user {
        email
      }
    }
  }
`

// Alternative REST API approach if GraphQL mutation is not available
async function sendPasswordResetViaREST(email: string) {
  const restUrl = process.env.WORDPRESS_REST_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/wp-json'
  
  try {
    const response = await fetch(`${restUrl}/wp/v2/users/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_login: email
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      // Try alternative endpoint
      const altResponse = await fetch(`${restUrl}/bdpwr/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      })

      if (altResponse.ok) {
        return { success: true }
      } else {
        throw new Error('REST API password reset failed')
      }
    }
  } catch (error) {
    console.error('REST API password reset error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    console.log(`Password reset requested for email: ${email}`)

    try {
      // First, try using GraphQL mutation
      console.log('Attempting password reset via GraphQL...')
      const resetData = await client.request(SEND_PASSWORD_RESET_EMAIL_MUTATION, {
        username: email
      }) as any

      console.log('GraphQL password reset response:', resetData)

      if (resetData.sendPasswordResetEmail?.success) {
        return NextResponse.json({
          success: true,
          message: 'Password reset instructions have been sent to your email address'
        })
      } else {
        throw new Error('GraphQL mutation returned unsuccessful result')
      }
    } catch (graphqlError: any) {
      console.error('GraphQL password reset failed:', graphqlError.message)
      
      // Fallback to REST API approach
      try {
        console.log('Attempting password reset via REST API...')
        await sendPasswordResetViaREST(email)
        
        return NextResponse.json({
          success: true,
          message: 'Password reset instructions have been sent to your email address'
        })
      } catch (restError: any) {
        console.error('REST API password reset failed:', restError.message)
        
        // If both methods fail, we'll still return success for security reasons
        // (to prevent email enumeration attacks)
        console.log('Both GraphQL and REST methods failed, but returning success for security')
        return NextResponse.json({
          success: true,
          message: 'If an account with that email exists, password reset instructions have been sent'
        })
      }
    }
  } catch (error: any) {
    console.error('Forgot password error:', error)
    
    // For security reasons, always return a generic success message
    // This prevents attackers from determining if an email exists in the system
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent'
    })
  }
}
