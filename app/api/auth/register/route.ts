import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'

// Try different possible GraphQL endpoints
const WORDPRESS_GRAPHQL_URL = process.env.WORDPRESS_API_URL || 'http://localhost/statspro/graphql'
const client = new GraphQLClient(WORDPRESS_GRAPHQL_URL)

// WordPress GraphQL mutation for user registration
const REGISTER_MUTATION = `
  mutation RegisterUser($username: String!, $email: String!, $password: String!, $firstName: String, $lastName: String) {
    registerUser(input: {
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    }) {
      user {
        id
        username
        email
        firstName
        lastName
        nicename
      }
    }
  }
`

// Login mutation to get auth token after registration
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
    console.log('Registration request received')
    const { email, password, name } = await request.json()

    console.log('Registration data:', { email, name, passwordLength: password?.length })

    if (!email || !password || !name) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Parse name into first and last names
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Generate username from email (WordPress requirement)
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    console.log('Generated username:', username)

    // Check WordPress connection
    console.log('WordPress API URL:', WORDPRESS_GRAPHQL_URL)

    // Define test query outside the try block so it's available everywhere
    // Use a simple query that doesn't require introspection
    const testQuery = `query { generalSettings { title } }`
    let workingClient = client

    // Test GraphQL endpoint availability first
    try {
      await client.request(testQuery)
      console.log('GraphQL endpoint is accessible')
    } catch (testError: any) {
      console.error('GraphQL endpoint test failed:', testError.message)
      
      // Try alternative URLs
      const alternativeUrls = [
        'http://localhost/statspro/wp-json/graphql',
        'http://localhost/statspro/index.php?graphql',
        'http://localhost/statspro/?graphql'
      ]
      
      let foundWorkingUrl = false
      for (const url of alternativeUrls) {
        try {
          console.log(`Trying alternative URL: ${url}`)
          const altClient = new GraphQLClient(url)
          await altClient.request(testQuery)
          console.log(`Alternative URL works: ${url}`)
          // Update the working client to use the working URL
          workingClient = altClient
          foundWorkingUrl = true
          break
        } catch (altError) {
          console.log(`Alternative URL failed: ${url}`)
        }
      }

      if (!foundWorkingUrl) {
        console.error('No working GraphQL endpoint found')
        return NextResponse.json(
          { error: 'WordPress GraphQL endpoint is not accessible. Please ensure WPGraphQL plugin is installed and activated.' },
          { status: 503 }
        )
      }
    }

    // Attempt registration with WordPress
    console.log('Attempting WordPress registration...')
    const registerData = await workingClient.request(REGISTER_MUTATION, {
      username: username,
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName
    }) as any

    console.log('Registration response:', registerData)

    if (registerData.registerUser?.user) {
      console.log('User registered successfully, attempting auto-login...')
      
      // Auto-login after successful registration
      const loginData = await workingClient.request(LOGIN_MUTATION, {
        username: email,
        password: password
      }) as any

      console.log('Login response:', loginData)

      if (loginData.login?.authToken && loginData.login?.user) {
        const user = loginData.login.user
        
        // Map WordPress user to your User type
        const mappedUser = {
          id: user.id,
          email: user.email,
          name: name, // Use the provided name
          subscriptionStatus: 'trial' as const, // New users get trial
          subscriptionExpiry: getTrialExpiry(),
          role: 'user' as const
        }

        console.log('Registration and login successful')
        return NextResponse.json({
          success: true,
          token: loginData.login.authToken,
          refreshToken: loginData.login.refreshToken,
          user: mappedUser
        })
      } else {
        console.log('Auto-login failed after registration')
        return NextResponse.json(
          { error: 'Registration successful but auto-login failed. Please try logging in manually.' },
          { status: 201 }
        )
      }
    } else {
      console.log('WordPress registration returned no user')
      return NextResponse.json(
        { error: 'Registration failed - WordPress did not create user' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Registration error details:', {
      message: error.message,
      response: error.response,
      errors: error.response?.errors
    })
    
    // Check if it's a GraphQL error
    if (error.response?.errors) {
      const errorMessage = error.response.errors[0]?.message || 'Registration failed'
      console.log('GraphQL error:', errorMessage)
      
      // Handle common WordPress registration errors
      if (errorMessage.includes('email') && errorMessage.includes('exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
      
      if (errorMessage.includes('registration') && errorMessage.includes('disabled')) {
        return NextResponse.json(
          { error: 'User registration is disabled. Please contact an administrator.' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: `Registration failed: ${errorMessage}` },
        { status: 400 }
      )
    }
    
    // Network or other errors
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Cannot connect to WordPress. Please check if WordPress is running.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

// Helper function to get trial expiry date
function getTrialExpiry(): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 14) // 14 day trial
  return expiry
}
