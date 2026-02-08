# 📧 SMTP Email Configuration Guide

## Quick Setup for Password Reset Emails

Your password reset feature is ready, but needs SMTP configuration to send emails.

### ⚡ Quick Start (Gmail - Easiest)

1. **Create/Use a Gmail Account**
   - You can use your existing Gmail or create a new one
   - Example: `yourname@gmail.com`

2. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification" and turn it ON
   - Follow the prompts to set it up (SMS or authenticator app)

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" from the dropdown
   - Select "Other (Custom name)" 
   - Type: `StatsPro` or `Password Reset`
   - Click **Generate**
   - Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
   - **Important**: Remove spaces when pasting!

4. **Add to .env.local**

Create or edit the `.env.local` file in your project root:

```env
# SMTP Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=StatsPro <yourname@gmail.com>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

5. **Restart Dev Server**

```bash
# Stop the server (press Ctrl+C)
# Then start it again:
npm run dev
```

6. **Test It!**
   - Go to: http://localhost:3001/forgot-password
   - Enter an email address that exists in your WordPress
   - Check your inbox!

---

## 🎯 Alternative SMTP Providers

### Option 1: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=yourname@outlook.com
SMTP_PASS=your-outlook-password
SMTP_FROM=StatsPro <yourname@outlook.com>
```

**Note**: Use your regular Outlook password (no app password needed)

### Option 2: Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=yourname@yahoo.com
SMTP_PASS=your-yahoo-app-password
SMTP_FROM=StatsPro <yourname@yahoo.com>
```

**Note**: Yahoo requires an app password like Gmail
- Generate at: https://login.yahoo.com/account/security

### Option 3: SendGrid (Best for Production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key-here
SMTP_FROM=StatsPro <noreply@yourdomain.com>
```

**Setup:**
1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Go to Settings > API Keys
3. Create new API Key with "Mail Send" permissions
4. Copy the key (starts with `SG.`)
5. Use `apikey` as SMTP_USER (literally the word "apikey")

### Option 4: Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-sandbox.mailgun.org
SMTP_PASS=your-smtp-password
SMTP_FROM=StatsPro <postmaster@your-sandbox.mailgun.org>
```

**Setup:**
1. Sign up at https://mailgun.com (Free tier: 5,000 emails/month)
2. Go to Sending > Domains
3. Use the sandbox domain or add your own
4. Find SMTP credentials in the domain settings

---

## 🧪 Testing Without SMTP (Development Mode)

If you don't configure SMTP, the system works in **Development Mode**:

✅ Password reset tokens are still generated  
✅ The reset URL is displayed on the success page  
✅ You can click the link directly (no email needed)  
⚠️ Console will show: "SMTP not configured"  

**This is perfect for testing!**

---

## 🔧 Troubleshooting

### Problem: "Error sending email"

**Solutions:**
1. Check SMTP credentials are correct
2. Make sure you're using an **app password** (Gmail/Yahoo)
3. Verify port 587 is not blocked by firewall
4. Restart dev server after adding env variables
5. Check `.env.local` file exists and is in project root

### Problem: "Invalid login" (Gmail)

**Solutions:**
1. Make sure 2-Factor Authentication is ON
2. Use app password, not your regular Gmail password
3. Remove spaces from the app password
4. The password should be 16 characters

### Problem: Emails going to spam

**Solutions:**
1. Check spam folder (Gmail may initially mark as spam)
2. Mark as "Not Spam" once
3. For production, use SendGrid or Mailgun with proper domain verification

### Problem: "Connection timeout"

**Solutions:**
1. Check your internet connection
2. Verify SMTP_HOST is correct
3. Try port 465 instead of 587 (set SMTP_PORT=465)
4. Disable VPN if you're using one

---

## 📋 Complete .env.local Template

Here's everything you need in your `.env.local` file:

```env
# WordPress API
WORDPRESS_API_URL=https://wordpress-1521448-5854014.cloudwaysapps.com/graphql
WORDPRESS_REST_URL=https://wordpress-1521448-5854014.cloudwaysapps.com/wp-json
WORDPRESS_ADMIN_USER=stefano
WORDPRESS_ADMIN_PASS=sfg6678$$

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=StatsPro <yourname@gmail.com>

# TheRundown API (if you have it)
THERUNDOWN_API_KEY=your-api-key
```

---

## ✅ Testing Checklist

- [ ] Added SMTP configuration to `.env.local`
- [ ] Restarted dev server
- [ ] Can access http://localhost:3001/forgot-password
- [ ] Entered test email address
- [ ] Received email (checked spam folder)
- [ ] Email contains reset link
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can log in with new password

---

## 🎨 What Users Will See

### Email Content:
- 🎨 Beautiful HTML design with StatsPro branding
- 🔴 Red color theme matching your app
- 🔘 Large "Reset My Password" button
- 📋 Backup link (if button doesn't work)
- ⏰ Clear 1-hour expiry warning
- 🔒 Security reminders
- 📱 Mobile-responsive design

### Email Subject:
"Reset Your StatsPro Password"

---

## 📞 Need Help?

Common issues and their solutions:

| Issue | Solution |
|-------|----------|
| Port 587 blocked | Try port 465 or check firewall |
| Gmail "less secure app" error | Use app password, not regular password |
| Yahoo not working | Generate app password at yahoo.com/account/security |
| Outlook timeout | Check username is full email address |
| SendGrid errors | Verify API key has "Mail Send" permission |

---

**Last Updated**: February 6, 2026  
**Status**: ✅ Ready to Use  
**Estimated Setup Time**: 5-10 minutes
