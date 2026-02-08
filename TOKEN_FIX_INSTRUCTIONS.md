# 🔧 Token Validation Fix - Instructions

## ✅ What Was Fixed

The "Invalid or expired reset token" error was caused by tokens being stored **in-memory**, which gets cleared when Next.js recompiles API routes during development.

### The Problem:
```
1. User requests password reset → Token stored in memory
2. Next.js recompiles API route (hot reload)
3. Memory cleared, token lost
4. User clicks reset link → Token not found ❌
```

### The Solution:
Tokens are now stored in a **persistent JSON file** (`.reset-tokens.json`) that survives server restarts and hot reloads.

```
1. User requests password reset → Token saved to file ✅
2. Next.js recompiles API route
3. Token still exists in file ✅
4. User clicks reset link → Token loaded from file ✅
```

---

## 🧪 Testing Instructions

### Step 1: Request a New Password Reset

The old tokens won't work anymore. You need to request a fresh one:

1. Go to: http://localhost:3001/forgot-password
2. Enter your email: `mujahid@grossiweb.com` (or any email in WordPress)
3. Click "Send reset instructions"
4. Check your email inbox

### Step 2: Click the Reset Link

1. Open the password reset email
2. Click the "Reset My Password" button
3. You should now see the reset password form (not an error!)

### Step 3: Set New Password

1. Enter a new password (8+ chars, uppercase, lowercase, number)
2. Confirm the password
3. Click "Reset password"
4. You should see success message ✅

### Step 4: Log In

1. Go to: http://localhost:3001/login
2. Use your email and new password
3. You should be logged in successfully!

---

## 🔍 Debugging

If you still get "Invalid token" error, check the console logs:

### What to Look For:

**When requesting reset (forgot-password):**
```
✅ Stored reset token for email@example.com
Token: abc123...
Expires at: 2026-02-06T16:20:42.548Z
```

**When using reset link (reset-password):**
```
🔍 Validating token: abc123...
📦 Total tokens in storage: 2
✅ Token found for email: email@example.com
✅ Token is valid for email@example.com
```

### If Token Not Found:

Check if `.reset-tokens.json` file exists:
```bash
cd C:\wamp64\www\statspro\sport
dir .reset-tokens.json
```

View the tokens file:
```bash
Get-Content .reset-tokens.json
```

---

## 📝 Technical Details

### Token Storage File

Location: `C:\wamp64\www\statspro\sport\.reset-tokens.json`

Format:
```json
{
  "abc123...": {
    "email": "user@example.com",
    "token": "abc123...",
    "expiry": 1707235242548
  },
  "email:user@example.com": {
    "email": "user@example.com",
    "token": "abc123...",
    "expiry": 1707235242548
  }
}
```

### Changes Made

**File: `lib/email/password-reset-service.ts`**

1. Added file-based storage functions:
   - `loadTokens()` - Loads tokens from JSON file
   - `saveTokens()` - Saves tokens to JSON file

2. Updated methods:
   - `storeResetToken()` - Now saves to file
   - `validateResetToken()` - Now loads from file first
   - `deleteResetToken()` - Now updates file

3. Added detailed logging:
   - Shows when tokens are stored
   - Shows when tokens are validated
   - Shows available tokens for debugging

**File: `.gitignore`**

Added `.reset-tokens.json` to prevent committing sensitive tokens to git.

---

## ⚠️ Important Notes

### Development vs Production

**Development (current):**
- Tokens stored in `.reset-tokens.json` file
- File persists across server restarts
- Good for testing

**Production (recommended):**
- Use Redis or database for token storage
- More scalable for multiple servers
- Better performance

### Token Expiry

- Tokens expire after **1 hour**
- Expired tokens are automatically deleted
- Old reset links won't work after expiry

### Security

- Token file is excluded from git (`.gitignore`)
- Tokens are 64-character random hex strings
- Each token is single-use (deleted after reset)

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Email received with reset link
2. ✅ Reset link opens password form (not error page)
3. ✅ Console shows "Token is valid"
4. ✅ Password reset succeeds
5. ✅ Can log in with new password

---

## 🔄 If Still Not Working

### Clear Everything and Start Fresh:

```bash
# Stop dev server (Ctrl+C)

# Remove old tokens
cd C:\wamp64\www\statspro\sport
Remove-Item .reset-tokens.json -ErrorAction SilentlyContinue

# Restart dev server
npm run dev
```

Then request a **new** password reset email.

---

**Status:** ✅ Fixed  
**Date:** February 6, 2026  
**Issue:** Token persistence across hot reloads  
**Solution:** File-based token storage
