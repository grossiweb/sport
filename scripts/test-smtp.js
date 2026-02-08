/**
 * SMTP Configuration Test Script
 * 
 * This script tests your SMTP email configuration
 * Run: npm run test:smtp
 */

// Load environment variables from .env.local
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  
  envFile.split(/\r?\n/).forEach(line => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      return
    }
    
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      // Always set the value (overwrite existing)
      process.env[key] = value
    }
  })
}

const nodemailer = require('nodemailer')

console.log('\n🔍 Testing SMTP Configuration...\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || '❌ Not set'}`)
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '❌ Not set'}`)
console.log(`   SMTP_USER: ${process.env.SMTP_USER || '❌ Not set'}`)
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set (hidden)' : '❌ Not set'}`)
console.log(`   SMTP_FROM: ${process.env.SMTP_FROM || process.env.SMTP_USER || '❌ Not set'}`)
console.log('')

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log('❌ SMTP configuration incomplete!')
  console.log('\n📝 Add these to your .env.local file:')
  console.log('   SMTP_HOST=smtp.gmail.com')
  console.log('   SMTP_PORT=587')
  console.log('   SMTP_USER=your-email@gmail.com')
  console.log('   SMTP_PASS=your-app-password')
  console.log('   SMTP_FROM=StatsPro <your-email@gmail.com>')
  console.log('\n📖 See SMTP_SETUP_GUIDE.md for detailed instructions\n')
  process.exit(1)
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

console.log('🔌 Testing SMTP connection...')

// Test connection
transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection successful!\n')
    
    // Ask if user wants to send a test email
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    readline.question('📧 Send a test email? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        readline.question('📮 Enter recipient email: ', async (recipient) => {
          console.log('\n📤 Sending test email...')
          
          try {
            const info = await transporter.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER,
              to: recipient,
              subject: 'StatsPro SMTP Test Email',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #C62828 0%, #B71C1C 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">✅ SMTP Test Successful!</h1>
                  </div>
                  <div style="padding: 30px; background: white; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #333;">Your SMTP email configuration is working correctly!</p>
                    <p style="font-size: 14px; color: #666;">This test email was sent from your StatsPro application.</p>
                    <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-left: 4px solid #C62828; border-radius: 4px;">
                      <p style="margin: 0; font-size: 14px; color: #666;"><strong>Configuration:</strong></p>
                      <p style="margin: 5px 0 0 0; font-size: 13px; color: #888;">
                        Host: ${process.env.SMTP_HOST}<br>
                        Port: ${process.env.SMTP_PORT}<br>
                        User: ${process.env.SMTP_USER}
                      </p>
                    </div>
                    <p style="margin-top: 20px; font-size: 14px; color: #666;">
                      You can now use the password reset feature in your application!
                    </p>
                  </div>
                  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    StatsPro © ${new Date().getFullYear()}
                  </div>
                </div>
              `,
              text: `
SMTP Test Successful!

Your SMTP email configuration is working correctly.
This test email was sent from your StatsPro application.

Configuration:
- Host: ${process.env.SMTP_HOST}
- Port: ${process.env.SMTP_PORT}
- User: ${process.env.SMTP_USER}

You can now use the password reset feature in your application!

StatsPro © ${new Date().getFullYear()}
              `.trim()
            })
            
            console.log('✅ Test email sent successfully!')
            console.log(`📬 Message ID: ${info.messageId}`)
            console.log(`\n✨ Check your inbox at: ${recipient}\n`)
            readline.close()
          } catch (error) {
            console.error('❌ Failed to send test email:', error.message)
            console.log('\n💡 Common issues:')
            console.log('   - Invalid credentials (check SMTP_USER and SMTP_PASS)')
            console.log('   - Port blocked by firewall (try port 465)')
            console.log('   - Gmail: Make sure you\'re using an app password')
            console.log('   - Yahoo: Generate app password at yahoo.com/account/security\n')
            readline.close()
          }
        })
      } else {
        console.log('✅ SMTP is configured and ready to use!\n')
        readline.close()
      }
    })
  })
  .catch((error) => {
    console.error('❌ SMTP connection failed!\n')
    console.error('Error:', error.message)
    console.log('\n💡 Troubleshooting:')
    console.log('   1. Check SMTP_HOST is correct')
    console.log('   2. Verify SMTP_USER and SMTP_PASS are correct')
    console.log('   3. For Gmail: Use app password (not regular password)')
    console.log('   4. Try port 465 instead of 587')
    console.log('   5. Check firewall/antivirus settings')
    console.log('   6. Disable VPN if you\'re using one')
    console.log('\n📖 See SMTP_SETUP_GUIDE.md for detailed help\n')
    process.exit(1)
  })
