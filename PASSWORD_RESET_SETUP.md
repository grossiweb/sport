# 🔐 Password Reset Email Setup Guide

## ✅ What's Been Fixed

The password reset functionality has been completely rebuilt to work independently of WordPress email configuration issues. The system now:

1. ✅ **Sends emails directly** using nodemailer (no WordPress dependency)
2. ✅ **Generates secure tokens** using Node.js crypto module
3. ✅ **Stores tokens temporarily** with 1-hour expiry
4. ✅ **Updates passwords in WordPress** after validation
5. ✅ **Beautiful HTML email templates** with responsive design
6. ✅ **Development mode support** (logs reset URLs to console when SMTP not configured)

## 🚀 Quick Setup

### Step 1: Configure SMTP Settings

Add these environment variables to your `.env.local` file:

```env
# SMTP Email Configuration (Required for Password Reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=StatsPro <your-email@gmail.com>

# App URL (for reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3001

# WordPress Admin Credentials (for password updates)
WORDPRESS_ADMIN_USER=stefano
WORDPRESS_ADMIN_PASS=sfg6678$$
```

### Step 2: Gmail Setup (Recommended for Testing)

If using Gmail, you **must** use an App Password:

1. Go to your Google Account: https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Enter "StatsPro" as the name
6. Click **Generate**
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
8. Use this password in `SMTP_PASS` (without spaces)

**Example Gmail Configuration:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=StatsPro <yourname@gmail.com>
```

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 4: Test Password Reset

1. Go to: http://localhost:3001/forgot-password
2. Enter your email address
3. Check your email inbox for the reset link
4. Click the link and set a new password

## 📧 Other SMTP Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=yourname@outlook.com
SMTP_PASS=your-outlook-password
```

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=yourname@yahoo.com
SMTP_PASS=your-yahoo-app-password
```

Note: Yahoo also requires an app password. Generate one at: https://login.yahoo.com/account/security

### SendGrid (Recommended for Production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create an API Key in Settings > API Keys
3. Use `apikey` as the username and your API key as the password

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

## 🧪 Development Mode

If SMTP is **not configured**, the system will still work in development:

- ✅ Token will be generated and stored
- ✅ Reset URL will be logged to the console
- ✅ You can manually copy the URL from console and test
- ⚠️ No email will be sent

**Console output will look like:**

```
================================================================================
DEVELOPMENT MODE - Reset URL:
http://localhost:3001/reset-password?token=abc123...&email=user@example.com
================================================================================
```

## 🔄 How It Works

### Forgot Password Flow

1. **User Request**: User enters email at `/forgot-password`
2. **Token Generation**: System generates secure random token (32 bytes)
3. **Token Storage**: Token stored in-memory with 1-hour expiry
4. **Email Sent**: Beautiful HTML email sent with reset link
5. **User Response**: Returns success message (for security, always succeeds)

### Reset Password Flow

1. **User Clicks Link**: User clicks reset link from email
2. **Token Validation**: System validates token and expiry
3. **Email Verification**: Ensures email matches token
4. **Password Update**: Updates password in WordPress via GraphQL/REST API
5. **Token Cleanup**: Deletes used token
6. **Success**: User can log in with new password

## 🔒 Security Features

- ✅ **Secure token generation** using crypto.randomBytes()
- ✅ **1-hour token expiry** prevents old links from working
- ✅ **Email enumeration protection** - always returns success message
- ✅ **Password strength validation** - min 8 chars, uppercase, lowercase, number
- ✅ **One-time use tokens** - deleted after successful reset
- ✅ **Email matching** - token must match requesting email

## 📝 Files Modified

```
✅ lib/email/password-reset-service.ts       (NEW - Email service)
✅ app/api/auth/forgot-password/route.ts     (UPDATED - Token generation & email)
✅ app/api/auth/reset-password/route.ts      (UPDATED - Token validation & password update)
✅ .env.example                               (NEW - Configuration template)
✅ PASSWORD_RESET_SETUP.md                   (NEW - This guide)
```

## 🐛 Troubleshooting

### Issue: Emails not sending

**Check:**
1. ✅ SMTP credentials are correct in `.env.local`
2. ✅ Using app password (for Gmail/Yahoo)
3. ✅ Port 587 is not blocked by firewall
4. ✅ Dev server was restarted after adding env variables

**Test SMTP connection:**
```bash
# Add this to test your SMTP config
node -e "const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'), secure: false, auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}}); t.verify().then(() => console.log('✅ SMTP OK')).catch(e => console.error('❌ SMTP Error:', e));"
```

### Issue: Token expired

**Solution:**
- Tokens expire after 1 hour
- Request a new password reset link
- Check system clock is correct

### Issue: Password not updating in WordPress

**Check:**
1. ✅ `WORDPRESS_ADMIN_USER` and `WORDPRESS_ADMIN_PASS` are correct
2. ✅ WordPress API is accessible
3. ✅ MySQL extension is installed in PHP (for WAMP)

**To fix MySQL extension in WAMP:**
1. Open `php.ini` (WAMP icon > PHP > php.ini)
2. Find `;extension=mysqli` and remove the semicolon: `extension=mysqli`
3. Restart WAMP services

### Issue: 400 Bad Request

**Common causes:**
- Invalid email format
- Weak password (needs: 8+ chars, uppercase, lowercase, number)
- Token expired or already used

## 📊 Email Template Preview

The system sends beautifully designed HTML emails with:

- 🎨 Modern, responsive design
- 🔴 StatsPro branding with red theme
- 🔘 Large "Reset My Password" button
- 📋 Fallback link (if button doesn't work)
- ⏰ Clear expiry warning (1 hour)
- 🔒 Security reminders
- 📱 Mobile-friendly layout

## ✅ Testing Checklist

- [ ] SMTP credentials added to `.env.local`
- [ ] Dev server restarted
- [ ] Can access `/forgot-password` page
- [ ] Enter email and submit
- [ ] Check email inbox (and spam folder)
- [ ] Click reset link in email
- [ ] Enter new password (8+ chars, mixed case, number)
- [ ] Confirm password matches
- [ ] Successfully reset password
- [ ] Can log in with new password

## 🚀 Production Deployment

For production, consider:

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES)
2. **Store tokens in Redis** instead of in-memory
3. **Add rate limiting** to prevent abuse
4. **Configure proper domain** for email sender
5. **Set up SPF/DKIM records** for better deliverability
6. **Monitor email delivery** and bounce rates

## 📞 Support

If you're still having issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test SMTP connection separately
4. Ensure WordPress API is working properly
5. Check that user exists in WordPress with the email provided

---

**Created**: February 6, 2026  
**Status**: ✅ Fully Functional  
**Last Updated**: February 6, 2026
