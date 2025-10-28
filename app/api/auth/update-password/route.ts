import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { cookies } from 'next/headers'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql')

// WordPress GraphQL mutation for updating password
const UPDATE_USER_PASSWORD_MUTATION = `
  mutation UpdateUser($id: ID!, $password: String!) {
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

// Function to validate password strength
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  return null
}

// Alternative REST API approach
async function updatePasswordViaREST(userId: string, currentPassword: string, newPassword: string, authToken: string) {
  const restUrl = process.env.WORDPRESS_REST_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/wp-json'
  
  try {
    const response = await fetch(`${restUrl}/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        password: newPassword
      })
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update password')
    }
  } catch (error) {
    console.error('REST API password update error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // Get authentication token from cookies or Authorization header
    const cookieStore = cookies()
    const cookieToken = cookieStore.get('authToken')?.value
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const headerToken = authHeader && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : undefined
    const authToken = cookieToken || headerToken

    // Get user id from cookie if present; otherwise fetch via viewer query
    let userId = cookieStore.get('userId')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'You must be logged in to update your password' },
        { status: 401 }
      )
    }

    if (!userId) {
      try {
        const viewerClient = new GraphQLClient(
          process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql',
          { headers: { Authorization: `Bearer ${authToken}` } }
        )
        const VIEWER_QUERY = `
          query ValidateToken { 
            viewer { id email }
          }
        `
        const viewerData = await viewerClient.request(VIEWER_QUERY) as any
        userId = viewerData?.viewer?.id
      } catch (e) {
        // ignore, will error below if still missing
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unable to resolve current user. Please re-login.' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      )
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      )
    }

    console.log(`Updating password for user ID: ${userId}`)

    try {
      // First, try using GraphQL mutation with auth header
      console.log('Attempting password update via GraphQL...')
      const graphqlClientWithAuth = new GraphQLClient(
        process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql',
        {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        }
      )

      const updateData = await graphqlClientWithAuth.request(UPDATE_USER_PASSWORD_MUTATION, {
        id: userId,
        password: newPassword
      }) as any

      console.log('GraphQL password update response:', updateData)

      if (updateData.updateUser?.user) {
        return NextResponse.json({
          success: true,
          message: 'Your password has been updated successfully'
        })
      } else {
        throw new Error('GraphQL mutation returned unsuccessful result')
      }
    } catch (graphqlError: any) {
      console.error('GraphQL password update failed:', graphqlError.message)
      
      // Fallback to REST API approach
      try {
        console.log('Attempting password update via REST API...')
        await updatePasswordViaREST(userId, currentPassword, newPassword, authToken)
        
        return NextResponse.json({
          success: true,
          message: 'Your password has been updated successfully'
        })
      } catch (restError: any) {
        console.error('REST API password update failed:', restError.message)
        
        // If both methods fail, return appropriate error
        return NextResponse.json(
          { 
            error: 'Failed to update password. Please check your current password and try again.' 
          },
          { status: 400 }
        )
      }
    }
  } catch (error: any) {
    console.error('Update password error:', error)
    
    return NextResponse.json(
      { 
        error: 'An error occurred while updating your password. Please try again.' 
      },
      { status: 500 }
    )
  }
}

