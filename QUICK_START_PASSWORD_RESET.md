# ⚡ Quick Start - Password Reset (5 Minutes)

## 🎯 Goal
Get password reset emails working in 5 minutes!

---

## ✅ Step-by-Step

### 1️⃣ Open `.env.local` file

Location: Root of your project (`C:\wamp64\www\statspro\sport\.env.local`)

If it doesn't exist, create it.

### 2️⃣ Add SMTP Configuration

**For Gmail (Recommended):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=StatsPro <your-email@gmail.com>
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3️⃣ Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Turn on **2-Step Verification** (if not already on)
3. Go to: https://myaccount.google.com/apppasswords
4. Select: **Mail** → **Other (Custom name)** → Type "StatsPro"
5. Click **Generate**
6. Copy the 16-character password (remove spaces!)
7. Paste into `SMTP_PASS` in `.env.local`

### 4️⃣ Test SMTP

```bash
npm run test:smtp
```

Should show: ✅ SMTP connection successful!

### 5️⃣ Restart Dev Server

```bash
# Press Ctrl+C to stop
npm run dev
```

### 6️⃣ Test Password Reset

1. Open: http://localhost:3001/forgot-password
2. Enter your email
3. Check your inbox!
4. Click the reset link
5. Set new password
6. Done! 🎉

---

## 🚨 Quick Troubleshooting

### Not receiving emails?

**Check:**
- [ ] Using **app password** (not regular Gmail password)
- [ ] Checked **spam folder**
- [ ] Restarted dev server after adding `.env.local`
- [ ] No typos in email address

### SMTP connection failed?

**Try:**
```bash
npm run test:smtp
```

This will tell you exactly what's wrong!

### Still stuck?

**Development Mode:**
- Password reset works WITHOUT email!
- Reset link shows on success page
- Click it directly (no email needed)

---

## 📧 Alternative: Use Outlook

If Gmail is too complicated:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=yourname@outlook.com
SMTP_PASS=your-regular-password
SMTP_FROM=StatsPro <yourname@outlook.com>
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

✅ No app password needed!

---

## ✅ Success Checklist

- [ ] Added SMTP config to `.env.local`
- [ ] Got Gmail app password (or using Outlook)
- [ ] Ran `npm run test:smtp` - shows success
- [ ] Restarted dev server
- [ ] Tested forgot password page
- [ ] Received email
- [ ] Reset link works
- [ ] Can log in with new password

---

## 🎉 Done!

Your password reset feature is now working!

**Need more help?**
- See `SMTP_SETUP_GUIDE.md` for detailed instructions
- See `PASSWORD_RESET_README.md` for complete documentation

---

**Time to complete:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** ✅ Ready to use
