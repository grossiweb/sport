import { GraphQLClient } from 'graphql-request'

// WordPress authentication utilities
export class WordPressAuth {
  private client: GraphQLClient
  
  constructor() {
    this.client = new GraphQLClient(
      process.env.WORDPRESS_API_URL || 'https://bpheadlessb852.wpenginepowered.com/graphql'
    )
  }

  // Check if WordPress is accessible
  async checkWordPressConnection(): Promise<boolean> {
    try {
      const query = `
        query GetGeneralSettings {
          generalSettings {
            title
            url
          }
        }
      `
      
      const data = await this.client.request(query)
      return !!data.generalSettings
    } catch (error) {
      console.error('WordPress connection failed:', error)
      return false
    }
  }

  // Create WordPress user with specific role
  async createUserWithRole(
    email: string, 
    password: string, 
    name: string, 
    role: string = 'subscriber'
  ) {
    const mutation = `
      mutation RegisterUser($username: String!, $email: String!, $password: String!) {
        registerUser(input: {
          username: $username
          email: $email
          password: $password
        }) {
          user {
            id
            username
            email
            firstName
            lastName
          }
        }
      }
    `

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    
    try {
      const data = await this.client.request(mutation, {
        username,
        email,
        password
      })

      if (data.registerUser?.user) {
        // If you need to set a specific role, you might need to use WordPress REST API
        // or a custom GraphQL mutation that supports role assignment
        return {
          success: true,
          user: data.registerUser.user
        }
      }
      
      return { success: false, error: 'Registration failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || 'Registration failed'
      }
    }
  }

  // Update user role in WordPress
  async updateUserRole(userId: string, role: string) {
    // This would typically require REST API call to WordPress
    // as GraphQL mutations for role changes might not be available
    try {
      const response = await fetch(`${process.env.WORDPRESS_REST_URL || 'http://localhost/statspro/wp-json'}/wp/v2/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.WORDPRESS_ADMIN_USER}:${process.env.WORDPRESS_ADMIN_PASS}`).toString('base64')}`
        },
        body: JSON.stringify({
          roles: [role]
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to update user role:', error)
      return false
    }
  }

  // Check if user has specific capability
  async userHasCapability(token: string, capability: string): Promise<boolean> {
    try {
      const client = new GraphQLClient(
        process.env.WORDPRESS_API_URL || 'https://bpheadlessb852.wpenginepowered.com/graphql',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const query = `
        query CheckUserCapability {
          viewer {
            roles {
              nodes {
                name
                capabilities
              }
            }
          }
        }
      `

      const data = await client.request(query)
      
      if (data.viewer?.roles?.nodes) {
        return data.viewer.roles.nodes.some((role: any) => 
          role.capabilities && role.capabilities.includes(capability)
        )
      }
      
      return false
    } catch (error) {
      console.error('Capability check failed:', error)
      return false
    }
  }
}

export const wordpressAuth = new WordPressAuth()
