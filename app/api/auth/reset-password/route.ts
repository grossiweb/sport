import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql')

// WordPress GraphQL mutation for resetting password
const RESET_USER_PASSWORD_MUTATION = `
  mutation ResetUserPassword($key: String!, $login: String!, $password: String!) {
    resetUserPassword(input: {
      key: $key
      login: $login
      password: $password
    }) {
      success
      user {
        id
        email
      }
    }
  }
`

// Alternative REST API approach if GraphQL mutation is not available
async function resetPasswordViaREST(token: string, email: string, password: string) {
  const restUrl = process.env.WORDPRESS_REST_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/wp-json'
  
  try {
    // Try the standard WordPress REST API endpoint
    const response = await fetch(`${restUrl}/wp/v2/users/password-reset/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: token,
        login: email,
        password: password
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      // Try alternative endpoint (if using a plugin like Better WordPress REST API)
      const altResponse = await fetch(`${restUrl}/bdpwr/v1/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: token,
          password: password
        })
      })

      if (altResponse.ok) {
        return { success: true }
      } else {
        // Try another alternative endpoint format
        const alt2Response = await fetch(`${restUrl}/wp/v2/users/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reset_key: token,
            user_login: email,
            new_password: password
          })
        })

        if (alt2Response.ok) {
          return { success: true }
        } else {
          throw new Error('All REST API password reset attempts failed')
        }
      }
    }
  } catch (error) {
    console.error('REST API password reset error:', error)
    throw error
  }
}

// Function to validate password strength
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      )
    }

    console.log(`Password reset confirmation for email: ${email}`)

    try {
      // First, try using GraphQL mutation
      console.log('Attempting password reset confirmation via GraphQL...')
      const resetData = await client.request(RESET_USER_PASSWORD_MUTATION, {
        key: token,
        login: email,
        password: password
      }) as any

      console.log('GraphQL password reset confirmation response:', resetData)

      if (resetData.resetUserPassword?.success) {
        return NextResponse.json({
          success: true,
          message: 'Your password has been reset successfully'
        })
      } else {
        throw new Error('GraphQL mutation returned unsuccessful result')
      }
    } catch (graphqlError: any) {
      console.error('GraphQL password reset confirmation failed:', graphqlError.message)
      
      // Fallback to REST API approach
      try {
        console.log('Attempting password reset confirmation via REST API...')
        await resetPasswordViaREST(token, email, password)
        
        return NextResponse.json({
          success: true,
          message: 'Your password has been reset successfully'
        })
      } catch (restError: any) {
        console.error('REST API password reset confirmation failed:', restError.message)
        
        // If both methods fail, return appropriate error
        return NextResponse.json(
          { 
            error: 'Invalid or expired reset token. Please request a new password reset link.' 
          },
          { status: 400 }
        )
      }
    }
  } catch (error: any) {
    console.error('Reset password confirmation error:', error)
    
    return NextResponse.json(
      { 
        error: 'An error occurred while resetting your password. Please try again.' 
      },
      { status: 500 }
    )
  }
}
