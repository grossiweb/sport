# WordPress + WAMP + Next.js Authentication Setup Guide

## Current Issues & Solutions

### Issue 1: GraphQL Schema Error ✅ FIXED
**Problem:** `Cannot query field "displayName" on type "User"`
**Solution:** Updated all GraphQL queries to use `nicename` instead of `displayName`

### Issue 2: Windows PowerShell Commands
**Problem:** PowerShell doesn't support `&&` syntax
**Solution:** Use PowerShell-specific commands

## Step-by-Step WAMP Setup

### Step 1: Install JWT Authentication Plugin

1. **Download the Plugin:**
   - Visit: https://github.com/wp-graphql/wp-graphql-jwt-authentication/releases
   - Download: `wp-graphql-jwt-authentication.zip`

2. **Install in WordPress:**
   - Go to: `http://localhost/statspro/wp-admin`
   - Navigate: **Plugins > Add New > Upload Plugin**
   - Upload the ZIP file and **Activate**

### Step 2: Configure WordPress (wp-config.php)

Edit your WordPress `wp-config.php` file located at:
`C:\wamp64\www\statspro\wp-config.php`

Add these lines BEFORE `/* That's all, stop editing! */`:

```php
// JWT Authentication Configuration
define( 'GRAPHQL_JWT_AUTH_SECRET_KEY', 'statspro-super-secret-jwt-key-2024-make-this-random-and-long' );

// Enable CORS for GraphQL
define( 'GRAPHQL_CORS_ENABLE', true );

// JWT Configuration
define( 'GRAPHQL_JWT_AUTH_AUTO_DELETE_CAP', 'manage_options' );

// Allow Authorization header
$_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
```

### Step 3: Configure Apache (.htaccess)

Edit the `.htaccess` file in your WordPress root:
`C:\wamp64\www\statspro\.htaccess`

Add these lines at the TOP of the file:

```apache
# Enable Authorization Header
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

# CORS Headers for GraphQL
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS, DELETE, PUT"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

# Handle preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

### Step 4: Restart WAMP Services

1. **Stop WAMP:** Click WAMP icon > "Stop All Services"
2. **Start WAMP:** Click WAMP icon > "Start All Services"
3. **Verify:** WAMP icon should be GREEN

### Step 5: Test GraphQL Endpoint

1. **Visit GraphQL IDE:**
   ```
   http://localhost/statspro/wp-admin/admin.php?page=graphql-ide
   ```

2. **Test Basic Query:**
   ```graphql
   query {
     generalSettings {
       title
       url
     }
   }
   ```

3. **Test Login Mutation:**
   ```graphql
   mutation {
     login(input: {
       username: "stefano"
       password: "sfg6678$$"
     }) {
       authToken
       user {
         id
         username
         email
         nicename
       }
     }
   }
   ```

### Step 6: Test Next.js API

**Windows PowerShell Commands:**

```powershell
# Test Login
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"stefano","password":"sfg6678$$"}'

# Test Registration
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Troubleshooting for WAMP

### Problem: 404 Error on GraphQL Endpoint
**Solution:**
1. Enable URL Rewrite module in Apache
2. WAMP > Apache > Apache Modules > Check "rewrite_module"
3. Restart Apache

### Problem: Authorization Header Issues
**Solution:**
1. Check if `.htaccess` rules are active
2. Verify mod_rewrite and mod_headers are enabled in Apache
3. WAMP > Apache > Apache Modules > Enable both modules

### Problem: CORS Errors
**Solution:**
1. Verify wp-config.php has CORS settings
2. Check .htaccess CORS headers
3. Clear browser cache

### Problem: Plugin Not Working
**Solution:**
1. Deactivate and reactivate both WPGraphQL and JWT Authentication plugins
2. Check WordPress error logs: `C:\wamp64\logs\php_error.log`
3. Verify PHP version compatibility (PHP 7.4+ recommended)

## Windows PowerShell Development Commands

```powershell
# Clear Next.js cache and restart
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue; npm run dev

# Check if ports are available
netstat -an | findstr "3000"
netstat -an | findstr "80"

# Test API endpoints
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method OPTIONS
```

## Next Steps After Setup

1. Install and configure the JWT plugin ✅
2. Update wp-config.php with JWT settings ✅
3. Configure .htaccess for Authorization headers ✅
4. Test GraphQL authentication ✅
5. Test Next.js API endpoints ✅
6. Test frontend login/register ✅
