import { GraphQLClient } from 'graphql-request'
import { WordPressPost, EmailContent, SocialPost, User } from '@/types'
import { determineSubscriptionStatus, getSubscriptionExpiry, getSubscriptionTier } from '@/lib/subscription-utils'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql')

// WordPress GraphQL authentication queries and mutations
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

const REGISTER_MUTATION = `
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
        nicename
      }
    }
  }
`

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

// GraphQL queries
const GET_POSTS = `
  query GetPosts($first: Int, $after: String) {
    posts(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        content
        excerpt
        slug
        date
        author {
          node {
            name
          }
        }
        categories {
          nodes {
            name
          }
        }
        tags {
          nodes {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`

const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      id
      title
      content
      excerpt
      slug
      date
      author {
        node {
          name
        }
      }
      categories {
        nodes {
          name
        }
      }
      tags {
        nodes {
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
`

const GET_EMAIL_TEMPLATES = `
  query GetEmailTemplates {
    emailTemplates {
      nodes {
        id
        title
        content
        emailTemplateFields {
          subject
          recipients
          sendDaily
          sportFilters
        }
      }
    }
  }
`

const GET_SOCIAL_POSTS = `
  query GetSocialPosts($status: String) {
    socialPosts(where: { status: $status }) {
      nodes {
        id
        title
        content
        socialPostFields {
          platform
          scheduledDate
          imageUrl
          status
        }
      }
    }
  }
`

const CREATE_EMAIL_CAMPAIGN = `
  mutation CreateEmailCampaign($input: CreateEmailCampaignInput!) {
    createEmailCampaign(input: $input) {
      emailCampaign {
        id
        title
        status
      }
    }
  }
`

const CREATE_SOCIAL_POST = `
  mutation CreateSocialPost($input: CreateSocialPostInput!) {
    createSocialPost(input: $input) {
      socialPost {
        id
        title
        status
      }
    }
  }
`

export class WordPressClient {
  // Authentication methods
  async login(email: string, password: string): Promise<{ success: boolean, token?: string, user?: User, error?: string }> {
    try {
      const data = await client.request(LOGIN_MUTATION, {
        username: email,
        password: password
      }) as any

      if (data.login?.authToken && data.login?.user) {
        const user = data.login.user
        
        return {
          success: true,
          token: data.login.authToken,
          user: this.mapUserData(user)
        }
      } else {
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }
    } catch (error: any) {
      console.error('WordPress login error:', error)
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || 'Login failed'
      }
    }
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean, user?: User, error?: string }> {
    try {
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      
      const data = await client.request(REGISTER_MUTATION, {
        username: username,
        email: email,
        password: password
      }) as any

      if (data.registerUser?.user) {
        return {
          success: true,
          user: {
            id: data.registerUser.user.id,
            email: data.registerUser.user.email,
            name: name,
            subscriptionStatus: 'trial',
            subscriptionExpiry: this.getTrialExpiry(),
            role: 'user'
          }
        }
      } else {
        return {
          success: false,
          error: 'Registration failed'
        }
      }
    } catch (error: any) {
      console.error('WordPress registration error:', error)
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || 'Registration failed'
      }
    }
  }

  async validateToken(token: string): Promise<{ success: boolean, user?: User, error?: string }> {
    try {
      const authenticatedClient = new GraphQLClient(
        process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql',
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await authenticatedClient.request(VALIDATE_TOKEN_QUERY) as any

      if (data && data.viewer && data.viewer.id) {
        return {
          success: true,
          user: this.mapUserData(data.viewer)
        }
      } else {
        return {
          success: false,
          error: 'Invalid token'
        }
      }
    } catch (error: any) {
      console.error('WordPress token validation error:', error)
      return {
        success: false,
        error: 'Token validation failed'
      }
    }
  }

  async getPosts(first: number = 10, after?: string): Promise<{ posts: WordPressPost[], hasNextPage: boolean, endCursor?: string }> {
    try {
      const data = await client.request(GET_POSTS, { first, after }) as any
      
      return {
        posts: data.posts.nodes.map(this.mapPostData),
        hasNextPage: data.posts.pageInfo.hasNextPage,
        endCursor: data.posts.pageInfo.endCursor
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  }

  async getPostBySlug(slug: string): Promise<WordPressPost | null> {
    try {
      const data = await client.request(GET_POST_BY_SLUG, { slug }) as any
      
      if (!data.postBy) return null
      
      return this.mapPostData(data.postBy)
    } catch (error) {
      console.error('Error fetching post by slug:', error)
      throw error
    }
  }

  async getEmailTemplates(): Promise<EmailContent[]> {
    try {
      const data = await client.request(GET_EMAIL_TEMPLATES) as any
      
      return data.emailTemplates.nodes.map((template: any) => ({
        subject: template.emailTemplateFields.subject,
        htmlContent: template.content,
        textContent: this.stripHtml(template.content),
        recipients: template.emailTemplateFields.recipients || [],
        scheduledDate: template.emailTemplateFields.sendDaily ? this.getNextSendDate() : undefined
      }))
    } catch (error) {
      console.error('Error fetching email templates:', error)
      throw error
    }
  }

  async getSocialPosts(status?: 'draft' | 'scheduled' | 'published'): Promise<SocialPost[]> {
    try {
      const data = await client.request(GET_SOCIAL_POSTS, { status }) as any
      
      return data.socialPosts.nodes.map((post: any) => ({
        platform: post.socialPostFields.platform,
        content: post.content,
        imageUrl: post.socialPostFields.imageUrl,
        scheduledDate: post.socialPostFields.scheduledDate ? new Date(post.socialPostFields.scheduledDate) : undefined,
        status: post.socialPostFields.status
      }))
    } catch (error) {
      console.error('Error fetching social posts:', error)
      throw error
    }
  }

  async createEmailCampaign(emailContent: EmailContent): Promise<string> {
    try {
      const data = await client.request(CREATE_EMAIL_CAMPAIGN, {
        input: {
          title: emailContent.subject,
          content: emailContent.htmlContent,
          emailTemplateFields: {
            subject: emailContent.subject,
            recipients: emailContent.recipients,
            scheduledDate: emailContent.scheduledDate?.toISOString()
          }
        }
      }) as any
      
      return data.createEmailCampaign.emailCampaign.id
    } catch (error) {
      console.error('Error creating email campaign:', error)
      throw error
    }
  }

  async createSocialPost(socialPost: SocialPost): Promise<string> {
    try {
      const data = await client.request(CREATE_SOCIAL_POST, {
        input: {
          title: `${socialPost.platform} Post - ${new Date().toISOString()}`,
          content: socialPost.content,
          socialPostFields: {
            platform: socialPost.platform,
            imageUrl: socialPost.imageUrl,
            scheduledDate: socialPost.scheduledDate?.toISOString(),
            status: socialPost.status
          }
        }
      }) as any
      
      return data.createSocialPost.socialPost.id
    } catch (error) {
      console.error('Error creating social post:', error)
      throw error
    }
  }

  // Helper methods
  private mapPostData(post: any): WordPressPost {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      slug: post.slug,
      publishedAt: new Date(post.date),
      author: post.author?.node?.name || 'Unknown',
      categories: post.categories?.nodes?.map((cat: any) => cat.name) || [],
      tags: post.tags?.nodes?.map((tag: any) => tag.name) || [],
      featuredImage: post.featuredImage?.node?.sourceUrl
    }
  }

  private mapUserData(wpUser: any): User {
    return {
      id: wpUser.id,
      email: wpUser.email,
      name: `${wpUser.firstName} ${wpUser.lastName}`.trim() || wpUser.nicename || wpUser.username,
      subscriptionStatus: determineSubscriptionStatus(wpUser.roles?.nodes || []),
      subscriptionTier: getSubscriptionTier(wpUser.roles?.nodes || []),
      subscriptionExpiry: getSubscriptionExpiry(wpUser.roles?.nodes || []),
      role: wpUser.roles?.nodes?.some((role: any) => role.name === 'administrator') ? 'admin' : 'user'
    }
  }

  // Subscription helper methods moved to centralized subscription-utils.ts

  private getTrialExpiry(): Date {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 14) // 14 day trial
    return expiry
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }

  private getNextSendDate(): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(8, 0, 0, 0) // 8 AM
    return tomorrow
  }
}

export const wordpressClient = new WordPressClient()