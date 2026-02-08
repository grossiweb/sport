import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { passwordResetService } from '@/lib/email/password-reset-service'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql')

// WordPress GraphQL mutation to update user password
const UPDATE_USER_PASSWORD_MUTATION = `
  mutation UpdateUserPassword($id: ID!, $password: String!) {
    updateUser(input: {
      id: $id
      password: $password
    }) {
      user {
        id
        email
      }
    }
  }
`

// GraphQL query to get user by email
const GET_USER_BY_EMAIL_QUERY = `
  query GetUserByEmail($email: String!) {
    users(where: { search: $email }) {
      nodes {
        id
        email
        username
      }
    }
  }
`

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

    // Step 1: Validate the reset token
    const tokenValidation = passwordResetService.validateResetToken(token)
    
    if (!tokenValidation.valid) {
      console.log('❌ Invalid or expired token')
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset link.' },
        { status: 400 }
      )
    }

    // Step 2: Verify the email matches the token
    if (tokenValidation.email?.toLowerCase() !== email.toLowerCase()) {
      console.log('❌ Email mismatch')
      return NextResponse.json(
        { error: 'Invalid reset request' },
        { status: 400 }
      )
    }

    console.log('✅ Token validated successfully')

    try {
      // Step 3: Get user ID from WordPress
      console.log(`Fetching user from WordPress for email: ${email}`)
      
      let userData: any = null
      let userId: string | null = null
      
      // Try GraphQL first
      try {
        userData = await client.request(GET_USER_BY_EMAIL_QUERY, {
          email: email
        }) as any
        
        console.log('GraphQL response:', JSON.stringify(userData, null, 2))
        
        if (userData?.users?.nodes?.length > 0) {
          userId = userData.users.nodes[0].id
          console.log(`✅ Found user via GraphQL: ${userId}`)
        }
      } catch (graphqlError: any) {
        console.log('GraphQL user query failed:', graphqlError.message)
      }
      
      // If GraphQL didn't work, try REST API
      if (!userId) {
        console.log('Trying WordPress REST API...')
        try {
          const restUrl = process.env.WORDPRESS_REST_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/wp-json'
          
          // Get admin credentials for authentication
          const authString = process.env.WORDPRESS_ADMIN_USER && process.env.WORDPRESS_ADMIN_PASS
            ? Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')
            : null
          
          if (authString) {
            const userResponse = await fetch(`${restUrl}/wp/v2/users?search=${encodeURIComponent(email)}`, {
              headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (userResponse.ok) {
              const users = await userResponse.json()
              console.log(`REST API found ${users.length} users`)
              
              if (users && users.length > 0) {
                // Find exact email match
                const exactMatch = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
                if (exactMatch) {
                  userId = exactMatch.id.toString()
                  console.log(`✅ Found user via REST API: ${userId} (${exactMatch.email})`)
                }
              }
            } else {
              console.log('REST API response not OK:', userResponse.status)
            }
          } else {
            console.log('No admin credentials available for REST API')
          }
        } catch (restError: any) {
          console.error('REST API user query failed:', restError.message)
        }
      }
      
      // If still no user found
      if (!userId) {
        console.log('❌ User not found in WordPress via GraphQL or REST API')
        console.log(`   Email searched: ${email}`)
        console.log('   Suggestion: Check if this email exists in WordPress users')
        return NextResponse.json(
          { 
            error: 'User account not found. Please ensure you have a WordPress account with this email address.',
            details: 'The email address does not match any user in the system.'
          },
          { status: 404 }
        )
      }
      
      console.log(`✅ Found user in WordPress: ${userId}`)

      // Step 4: Update password in WordPress using admin credentials
      console.log('Updating password in WordPress...')
      
      // Create an admin client for password update
      const adminClient = new GraphQLClient(
        process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql'
      )

      // Try to get admin token if available
      let adminToken: string | null = null
      if (process.env.WORDPRESS_ADMIN_USER && process.env.WORDPRESS_ADMIN_PASS) {
        try {
          const LOGIN_MUTATION = `
            mutation Login($username: String!, $password: String!) {
              login(input: {
                username: $username
                password: $password
              }) {
                authToken
              }
            }
          `
          const loginData = await adminClient.request(LOGIN_MUTATION, {
            username: process.env.WORDPRESS_ADMIN_USER,
            password: process.env.WORDPRESS_ADMIN_PASS
          }) as any
          
          adminToken = loginData?.login?.authToken
          if (adminToken) {
            console.log('✅ Obtained admin token')
            adminClient.setHeader('Authorization', `Bearer ${adminToken}`)
          }
        } catch (loginError) {
          console.log('⚠️ Could not obtain admin token, trying without authentication')
        }
      }

      // Update the password
      const updateResult = await adminClient.request(UPDATE_USER_PASSWORD_MUTATION, {
        id: userId,
        password: password
      }) as any

      if (updateResult?.updateUser?.user) {
        console.log('✅ Password updated successfully in WordPress')
        
        // Step 5: Delete the used token
        passwordResetService.deleteResetToken(token)
        
        return NextResponse.json({
          success: true,
          message: 'Your password has been reset successfully. You can now log in with your new password.'
        })
      } else {
        throw new Error('Password update failed')
      }
    } catch (wordpressError: any) {
      console.error('❌ WordPress password update error:', wordpressError)
      
      // If WordPress update fails, try REST API fallback
      try {
        console.log('Attempting password update via WordPress REST API...')
        const restUrl = process.env.WORDPRESS_REST_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/wp-json'
        
        // Get admin credentials
        const authString = process.env.WORDPRESS_ADMIN_USER && process.env.WORDPRESS_ADMIN_PASS
          ? Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')
          : null
        
        if (!authString) {
          throw new Error('Admin credentials not configured')
        }

        // First, get the user ID via REST API
        const userResponse = await fetch(`${restUrl}/wp/v2/users?search=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json'
          }
        })

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user via REST API')
        }

        const users = await userResponse.json()
        if (!users || users.length === 0) {
          throw new Error('User not found via REST API')
        }

        const wpUserId = users[0].id

        // Update the password
        const updateResponse = await fetch(`${restUrl}/wp/v2/users/${wpUserId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: password
          })
        })

        if (updateResponse.ok) {
          console.log('✅ Password updated via REST API')
          passwordResetService.deleteResetToken(token)
          
          return NextResponse.json({
            success: true,
            message: 'Your password has been reset successfully. You can now log in with your new password.'
          })
        } else {
          throw new Error('REST API password update failed')
        }
      } catch (restError: any) {
        console.error('❌ REST API password update also failed:', restError)
        
        return NextResponse.json(
          { 
            error: 'Failed to update password. Please ensure WordPress is properly configured.',
            details: wordpressError.message
          },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error('Reset password fatal error:', error)
    
    return NextResponse.json(
      { 
        error: 'An error occurred while resetting your password. Please try again.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
