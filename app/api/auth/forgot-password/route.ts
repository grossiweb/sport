import { NextRequest, NextResponse } from 'next/server'
import { GraphQLClient } from 'graphql-request'
import { passwordResetService } from '@/lib/email/password-reset-service'

const client = new GraphQLClient(process.env.WORDPRESS_API_URL || 'https://wordpress-1521448-5854014.cloudwaysapps.com/graphql')

// WordPress GraphQL query to check if user exists
const CHECK_USER_QUERY = `
  query CheckUser($email: String!) {
    users(where: { search: $email }) {
      nodes {
        id
        email
        username
      }
    }
  }
`

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
      // Check if user exists in WordPress (optional - for better UX)
      let userExists = true
      try {
        const userData = await client.request(CHECK_USER_QUERY, { email }) as any
        userExists = userData?.users?.nodes?.length > 0
        
        if (userExists) {
          console.log(`✅ User found in WordPress: ${email}`)
        } else {
          console.log(`⚠️ User not found in WordPress: ${email}`)
        }
      } catch (wpError) {
        // If WordPress check fails, we'll still proceed for security
        console.log('WordPress user check failed, proceeding anyway for security')
        userExists = true // Assume user exists to prevent email enumeration
      }

      // Generate reset token and store it in MongoDB
      const resetToken = passwordResetService.generateToken()
      await passwordResetService.storeResetToken(email, resetToken)

      // Create reset URL with token
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

      console.log(`Generated reset URL: ${resetUrl}`)

      // Send password reset email using nodemailer
      try {
        const emailSent = await passwordResetService.sendPasswordResetEmail(email, resetUrl)
        
        if (emailSent) {
          console.log(`✅ Password reset email sent successfully to ${email}`)
          return NextResponse.json({
            success: true,
            message: 'Password reset instructions have been sent to your email address'
          })
        } else {
          throw new Error('Failed to send email')
        }
      } catch (emailError: any) {
        console.error('❌ Error sending password reset email:', emailError)
        
        // Check if SMTP is configured
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
          console.error('⚠️ SMTP not configured! Please set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_PORT in .env.local')
          
          // For development, log the reset URL
          console.log('='.repeat(80))
          console.log('DEVELOPMENT MODE - Reset URL:')
          console.log(resetUrl)
          console.log('='.repeat(80))
          
          return NextResponse.json({
            success: true,
            message: 'Password reset link generated (check console in development mode)',
            devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
          })
        }
        
        throw emailError
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
  } catch (error: any) {
    console.error('Forgot password fatal error:', error)
    
    // For security reasons, always return a generic success message
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent'
    })
  }
}
