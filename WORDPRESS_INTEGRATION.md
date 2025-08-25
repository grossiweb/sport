# WordPress + Next.js Authentication Integration

This document explains how your StatsPro Next.js app integrates with WordPress for user authentication and management.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/GraphQL    ┌─────────────────┐
│                 │ ◄─────────────────► │                 │
│   Next.js App   │                    │   WordPress     │
│  (Port 3001)    │                    │ (localhost/stat)│
│                 │                    │                 │
└─────────────────┘                    └─────────────────┘
        │                                       │
        │                                       │
    ┌───▼────┐                              ┌───▼────┐
    │ Auth   │                              │ User   │
    │ System │                              │ DB     │
    └────────┘                              └────────┘
```

## 📍 Current Setup

### WordPress Location
- **Path**: `C:\wamp64\www\statspro`
- **Admin URL**: `http://localhost/statspro/wp-admin`
- **GraphQL Endpoint**: `http://localhost/statspro/graphql`
- **Admin User**: stefano
- **Admin Password**: sfg6678$$

### Next.js App Location
- **Path**: `C:\wamp64\www\statspro\sport`
- **URL**: `http://localhost:3001`
- **Register**: `http://localhost:3001/register`
- **Login**: `http://localhost:3001/login`

## 🔐 Authentication Flow

### Registration Process
1. User visits `http://localhost:3001/register`
2. User fills registration form (name, email, password)
3. Next.js sends data to `/api/auth/register`
4. API creates user in WordPress via GraphQL
5. User is automatically logged in with JWT token
6. User gains access to protected areas

### Login Process
1. User visits `http://localhost:3001/login`
2. User enters email and password
3. Next.js sends credentials to `/api/auth/login`
4. API validates with WordPress via GraphQL
5. WordPress returns JWT token if valid
6. Token stored in localStorage for session management

### Session Management
1. Token stored in browser localStorage
2. Each protected route checks token validity
3. Middleware protects routes automatically
4. Token validated against WordPress on each request

## 🛠️ Required WordPress Plugins

Make sure these plugins are installed and activated:

1. **WPGraphQL** - Core GraphQL functionality
2. **WPGraphQL for Advanced Custom Fields** - Custom field support
3. **Custom Post Type UI** - For email/social post types
4. **Advanced Custom Fields** - Custom fields management

Install from: `http://localhost/statspro/wp-admin/plugins.php`

## 👥 User Roles & Permissions

The system uses these WordPress roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| `subscriber` | Default new users | Basic access |
| `trial_member` | Trial users | 14-day access |
| `premium_member` | Paid users | Full access |
| `administrator` | Admin users | Complete access |

### Default Behavior
- New registrations → `subscriber` role
- Trial access → 14 days from registration
- Role upgrades → Manual via WordPress admin

## 🚀 Quick Start

### 1. Verify Setup
```bash
cd C:\wamp64\www\statspro\sport
npm run wordpress:check
```

### 2. Start Development
```bash
npm run dev
```
This starts Next.js on `http://localhost:3001`

### 3. Test Registration
1. Visit `http://localhost:3001/register`
2. Create a test account
3. Check WordPress admin to see new user

### 4. Test Login
1. Visit `http://localhost:3001/login`
2. Login with test account
3. Access protected areas

## 📂 Key Files

### Authentication Routes
- `app/api/auth/login/route.ts` - User login
- `app/api/auth/register/route.ts` - User registration
- `app/api/auth/validate/route.ts` - Token validation
- `app/api/auth/logout/route.ts` - User logout

### Frontend Components
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `components/auth/AuthProvider.tsx` - Auth context
- `hooks/useAuth.ts` - Auth hook

### WordPress Integration
- `lib/wordpress/client.ts` - WordPress GraphQL client
- `lib/wordpress/auth.ts` - Additional auth utilities
- `middleware.ts` - Route protection

### Configuration
- `.env.local` - Environment variables
- `next.config.js` - Next.js configuration

## 🔧 Environment Variables

Create `.env.local` with:

```env
# WordPress Integration
WORDPRESS_API_URL=http://localhost/statspro/graphql
WORDPRESS_REST_URL=http://localhost/statspro/wp-json
WORDPRESS_ADMIN_USER=stefano
WORDPRESS_ADMIN_PASS=sfg6678$$

# Next.js App
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here
NEXTAUTH_URL=http://localhost:3001

# Sports API
THERUNDOWN_API_KEY=your_therundown_api_key_here
```

## 🔒 Security Features

1. **JWT Token Authentication** - Secure token-based auth
2. **Route Protection** - Middleware guards protected routes
3. **Token Validation** - Regular token verification
4. **Role-Based Access** - WordPress role-based permissions
5. **Password Security** - WordPress handles password hashing

## 🐛 Troubleshooting

### Common Issues

**WordPress Not Accessible**
- Ensure WAMP server is running
- Check WordPress installation path
- Verify admin credentials

**GraphQL Endpoint Not Working**
- Install WPGraphQL plugin
- Check plugin activation
- Verify endpoint URL

**Registration/Login Failing**
- Check WordPress admin credentials
- Verify GraphQL mutations are enabled
- Check browser console for errors

**Token Validation Failing**
- Check JWT token in localStorage
- Verify WordPress user exists
- Check token expiration

### Debug Steps

1. **Check WordPress**
   ```bash
   # Visit admin panel
   http://localhost/statspro/wp-admin
   
   # Test GraphQL endpoint
   http://localhost/statspro/graphql
   ```

2. **Check Next.js App**
   ```bash
   # Check development server
   npm run dev
   
   # Check browser console
   F12 → Console → Look for errors
   ```

3. **Check Database**
   - Login to WordPress admin
   - Go to Users → All Users
   - Verify new registrations appear

## 📈 Advanced Features

### Custom User Meta
You can extend user data by adding custom fields in WordPress:

1. Go to WordPress admin
2. Install Advanced Custom Fields plugin
3. Create field groups for users
4. Access via GraphQL queries

### Role Management
Programmatically manage user roles:

```javascript
import { wordpressAuth } from '@/lib/wordpress/auth'

// Update user role
await wordpressAuth.updateUserRole(userId, 'premium_member')

// Check user capabilities
const hasAccess = await wordpressAuth.userHasCapability(token, 'read_premium')
```

### Email Notifications
Set up email notifications for:
- New user registrations
- Password resets
- Subscription updates
- Login alerts

## 🚀 Production Deployment

### WordPress (Production)
1. Deploy WordPress to your hosting provider
2. Update WORDPRESS_API_URL in environment
3. Configure SSL certificates
4. Set up database backups

### Next.js (Production)
1. Deploy to Vercel/Netlify/your hosting
2. Set production environment variables
3. Update NEXTAUTH_URL
4. Configure domain and SSL

### Security Checklist
- [ ] Use HTTPS for all endpoints
- [ ] Set strong JWT secrets
- [ ] Enable WordPress security plugins
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable login attempt limits

## 📞 Support

If you encounter issues:

1. Check this documentation
2. Run the WordPress setup checker
3. Review browser console logs
4. Check WordPress error logs
5. Test API endpoints manually

## 🎯 Current Status

✅ **Working Features:**
- User registration via Next.js → WordPress
- User login with WordPress validation
- JWT token-based authentication
- Protected route access
- Role-based permissions
- Session management

✅ **Integration Points:**
- Next.js app at `http://localhost:3001`
- WordPress at `http://localhost/statspro`
- GraphQL API communication
- Shared user database

Your WordPress + Next.js authentication integration is fully functional and ready for use!
