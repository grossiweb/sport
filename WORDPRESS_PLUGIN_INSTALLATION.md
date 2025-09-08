# WordPress Subscription Plugin Installation

## 🎯 Purpose
This plugin fixes the WordPress role update issue by providing custom REST API endpoints that can properly update user roles and subscription metadata.

## 📁 Installation Steps

### Step 1: Create Plugin Directory
1. Navigate to your WordPress installation: `C:\wamp64\www\statspro\`
2. Go to: `wp-content/plugins/`
3. Create a new folder: `statspro-subscription`

### Step 2: Copy Plugin File
1. Copy the file `wordpress-subscription-plugin.php` from your Next.js project root
2. Paste it into: `C:\wamp64\www\statspro\wp-content\plugins\statspro-subscription\`
3. Rename it to: `statspro-subscription.php`

### Step 3: Activate Plugin
1. Go to WordPress admin: `http://localhost/statspro/wp-admin`
2. Login with:
   - Username: `stefano`
   - Password: `sfg6678$$`
3. Navigate to: **Plugins** → **Installed Plugins**
4. Find "StatsPro Subscription Manager"
5. Click **Activate**

## ✅ What This Plugin Does

### Custom User Roles
Creates these subscription-based roles:
- `pro_subscriber` - For Pro plan users
- `enterprise_subscriber` - For Enterprise plan users  
- `free_subscriber` - For Free plan users

### Custom REST API Endpoints

#### Update User Subscription
- **Endpoint**: `/wp-json/statspro/v1/update-user-subscription`
- **Method**: POST
- **Purpose**: Updates user role and subscription metadata
- **Used by**: Stripe webhooks when subscription changes

#### Get User Subscription
- **Endpoint**: `/wp-json/statspro/v1/get-user-subscription/{user_id}`
- **Method**: GET
- **Purpose**: Retrieves user subscription data
- **Used by**: Settings page to display current plan

## 🧪 Testing the Installation

### Test 1: Check if Plugin is Active
Visit: `http://localhost/statspro/wp-json/statspro/v1/get-user-subscription/3`

You should see user subscription data (not a 404 error).

### Test 2: Test Role Update
Run this in your Next.js project terminal:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/test-wordpress-update" -Method POST -ContentType "application/json" -Body '{"userId": "3", "role": "enterprise_subscriber", "plan": "enterprise"}'
```

### Test 3: Check WordPress User
1. Go to WordPress admin: **Users** → **All Users**
2. Click on your user (ID 3)
3. Check if the role shows as "Enterprise Subscriber"

## 🔧 Troubleshooting

### Plugin Not Showing Up
- Check file path: `wp-content/plugins/statspro-subscription/statspro-subscription.php`
- Check file permissions (should be readable)
- Refresh WordPress admin plugins page

### REST API Endpoints Not Working
- Make sure plugin is **activated**
- Check WordPress error logs
- Verify admin credentials in Next.js environment

### Roles Not Updating
- Check browser console for errors
- Check Next.js server logs
- Verify Stripe webhook is firing

## 🎉 Expected Results

After installation:
1. ✅ WordPress user roles update correctly when subscription changes
2. ✅ Settings page shows correct subscription plan
3. ✅ User metadata is stored properly in WordPress
4. ✅ No more REST API permission errors

## 📞 Support

If you encounter issues:
1. Check WordPress error logs: `wp-content/debug.log`
2. Check Next.js server console for error messages
3. Verify all file paths and permissions
4. Ensure WordPress admin credentials are correct
