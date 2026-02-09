import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { passwordResetService } from '@/lib/email/password-reset-service'

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'http://localhost/statspro/graphql'

const ADMIN_LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
    }
  }
`

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

const UPDATE_USER_PASSWORD_MUTATION = `
  mutation UpdateUserPassword($id: ID!, $password: String!) {
    updateUser(input: { id: $id, password: $password }) {
      user {
        id
        email
      }
    }
  }
`

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }
  return null
}

async function getAdminGraphQLClient(): Promise<GraphQLClient> {
  const client = new GraphQLClient(WORDPRESS_API_URL)

  const adminUser = process.env.WORDPRESS_ADMIN_USER
  const adminPass = process.env.WORDPRESS_ADMIN_PASS

  if (!adminUser || !adminPass) {
    throw new Error('WordPress admin credentials not configured')
  }

  const loginData = await client.request(ADMIN_LOGIN_MUTATION, {
    username: adminUser,
    password: adminPass,
  }) as any

  const token = loginData?.login?.authToken
  if (!token) {
    throw new Error('Failed to obtain admin token from WordPress')
  }

  client.setHeader('Authorization', `Bearer ${token}`)
  return client
}

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    // Step 1: Validate the reset token from MongoDB
    const tokenValidation = await passwordResetService.validateResetToken(token)

    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset link.' },
        { status: 400 }
      )
    }

    // Step 2: Verify the email matches the token
    if (tokenValidation.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 })
    }

    // Step 3: Get admin-authenticated GraphQL client
    let adminClient: GraphQLClient
    try {
      adminClient = await getAdminGraphQLClient()
    } catch (authError: any) {
      console.error('Admin authentication failed:', authError.message)
      return NextResponse.json(
        { error: 'Server authentication error. Please try again later.' },
        { status: 500 }
      )
    }

    // Step 4: Find user by email via authenticated GraphQL
    let userId: string | null = null
    try {
      const userData = await adminClient.request(GET_USER_BY_EMAIL_QUERY, {
        email,
      }) as any

      if (userData?.users?.nodes?.length > 0) {
        const exactMatch = userData.users.nodes.find(
          (u: any) => u.email?.toLowerCase() === email.toLowerCase()
        )
        if (exactMatch) {
          userId = exactMatch.id
        }
      }
    } catch (queryError: any) {
      console.error('GraphQL user query failed:', queryError.message)
    }

    // Fallback: try REST API if GraphQL didn't find the user
    if (!userId) {
      try {
        const restUrl = process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'
        const adminUser = process.env.WORDPRESS_ADMIN_USER
        const adminPass = process.env.WORDPRESS_ADMIN_PASS

        if (adminUser && adminPass) {
          const authString = Buffer.from(`${adminUser}:${adminPass}`).toString('base64')
          const res = await fetch(
            `${restUrl}/wp/v2/users?search=${encodeURIComponent(email)}&context=edit`,
            { headers: { 'Authorization': `Basic ${authString}` } }
          )

          if (res.ok) {
            const users = await res.json()
            const match = users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
            if (match) {
              // Encode numeric ID as WPGraphQL global ID: base64("user:{numericId}")
              userId = Buffer.from(`user:${match.id}`).toString('base64')
            }
          } else {
            console.error('REST API user search failed:', res.status, await res.text())
          }
        }
      } catch (restError: any) {
        console.error('REST API fallback failed:', restError.message)
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User account not found. Please ensure you have an account with this email address.' },
        { status: 404 }
      )
    }

    console.log(`Found WordPress user for ${email}, updating password...`)

    // Step 5: Update password via authenticated GraphQL
    try {
      const updateResult = await adminClient.request(UPDATE_USER_PASSWORD_MUTATION, {
        id: userId,
        password,
      }) as any

      if (!updateResult?.updateUser?.user) {
        throw new Error('GraphQL updateUser returned no user')
      }
    } catch (gqlUpdateError: any) {
      console.error('GraphQL password update failed:', gqlUpdateError.message)

      // Fallback: try REST API for password update
      try {
        const restUrl = process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'
        const adminUser = process.env.WORDPRESS_ADMIN_USER
        const adminPass = process.env.WORDPRESS_ADMIN_PASS

        if (!adminUser || !adminPass) throw new Error('No admin credentials')

        // Decode GraphQL global ID to numeric WordPress user ID
        let numericId: string
        try {
          const decoded = Buffer.from(userId, 'base64').toString('utf8')
          numericId = decoded.split(':')[1] || userId
        } catch {
          numericId = userId
        }

        const authString = Buffer.from(`${adminUser}:${adminPass}`).toString('base64')
        const res = await fetch(`${restUrl}/wp/v2/users/${numericId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        })

        if (!res.ok) {
          console.error('REST API password update failed:', res.status, await res.text())
          throw new Error('REST API password update failed')
        }
      } catch (restUpdateError: any) {
        console.error('All password update methods failed:', restUpdateError.message)
        return NextResponse.json(
          { error: 'Failed to update password. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Step 6: Delete the used token
    await passwordResetService.deleteResetToken(token)

    console.log(`Password reset completed for ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while resetting your password. Please try again.' },
      { status: 500 }
    )
  }
}
