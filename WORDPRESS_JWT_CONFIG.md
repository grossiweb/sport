# WordPress JWT Configuration for Extended Sessions

This guide explains how to configure WordPress JWT tokens to work optimally with the extended session management in your Next.js app.

## Current Session Management

Your Next.js app now implements:
- ✅ **24-hour session timeout** (hard limit)
- ✅ **Automatic token refresh** every 30 minutes
- ✅ **Graceful fallback** when refresh tokens aren't available
- ✅ **Client-side session tracking** with login timestamps

## WordPress JWT Plugin Configuration

### Option 1: Using WPGraphQL JWT Authentication (Recommended)

1. **Install the plugin** (if not already installed):
   ```bash
   # Via WordPress Admin
   Plugins > Add New > Search "WPGraphQL JWT Authentication"
   ```

2. **Add to wp-config.php**:
   ```php
   // JWT Configuration
   define('GRAPHQL_JWT_AUTH_SECRET_KEY', 'your-super-secret-jwt-key-here');
   
   // Optional: Extend token expiration (default is 300 seconds = 5 minutes)
   define('GRAPHQL_JWT_AUTH_EXPIRE', 3600); // 1 hour in seconds
   
   // Optional: Enable refresh tokens
   define('GRAPHQL_JWT_AUTH_REFRESH_TOKEN_EXPIRE', 86400); // 24 hours in seconds
   ```

3. **Update .htaccess** (if needed):
   ```apache
   # Allow Authorization header
   RewriteEngine On
   RewriteCond %{HTTP:Authorization} ^(.*)
   RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]
   ```

### Option 2: Manual JWT Configuration

If using a different JWT plugin, add these configurations:

```php
// In wp-config.php or functions.php

// Extend JWT token expiration
add_filter('jwt_auth_expire', function() {
    return time() + (60 * 60); // 1 hour
});

// Enable CORS for your Next.js app
add_action('init', function() {
    header('Access-Control-Allow-Origin: http://localhost:3001');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
});
```

## Environment Variables

Update your `.env.local`:

```env
# WordPress Configuration
WORDPRESS_API_URL=http://localhost/statspro/graphql
WORDPRESS_REST_URL=http://localhost/statspro/wp-json

# JWT Configuration (add these)
WORDPRESS_JWT_SECRET=your-super-secret-jwt-key-here
WORDPRESS_JWT_EXPIRE=3600

# For admin operations (if needed)
WORDPRESS_ADMIN_USER=stefano
WORDPRESS_ADMIN_PASS=sfg6678$$
```

## How the New System Works

### Client-Side Session Management
1. **Login**: Stores `authToken`, `refreshToken`, and `loginTime`
2. **24-Hour Rule**: Hard logout after 24 hours regardless of token validity
3. **Auto-Refresh**: Attempts token refresh every 30 minutes
4. **Graceful Degradation**: Falls back to current token if refresh fails

### Session Flow
```
User Login
    ↓
Store: token, refreshToken, loginTime
    ↓
Every 30 minutes: Attempt refresh
    ↓
Check: Is session < 24 hours old?
    ↓
Yes: Continue session
No: Force logout
```

## Testing the Configuration

1. **Login to your app**: http://localhost:3001/login
2. **Check browser localStorage**:
   - `authToken`: JWT token
   - `refreshToken`: Refresh token (if available)
   - `loginTime`: Timestamp of login

3. **Monitor console logs**:
   - "Attempting automatic session refresh..." (every 30 min)
   - "Session expired after 24 hours" (after 24 hours)

## Troubleshooting

### Issue: Still logging out quickly
- Check WordPress JWT plugin configuration
- Verify `GRAPHQL_JWT_AUTH_EXPIRE` in wp-config.php
- Check browser console for refresh errors

### Issue: Refresh token not working
- Ensure WPGraphQL JWT Authentication plugin supports refresh tokens
- Check if `refreshJwtAuthToken` mutation is available
- The system will fall back to current token validation

### Issue: CORS errors
- Add CORS headers to WordPress
- Update .htaccess if needed
- Check browser network tab for OPTIONS requests

## WordPress Plugin Recommendations

1. **WPGraphQL JWT Authentication** (Primary)
   - Full JWT support with refresh tokens
   - GraphQL integration
   - Configurable expiration times

2. **JWT Auth** (Alternative)
   - Basic JWT functionality
   - REST API integration
   - Simpler setup

## Current Status

✅ **Client-side session management**: Implemented  
✅ **24-hour session timeout**: Active  
✅ **Automatic token refresh**: Working  
✅ **Graceful fallbacks**: Implemented  
⏳ **WordPress JWT optimization**: Requires manual configuration  

The system will work with default WordPress JWT settings, but configuring longer token expiration times will reduce the frequency of refresh attempts and improve performance.
