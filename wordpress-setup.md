# WordPress JWT Authentication Setup

## Step 1: Download JWT Authentication Plugin

1. Go to: https://github.com/wp-graphql/wp-graphql-jwt-authentication/releases
2. Download the latest release ZIP file
3. In WordPress admin (`http://localhost/statspro/wp-admin`):
   - Go to **Plugins > Add New > Upload Plugin**
   - Upload the ZIP file
   - **Activate** the plugin

## Step 2: Configure wp-config.php

Add these lines to your WordPress `wp-config.php` file (before `/* That's all, stop editing! */`):

```php
// JWT Authentication Configuration
define( 'GRAPHQL_JWT_AUTH_SECRET_KEY', 'your-super-secret-jwt-key-here-make-it-long-and-random' );

// Enable CORS for GraphQL (if needed)
define( 'GRAPHQL_CORS_ENABLE', true );

// Allow JWT authentication in GraphQL
define( 'GRAPHQL_JWT_AUTH_AUTO_DELETE_CAP', 'manage_options' );
```

## Step 3: Configure .htaccess (Apache)

Add this to your WordPress `.htaccess` file:

```apache
# JWT Authentication Support
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1

# GraphQL CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS, DELETE, PUT"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
```

## Step 4: Test GraphQL Endpoint

Visit: `http://localhost/statspro/wp-admin/admin.php?page=graphql-ide`

Test this query:
```graphql
query {
  viewer {
    id
    username
    email
  }
}
```

## Step 5: Test Authentication

Try this mutation in GraphQL IDE:
```graphql
mutation {
  login(input: {
    username: "stefano"
    password: "sfg7789$$"
  }) {
    authToken
    refreshToken
    user {
      id
      username
      email
      displayName
    }
  }
}
```

## Step 6: Test Next.js Integration

Once the plugin is installed and configured, test the login from your Next.js app:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stefano","password":"sfg7789$$"}'
```

## Troubleshooting

- If you get "Authorization header not found" errors, make sure the .htaccess rules are applied
- If CORS errors occur, check the wp-config.php CORS settings
- Verify the JWT secret key is set correctly in wp-config.php
