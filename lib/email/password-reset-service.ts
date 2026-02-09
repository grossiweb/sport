import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { getPasswordResetTokensCollection } from '@/lib/mongodb'

export class PasswordResetService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  /**
   * Generate a secure random token
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Store reset token in MongoDB with 1-hour expiry
   */
  async storeResetToken(email: string, token: string): Promise<void> {
    const collection = await getPasswordResetTokensCollection()

    // Remove any existing tokens for this email
    await collection.deleteMany({ email: email.toLowerCase() })

    // Insert new token
    await collection.insertOne({
      token,
      email: email.toLowerCase(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      createdAt: new Date(),
    })

    console.log(`Stored reset token in MongoDB for ${email}`)
  }

  /**
   * Validate reset token from MongoDB
   */
  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const collection = await getPasswordResetTokensCollection()

    const tokenDoc = await collection.findOne({
      token,
      expiresAt: { $gt: new Date() },
    })

    if (!tokenDoc) {
      console.log(`Token not found or expired: ${token.substring(0, 8)}...`)
      return { valid: false }
    }

    console.log(`Token validated for ${tokenDoc.email}`)
    return { valid: true, email: tokenDoc.email }
  }

  /**
   * Delete reset token after use
   */
  async deleteResetToken(token: string): Promise<void> {
    const collection = await getPasswordResetTokensCollection()
    await collection.deleteOne({ token })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Reset Your StatsPro Password',
        html: this.generatePasswordResetHTML(resetUrl),
        text: this.generatePasswordResetText(resetUrl),
      }

      console.log(`Attempting to send password reset email to: ${email}`)
      console.log(`SMTP Config: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`)

      const info = await this.transporter.sendMail(mailOptions)

      console.log(`Password reset email sent successfully to ${email}`)
      console.log(`Message ID: ${info.messageId}`)

      return true
    } catch (error) {
      console.error('Error sending password reset email:', error)
      throw error
    }
  }

  private generatePasswordResetHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #C62828 0%, #B71C1C 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin: 0 0 20px;
              font-size: 16px;
              line-height: 1.5;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .reset-button {
              display: inline-block;
              padding: 14px 32px;
              background: #C62828;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 16px;
            }
            .link-section {
              margin: 30px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 6px;
              border-left: 4px solid #C62828;
            }
            .link-section p {
              margin: 0 0 10px;
              font-size: 14px;
              color: #666;
            }
            .link-section code {
              display: block;
              padding: 10px;
              background: white;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 12px;
              word-break: break-all;
              color: #333;
            }
            .footer {
              padding: 20px 30px;
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
              text-align: center;
            }
            .footer p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .warning {
              margin: 20px 0;
              padding: 15px;
              background: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 6px;
              font-size: 14px;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>

            <div class="content">
              <p>Hello,</p>

              <p>We received a request to reset your StatsPro account password. Click the button below to create a new password:</p>

              <div class="button-container">
                <a href="${resetUrl}" class="reset-button">Reset My Password</a>
              </div>

              <div class="link-section">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <code>${resetUrl}</code>
              </div>

              <div class="warning">
                <strong>Important:</strong> This password reset link will expire in <strong>1 hour</strong> for security reasons.
              </div>

              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

              <p>Best regards,<br><strong>The StatsPro Team</strong></p>
            </div>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} StatsPro. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generatePasswordResetText(resetUrl: string): string {
    return `
Reset Your StatsPro Password

Hello,

We received a request to reset your StatsPro account password.

To reset your password, click the link below or copy and paste it into your browser:

${resetUrl}

IMPORTANT: This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The StatsPro Team

---
${new Date().getFullYear()} StatsPro. All rights reserved.
This is an automated email, please do not reply.
    `.trim()
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return false
    }
  }
}

export const passwordResetService = new PasswordResetService()
